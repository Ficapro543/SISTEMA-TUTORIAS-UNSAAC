// utils/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos para producción
});

// Variable para controlar refresh concurrente
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Interceptor de request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de response - MEJORADO para producción
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si el error NO es de autenticación o ya reintentamos
    if (!error.response ||
      ![401, 403].includes(error.response.status) ||
      originalRequest._retry) {
      return Promise.reject(error);
    }

    // Si es una petición al endpoint de login o refresh, no reintentar refresh automatico
    if (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    // Si ya estamos refrescando, encolar la petición
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch(err => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refreshToken
      }, {
        headers: { 'Content-Type': 'application/json' }
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data;

      // Actualizar tokens
      localStorage.setItem('accessToken', accessToken);
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }

      // Actualizar header para futuras peticiones
      api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

      // Procesar cola de peticiones en espera
      processQueue(null, accessToken);

      // Reintentar petición original
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return api(originalRequest);

    } catch (refreshError) {
      // Error en refresh, limpiar todo
      processQueue(refreshError, null);
      localStorage.clear();

      // Solo redirigir si estamos en el navegador
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;