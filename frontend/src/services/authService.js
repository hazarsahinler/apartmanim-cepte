import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // jwt-decode kütüphanesini import edin

const API_URL = 'http://localhost:8080/api/identity';

// Axios instance oluştur
const api = axios.create({
  baseURL: API_URL,
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

// Response interceptor - Token süresi dolmuşsa logout yap
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token hatası durumunda temizlik yap ve giriş sayfasına yönlendir
      authService.logout(); 
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // Yönetici kaydı
  registerManager: async (userData) => {
    try {
      // DÜZELTME: API yolu dokümandaki gibi '/yonetici/kayit' olarak güncellendi.
      const response = await api.post('/yonetici/kayit', userData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        'Kayıt sırasında bir hata oluştu.'
      );
    }
  },

  // Giriş
  login: async (credentials) => {
    try {
      // BU KISIM DOĞRUYDU, DEĞİŞTİRİLMEDİ.
      const response = await api.post('/giris', {
        kullaniciTelefon: credentials.kullaniciTelefon,
        kullaniciSifre: credentials.kullaniciSifre,
      });

      // Token'ı kaydet
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
      // ENTEGRASYON: Token'dan kullanıcı ID'sini (telefon no) alıp dinamik URL oluşturma
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Yetkilendirme token\'ı bulunamadı.');
      }

      // Token'ı decode et ve 'sub' (subject) alanını al.
      // API dökümanınızdaki örnek token'a göre 'sub' alanı telefon numarasını içeriyor.
      const decodedToken = jwtDecode(token);
      const kullaniciId = decodedToken.sub; // 'sub' genellikle kullanıcı kimliğidir.

      if (!kullaniciId) {
        throw new Error('Token içerisinden kullanıcı kimliği alınamadı.');
      }
      
      // DÜZELTME: API yolu dokümandaki gibi '/kullanici/bilgi/{kullaniciId}' formatına getirildi.
      const response = await api.get(`/kullanici/bilgi/${kullaniciId}`);
      const userInfo = response.data;
      
      // Kullanıcı bilgilerini localStorage'a kaydet
      localStorage.setItem('user', JSON.stringify(userInfo));
      
      return userInfo;
    } catch (error) {
      // Token decode hatası veya network hatası olabilir
      const errorMessage = error.response?.data?.message || error.message || 'Kullanıcı bilgileri alınamadı.';
      throw new Error(errorMessage);
    }
  },

  // Çıkış
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Sayfanın yeniden yüklenerek state'in sıfırlanmasını sağlamak için
    window.location.href = '/giris';
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

  // Kullanıcı bilgilerini al (localStorage'dan)
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Token'ı al
  getToken: () => {
    return localStorage.getItem('token');
  }
};