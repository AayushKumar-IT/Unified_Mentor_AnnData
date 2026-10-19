import api from './api.js';

export const getFarmers = () => api.get('/farmers').then((response) => response.data.data);
export const getFarmer = (id) => api.get(`/farmers/${id}`).then((response) => response.data.data);
export const getMyFarmerProfile = () => api.get('/farmers/profile').then((response) => response.data.data);
export const saveFarmerProfile = (data, exists) => api[exists ? 'put' : 'post']('/farmers/profile', data).then((response) => response.data.data);
export const getSalesSummary = () => api.get('/farmers/sales-summary').then((response) => response.data.data);
export const getAnalytics = () => api.get('/admin/analytics').then((response) => response.data.data);
export const getPendingFarmers = () => api.get('/admin/farmers/pending').then((response) => response.data.data);
export const getAdminFarmers = () => api.get('/admin/farmers').then((response) => response.data.data);
export const getAdminConsumers = () => api.get('/admin/consumers').then((response) => response.data.data);
export const getAdminOrders = () => api.get('/admin/orders').then((response) => response.data.data);
export const reviewFarmer = (id, approved) => api.patch(`/admin/farmers/${id}/approve`, { approved }).then((response) => response.data.data);
