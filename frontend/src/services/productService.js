import api from './api.js';

export const getProducts = (params = {}) => api.get('/products', { params }).then((response) => response.data.data);
export const getProduct = (id) => api.get(`/products/${id}`).then((response) => response.data.data);
export const getMyProduct = (id) => api.get(`/products/mine/${id}`).then((response) => response.data.data);
export const getFarmerProducts = (id) => api.get(`/products/farmer/${id}`).then((response) => response.data.data);
export const getMyProducts = () => api.get('/products/mine').then((response) => response.data.data);
export const createProduct = (data) => api.post('/products', data).then((response) => response.data.data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data).then((response) => response.data.data);
export const setProductAvailability = (id, isAvailable) => api.put(`/products/${id}`, { isAvailable }).then((response) => response.data.data);
export const deleteProduct = (id) => api.delete(`/products/${id}`).then((response) => response.data.data);
export const getCategories = () => api.get('/admin/categories').then((response) => response.data.data);
export const getProductReviews = (id) => api.get(`/reviews/product/${id}`).then((response) => response.data.data);
export const createReview = (data) => api.post('/reviews', data).then((response) => response.data.data);
