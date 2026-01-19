import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // jwt-decode kütüphanesini import edin
import { ENDPOINTS } from '../constants/endpoints';
import { handleUserDataError } from '../utils/errorHandler';
import { API_BASE_URL } from '../config/apiConfig';
const API_URL = API_BASE_URL;
// Axios instance oluştur
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});
// Request interceptor - Token'ı her istekte otomatik ekle
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
export const authService = {
  // Yönetici kaydı
  registerManager: async (userData) => {
    try {
      // ENDPOINTS kullanarak
      const response = await api.post(ENDPOINTS.IDENTITY.YONETICI_KAYIT, userData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        'Kayıt sırasında bir hata oluştu.'
      );
    }
  },
  // Kullanıcı (genel) kaydı - KullaniciKayitDTO
  registerUser: async (userData) => {
    try {
      // ENDPOINTS kullanarak - KullaniciKayitDTO için ayrı endpoint
      const response = await api.post(ENDPOINTS.IDENTITY.KULLANICI_KAYIT, userData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        'Kayıt sırasında bir hata oluştu.'
      );
    }
  },
  // Giriş - KullaniciGirisBilgiDTO'ya göre field mapping
  login: async (credentials) => {
    try {
      // Önce localStorage'ı tamamen temizle (eski verilerin kalmasını önle)
      localStorage.clear();
      
      // Backend KullaniciGirisBilgiDTO'ya göre field mapping
      const loginData = {
        kullaniciTelefon: credentials.kullaniciTelefon,
        kullaniciSifre: credentials.kullaniciSifre,
      };
      
      // ENDPOINTS.IDENTITY.LOGIN = /identity/giris
      const response = await api.post(ENDPOINTS.IDENTITY.LOGIN, loginData);
      
      // ResponseDTO { message, token } formatında gelir
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        'Giriş yapılırken bir hata oluştu.'
      );
    }
  },
  // Kullanıcı bilgilerini getir
  getUserInfo: async () => {
    try {
      // Token'dan kullanıcı ID'sini alıp dinamik URL oluşturma
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Yetkilendirme token\'ı bulunamadı.');
      }
      // Token'ı decode et ve kullanıcı ID'sini çıkar
      const decodedToken = jwtDecode(token);
      // JWT token içinde kullanıcı ID'si 'userId' claim'inde saklanıyor
      const kullaniciId = decodedToken.userId || decodedToken.sub || decodedToken.id;
      // JWT token'dan rolleri al
      const roles = decodedToken.roles || [];
      if (!kullaniciId) {
        throw new Error('Token içerisinde kullanıcı ID bilgisi bulunamadı.');
      }
      // API yolu ve Authorization header'ını log'la
      try {
        // Doğrudan URL kullanarak - chunked encoding hatasını aşmak için
        const response = await axios.get(`${API_BASE_URL}/identity/kullanici/bilgi/${kullaniciId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        });
        // API yanıtını kullan
        const userInfo = response.data;
        // Rol bilgisini token'dan al ve apartmanRol field'ını güncelle
        let apartmanRol = userInfo.apartmanRol;
        // Eğer API'dan rol bilgisi gelmiyorsa token'dan al
        if ((apartmanRol === null || apartmanRol === undefined) && roles.length > 0) {
          // Backend'deki rol formatını kontrol et
          if (roles.includes('ROLE_YONETICI')) {
            apartmanRol = 'ROLE_YONETICI';
          } else if (roles.includes('ROLE_APARTMANSAKIN')) {
            apartmanRol = 'ROLE_APARTMANSAKIN';
          }
        } else {
        }
        // ID bilgisini token'dan alınmış ID ile birleştir (API dönüşünde olmayabilir)
        const enhancedUserInfo = {
          ...userInfo,
          id: kullaniciId, // ID'yi token'dan alıp ekliyoruz
          apartmanRol: apartmanRol, // Rol bilgisini güncelle
          roles: roles // Token'dan alınan rolleri de ekle
        };
        // Kullanıcı bilgilerini localStorage'a kaydet
        localStorage.setItem('user', JSON.stringify(enhancedUserInfo));
        return enhancedUserInfo;
      } catch (err) {
        // Özel hata işleyici ile mockData döndür
        const mockUser = handleUserDataError(err);
        if (mockUser) {
          // Kullanıcı ID'sini token'dan al
          const mockUserWithId = { ...mockUser, id: kullaniciId };
          // Önbelleğe kaydet
          localStorage.setItem('user', JSON.stringify(mockUserWithId));
          // Demo kullanıcı bilgisini döndür
          return mockUserWithId;
        }
        // 401 veya 403 hatası durumunda logout yap
        if (err.response?.status === 401 || err.response?.status === 403) {
          authService.logout();
          throw new Error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        }
        // Network hatası durumunda token'dan basic user oluştur
        if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
          const basicUserInfo = {
            id: kullaniciId,
            kullaniciAdi: 'Kullanıcı',
            kullaniciSoyadi: '',
            kullaniciTelefon: decodedToken.sub || '',
            kullaniciEposta: '',
            apartmanRol: 'ROLE_YONETICI' // Varsayılan olarak yönetici
          };
          // localStorage'a kaydet
          localStorage.setItem('user', JSON.stringify(basicUserInfo));
          return basicUserInfo;
        }
        throw err;
      }
    } catch (error) {
      throw error;
    }
  },
  // Çıkış
  logout: () => {
    // LocalStorage'ı TAMAMEN temizle
    try {
      localStorage.clear();
    } catch (e) {
      // Fallback: önemli anahtarları tek tek sil
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userSitesMapping');
        localStorage.removeItem('selectedSite');
        localStorage.removeItem('kullaniciDaireBilgileri');
        localStorage.removeItem('cachedSites');
        localStorage.removeItem('lastUserId');
      } catch (fallbackError) {
      }
    }
    // Sayfanın yeniden yüklenerek state'in sıfırlanmasını sağlamak için
    window.location.href = '/giris';
  },
  // Token çözümle
  decodeToken: (token) => {
    try {
      if (!token) {
        token = localStorage.getItem('token');
      }
      if (!token) {
        throw new Error('Token bulunamadı');
      }
      const decoded = jwtDecode(token);
      // Rolleri al
      const roles = decoded.roles || [];
      // apartmanRol değerini rollere göre belirle
      let apartmanRol = null;
      if (roles.includes('ROLE_YONETICI')) {
        apartmanRol = 'ROLE_YONETICI';
      } else if (roles.includes('ROLE_APARTMANSAKIN')) {
        apartmanRol = 'ROLE_APARTMANSAKIN';
      }
      return {
        ...decoded,
        apartmanRol: apartmanRol,
        roles: roles
      };
    } catch (error) {
      return {}; // Boş nesne döndür
    }
  },
  // Token kontrolü
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return false;
    }
    try {
      // Token'ın süresinin dolup dolmadığını kontrol et
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      const isValid = decodedToken.exp > currentTime;
      if (!isValid) {
      }
      return isValid;
    } catch (error) {
      return false; // Token decode edilemezse geçersizdir.
    }
  },
  // Kullanıcı bilgilerini al (localStorage'dan veya token'dan)
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      // Çeşitli senaryolar
      if (user && token) {
        // Her şey normal, önbellekteki kullanıcıyı dön
        return JSON.parse(user);
      } else if (!user && token) {
        // Token var ama kullanıcı yok, token'dan kullanıcı bilgisi çıkar
        try {
          const decodedToken = jwtDecode(token);
          const userId = decodedToken.userId || decodedToken.sub;
          // Temel kullanıcı bilgisini oluştur (back-end'deki DTO formatına uygun)
          const basicUser = {
            id: userId,
            kullaniciAdi: "Kullanıcı",
            kullaniciSoyadi: "",
            kullaniciTelefon: decodedToken.sub || "",
            ApartmanRol: "ROLE_YONETICI"
          };
          // Sonradan kullanılmak üzere sakla
          localStorage.setItem('user', JSON.stringify(basicUser));
          return basicUser;
        } catch (e) {
          return null;
        }
      } else {
        // Ne token ne de kullanıcı var, oturum açık değil
        return null;
      }
    } catch (error) {
      return null;
    }
  },
  // Token'ı al
  getToken: () => {
    return localStorage.getItem('token');
  }
};
