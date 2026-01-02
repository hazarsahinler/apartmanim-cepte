import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';

const BASE_URL = API_BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  // Content-Type'ı burada set etmeyin, request'te gerekirse set edilecek
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
    
    // FormData değilse default olarak application/json set et
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    // FormData ise axios otomatik olarak multipart/form-data ekleyecek
    
    // Basit logging
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    console.log('API Request - Content-Type:', config.headers['Content-Type']);
    
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