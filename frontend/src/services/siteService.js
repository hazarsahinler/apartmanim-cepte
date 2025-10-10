import { jwtDecode } from 'jwt-decode';
import api fro          // Önbelleğe kaydet
        siteStorageService.saveSites(mappedSites, kullaniciId);
        
        return mappedSites;
      } catch (apiError) {
        console.error('Site verileri alınırken API hatası:', apiError);
        
        // ERR_INCOMPLETE_CHUNKED_ENCODING hatası veya bağlantı sorunları
        if (apiError.message?.includes('ERR_INCOMPLETE_CHUNKED_ENCODING') || 
            apiError.message?.includes('INCOMPLETE_CHUNKED_ENCODING') ||
            apiError.code === 'ERR_NETWORK') {
          
          console.log('Chunked encoding veya bağlantı hatası - önbellek kontrolü');
          
          // Önce önbellekten kontrol et
          const cachedSites = siteStorageService.getSites(kullaniciId);
          if (cachedSites && cachedSites.length > 0) {
            console.log('Önbellekten site verileri yüklendi:', cachedSites);
            toast.info('Sunucu bağlantı sorunu. Önbellekten veriler yüklendi.', { 
              position: "bottom-right", 
              autoClose: 5000 
            });
            return cachedSites;
          }
          
          // Önbellekte yoksa mock data kullan
          console.log('Önbellekte veri yok, demo veriler gösteriliyor');
          toast.info('Sunucu bağlantı sorunu. Demo veriler gösteriliyor.', { 
            position: "top-right", 
            autoClose: 5000 
          });
          return MOCK_DATA.sites;
        }
        
        // Diğer API hataları
        throw apiError;
      }
    } catch (error) {
      console.error('SiteService - Site listesi genel hatası:', error);
      
      // Son çare - demo veriler
      console.log('Son çare - Demo veriler kullanılıyor');
      toast.error('Beklenmeyen bir hata oluştu. Demo veriler gösteriliyor.', { 
        position: "top-center", 
        autoClose: 5000 
      });
      return MOCK_DATA.sites;
    } ENDPOINTS } from '../constants/endpoints';
import { toast } from 'react-toastify';
import { MOCK_DATA } from '../utils/mockData';
import siteStorageService from './siteStorageService';

export const siteService = {
  /**
   * Kullanıcının sitelerini getir - Chunked encoding hatalarını handle eder
   * @returns {Promise<Array>} Siteler listesi
   */
  getUserSites: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('SiteService - Token bulunamadı');
        // localStorage fallback
        const cachedSites = siteStorageService.getSites() || [];
        if (cachedSites.length > 0) {
          return cachedSites;
        }
        
        // Demo veriler
        console.log('Önbellekte veri yok, demo veriler gösteriliyor');
        return MOCK_DATA.sites;
      }

      // Token'dan kullanıcı ID'sini al
      const decodedToken = jwtDecode(token);
      const kullaniciId = decodedToken.userId || decodedToken.sub || decodedToken.id;
      
      if (!kullaniciId) {
        console.error('Token içeriği:', decodedToken);
        throw new Error('Token\'dan kullanıcı ID\'si alınamadı');
      }

      console.log('SiteService - Kullanıcı siteleri getiriliyor, kullaniciId:', kullaniciId);
      
      try {
        // Backend API: GET /structure/site/{kullaniciId} -> List<SiteResponseDTO>
        const response = await api.get(`${ENDPOINTS.SITE.BY_KULLANICI}/${kullaniciId}`);
        console.log('SiteService - Backend response:', response.data);
        
        // SiteResponseDTO mapping: { siteId, siteIsmi, siteIl, siteIlce, siteMahalle, siteSokak }
        const sites = response.data || [];
        
        // Frontend için field mapping - id field'ı ekleme
        const mappedSites = sites.map(site => ({
          ...site,
          id: site.siteId, // Frontend'de id field'ı bekleniyor
        }));
        
        console.log('SiteService - Mapped sites:', mappedSites);
        
        // Önbelleğe kaydet
        siteStorageService.saveSites(mappedSites, kullaniciId);
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
      
      // ERR_INCOMPLETE_CHUNKED_ENCODING hatası veya bağlantı sorunları
      if (error.message?.includes('ERR_INCOMPLETE_CHUNKED_ENCODING') || 
          error.message?.includes('INCOMPLETE_CHUNKED_ENCODING') ||
          error.code === 'ERR_NETWORK') {
            
        console.log('Chunked encoding veya bağlantı hatası - demo site ekleniyor');
        
        // Demo site oluştur
        const demoSite = {
          id: Date.now(), // Geçici ID
          siteId: Date.now(),
          siteIsmi: siteData.siteIsmi,
          siteIl: siteData.siteIl,
          siteIlce: siteData.siteIlce,
          siteMahalle: siteData.siteMahalle,
          siteSokak: siteData.siteSokak,
          _isTemp: true,
          _isDemo: true
        };
        
        try {
          // Önbelleğe ekle
          const cachedSites = siteStorageService.getSites(kullaniciId) || [];
          const updatedSites = [...cachedSites, demoSite];
          siteStorageService.saveSites(updatedSites, kullaniciId);
          
          toast.success('Site demo modunda eklendi! Sunucu bağlantısı kurulduğunda senkronize edilecek.', {
            position: "top-center",
            autoClose: 5000
          });
          
          return {
            success: true,
            message: 'Site demo modunda eklendi (Sunucu bağlantısı kurulamadı)',
            data: demoSite
          };
        } catch (localError) {
          console.error('Demo site önbellek kaydı hatası:', localError);
        }
      }
      
      // Diğer hatalar için normal error fırlat
      throw error;
    }
  }
};

export default siteService;