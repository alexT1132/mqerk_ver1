// src/api/axios.js

import axios from "axios";

// Base URL configurable via Vite env; fallback to current host for same-site cookies over LAN
const envBase = import.meta?.env?.VITE_API_URL;
const host = (typeof window !== 'undefined' && window.location && window.location.hostname) ? window.location.hostname : 'localhost';
const baseURL = envBase || `http://${host}:1002/api`;

const instance = axios.create({
        baseURL,
        withCredentials: true,
});

// Interceptor de solicitud: adjunta el token de autorización si existe.
function readCookie(name) {
        try {
                const target = name + '=';
                const parts = document.cookie ? document.cookie.split(';') : [];
                for (let c of parts) {
                        c = c.trim();
                        if (c.startsWith(target)) return decodeURIComponent(c.slice(target.length));
                }
        } catch {}
        return null;
}

instance.interceptors.request.use(
        (config) => {
                try {
                        // 1) Si ya viene Authorization, respetarlo
                        if (!config.headers.Authorization && !config.headers.authorization) {
                                let bearer = localStorage.getItem('token'); // fallback legacy
                                if (!bearer && typeof document !== 'undefined') {
                                        const path = (typeof window !== 'undefined' && window.location && window.location.pathname) ? window.location.pathname : '';
                                        // Prioridad por contexto de ruta para entornos multi-rol
                                        let order = ['access_token','token_admin','token_asesor','token_estudiante','token'];
                                        if (path.startsWith('/asesor')) order = ['token_asesor','token_admin','access_token','token_estudiante','token'];
                                        else if (path.startsWith('/alumno')) order = ['token_estudiante','access_token','token_asesor','token_admin','token'];
                                        else if (path.startsWith('/admin') || path.startsWith('/administrativo')) order = ['token_admin','access_token','token_asesor','token_estudiante','token'];
                                        for (const name of order) {
                                                const v = readCookie(name);
                                                if (v) { bearer = v; break; }
                                        }
                                }
                                if (bearer) {
                                        config.headers.Authorization = `Bearer ${bearer}`;
                                }
                        }
                } catch {}
                return config;
        },
        (error) => Promise.reject(error)
);

// Interceptor de respuesta: Maneja la expiración de tokens y otros errores de autenticación.
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
        const apiReason = error?.response?.data?.reason;
        const isAuthLike = status === 401 || status === 403;
        
        // Razones que nunca intentan refresh (logout directo)
        const terminalReasons = new Set(['invalid-token','soft-deleted','user-not-found','no-token','no-rtoken','expired-rtoken']);
        
        // Refrescar si el access token expiró o si el backend indica que no hay access token (pero podría existir refresh cookie)
        const shouldRefresh = isAuthLike && (apiReason === 'expired' || apiReason === 'no-token') && !original?._retry;

        // Si la cuenta está suspendida, limpiamos sesión y redirigimos.
        if (isAuthLike && apiReason === 'suspended') {
            try { localStorage.clear(); } catch {} // Limpiar todo por seguridad
            if (typeof window !== 'undefined') {
                const path = window.location?.pathname || '';
                if (!path.startsWith('/login')) window.location.href = '/login?reason=suspended';
            }
            return Promise.reject(error);
        }

        if (shouldRefresh) {
            original._retry = true;
            if (isRefreshing) {
                // Pone en cola las peticiones mientras se refresca el token.
                return new Promise((_, reject) => pendingQueue.push({ reject }));
            }
            isRefreshing = true;
            try {
                await instance.post('/token/refresh'); // Llama al endpoint para refrescar el token
                isRefreshing = false;
                return instance(original); // Reintenta la petición original con el nuevo token
            } catch (e) {
                isRefreshing = false;
                processQueue(e);
                // Si el refresh falla, hacemos logout.
                try { localStorage.clear(); } catch {}
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