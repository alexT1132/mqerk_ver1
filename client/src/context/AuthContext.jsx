import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { registerRequest, loginRequest, verifyTokenRequest, logoutRequest } from "../api/usuarios.js";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

export const AuthContext = createContext();

const defaultAuthContext = {
    signup: async () => {},
    signin: async () => {},
    logout: async () => {}, // función async que siempre resuelve
    isVerde: false,
    errors: [],
    user: null,
    alumno: null,
    setAlumno: () => {},
    isAuthenticated: false,
    loading: false,
    remember: () => false,
};

let __authWarnShown = false; // avoid spamming console in dev

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        try {
            if (import.meta?.env?.DEV && !__authWarnShown) {
                console.warn('useAuth used outside AuthProvider. Using fallback to prevent crash.');
                __authWarnShown = true;
            }
        } catch {}
        return defaultAuthContext;
    }
    return context;
}

export const AuthProvider = ({children}) => {

    const [user, setUser] = useState(null);
    const [alumno, setAlumno] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isVerde, setVerde] = useState(false);
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(true);
    // Ref para controlar inicialización única (StrictMode ejecuta doble en dev)
    // StrictMode en desarrollo monta -> desmonta -> vuelve a montar.
    // El código previo usaba done=true en la PRIMERA (falsa) ejecución, luego el segundo montaje real se saltaba el efecto y nunca dejaba de estar en Loading.
    // Ahora diferenciamos: started / completed. Solo evitamos reruns después de completar correctamente.
    const authInitRef = useRef({ started:false, completed:false });
    const debug = (...args)=>{ if(import.meta.env.DEV) console.debug('[Auth]', ...args); };

    const signup = async (user) => {
        try {
            const res = await registerRequest(user);
            setVerde(true);
        } catch (error) {
            console.log(error);
        }
    }

    const signin = async (formData) => {
        try {
            const res = await loginRequest(formData);
            const usuarioResp = res.data.usuario;
            // Adjuntar perfil asesor si viene
            if (res.data.asesor_profile) {
                usuarioResp.asesor_profile = res.data.asesor_profile;
                usuarioResp.grupo_asesor = res.data.asesor_profile?.grupo_asesor || null;
            }
            setUser(usuarioResp);
            setAlumno(res.data.estudiante);
            setIsAuthenticated(true);
            if (formData.rememberMe) {
                try {
                    localStorage.setItem('rememberMe','1');
                    localStorage.setItem('mq_user', JSON.stringify(usuarioResp));
                } catch {}
            } else {
                try {
                    localStorage.removeItem('rememberMe');
                    localStorage.removeItem('mq_user');
                } catch {}
            }
        } catch (error) {
            const errMsg = error.response?.data?.message || (error.response?.status === 404 ? 'Endpoint /login no encontrado' : undefined);
            setErrors(Array.isArray(errMsg) ? errMsg : [errMsg || "Error desconocido"]);
        }
    }

                const logout = async () => {
                        try { await logoutRequest().catch(()=>{}); } catch {}
                        // El backend ya borra todas, pero limpiamos manual para reflejar inmediatamente
                        ['token','rtoken','token_admin','rtoken_admin','token_asesor','rtoken_asesor','token_estudiante','rtoken_estudiante','access_token','refresh_token']
                            .forEach(c=> Cookies.remove(c));
                        setIsAuthenticated(false);
                        setUser(null);
                        setAlumno(null);
                        try {
                                localStorage.removeItem('mq_user');
                                localStorage.removeItem('rememberMe');
                                // Limpiar curso seleccionado del asesor al cerrar sesión
                                localStorage.removeItem('cursoSeleccionado');
                        } catch {}
                }

    // const getUsuarios = async () => {
    //     try {
    //         const res = await ObtenerUsuarios();
    //         setUsers(res.data.data);
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }

    useEffect(() => {
        if (errors.length > 0) {
            const timer = setTimeout(() => {
                setErrors([])
            }, 3000)
            return () => clearTimeout(timer)
        }
    }, [errors]);

    useEffect(() => {
    const initRef = authInitRef.current;
    if (initRef.started && initRef.completed) return; // ya completado anteriormente
    // Permitimos segunda ejecución si StrictMode desmontó antes de completar
    initRef.started = true;
        debug('init effect start');

        let cancelled = false;
    let attempt = 0;
    const maxNetworkAttempts = 3; // después de este número de intentos salimos del estado Loading
        let retryTimer = null;
        const remember = localStorage.getItem('rememberMe') === '1';
        const currentPath = (typeof window !== 'undefined' && window.location?.pathname) || '';

        // Carga optimista desde localStorage para evitar parpadeo si backend tarda
        if (remember && !user) {
            try {
                const cached = localStorage.getItem('mq_user');
                if (cached) {
                    const parsed = JSON.parse(cached);
                    setUser(parsed);
                    setIsAuthenticated(true);
                }
            } catch {}
        }

    const scheduleRetry = (delayMs) => {
            if (cancelled) return;
            if (retryTimer) clearTimeout(retryTimer);
            retryTimer = setTimeout(() => verifyFlow(), delayMs);
        };

    // Hard fallback: liberar loading si algo bloquea (p.ej. backend caído) tras 12s
    const hardTimeout = setTimeout(() => { if (!cancelled && loading) setLoading(false); }, 12000);

        const applyUser = (data) => {
            const u = data.usuario;
            if (data.asesor_profile){
                u.asesor_profile = data.asesor_profile;
                u.grupo_asesor = data.asesor_profile?.grupo_asesor || null;
            }
            setIsAuthenticated(true);
            setUser(u);
            if (data.estudiante) setAlumno(data.estudiante);
        };

        const handleNetworkError = () => {
            attempt += 1;
            const backoff = Math.min(30000, 2000 * attempt); // 2s,4s,6s... máx 30s
            if (attempt > maxNetworkAttempts) {
                // Cortamos el bucle: asumimos modo offline / invitado pero liberamos la UI
                debug('max network attempts reached -> giving up verify, loading=false');
                setLoading(false);
                return;
            }
            debug('network error attempt %d scheduling retry in %dms', attempt, backoff);
            scheduleRetry(backoff);
        };

        const verifyFlow = async (label='initial') => {
            if (cancelled) return;
            // Si estamos en rutas públicas, siempre saltar /verify para evitar 401 visibles
            const publicNoAuthRoutes = ['/login', '/pre_registro'];
            if (publicNoAuthRoutes.some(r => currentPath.startsWith(r))) {
                debug('skip verify (public route)');
                setLoading(false); initRef.completed = true;
                return;
            }
            try {
                debug('calling /verify', label);
                const res = await Promise.race([
                    verifyTokenRequest(),
                    new Promise((_r, rej)=> setTimeout(()=> rej(new Error('verify-timeout')), 8000))
                ]);
                if (!cancelled){
                    if (res.data?.usuario){
                        applyUser(res.data);
                        debug('/verify success user id=%s role=%s', res.data.usuario?.id, res.data.usuario?.role);
                    } else {
                        // 200 sin usuario o con reason => no autenticado => estado invitado
                        const reason = res.data?.reason;
                        setIsAuthenticated(false); setUser(null); setAlumno(null);
                        debug('/verify no user payload (status=%s, reason=%s) -> guest', res.status, reason || 'none');
                    }
                    setLoading(false); initRef.completed = true; debug('loading=false after verify response');
                }
            } catch (e) {
                if(e.message === 'verify-timeout'){
                    debug('verify timeout');
                    handleNetworkError();
                    return;
                }
                const status = e?.response?.status;
                const reason = e?.response?.data?.reason;
                const isNetwork = !e.response; // ECONNREFUSED, timeout, etc.
                if (isNetwork) {
                    debug('network error on verify', e?.message);
                    if(!cancelled) handleNetworkError();
                    return; // loading se mantiene true hasta primer éxito o desistimos
                }
                // Si no hay token y tampoco remember, terminar silenciosamente sin marcar error
                if (!remember && (reason === 'no-token' || reason === 'invalid-token')) {
                    if(!cancelled){
                        debug('no token & no remember -> guest');
                        setIsAuthenticated(false); setUser(null); setAlumno(null); setLoading(false);
                    }
                    return;
                }
                if (remember) {
                    try {
                        const axios = (await import('../api/axios.js')).default;
                        debug('trying refresh after reason=%s status=%s', reason, status);
                        await axios.post('/token/refresh');
                        const res2 = await verifyTokenRequest();
                        if (!cancelled && res2.data?.usuario){
                            applyUser(res2.data);
                            debug('refresh+verify success');
                        } else if(!cancelled){
                            setIsAuthenticated(false); setUser(null); setAlumno(null);
                            debug('refresh+verify failed no user');
                        }
                    } catch (e2) {
                        debug('refresh failed', e2?.response?.data || e2?.message);
                        if(!cancelled){
                            setIsAuthenticated(false); setUser(null); setAlumno(null);
                            try { localStorage.removeItem('rememberMe'); localStorage.removeItem('mq_user'); } catch {}
                        }
                    } finally {
                        if(!cancelled) { setLoading(false); initRef.completed = true; debug('loading=false after refresh flow'); }
                    }
                } else if(!cancelled){
                    setIsAuthenticated(false); setUser(null); setAlumno(null);
                    setLoading(false); initRef.completed = true; debug('unauthenticated final');
                }
            }
        };

        verifyFlow();
        // Exponer helper para depuración manual desde consola
        if(typeof window !== 'undefined') window._mq_forceVerify = ()=> verifyFlow('manual');
        return () => { cancelled = true; if (retryTimer) clearTimeout(retryTimer); clearTimeout(hardTimeout); };
    }, []);

    return (
        <AuthContext.Provider value={{
            signup,
            signin,
            logout,
            isVerde,
            errors,
            user,
            alumno,
            setAlumno,
            isAuthenticated,
            loading,
            // Exponer bandera remember a posibles hooks futuros
            remember: ()=> localStorage.getItem('rememberMe')==='1'
        }}>
            {children}
        </AuthContext.Provider>
    )

}