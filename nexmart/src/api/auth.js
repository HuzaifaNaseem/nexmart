import { post, get, patch, clearTokens } from './client.js';

export const register = (email, password, first_name, last_name) =>
  post('/auth/register', { email, password, first_name, last_name });

export const login = (email, password) =>
  post('/auth/login', { email, password });

export const getMe = () => get('/auth/me');

export const updateMe = (data) => patch('/auth/me', data);

export const logout = () => { clearTokens(); };
