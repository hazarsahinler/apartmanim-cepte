import api from './api';
import { ENDPOINTS } from '../constants/endpoints';

export const odemeIstekService = {
  // Site ID ile ödeme isteklerini getir (YÖNETICI)
  getSiteOdemeIstekleri: async (siteId) => {
    try {
      console.log('OdemeIstekService - Site ödeme istekleri getiriliyor:', siteId);
      
      const response = await api.get(`${ENDPOINTS.FINANCE.ODEME_ISTEKLER}/${siteId}`);
      
      console.log('OdemeIstekService - Ödeme istekleri yanıtı:', response.data);
      
      // BorcOdemeIstekResponseDTO array response
      return response.data;
    } catch (error) {
      console.error('OdemeIstekService - Ödeme istekleri getirme hatası:', error);
      
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

  // Ödeme isteğini kabul et (YÖNETICI)
  odemeIstegiKabulEt: async (daireBorcId) => {
    try {
      console.log('OdemeIstekService - Ödeme isteği kabul ediliyor:', daireBorcId);
      
      const response = await api.post(`${ENDPOINTS.FINANCE.ODEME_ISTEK_KABUL}/${daireBorcId}`);
      
      console.log('OdemeIstekService - Ödeme isteği kabul yanıtı:', response.data);
      return response.data;
    } catch (error) {
      console.error('OdemeIstekService - Ödeme isteği kabul hatası:', error);
      
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

  // Ödeme isteklerini formatla
  formatOdemeIstekleri: (istekler) => {
    if (!istekler || !Array.isArray(istekler)) return [];
    
    return istekler.map(istek => ({
      ...istek,
      daireAdresi: `${istek.blokIsmi} Blok - ${istek.katNo}. Kat - Daire ${istek.daireNo}`,
      istekTarihiFormatli: new Date(istek.istekTarihi).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      gecenGunSayisi: Math.floor((new Date() - new Date(istek.istekTarihi)) / (1000 * 60 * 60 * 24))
    }));
  },

  // LocalStorage'da ödeme isteklerini sakla
  saveOdemeIstekleri: (siteId, istekler) => {
    try {
      localStorage.setItem(`odemeIstekleri_${siteId}`, JSON.stringify({
        data: istekler,
        timestamp: new Date().getTime()
      }));
    } catch (error) {
      console.error('OdemeIstekService - Ödeme istekleri saklama hatası:', error);
    }
  },

  // LocalStorage'dan ödeme isteklerini al
  getSavedOdemeIstekleri: (siteId) => {
    try {
      const saved = localStorage.getItem(`odemeIstekleri_${siteId}`);
      if (!saved) return null;
      
      const parsed = JSON.parse(saved);
      const now = new Date().getTime();
      const fiveMinutes = 5 * 60 * 1000;
      
      // 5 dakikadan eski cache'i geçersiz say
      if (now - parsed.timestamp > fiveMinutes) {
        localStorage.removeItem(`odemeIstekleri_${siteId}`);
        return null;
      }
      
      return parsed.data;
    } catch (error) {
      console.error('OdemeIstekService - Ödeme istekleri alma hatası:', error);
      return null;
    }
  },

  // DaireId'ye göre daire borçlarını getir (yeni API)
  getDaireBorcByDaireId: async (daireId) => {
    try {
      console.log('OdemeIstekService - Daire borçları alınıyor, daireId:', daireId);
      
      const response = await api.get(`${ENDPOINTS.FINANCE.DAIRE_BORC}/${daireId}`);
      console.log('OdemeIstekService - Daire borçları response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('OdemeIstekService - Daire borçları alma hatası:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Daire borç bilgisi bulunamadı.');
      } else if (error.response?.status === 403) {
        throw new Error('Bu işlem için yetkiniz bulunmuyor.');
      } else if (error.response?.status === 401) {
        throw new Error('Oturumunuz sonlanmış. Lütfen tekrar giriş yapın.');
      }
      
      throw new Error(error.response?.data?.message || 'Daire borçları alınırken bir hata oluştu.');
    }
  },

  // Borç ID'sine göre daire borçlarını getir (eski API)
  getDaireBorcByBorcId: async (borcId) => {
    try {
      console.log('OdemeIstekService - Borç detayları alınıyor:', borcId);
      
      const response = await api.get(`${ENDPOINTS.FINANCE.DAIRELER_BORC_BY_ID}/${borcId}`);
      console.log('OdemeIstekService - Borç detayları response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('OdemeIstekService - Borç detayları alma hatası:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Borç bilgisi bulunamadı.');
      } else if (error.response?.status === 403) {
        throw new Error('Bu işlem için yetkiniz bulunmuyor.');
      } else if (error.response?.status === 401) {
        throw new Error('Oturumunuz sonlanmış. Lütfen tekrar giriş yapın.');
      }
      
      throw new Error(error.response?.data?.message || 'Borç detayları alınırken bir hata oluştu.');
    }
  },

  // Borç türünü formatla
  formatBorcTuru: (borcAciklamasi) => {
    if (!borcAciklamasi) return 'Belirtilmemiş';
    
    if (borcAciklamasi.toLowerCase().includes('aidat')) {
      return 'Aylık Aidat';
    } else if (borcAciklamasi.toLowerCase().includes('özel') || borcAciklamasi.toLowerCase().includes('ozel')) {
      return 'Özel Masraf';
    } else if (borcAciklamasi.toLowerCase().includes('elektrik')) {
      return 'Elektrik';
    } else if (borcAciklamasi.toLowerCase().includes('su')) {
      return 'Su';
    } else if (borcAciklamasi.toLowerCase().includes('doğalgaz') || borcAciklamasi.toLowerCase().includes('dogalgaz')) {
      return 'Doğalgaz';
    }
    
    return borcAciklamasi;
  },

  // Cache'i temizle
  clearCache: (siteId) => {
    try {
      if (siteId) {
        localStorage.removeItem(`odemeIstekleri_${siteId}`);
      } else {
        // Tüm ödeme isteği cache'lerini temizle
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('odemeIstekleri_')) {
            localStorage.removeItem(key);
          }
        });
      }
    } catch (error) {
      console.error('OdemeIstekService - Cache temizleme hatası:', error);
    }
  }
};

export default odemeIstekService;