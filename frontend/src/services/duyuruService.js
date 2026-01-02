import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';

// Önem seviyeleri enum'u
export const ONEM_SEVIYELERI = {
  DUSUK: 'DUSUK',
  ORTA: 'ORTA',
  YUKSEK: 'YUKSEK'
};

const duyuruService = {
  // Axios instance oluştur
  axiosInstance: axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  }),

  // Request interceptor to add auth token
  setupInterceptors() {
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  },

  // Duyuru oluştur
  async createDuyuru(duyuruData) {
    try {
      this.setupInterceptors();
      const response = await this.axiosInstance.post('/duyuru/ekle', duyuruData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Duyuruları getir (filtrelenmiş veya hepsi)
  async getDuyurular(siteId = null, onemSeviyesi = null) {
    try {
      this.setupInterceptors();
      const params = {};
      if (siteId) params.siteId = siteId;
      if (onemSeviyesi) params.onemSeviyesi = onemSeviyesi;

      const response = await this.axiosInstance.get('/duyuru/duyurular', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Site bazlı duyurular
  async getDuyurularBySite(siteId) {
    return this.getDuyurular(siteId);
  },

  // Önem seviyesine göre duyurular
  async getDuyurularByOnem(onemSeviyesi) {
    return this.getDuyurular(null, onemSeviyesi);
  },

  // Hem site hem önem filtresi
  async getDuyurularFiltered(siteId, onemSeviyesi) {
    return this.getDuyurular(siteId, onemSeviyesi);
  },

  // Error handling
  handleError(error) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || 'Bir hata oluştu';
      
      if (status === 403) {
        console.error('403 Forbidden: Duyuru endpoint\'ine erişim yetkisi yok. Backend SecurityConfig kontrol edilmeli.');
        return new Error('Erişim yetkisi yok (403)');
      } else if (status === 401) {
        return new Error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
      }
      
      return new Error(message);
    } else if (error.request) {
      return new Error('Sunucuya ulaşılamıyor');
    } else {
      return new Error('Beklenmeyen bir hata oluştu');
    }
  },

  // Önem seviyesi helper'ları
  getOnemSeviyesiColor(seviye) {
    switch (seviye) {
      case 'DUSUK':
        return '#10B981'; // Yeşil
      case 'ORTA':
        return '#F59E0B'; // Turuncu
      case 'YUKSEK':
        return '#EF4444'; // Kırmızı
      default:
        return '#6B7280'; // Gri
    }
  },

  getOnemSeviyesiLabel(seviye) {
    switch (seviye) {
      case 'DUSUK':
        return 'Düşük';
      case 'ORTA':
        return 'Orta';
      case 'YUKSEK':
        return 'Yüksek';
      default:
        return 'Bilinmiyor';
    }
  },

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

export default duyuruService;