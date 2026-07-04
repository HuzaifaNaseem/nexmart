import { get } from './client.js';

export const fetchProducts = (params = {}) => {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v != null && v !== '')
  ).toString();
  return get(`/products/${qs ? '?' + qs : ''}`);
};

export const fetchProduct       = (id)   => get(`/products/${id}`);
export const fetchProductBySlug = (slug) => get(`/products/slug/${slug}`);
