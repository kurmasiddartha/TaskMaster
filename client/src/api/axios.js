import axios from 'axios';

const getBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'production' ? '' : 'http://localhost:5000');
  
  // Strip /api or /api/ since it's already hardcoded in service endpoints
  if (url.endsWith('/api')) {
    url = url.slice(0, -4);
  } else if (url.endsWith('/api/')) {
    url = url.slice(0, -5);
  }
  
  // Strip trailing slash
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  
  return url;
};

const api = axios.create({
  baseURL: getBaseUrl(),
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;