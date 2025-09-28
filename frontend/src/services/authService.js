import api from './api';
import { ENDPOINTS } from '../constants/endpoints';

export const authService = {
  registerManager: async (userData) => {
    try {
      const response = await api.post(ENDPOINTS.IDENTITY.YONETICI_KAYIT, userData);
      return response.data;
    } catch (error) {
      throw {
        message: error.response?.data?.message || 'Kayıt sırasında bir hata oluştu.',
        status: error.response?.status
      };
    }
  }
};