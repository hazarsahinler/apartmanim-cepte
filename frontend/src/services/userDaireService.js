import api from './api';
import { ENDPOINTS } from '../constants/endpoints';

export const userDaireService = {
  // Kullanıcının telefon numarası ile daire bilgilerini getir (tüm daireler)
  getKullaniciDaireBilgileri: async (telefonNo) => {
    try {
      const response = await api.get(`${ENDPOINTS.STRUCTURE.KULLANICI_DAIRE}/${telefonNo}`);
      
      // Backend array döndürüyor, tümünü return et
      const daireData = Array.isArray(response.data) ? response.data : [response.data];
      
      // DaireResponseByKullaniciDTO[] response
      return daireData;
    } catch (error) {
      
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
      const response = await api.get(`${ENDPOINTS.FINANCE.DAIRE_BORC}/${daireId}`);
      
      // DaireBorcResponseDTO array response
      return response.data;
    } catch (error) {
      
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
      return [];
    }
  },

  // Ödeme isteği gönder
  odemeIstegiGonder: async (daireBorcId) => {
    try {
      const response = await api.post(`${ENDPOINTS.FINANCE.ODEME_ISTEK_GONDER}/${daireBorcId}`);
      
      return response.data;
    } catch (error) {
      
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
      const response = await api.get(`${ENDPOINTS.FINANCE.ODEME_ISTEK_DURUM}/${daireBorcId}`);
      
      // BorcOdemeIstekDurumResponseDTO response
      return response.data;
    } catch (error) {
      
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
    if (!daire) {
      return null;
    }
    
    const formatted = {
      ...daire,
      adres: `${daire.siteIsmi || 'Site'} - ${daire.blokIsmi || 'Blok'} Blok - ${daire.katNo || '?'}. Kat - Daire ${daire.daireNo || '?'}`,
      kisaAdres: `${daire.blokIsmi || 'Blok'} - ${daire.daireNo || '?'}`,
      tamAdres: `${daire.siteIsmi || 'Site'}, ${daire.siteAdresi || 'Adres belirtilmemiş'}`
    };
    
    return formatted;
  },

  // LocalStorage'da daire bilgilerini sakla
  saveDaireBilgileri: (daire) => {
    try {
      localStorage.setItem('userDaire', JSON.stringify(daire));
    } catch (error) {
      // Hata sessizce yoksayılıyor
    }
  },

  // LocalStorage'dan daire bilgilerini al
  getSavedDaireBilgileri: () => {
    try {
      const saved = localStorage.getItem('userDaire');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      return null;
    }
  },

  // Total apartman gelirini getir
  getTotalApartmanGelir: async (siteId) => {
    try {
      const response = await api.get(`/finance/total/gelir/${siteId}`);
      
      // TotalApartmanGelirResponseDTO döner: { tutar: BigDecimal }
      return response.data;
    } catch (error) {
      if (error.response?.status === 403) {
        throw new Error('Bu bilgilere erişim yetkiniz bulunmamaktadır.');
      } else if (error.response?.status === 404) {
        // Gelir bulunamadıysa sıfır döner
        return { tutar: 0 };
      } else if (error.response?.status === 500) {
        throw new Error('Sunucu hatası. Lütfen daha sonra tekrar deneyiniz.');
      }
      
      // Hata durumunda sıfır döner
      return { tutar: 0 };
    }
  },

  // Seçilen daire bilgisini localStorage'a kaydet
  setSelectedDaire: (daireInfo) => {
    try {
      localStorage.setItem('selectedDaire', JSON.stringify(daireInfo));
    } catch (error) {
      // Hata sessizce yoksayılıyor
    }
  },

  // Seçilen daire bilgisini localStorage'dan getir
  getSelectedDaire: () => {
    try {
      const savedDaire = localStorage.getItem('selectedDaire');
      return savedDaire ? JSON.parse(savedDaire) : null;
    } catch (error) {
      return null;
    }
  },

  // Seçilen daire bilgisini temizle
  clearSelectedDaire: () => {
    try {
      localStorage.removeItem('selectedDaire');
    } catch (error) {
      // Hata sessizce yoksayılıyor
    }
  },

  // Daire bilgilerini temizle
  clearDaireBilgileri: () => {
    try {
      localStorage.removeItem('userDaire');
    } catch (error) {
      // Hata sessizce yoksayılıyor
    }
  }
};

export default userDaireService;
