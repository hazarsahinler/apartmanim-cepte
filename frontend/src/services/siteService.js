import { jwtDecode } from 'jwt-decode';
import api from '../services/api';
import { ENDPOINTS } from '../constants/endpoints';
import { toast } from 'react-toastify';
import { MOCK_DATA } from '../utils/mockData';
import { siteStorageService } from './siteStorageService';

export const siteService = {
  // Kullanıcının sitelerini getir
  getUserSites: async (kullaniciId) => {
    try {
      const response = await api.get(`/structure/site/${kullaniciId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 403) {
        throw new Error('Bu işlem için yetkiniz bulunmuyor. Lütfen yönetici olarak giriş yaptığınızdan emin olun.');
      } else if (error.response?.status === 401) {
        throw new Error('Oturumunuz sonlanmış. Lütfen tekrar giriş yapın.');
      }
      
      throw new Error(
        error.response?.data?.message || 
        'Site verileri alınırken bir hata oluştu.'
      );
    }
  },

  searchUserByPhone: async (telefon) => {
    try {
      const response = await api.get(`${ENDPOINTS.IDENTITY.TELEFON_KONTROL}/${telefon}`);
      
      if (response.data) {
        return {
          success: true,
          user: response.data
        };
      } else {
        return {
          success: false,
          message: 'Kullanıcı bulunamadı'
        };
      }
    } catch (error) {
      if (error.response?.status === 404) {
        return {
          success: false,
          message: 'Bu telefon numarasıyla kayıtlı kullanıcı bulunamadı'
        };
      }
      
      throw new Error(
        error.response?.data?.message || 
        'Kullanıcı aranırken bir hata oluştu.'
      );
    }
  },

  addUserToApartment: async (kullaniciId, daireId) => {
    try {
      const payload = {
        kullaniciId: parseInt(kullaniciId, 10),
        daireId: parseInt(daireId, 10)
      };
      
      const response = await api.post('/structure/daire/sakin/ekle', payload);
      
      if (response.data && response.data.message) {
        return {
          success: true,
          message: response.data.message
        };
      } else {
        throw new Error('Backend\'den beklenmeyen yanıt');
      }
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error('Daireye sakin eklenirken bir hata oluştu.');
    }
  }
};

export default siteService;