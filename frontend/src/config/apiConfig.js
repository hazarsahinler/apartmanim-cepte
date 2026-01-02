// Merkezi API yapılandırması
// Bu dosya tüm servisler tarafından kullanılır

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Debug için
if (process.env.NODE_ENV === 'development') {
  console.log('API Base URL:', API_BASE_URL);
}
