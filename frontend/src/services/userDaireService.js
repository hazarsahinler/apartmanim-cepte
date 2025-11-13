import api from './api';
import { ENDPOINTS } from '../constants/endpoints';

export const userDaireService = {
  // Kullanıcının telefon numarası ile daire bilgilerini getir
  getKullaniciDaireBilgileri: async (telefonNo) => {
    try {
      console.log('UserDaireService - Kullanıcı daire bilgileri getiriliyor:', telefonNo);
      
      // Token kontrolü yap
      const token = localStorage.getItem('token');
      console.log('UserDaireService - Token var mı:', !!token);
      console.log('UserDaireService - Token değeri (ilk 20 karakter):', token?.substring(0, 20));
      
      const response = await api.get(`${ENDPOINTS.STRUCTURE.KULLANICI_DAIRE}/${telefonNo}`);
      
      console.log('UserDaireService - Daire bilgileri yanıtı:', response.data);
      
      // Backend array döndürüyor, ilk elemanı al
      const daireData = Array.isArray(response.data) ? response.data[0] : response.data;
      console.log('UserDaireService - İşlenmiş daire datası:', daireData);
      
      // DaireResponseByKullaniciDTO response
      return daireData;
    } catch (error) {
      console.error('UserDaireService - Daire bilgileri getirme hatası:', error);
      
      if (error.response?.status === 404) {
        // Kullanıcının dairesi bulunamadı
        throw new Error('Kayıtlı daire bulunamadı. Site yöneticisi ile iletişime geçiniz.');
      } else if (error.response?.status === 403) {
        throw new Error('Bu bilgilere erişim yetkiniz bulunmamaktadır.');
      } else if (error.response?.status === 500) {
        throw new Error('Sunucu hatası. Lütfen daha sonra tekrar deneyiniz.');
      }
      
      throw new Error('Daire bilgileri alınırken beklenmeyen bir hata oluştu.');
    }
  },

  // Kullanıcının finansal verilerini getir
  getKullaniciFinansalOzet: async (daireId) => {
    try {
      console.log('UserDaireService - Kullanıcı finansal özeti getiriliyor:', daireId);
      
      // Daire borçlarını alıp finansal özet hesapla
      const borclar = await userDaireService.getKullaniciDaireBorclari(daireId);
      
      if (!borclar || borclar.length === 0) {
        return {
          toplamOdenen: 0,
          bekleyenOdemeler: 0,
          buAyTutari: 0,
          toplamBorc: 0
        };
      }
      
      let toplamOdenen = 0;
      let bekleyenOdemeler = 0;
      let buAyTutari = 0;
      let toplamBorc = 0;
      
      const buAy = new Date().getMonth();
      const buYil = new Date().getFullYear();
      
      borclar.forEach(borc => {
        const tutar = Number(borc.tutar) || 0;
        toplamBorc += tutar;
        
        if (borc.odendiMi) {
          toplamOdenen += tutar;
        } else {
          bekleyenOdemeler += tutar;
          
          // Bu ayın borçlarını kontrol et
          if (borc.sonOdemeTarihi) {
            const sonOdemeTarihi = new Date(borc.sonOdemeTarihi);
            if (sonOdemeTarihi.getMonth() === buAy && sonOdemeTarihi.getFullYear() === buYil) {
              buAyTutari += tutar;
            }
          }
        }
      });
      
      return {
        toplamOdenen,
        bekleyenOdemeler,
        buAyTutari,
        toplamBorc,
        borcSayisi: borclar.length,
        odenmemisBorcSayisi: borclar.filter(b => !b.odendiMi).length
      };
    } catch (error) {
      console.error('UserDaireService - Finansal özet hatası:', error);
      return {
        toplamOdenen: 0,
        bekleyenOdemeler: 0,
        buAyTutari: 0,
        toplamBorc: 0,
        borcSayisi: 0,
        odenmemisBorcSayisi: 0
      };
    }
  },

  // Kullanıcının daire borçlarını getir
  getKullaniciDaireBorclari: async (daireId) => {
    try {
      console.log('UserDaireService - Kullanıcı daire borçları getiriliyor:', daireId);
      
      const response = await api.get(`${ENDPOINTS.FINANCE.DAIRE_BORC}/${daireId}`);
      
      console.log('UserDaireService - Daire borçları yanıtı:', response.data);
      
      // DaireBorcResponseDTO array response
      return response.data;
    } catch (error) {
      console.error('UserDaireService - Daire borçları hatası:', error);
      
      if (error.response?.status === 404) {
        return []; // Borç bulunamadığında boş array döndür
      } else if (error.response?.status === 403) {
        throw new Error('Bu bilgilere erişim yetkiniz bulunmamaktadır.');
      } else if (error.response?.status === 500) {
        throw new Error('Sunucu hatası. Lütfen daha sonra tekrar deneyiniz.');
      }
      
      throw new Error('Daire borçları alınırken beklenmeyen bir hata oluştu.');
    }
  },

  // Kullanıcının ödeme isteklerini getir
  getKullaniciOdemeIstekleri: async (daireId) => {
    try {
      console.log('UserDaireService - Kullanıcı ödeme istekleri getiriliyor:', daireId);
      
      // Gelecekte kullanılacak API endpoint'i
      // const response = await api.get(`/finance/kullanici/odeme-istekleri/${daireId}`);
      
      // Şimdilik mock data döndürelim  
      return [
        {
          id: 1,
          borcId: 1,
          tutar: 850.00,
          durum: 'BEKLEMEDE',
          istekTarihi: '2024-11-08',
          aciklama: 'Kasım ayı aidat ödemesi için istek gönderildi'
        }
      ];
    } catch (error) {
      console.error('UserDaireService - Ödeme istekleri hatası:', error);
      return [];
    }
  },

  // Ödeme isteği gönder
  odemeIstegiGonder: async (daireBorcId) => {
    try {
      console.log('UserDaireService - Ödeme isteği gönderiliyor:', daireBorcId);
      
      const response = await api.post(`${ENDPOINTS.FINANCE.ODEME_ISTEK_GONDER}/${daireBorcId}`);
      
      console.log('UserDaireService - Ödeme isteği yanıtı:', response.data);
      return response.data;
    } catch (error) {
      console.error('UserDaireService - Ödeme isteği hatası:', error);
      
      if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Ödeme isteği gönderilemedi. Bilgileri kontrol ediniz.');
      } else if (error.response?.status === 403) {
        throw new Error('Bu işlem için yetkiniz bulunmamaktadır.');
      } else if (error.response?.status === 404) {
        throw new Error('İlgili borç kaydı bulunamadı.');
      } else if (error.response?.status === 409) {
        throw new Error('Bu borç için zaten ödeme isteği gönderilmiş.');
      } else if (error.response?.status === 500) {
        throw new Error('Sunucu hatası. Lütfen daha sonra tekrar deneyiniz.');
      }
      
      throw new Error('Ödeme isteği gönderilirken beklenmeyen bir hata oluştu.');
    }
  },

  // Ödeme isteği durumu kontrol et
  odemeIstekDurumKontrol: async (daireBorcId) => {
    try {
      console.log('UserDaireService - Ödeme isteği durumu kontrol ediliyor:', daireBorcId);
      
      const response = await api.get(`${ENDPOINTS.FINANCE.ODEME_ISTEK_DURUM}/${daireBorcId}`);
      
      console.log('UserDaireService - Ödeme isteği durum yanıtı:', response.data);
      
      // BorcOdemeIstekDurumResponseDTO response
      return response.data;
    } catch (error) {
      console.error('UserDaireService - Ödeme isteği durum kontrol hatası:', error);
      
      if (error.response?.status === 404) {
        // Ödeme isteği bulunamadı - henüz istek gönderilmemiş
        return { onaylandiMi: false };
      } else if (error.response?.status === 403) {
        throw new Error('Bu bilgilere erişim yetkiniz bulunmamaktadır.');
      } else if (error.response?.status === 500) {
        throw new Error('Sunucu hatası. Lütfen daha sonra tekrar deneyiniz.');
      }
      
      // Varsayılan olarak onaylanmamış kabul et
      return { onaylandiMi: false };
    }
  },

  // Daire bilgilerini formatla
  formatDaireBilgileri: (daire) => {
    console.log('UserDaireService - formatDaireBilgileri input:', daire);
    
    if (!daire) {
      console.warn('UserDaireService - formatDaireBilgileri: daire null/undefined');
      return null;
    }
    
    const formatted = {
      ...daire,
      adres: `${daire.siteIsmi || 'Site'} - ${daire.blokIsmi || 'Blok'} Blok - ${daire.katNo || '?'}. Kat - Daire ${daire.daireNo || '?'}`,
      kisaAdres: `${daire.blokIsmi || 'Blok'} - ${daire.daireNo || '?'}`,
      tamAdres: `${daire.siteIsmi || 'Site'}, ${daire.siteAdresi || 'Adres belirtilmemiş'}`
    };
    
    console.log('UserDaireService - formatDaireBilgileri output:', formatted);
    return formatted;
  },

  // LocalStorage'da daire bilgilerini sakla
  saveDaireBilgileri: (daire) => {
    try {
      localStorage.setItem('userDaire', JSON.stringify(daire));
    } catch (error) {
      console.error('UserDaireService - Daire bilgileri saklama hatası:', error);
    }
  },

  // LocalStorage'dan daire bilgilerini al
  getSavedDaireBilgileri: () => {
    try {
      const saved = localStorage.getItem('userDaire');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('UserDaireService - Daire bilgileri alma hatası:', error);
      return null;
    }
  },

  // Daire bilgilerini temizle
  clearDaireBilgileri: () => {
    try {
      localStorage.removeItem('userDaire');
    } catch (error) {
      console.error('UserDaireService - Daire bilgileri temizleme hatası:', error);
    }
  }
};

export default userDaireService;