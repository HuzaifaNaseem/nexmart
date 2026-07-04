import { get } from './client.js';

export const getAdminStats    = ()              => get('/admin/stats');
export const getRevenueChart  = (days = 30)     => get(`/admin/revenue?days=${days}`);
export const getRecentOrders  = (limit = 10)    => get(`/admin/orders/recent?limit=${limit}`);
export const getTopProducts   = (limit = 10)    => get(`/admin/products/top?limit=${limit}`);
