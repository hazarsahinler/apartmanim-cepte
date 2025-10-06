import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // jwt-decode kütüphanesini import edin
import { ENDPOINTS } from '../constants/endpoints';

const API_URL = 'http://localhost:8080/api';

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

  // Giriş - KullaniciGirisBilgiDTO'ya göre field mapping
  login: async (credentials) => {
    try {
      console.log('Giriş isteği gönderiliyor:', {
        kullaniciTelefon: credentials.kullaniciTelefon,
        kullaniciSifre: credentials.kullaniciSifre,
      });

      // Backend KullaniciGirisBilgiDTO'ya göre field mapping
      const loginData = {
        kullaniciTelefon: credentials.kullaniciTelefon,
        kullaniciSifre: credentials.kullaniciSifre,
      };

      // ENDPOINTS.IDENTITY.LOGIN = /identity/giris
      const response = await api.post(ENDPOINTS.IDENTITY.LOGIN, loginData);

      console.log('Giriş yanıtı:', response.data);

      // ResponseDTO { message, token } formatında gelir
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }

      return response.data;
    } catch (error) {
      console.error('Giriş API hatası:', error);
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
      console.log('Decoded token:', decodedToken);
      
      // JWT token içinde kullanıcı ID'si 'userId' veya 'sub' claim'inde saklanıyor olabilir
      const kullaniciId = decodedToken.userId || decodedToken.sub || decodedToken.id;

      if (!kullaniciId) {
        console.error('Token içeriği:', decodedToken);
        throw new Error('Token içerisinde kullanıcı ID bilgisi bulunamadı.');
      }
      
      console.log('Kullanıcı ID:', kullaniciId);
      
      // API yolu ve Authorization header'ını log'la
      console.log(`API çağrısı yapılıyor: ${ENDPOINTS.IDENTITY.KULLANICI_BILGI}/${kullaniciId}`);
      console.log('Authorization header:', `Bearer ${token}`);
      
      try {
        // ENDPOINTS kullanarak
        const response = await api.get(`${ENDPOINTS.IDENTITY.KULLANICI_BILGI}/${kullaniciId}`);
        // API yanıtını kullan
        const userInfo = response.data;
        console.log('Kullanıcı bilgileri alındı:', userInfo);
        
        // ID bilgisini token'dan alınmış ID ile birleştir (API dönüşünde olmayabilir)
        const enhancedUserInfo = {
          ...userInfo,
          id: kullaniciId // ID'yi token'dan alıp ekliyoruz
        };
        
        console.log('Zenginleştirilmiş kullanıcı bilgileri:', enhancedUserInfo);
        
        // Kullanıcı bilgilerini localStorage'a kaydet
        localStorage.setItem('user', JSON.stringify(enhancedUserInfo));
        
        return enhancedUserInfo;
      } catch (err) {
        console.error('Kullanıcı bilgileri alınırken hata:', err);
        
        // 401 veya 403 hatası durumunda logout yap
        if (err.response?.status === 401 || err.response?.status === 403) {
          console.log('Yetkilendirme hatası. Çıkış yapılıyor.');
          authService.logout();
          throw new Error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        }
        
        throw err;
      }
    } catch (error) {
      console.error('getUserInfo hatası:', error);
      throw error;
    }
  },

  // Çıkış
  logout: () => {
    // Kullanıcı bilgilerini al (eğer varsa)
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (userData && userData.id) {
        // siteStorageService'i direkt import etmek yerine, localStorage'dan
        // kullanıcıya ait tüm verileri temizleyelim
        const userIdStr = userData.id.toString();
        
        // localStorage'da userSitesMapping anahtarını kontrol et ve güncelle
        const mappingJson = localStorage.getItem('userSitesMapping');
        if (mappingJson) {
          try {
            const mapping = JSON.parse(mappingJson);
            if (mapping[userIdStr]) {
              delete mapping[userIdStr];
              localStorage.setItem('userSitesMapping', JSON.stringify(mapping));
            }
          } catch (e) {
            console.error('Kullanıcı-site eşleştirme verisi temizlenirken hata:', e);
          }
        }
      }
    } catch (e) {
      console.error('Çıkış yaparken site verilerini temizlerken hata:', e);
    }
    
    // Kimlik doğrulama verilerini temizle
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
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
      
      // Artık gerçek JWT token yapısını taklit eden bir test token kullanıyoruz
      // Bu nedenle bu kodu kaldırdık ve doğrudan decode etmeyi kullanıyoruz
      
      const decoded = jwtDecode(token);
      console.log('Decoded token data:', decoded);
      return decoded;
    } catch (error) {
      console.error('Token çözümleme hatası:', error);
      return {}; // Boş nesne döndür
    }
  },
  
  // Token kontrolü
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      // Token'ın süresinin dolup dolmadığını kontrol et
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decodedToken.exp > currentTime;
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
            ApartmanRol: "YONETICI"
          };
          
          // Sonradan kullanılmak üzere sakla
          localStorage.setItem('user', JSON.stringify(basicUser));
          return basicUser;
        } catch (e) {
          console.error('Token decode hatası:', e);
          return null;
        }
      } else {
        // Ne token ne de kullanıcı var, oturum açık değil
        return null;
      }
    } catch (error) {
      console.error("Kullanıcı bilgisi parse edilirken hata:", error);
      return null;
    }
  },

  // Token'ı al
  getToken: () => {
    return localStorage.getItem('token');
  }
};