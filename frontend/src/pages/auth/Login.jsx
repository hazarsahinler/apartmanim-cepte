import React, { useState } from 'react';
import { Smartphone, Lock, Eye, EyeOff, Home, AlertCircle } from 'lucide-react';
import { authService } from '../../services/authService';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    kullaniciTelefon: '',
    kullaniciSifre: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    // Hata mesajını temizle
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Normal giriş işlemi
      console.log('Giriş isteği gönderiliyor:', formData);
      const loginResponse = await authService.login(formData);
      console.log('Giriş başarılı:', loginResponse);
      
      // Token kontrolü
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Giriş başarılı ancak token alınamadı.');
      }
      
      // Login başarılı mesajını kontrol et
      if (loginResponse.message !== "Giriş başarılı.") {
        throw new Error(loginResponse.message || "Giriş bilgileri hatalı.");
      }
      
      // Kullanıcı bilgilerini al - kullanıcı ID'si ile
      try {
        console.log('Kullanıcı bilgileri alınıyor...');
        const userInfo = await authService.getUserInfo();
        console.log('Kullanıcı bilgileri alındı:', userInfo);
        
        // Token'dan rol bilgisini de al
        const decodedToken = authService.decodeToken();
        console.log('Token bilgileri:', decodedToken);
        
        // Kullanıcı rolüne göre yönlendir
        // Önce API'dan gelen rol bilgisini kontrol et, yoksa token'dan al
        let role = userInfo.apartmanRol;
        
        // Eğer API'dan rol gelmiyorsa token'dan al
        if (role === null || role === undefined) {
          role = decodedToken.apartmanRol;
        }
        
        console.log('API\'dan gelen userInfo:', userInfo);
        console.log('API\'dan gelen rol (userInfo.apartmanRol):', userInfo.apartmanRol);
        console.log('Token\'dan gelen rol (decodedToken.apartmanRol):', decodedToken.apartmanRol);
        console.log('Belirlenen final rol:', role);
        
        if (role === 'ROLE_YONETICI' || role === 'ApartmanYonetici' || role === 'Yonetici') {
          console.log('Yönetici olarak yönlendiriliyor...');
          navigate('/site-yonetimi');
        } else if (role === 'ROLE_APARTMANSAKIN' || role === 'ApartmanSakin' || role === 'Sakin') {
          console.log('Kullanıcı olarak yönlendiriliyor...');
          navigate('/kullanici-sayfasi');
        } else {
          console.warn('Rol belirsiz, varsayılan yönetici dashboardına yönlendiriliyor:', role);
          navigate('/site-yonetimi');
        }
      } catch (userInfoErr) {
        console.error('Kullanıcı bilgileri alınamadı:', userInfoErr);
        
        // Kullanıcı bilgileri alınamazsa token'dan rol kontrolü yap
        try {
          const decodedToken = authService.decodeToken();
          const tokenRole = decodedToken.apartmanRol;
          
          if (tokenRole === 'ROLE_YONETICI' || tokenRole === 'ApartmanYonetici' || tokenRole === 'Yonetici') {
            navigate('/site-yonetimi');
          } else if (tokenRole === 'ROLE_APARTMANSAKIN' || tokenRole === 'ApartmanSakin' || tokenRole === 'Sakin') {
            navigate('/kullanici-sayfasi');
          } else {
            navigate('/site-yonetimi');
          }
        } catch (tokenErr) {
          console.error('Token decode hatası:', tokenErr);
          navigate('/site-yonetimi');
        }
      }
    } catch (err) {
      setError(err.message || 'Giriş yapılırken bir hata oluştu.');
      console.error('Giriş hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
              <Home className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Apartman'ım Cepte
            </h2>
            <p className="text-gray-600">
              Hesabınıza giriş yapın
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Telefon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefon Numarası
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Smartphone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="kullaniciTelefon"
                  name="kullaniciTelefon"
                  type="tel"
                  autoComplete="tel"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  placeholder="5XXXXXXXXX"
                  value={formData.kullaniciTelefon}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Şifre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Şifre
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="kullaniciSifre"
                  name="kullaniciSifre"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  placeholder="Şifrenizi giriniz"
                  value={formData.kullaniciSifre}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Beni hatırla
                </label>
              </div>

              <div className="text-sm">
                <button
                  type="button"
                  className="font-medium text-green-600 hover:text-green-500"
                  onClick={() => alert('Şifre sıfırlama özelliği henüz aktif değil.')}
                >
                  Şifremi unuttum
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Giriş yapılıyor...
                </div>
              ) : (
                'Giriş Yap'
              )}
            </button>

            {/* Footer */}
            <div className="text-center mt-6">
              <p className="text-gray-600 text-sm mb-4">
                Hesabınız yok mu?
              </p>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => navigate('/kullanici-kayit')}
                  className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Apartman Sakin Kayıt
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/yonetici-kayit')}
                  className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                >
                  Yönetici Kayıt
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;