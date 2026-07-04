import { get, post, patch, del } from './client.js';

export const getCart        = ()                         => get('/cart/');
export const addToCart      = (product_id, quantity = 1) => post('/cart/', { product_id, quantity });
export const updateCartItem = (item_id, quantity)        => patch(`/cart/${item_id}`, { quantity });
export const removeCartItem = (item_id)                  => del(`/cart/${item_id}`);
export const clearCart      = ()                         => del('/cart/clear');
