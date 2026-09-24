import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'URL_KOSONG_TOLONG_CEK_VERCEL'

const api = axios.create({
    baseURL: baseURL,
});

// Automatically attach token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
