export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'BekPizza.pythonanywhere.com').replace(/\/$/, '');

export const apiUrl = (path) => `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

export const mediaUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('/')) return path;
  return apiUrl(path);
};
