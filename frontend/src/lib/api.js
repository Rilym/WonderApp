import axios from 'axios';

// Vite secara otomatis menyediakan import.meta.env.MODE
// Jika kita sedang 'npm run dev', nilainya adalah 'development'
// Jika Vercel sedang 'npm run build', nilainya adalah 'production'

const isProduction = import.meta.env.MODE === 'production';

// Tentukan URL berdasarkan mode
const baseURL = isProduction 
  ? 'https://wanderapp.onrender.com/api' // URL Render untuk Vercel
  : 'http://localhost:5000/api';         // URL Localhost untuk komputer Anda

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