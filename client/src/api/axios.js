import axios from "axios";

// Base URL configurable via Vite env; fallback to current host for same-site cookies over LAN
const envBase = import.meta?.env?.VITE_API_URL;
const host = (typeof window !== 'undefined' && window.location && window.location.hostname) ? window.location.hostname : 'localhost';
const baseURL = envBase || `http://${host}:1002/api`;

const instance = axios.create({
    baseURL,
    withCredentials: true,
});

export default instance;