import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // Timeout değerini artırıyoruz
  headers: {
    'Content-Type': 'application/json',
  },
});
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('API Request - Authorization header eklendi:', `Bearer ${token.substring(0, 20)}...`);
    } else {
      console.warn('API Request - Token bulunamadı!');
    }
    
    // Basit logging
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    console.log('API Request - Headers:', config.headers);
    
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    console.log('API Response Success:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.response?.config?.url);
    console.error('API Response Error Details:', error.response?.data);
    console.error('API Response Error Headers:', error.response?.headers);
    
    if (error.response?.status === 401) {
      console.warn('401 Unauthorized - Token siliniyor...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;