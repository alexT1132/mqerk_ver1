import axios from "axios";

// Base URL configurable via Vite env; fallback to current host for same-site cookies over LAN
const envBase = import.meta?.env?.VITE_API_URL;
const host = (typeof window !== 'undefined' && window.location && window.location.hostname) ? window.location.hostname : 'localhost';
const baseURL = envBase || `http://${host}:1002/api`;

const instance = axios.create({
    baseURL,
    withCredentials: true,
});

// Interceptor de solicitud: adjunta Authorization si existe cookie token_* o fallback localStorage
instance.interceptors.request.use((config) => {
    try {
        // Preferir cookies httpOnly no es posible leerlas; pero si en algún flujo guardas un access token visible (ej: adminToken) úsalo.
        // Estrategia: si el backend ya maneja cookies httpOnly no es obligatorio este header; lo añadimos solo si existe en storage.
        const stored = localStorage.getItem('adminToken');
        if (stored && !config.headers.Authorization) {
            config.headers.Authorization = `Bearer ${stored}`;
        }
    } catch {}
    return config;
}, (error) => Promise.reject(error));

// Redirige globalmente al login en respuestas 401 para cortar bucles de llamadas no autorizadas
let isRefreshing = false;
let pendingQueue = [];

const processQueue = (err) => {
    pendingQueue.forEach(({ reject }) => reject(err));
    pendingQueue = [];
};

instance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error?.config;
        const status = error?.response?.status;
    // Evitar intentar refresh si es 403 not-admin (rol insuficiente) para no entrar en loop
        const apiReason = error?.response?.data?.reason;
    const isAuthLike = status === 401 || status === 403;
        // Razones que nunca intentan refresh vía interceptor (logout directo)
        const terminalReasons = new Set(['invalid-token','soft-deleted','user-not-found','no-token','no-rtoken','expired-rtoken']);
        // Solo refrescamos automáticamente si el access token expiró explícitamente
        const shouldRefresh = isAuthLike && apiReason === 'expired' && !original?._retry;
        // Suspended: limpiar sesión y redirigir a login o página informativa
        if (isAuthLike && apiReason === 'suspended') {
            try { localStorage.removeItem('adminToken'); localStorage.removeItem('adminProfile'); } catch {}
            if (typeof window !== 'undefined') {
                const path = window.location?.pathname || '';
                if (!path.startsWith('/login')) window.location.href = '/login?reason=suspended';
            }
            return Promise.reject(error);
        }

        if (shouldRefresh) {
            original._retry = true;
            if (isRefreshing) {
                // Cola de espera hasta que termine el refresh en curso
                return new Promise((_, reject) => pendingQueue.push({ reject }));
            }
            isRefreshing = true;
            try {
            await instance.post('/token/refresh'); // si falla se caerá al catch y haremos logout
                isRefreshing = false;
                // Reintentar la solicitud original una vez
                return instance(original);
            } catch (e) {
                isRefreshing = false;
                processQueue(e);
                // Redirigir a login
                try {
                    localStorage.removeItem('adminToken');
                    localStorage.removeItem('adminProfile');
                } catch {}
                if (typeof window !== 'undefined') {
                    const path = window.location?.pathname || '';
                    if (!path.startsWith('/login')) window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default instance;