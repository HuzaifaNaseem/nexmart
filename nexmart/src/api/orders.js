import { get, post, patch } from './client.js';

export const checkout    = (shipping_address) => post('/orders/checkout', { shipping_address });
export const getOrders   = (page = 1)         => get(`/orders/?page=${page}&limit=10`);
export const getOrder    = (id)               => get(`/orders/${id}`);
export const cancelOrder = (id)               => patch(`/orders/${id}/cancel`);
