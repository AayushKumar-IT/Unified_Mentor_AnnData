import api from './api.js';

export const register = (data) => api.post('/auth/register', data).then((response) => response.data.data);
export const login = (data) => api.post('/auth/login', data).then((response) => response.data.data);
export const getMe = () => api.get('/auth/me').then((response) => response.data.data.user);
export const updatePassword = (data) => api.put('/auth/updatepassword', data).then((response) => response.data.data);
