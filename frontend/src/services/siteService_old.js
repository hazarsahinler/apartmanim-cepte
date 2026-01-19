import api from './api';
import { jwtDecode } from 'jwt-decode';
import { ENDPOINTS } from '../constants/endpoints';

const siteService = {
  // Kullanıcının sitelerini getir
  getUserSites: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Yetkilendirme token\'ı bulunamadı.');
      }

      // Token'ı decode et ve kullanıcı ID'sini çıkar
      const decodedToken = jwtDecode(token);
      
      // JWT token içinde kullanıcı ID'si 'userId' veya 'sub' veya 'id' claim'inde saklanıyor olabilir
      const kullaniciId = decodedToken.userId || decodedToken.sub || decodedToken.id;

      if (!kullaniciId) {
        throw new Error('Token içerisinden kullanıcı ID\'si alınamadı.');
      }
      
      try {
        // endpoints.js'den endpoint kullanarak API çağrısı yap
        const response = await api.get(`${ENDPOINTS.SITE.BY_KULLANICI}/${kullaniciId}`);
        
        // Başarılı olursa localStorage'a da kaydet (yedek için)
        if (response.data && Array.isArray(response.data)) {
          localStorage.setItem('test_sites', JSON.stringify(response.data));
        }
        
        return response.data;
      } catch (apiError) {
        // Hata durumunda localStorage'dan kayıtlı siteleri kontrol et
        const sitesJson = localStorage.getItem('test_sites');
        if (sitesJson) {
          return JSON.parse(sitesJson);
        }
        
        // Hiç site yoksa boş array dön
        return [];
      }
    } catch (error) {
      // Genel hata durumunda da localStorage'a bakalım
      const sitesJson = localStorage.getItem('test_sites');
      if (sitesJson) {
        return JSON.parse(sitesJson);
      }
      
      // En son çare boş array
      return [];
    }
  },

  // Yeni site ekle - SiteKayitDTO'ya göre field mapping
  addSite: async (siteData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Yetkilendirme token\'ı bulunamadı.');
      }

      // Token'ı decode et ve kullanıcı ID'sini çıkar
      const decodedToken = jwtDecode(token);
      const kullaniciId = decodedToken.userId || decodedToken.sub;

      if (!kullaniciId) {
        throw new Error('Token içerisinden kullanıcı ID\'si alınamadı.');
      }

      // Backend SiteKayitDTO'ya göre field mapping
      const sitePayload = {
        siteIsmi: siteData.siteIsmi,
        siteIl: siteData.siteIl,
        siteIlce: siteData.siteIlce,
        siteMahalle: siteData.siteMahalle,
        siteSokak: siteData.siteSokak,
        yoneticiId: parseInt(kullaniciId, 10)
      };

      try {
        const response = await api.post(ENDPOINTS.SITE.EKLE, sitePayload);
        
        // Başarılı eklemeden sonra localStorage'da da sakla (yedek olarak)
        if (response.data.success) {
          try {
            const sitesJson = localStorage.getItem('test_sites');
            const sites = sitesJson ? JSON.parse(sitesJson) : [];
            sites.push({
              siteIsmi: siteData.siteIsmi,
              siteIl: siteData.siteIl,
              siteIlce: siteData.siteIlce,
              siteMahalle: siteData.siteMahalle,
              siteSokak: siteData.siteSokak
            });
            localStorage.setItem('test_sites', JSON.stringify(sites));
          } catch (e) {
            // localStorage güncellenemedi
          }
        }
        
        return response.data;
      } catch (apiError) {
        
        // Fallback için localStorage'a ekleme
        const newSite = {
          siteId: Date.now(), // Geçici benzersiz ID
          siteIsmi: siteData.siteIsmi,
          siteIl: siteData.siteIl,
          siteIlce: siteData.siteIlce,
          siteMahalle: siteData.siteMahalle,
          siteSokak: siteData.siteSokak
        };
        
        const sitesJson = localStorage.getItem('test_sites');
        const sites = sitesJson ? JSON.parse(sitesJson) : [];
        sites.push(newSite);
        localStorage.setItem('test_sites', JSON.stringify(sites));
        
        return {
          success: true,
          message: 'Site geçici olarak kaydedildi. (Sunucu hatası: ' + (apiError.message || 'Bilinmeyen hata') + ')',
          data: newSite
        };
      }

    } catch (error) {
      
      // API hatası durumunda, yine de localStorage'a ekle
      try {
        const sitesJson = localStorage.getItem('test_sites');
        const sites = sitesJson ? JSON.parse(sitesJson) : [];
        const newSite = {
          siteId: Date.now(), // Geçici benzersiz ID
          siteIsmi: siteData.siteIsmi,
          siteIl: siteData.siteIl,
          siteIlce: siteData.siteIlce,
          siteMahalle: siteData.siteMahalle,
          siteSokak: siteData.siteSokak
        };
        sites.push(newSite);
        localStorage.setItem('test_sites', JSON.stringify(sites));
        
        return {
          success: true,
          message: 'Site geçici olarak kaydedildi (yerel olarak)',
          data: newSite
        };
      } catch (e) {
        // localStorage hatası durumunda orijinal hatayı fırlat
        throw new Error(
          error.response?.data?.message || 
          'Site eklenirken bir hata oluştu.'
        );
      }
    }
  },
};

export default siteService;
