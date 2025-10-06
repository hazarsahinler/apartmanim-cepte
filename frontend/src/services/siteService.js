import { jwtDecode } from 'jwt-decode';
import api from './api';
import { ENDPOINTS } from '../constants/endpoints';

export const siteService = {
  // Kullanıcının sitelerini getir - Backend: GET /structure/site/{kullaniciId} -> List<SiteResponseDTO>
  getUserSites: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('SiteService - Token bulunamadı');
        // localStorage fallback
        const sitesJson = localStorage.getItem('test_sites');
        if (sitesJson) {
          const sites = JSON.parse(sitesJson);
          return Array.isArray(sites) ? sites : [];
        }
        return [];
      }

      // Token'dan kullanıcı ID'sini al
      const decodedToken = jwtDecode(token);
      const kullaniciId = decodedToken.userId || decodedToken.sub || decodedToken.id;
      
      if (!kullaniciId) {
        throw new Error('Token\'dan kullanıcı ID\'si alınamadı');
      }

      console.log('SiteService - Kullanıcı siteleri getiriliyor, kullaniciId:', kullaniciId);
      
      // Backend API: GET /structure/site/{kullaniciId} -> List<SiteResponseDTO>
      const response = await api.get(`${ENDPOINTS.SITE.BY_KULLANICI}/${kullaniciId}`);
      
      console.log('SiteService - Backend response:', response.data);
      
      // SiteResponseDTO mapping: { siteId, siteIsmi, siteIl, siteIlce, siteMahalle, siteSokak }
      const sites = response.data || [];
      
      // Frontend için field mapping - id field'ı ekleme
      const mappedSites = sites.map(site => ({
        ...site,
        id: site.siteId, // Frontend'de id field'ı bekleniyor
        // Backend SiteResponseDTO field'ları zaten doğru
      }));
      
      console.log('SiteService - Mapped sites:', mappedSites);
      
      // Başarılı olursa localStorage'a kaydet
      try {
        localStorage.setItem('test_sites', JSON.stringify(mappedSites));
      } catch (e) {
        console.warn('localStorage yazma hatası:', e);
      }
      
      return mappedSites;
    } catch (error) {
      console.error('SiteService - Site listesi hatası:', error);
      
      // Hata durumunda localStorage fallback
      const sitesJson = localStorage.getItem('test_sites');
      if (sitesJson) {
        console.log('SiteService - localStorage fallback kullanılıyor');
        const sites = JSON.parse(sitesJson);
        return Array.isArray(sites) ? sites : [];
      }
      
      return [];
    }
  },

  // Yeni site ekle - Backend: POST /structure/site/ekle -> ResponseDTO
  addSite: async (siteData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Yetkilendirme token\'ı bulunamadı.');
      }

      // Token'dan kullanıcı ID'sini al
      const decodedToken = jwtDecode(token);
      const kullaniciId = decodedToken.userId || decodedToken.sub || decodedToken.id;

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

      console.log('SiteService - Site ekleniyor (SiteKayitDTO):', sitePayload);
      
      // Backend API: POST /structure/site/ekle -> ResponseDTO { message, token }
      const response = await api.post(ENDPOINTS.SITE.EKLE, sitePayload);
      
      console.log('SiteService - Site ekleme yanıtı:', response.data);
      
      // Backend'den ResponseDTO gelir: { message, token }
      if (response.data && response.data.message) {
        // Başarılı ekleme sonrası site listesini yenile
        setTimeout(async () => {
          try {
            await this.getUserSites(); // Site listesini yenile
          } catch (e) {
            console.warn('Site listesi yenileme hatası:', e);
          }
        }, 1000);
        
        return {
          success: true,
          message: response.data.message,
          data: response.data
        };
      } else {
        throw new Error('Backend\'den beklenmeyen yanıt');
      }
    } catch (error) {
      console.error('SiteService - Site ekleme hatası:', error);
      
      // Fallback: localStorage'a geçici kayıt
      const newSite = {
        id: Date.now(), // Geçici ID
        siteId: Date.now(),
        siteIsmi: siteData.siteIsmi,
        siteIl: siteData.siteIl,
        siteIlce: siteData.siteIlce,
        siteMahalle: siteData.siteMahalle,
        siteSokak: siteData.siteSokak,
        _isTemp: true
      };
      
      try {
        const sitesJson = localStorage.getItem('test_sites');
        const sites = sitesJson ? JSON.parse(sitesJson) : [];
        sites.push(newSite);
        localStorage.setItem('test_sites', JSON.stringify(sites));
        
        return {
          success: true,
          message: 'Site geçici olarak kaydedildi (Backend hatası)',
          data: newSite
        };
      } catch (localError) {
        throw new Error('Site kaydedilemedi: ' + error.message);
      }
    }
  }
};

export default siteService;