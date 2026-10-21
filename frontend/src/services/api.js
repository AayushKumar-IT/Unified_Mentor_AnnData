import axios from 'axios';

const apiOrigin = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const apiBaseURL = `${apiOrigin.replace(/\/api\/v1\/?$/, '')}/api/v1`;

const api = axios.create({
  baseURL: apiBaseURL,
  timeout: 15000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
