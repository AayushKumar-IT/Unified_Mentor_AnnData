import api from './api.js';

export const getSavedAddresses = () => api.get('/addresses').then((response) => response.data.data);
