import axios from "axios";

// Base URL configurable via Vite env; fallback to current host for same-site cookies over LAN
const envBase = import.meta?.env?.VITE_API_URL;
const host = (typeof window !== 'undefined' && window.location && window.location.hostname) ? window.location.hostname : 'localhost';
const baseURL = envBase || `http://${host}:1002/api`;

const instance = axios.create({
    baseURL,
    withCredentials: true,
});

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
        const shouldRefresh = (status === 401 || status === 403) && !original?._retry;

        if (shouldRefresh) {
            original._retry = true;
            if (isRefreshing) {
                // Cola de espera hasta que termine el refresh en curso
                return new Promise((_, reject) => pendingQueue.push({ reject }));
            }
            isRefreshing = true;
            try {
                await instance.post('/token/refresh');
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