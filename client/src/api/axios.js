import axios from 'axios';

const api = axios.create({
<<<<<<< HEAD
  baseURL: import.meta.env.MODE === 'production' ? '' : 'http://localhost:5000',
=======
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'production' ? '' : 'http://localhost:5000'),
>>>>>>> 3f76ae5 (updated)
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
