import api from './api';
import { ENDPOINTS } from '../constants/endpoints';

export const yoneticiOdemeService = {
  
  // Yönetici için site ödeme isteklerini getir
  getSiteOdemeIstekleri: async (siteId) => {
    try {
      const response = await api.get(`${ENDPOINTS.FINANCE.ODEME_ISTEKLER}/${siteId}`);
      
      // BorcOdemeIstekResponseDTO array response
      return response.data;
    } catch (error) {
      
      if (error.response?.status === 404) {
        return []; // Ödeme isteği bulunamadı
      } else if (error.response?.status === 403) {
        throw new Error('Bu bilgilere erişim yetkiniz bulunmamaktadır.');
      } else if (error.response?.status === 500) {
        throw new Error('Sunucu hatası. Lütfen daha sonra tekrar deneyiniz.');
      }
      
      throw new Error('Ödeme istekleri alınırken beklenmeyen bir hata oluştu.');
    }
  },

  // Ödeme isteğini kabul et
  odemeIstegiKabulEt: async (daireBorcId) => {
    try {
      const response = await api.post(`${ENDPOINTS.FINANCE.ODEME_ISTEK_KABUL}/${daireBorcId}`);
      
      return response.data;
    } catch (error) {
      
      if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Ödeme isteği kabul edilemedi. Bilgileri kontrol ediniz.');
      } else if (error.response?.status === 403) {
        throw new Error('Bu işlem için yetkiniz bulunmamaktadır.');
      } else if (error.response?.status === 404) {
        throw new Error('İlgili ödeme isteği bulunamadı.');
      } else if (error.response?.status === 409) {
        throw new Error('Bu ödeme isteği zaten işlenmiş.');
      } else if (error.response?.status === 500) {
        throw new Error('Sunucu hatası. Lütfen daha sonra tekrar deneyiniz.');
      }
      
      throw new Error('Ödeme isteği kabul edilirken beklenmeyen bir hata oluştu.');
    }
  },

  // Ödeme isteklerini formatlama yardımcı fonksiyonu
  formatOdemeIstekleri: (istekler) => {
    if (!istekler || !Array.isArray(istekler)) {
      return [];
    }

    return istekler.map(istek => ({
      ...istek,
      istekTarihiFormatted: new Date(istek.istekTarihi).toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      adresKismi: `${istek.blokIsmi} Blok - ${istek.katNo}. Kat - Daire ${istek.daireNo}`,
      daireAdresi: `${istek.blokIsmi} - Daire ${istek.daireNo}`
    }));
  },

  // LocalStorage'da ödeme isteklerini sakla
  saveOdemeIstekleri: (siteId, istekler) => {
    try {
      const key = `odemeIstekleri_${siteId}`;
      localStorage.setItem(key, JSON.stringify(istekler));
    } catch (error) {
      // Hata sessizce yoksayılıyor
    }
  },

  // LocalStorage'dan ödeme isteklerini al
  getSavedOdemeIstekleri: (siteId) => {
    try {
      const key = `odemeIstekleri_${siteId}`;
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      return [];
    }
  },

  // Ödeme isteklerini temizle
  clearOdemeIstekleri: (siteId) => {
    try {
      const key = `odemeIstekleri_${siteId}`;
      localStorage.removeItem(key);
    } catch (error) {
      // Hata sessizce yoksayılıyor
    }
  }
};

export default yoneticiOdemeService;
