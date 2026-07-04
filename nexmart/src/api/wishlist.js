import { get, post, del } from './client.js';

export const getWishlist        = ()           => get('/wishlist/');
export const addToWishlist      = (product_id) => post(`/wishlist/${product_id}`);
export const removeFromWishlist = (product_id) => del(`/wishlist/${product_id}`);
