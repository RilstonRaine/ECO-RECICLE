// src/api/http.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  // tenta vários lugares
  const ls = JSON.parse(localStorage.getItem('auth') || '{}');
  const ss = JSON.parse(sessionStorage.getItem('auth') || '{}');
  const candidates = [
    ls?.token,
    ss?.token,
    localStorage.getItem('token'),
    sessionStorage.getItem('token'),
  ].filter(Boolean);
  const token = candidates[0];

  if (token && !config.headers?.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
