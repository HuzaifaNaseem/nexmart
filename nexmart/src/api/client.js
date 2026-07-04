const API_BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:8001'}/api/v1`;

export function getToken() {
  return localStorage.getItem('nexmart_access_token');
}

export function setTokens(access, refresh) {
  localStorage.setItem('nexmart_access_token', access);
  if (refresh) localStorage.setItem('nexmart_refresh_token', refresh);
}

export function clearTokens() {
  localStorage.removeItem('nexmart_access_token');
  localStorage.removeItem('nexmart_refresh_token');
}

export async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };

  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    clearTokens();
    window.dispatchEvent(new CustomEvent('nexmart:unauthorized'));
  }

  let data = null;
  if (res.status !== 204) {
    try { data = await res.json(); } catch { /* empty body */ }
  }

  if (!res.ok) {
    throw new Error(data?.detail || 'Request failed');
  }

  return data;
}

export const get   = (path)       => apiFetch(path);
export const post  = (path, body) => apiFetch(path, { method: 'POST',  body: JSON.stringify(body) });
export const patch = (path, body) => apiFetch(path, { method: 'PATCH', body: JSON.stringify(body) });
export const del   = (path)       => apiFetch(path, { method: 'DELETE' });
