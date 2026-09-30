import { get } from './client.js';
import demoProducts from '../data/demoProducts.json';

function demoPage(params) {
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 100;
  let items = demoProducts;
  if (params.category) items = items.filter(item => item.category === params.category);
  if (params.search) {
    const query = String(params.search).toLowerCase();
    items = items.filter(item => [item.name, item.brand, item.category, item.description].some(value => value?.toLowerCase().includes(query)));
  }
  return { items: items.slice((page - 1) * limit, page * limit), total: items.length, page, pages: Math.ceil(items.length / limit) };
}

export const fetchProducts = (params = {}) => {
  const qs = new URLSearchParams(Object.entries(params).filter(([, value]) => value != null && value !== '')).toString();
  return get(`/products/${qs ? '?' + qs : ''}`).catch(() => demoPage(params));
};

export const fetchProduct = id => get(`/products/${id}`).catch(() => {
  const product = demoProducts.find(item => String(item.id) === String(id));
  if (!product) throw new Error('Product not found');
  return product;
});

export const fetchProductBySlug = slug => get(`/products/slug/${slug}`).catch(() => {
  const product = demoProducts.find(item => item.slug === slug);
  if (!product) throw new Error('Product not found');
  return product;
});
