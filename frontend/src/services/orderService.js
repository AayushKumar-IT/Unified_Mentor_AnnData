import api from './api.js';

export const placeOrder = (data) => api.post('/orders', data).then((response) => response.data.data);
export const getMyOrders = () => api.get('/orders/my-orders').then((response) => response.data.data);
export const getFarmerOrders = () => api.get('/orders/farmer-orders').then((response) => response.data.data);
export const updateOrderStatus = (id, status) => api.patch(`/orders/${id}/status`, { status }).then((response) => response.data.data);
