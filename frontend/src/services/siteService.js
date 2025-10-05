import api from './api';
import { jwtDecode } from 'jwt-decode';

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
      console.log('Site service - Decoded token:', decodedToken);
      
      // JWT token içinde kullanıcı ID'si 'userId' veya 'sub' veya 'id' claim'inde saklanıyor olabilir
      const kullaniciId = decodedToken.userId || decodedToken.sub || decodedToken.id;

      if (!kullaniciId) {
        console.error('Site service - Token içeriği:', decodedToken);
        throw new Error('Token içerisinden kullanıcı ID\'si alınamadı.');
      }
      
      console.log('Site service - Kullanıcı ID:', kullaniciId);
      
      // API çağrısı yap
      console.log(`Siteler için API çağrısı: /structure/site/${kullaniciId}`);
      console.log('API URL:', api.defaults.baseURL + `/structure/site/${kullaniciId}`);
      
      try {
        // Path param olarak kullaniciId'yi gönder
        const response = await api.get(`/structure/site/${kullaniciId}`);
        
        // Başarılı olursa localStorage'a da kaydet (yedek için)
        if (response.data && Array.isArray(response.data)) {
          localStorage.setItem('test_sites', JSON.stringify(response.data));
        }
        
        return response.data;
      } catch (apiError) {
        console.error('Site API hatası:', apiError.response || apiError);
        
        // Hata durumunda localStorage'dan kayıtlı siteleri kontrol et
        const sitesJson = localStorage.getItem('test_sites');
        if (sitesJson) {
          console.log('API çağrısı başarısız, localStorage\'dan siteler alınıyor');
          return JSON.parse(sitesJson);
        }
        
        // Hiç site yoksa boş array dön
        console.log('Kayıtlı site bulunamadı, boş array dönülüyor');
        return [];
      }
    } catch (error) {
      console.error('getUserSites genel hata:', error);
      
      // Genel hata durumunda da localStorage'a bakalım
      const sitesJson = localStorage.getItem('test_sites');
      if (sitesJson) {
        return JSON.parse(sitesJson);
      }
      
      // En son çare boş array
      return [];
    }
  },

  // Yeni site ekle
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

      // Kullanıcı ID'sini siteData içine ekle
      const sitePayload = {
        ...siteData,
        yoneticiId: parseInt(kullaniciId, 10) // Ensure kullaniciId is a number
      };

      console.log('Site ekleniyor:', sitePayload);
      
      // Log the full URL being used
      console.log('API URL:', api.defaults.baseURL + `/structure/site/ekle`);
      
      try {
        const response = await api.post(`/structure/site/ekle`, sitePayload);
        
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
            console.warn('localStorage güncellenirken hata:', e);
          }
        }
        
        return response.data;
      } catch (apiError) {
        console.error('Site API hatası:', apiError.response || apiError);
        
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
        
        console.log('API hatası sonrası site localStorage\'a eklendi');
        return {
          success: true,
          message: 'Site geçici olarak kaydedildi. (Sunucu hatası: ' + (apiError.message || 'Bilinmeyen hata') + ')',
          data: newSite
        };
      }

    } catch (error) {
      console.error('Site eklenirken hata:', error);
      
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
        
        console.log('API hatası sonrası site localStorage\'a eklendi:', newSite);
        return {
          success: true,
          message: 'Site geçici olarak kaydedildi (yerel olarak)',
          data: newSite
        };
      } catch (e) {
        console.warn('localStorage güncellenirken hata:', e);
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