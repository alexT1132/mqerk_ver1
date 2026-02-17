import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { registerRequest, loginRequest, verifyTokenRequest, logoutRequest } from "../api/usuarios.js";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

export const AuthContext = createContext();

const defaultAuthContext = {
    signup: async () => { },
    signin: async () => { },
    logout: async () => { }, // función async que siempre resuelve
    isVerde: false,
    errors: [],
    user: null,
    alumno: null,
    setAlumno: () => { },
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
        } catch { }
        return defaultAuthContext;
    }
    return context;
}

export const AuthProvider = ({ children }) => {

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
    const authInitRef = useRef({ started: false, completed: false });
    const debug = (...args) => { if (import.meta.env.DEV) console.debug('[Auth]', ...args); };

    const signup = async (user) => {
        try {
            setErrors([]); // Limpiar errores previos
            const res = await registerRequest(user);
            setVerde(true);
        } catch (error) {
            console.log(error);
            // Capturar y mostrar errores del servidor
            const errorMessage = error.response?.data?.message ||
                (error.response?.status === 409 ? 'Este nombre de usuario ya está en uso. Por favor, elige otro.' :
                    error.response?.status === 400 ? 'Todos los campos son obligatorios' :
                        'Error al crear la cuenta. Por favor, intenta de nuevo.');
            setErrors([errorMessage]);
            setVerde(false);
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
                    localStorage.setItem('rememberMe', '1');
                    localStorage.setItem('mq_user', JSON.stringify(usuarioResp));
                } catch { }
            } else {
                try {
                    localStorage.removeItem('rememberMe');
                    localStorage.removeItem('mq_user');
                } catch { }
            }
        } catch (error) {
            const errMsg = error.response?.data?.message || (error.response?.status === 404 ? 'Endpoint /login no encontrado' : undefined);
            setErrors(Array.isArray(errMsg) ? errMsg : [errMsg || "Error desconocido"]);
        }
    }

    const logout = async () => {
        try { await logoutRequest().catch(() => { }); } catch { }

        // SEGURIDAD: Limpieza exhaustiva de cookies
        // El backend ya borra todas, pero limpiamos manual para reflejar inmediatamente
        const cookiesToRemove = [
            'token', 'rtoken', 'token_admin', 'rtoken_admin',
            'token_asesor', 'rtoken_asesor', 'token_estudiante',
            'rtoken_estudiante', 'access_token', 'refresh_token'
        ];

        // Limpiar cookies con diferentes paths y domains para asegurar eliminación completa
        cookiesToRemove.forEach(cookieName => {
            Cookies.remove(cookieName);
            Cookies.remove(cookieName, { path: '/' });
            Cookies.remove(cookieName, { path: '', domain: window.location.hostname });
        });

        // SEGURIDAD: Resetear estado de autenticación INMEDIATAMENTE
        setIsAuthenticated(false);
        setUser(null);
        setAlumno(null);

        // SEGURIDAD: Limpieza de almacenamiento local
        try {
            localStorage.removeItem('mq_user');
            localStorage.removeItem('rememberMe');
            localStorage.removeItem('cursoSeleccionado');
            // Limpiar cualquier otro dato sensible que pueda existir
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('mq_') || key.includes('token') || key.includes('auth')) {
                    localStorage.removeItem(key);
                }
            });
        } catch { }

        // SEGURIDAD: Limpieza de sessionStorage
        try {
            sessionStorage.clear();
        } catch { }

        // SEGURIDAD: Limpieza de IndexedDB si existe
        try {
            if (window.indexedDB) {
                const dbs = await window.indexedDB.databases();
                dbs.forEach(db => {
                    if (db.name && (db.name.includes('mq') || db.name.includes('auth'))) {
                        window.indexedDB.deleteDatabase(db.name);
                    }
                });
            }
        } catch { }
    }

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

        let cancelled = false;
        let attempt = 0;
        const maxNetworkAttempts = 3;
        let retryTimer = null;
        const remember = localStorage.getItem('rememberMe') === '1';

        // Detectar si la navegación fue mediante botones de atrás/adelante del navegador
        const isBackForward = performance.getEntriesByType &&
            performance.getEntriesByType('navigation').length > 0 &&
            performance.getEntriesByType('navigation')[0].type === 'back_forward';

        const verifyFlow = async (label = 'initial') => {
            if (cancelled) return;

            const currentPath = window.location.pathname;
            const publicNoAuthRoutes = ['/login', '/pre_registro', '/recuperar', '/resetear', '/setup'];
            const protectedRoutes = ['/asesor', '/alumno', '/admin', '/administrativo'];
            const isProtectedRoute = protectedRoutes.some(route => currentPath.startsWith(route));
            const isPublicRoute = publicNoAuthRoutes.some(route => currentPath === route || currentPath.startsWith(route + '/'));

            // Si es una ruta protegida, forzar estado de carga antes de verificar
            if (isProtectedRoute) {
                setLoading(true);
            }

            if (isPublicRoute && !isProtectedRoute) {
                debug('skip verify (public route)', currentPath);
                setLoading(false);
                initRef.completed = true;
                return;
            }

            try {
                debug('calling /verify', label);
                const res = await Promise.race([
                    verifyTokenRequest(),
                    new Promise((_r, rej) => setTimeout(() => rej(new Error('verify-timeout')), 8000))
                ]);

                if (!cancelled) {
                    if (res.data?.usuario) {
                        applyUser(res.data);
                        debug('/verify success user id=%s role=%s', res.data.usuario?.id, res.data.usuario?.role);
                    } else {
                        // No autenticado
                        setIsAuthenticated(false);
                        setUser(null);
                        setAlumno(null);
                        debug('/verify no user payload (reason=%s) -> guest', res.data?.reason || 'none');
                    }
                    setLoading(false);
                    initRef.completed = true;
                }
            } catch (e) {
                if (e.message === 'verify-timeout') {
                    handleNetworkError();
                    return;
                }

                const reason = e?.response?.data?.reason;
                const isNetwork = !e.response;

                if (isNetwork) {
                    handleNetworkError();
                    return;
                }

                // Manejo de tokens inválidos o expirados con rememberMe
                if (remember && (reason === 'expired' || reason === 'invalid-token')) {
                    try {
                        const axios = (await import('../api/axios.js')).default;
                        await axios.post('/token/refresh');
                        const res2 = await verifyTokenRequest();
                        if (!cancelled && res2.data?.usuario) {
                            applyUser(res2.data);
                        } else if (!cancelled) {
                            setIsAuthenticated(false); setUser(null); setAlumno(null);
                        }
                    } catch (e2) {
                        if (!cancelled) {
                            setIsAuthenticated(false); setUser(null); setAlumno(null);
                            localStorage.removeItem('rememberMe'); localStorage.removeItem('mq_user');
                        }
                    } finally {
                        if (!cancelled) { setLoading(false); initRef.completed = true; }
                    }
                } else if (!cancelled) {
                    setIsAuthenticated(false); setUser(null); setAlumno(null);
                    setLoading(false); initRef.completed = true;
                }
            }
        };

        const applyUser = (data) => {
            const u = data.usuario;
            if (data.asesor_profile) {
                u.asesor_profile = data.asesor_profile;
                u.grupo_asesor = data.asesor_profile?.grupo_asesor || null;
            }
            setIsAuthenticated(true);
            setUser(u);
            if (data.estudiante) setAlumno(data.estudiante);

            // Actualizar caché si remember está activo
            if (remember) {
                localStorage.setItem('mq_user', JSON.stringify(u));
            }
        };

        const handleNetworkError = () => {
            attempt += 1;
            const backoff = Math.min(30000, 2000 * attempt);
            if (attempt > maxNetworkAttempts) {
                setLoading(false);
                return;
            }
            scheduleRetry(backoff);
        };

        const scheduleRetry = (delayMs) => {
            if (cancelled) return;
            if (retryTimer) clearTimeout(retryTimer);
            retryTimer = setTimeout(() => verifyFlow('retry'), delayMs);
        };

        const hardTimeout = setTimeout(() => { if (!cancelled && loading) setLoading(false); }, 12000);

        // --- MANEJO DE SEGURIDAD EN CARGA ---

        // 1. Carga optimista inmediata (solo si no es navegación atrás/adelante)
        if (!isBackForward) {
            try {
                const cached = localStorage.getItem('mq_user');
                if (cached) {
                    const parsed = JSON.parse(cached);
                    setUser(parsed);
                    setIsAuthenticated(true);
                    // Pero mantenemos loading=true para que la ruta protegida verifique con el servidor
                }
            } catch { }
        } else {
            // Si es navegación atrás/adelante, forzar limpieza de estado y verificación obligatoria
            debug('back_forward detected - cleaning optimistic state');
            if (!remember) {
                setUser(null);
                setIsAuthenticated(false);
                setAlumno(null);
            }
        }

        // Iniciar flujo de verificación inicial
        verifyFlow('mount');

        // Exponer helper para depuración
        window._mq_forceVerify = () => verifyFlow('manual');

        return () => {
            cancelled = true;
            if (retryTimer) clearTimeout(retryTimer);
            clearTimeout(hardTimeout);
        };
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
            remember: () => localStorage.getItem('rememberMe') === '1'
        }}>
            {children}
        </AuthContext.Provider>
    )

}
