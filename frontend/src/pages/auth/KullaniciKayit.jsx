import React, { useState } from 'react';
import { Eye, EyeOff, User, Mail, Phone, Lock, Home, CheckCircle, AlertCircle } from 'lucide-react';
import { authService } from '../../services/authService';
import { useNavigate } from 'react-router-dom';

const KullaniciKayit = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    kullaniciAdi: '',
    kullaniciSoyadi: '',
    kullaniciEposta: '',
    kullaniciTelefon: '',
    konutKullanim: 0, // 0: Ev sahibi, 1: Kiracı
    kullaniciSifre: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Form input değişikliklerini handle etme
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validation error'ı temizle
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Konut kullanım tipi değişikliği
  const handleKonutKullanimChange = (value) => {
    setFormData(prev => ({
      ...prev,
      konutKullanim: parseInt(value, 10)
    }));
  };

  // Şifre görünürlüğü toggle
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  // Form validasyonu
  const validateForm = () => {
    const errors = {};

    if (!formData.kullaniciAdi.trim()) {
      errors.kullaniciAdi = 'Ad alanı zorunludur';
    }

    if (!formData.kullaniciSoyadi.trim()) {
      errors.kullaniciSoyadi = 'Soyad alanı zorunludur';
    }

    if (!formData.kullaniciEposta.trim()) {
      errors.kullaniciEposta = 'E-posta alanı zorunludur';
    } else if (!/\S+@\S+\.\S+/.test(formData.kullaniciEposta)) {
      errors.kullaniciEposta = 'Geçerli bir e-posta adresi giriniz';
    }

    if (!formData.kullaniciTelefon.trim()) {
      errors.kullaniciTelefon = 'Telefon numarası zorunludur';
    } else if (!/^5\d{9}$/.test(formData.kullaniciTelefon.replace(/\s/g, ''))) {
      errors.kullaniciTelefon = 'Geçerli bir telefon numarası giriniz (5XXXXXXXXX)';
    }

    if (formData.konutKullanim !== 0 && formData.konutKullanim !== 1) {
      errors.konutKullanim = 'Lütfen konut kullanım tipini seçin.';
    }

    if (!formData.kullaniciSifre.trim()) {
      errors.kullaniciSifre = 'Şifre alanı zorunludur';
    } else if (formData.kullaniciSifre.length < 8) {
      errors.kullaniciSifre = 'Şifre en az 8 karakter olmalıdır';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form gönderimi
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const dataToSend = {
        ...formData,
        konutKullanim: Number(formData.konutKullanim)
      };

      await authService.registerUser(dataToSend);
      setSuccess('Apartman sakin kaydı başarıyla oluşturuldu! Giriş sayfasına yönlendiriliyorsunuz...');
      
      // 2 saniye sonra giriş sayfasına yönlendir
      setTimeout(() => {
        navigate('/giris');
      }, 2000);
      
    } catch (err) {
      setError(err.message || 'Kayıt sırasında bir hata oluştu.');
      console.error('Kayıt hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mb-4">
              <Home className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Apartman'ım Cepte
            </h1>
            <p className="text-gray-600 text-lg">Apartman Sakin Kayıt</p>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-400 rounded-r-lg">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Ad Soyad Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ad
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="kullaniciAdi"
                    value={formData.kullaniciAdi}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      validationErrors.kullaniciAdi 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300'
                    }`}
                    placeholder="Adınızı giriniz"
                  />
                </div>
                {validationErrors.kullaniciAdi && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.kullaniciAdi}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Soyad
                </label>
                <input
                  type="text"
                  name="kullaniciSoyadi"
                  value={formData.kullaniciSoyadi}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    validationErrors.kullaniciSoyadi 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                  placeholder="Soyadınızı giriniz"
                />
                {validationErrors.kullaniciSoyadi && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.kullaniciSoyadi}
                  </p>
                )}
              </div>
            </div>

            {/* E-posta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-posta
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="kullaniciEposta"
                  value={formData.kullaniciEposta}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    validationErrors.kullaniciEposta 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                  placeholder="ornek@email.com"
                />
              </div>
              {validationErrors.kullaniciEposta && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.kullaniciEposta}
                </p>
              )}
            </div>

            {/* Telefon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefon
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  name="kullaniciTelefon"
                  value={formData.kullaniciTelefon}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    validationErrors.kullaniciTelefon 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                  placeholder="5551234567"
                />
              </div>
              {validationErrors.kullaniciTelefon && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.kullaniciTelefon}
                </p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Format: 5XXXXXXXXX
              </p>
            </div>

            {/* Konut Kullanım Tipi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Konut Kullanım Tipi
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleKonutKullanimChange(0)}
                  className={`p-4 border-2 rounded-lg text-center transition-all ${
                    formData.konutKullanim === 0
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">Ev Sahibi</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleKonutKullanimChange(1)}
                  className={`p-4 border-2 rounded-lg text-center transition-all ${
                    formData.konutKullanim === 1
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">Kiracı</div>
                </button>
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
                  type={showPassword ? 'text' : 'password'}
                  name="kullaniciSifre"
                  value={formData.kullaniciSifre}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    validationErrors.kullaniciSifre 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                  placeholder="En az 8 karakter"
                />
                <button
                  type="button"
                  onClick={handleTogglePassword}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {validationErrors.kullaniciSifre && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.kullaniciSifre}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Kayıt Oluşturuluyor...
                </div>
              ) : (
                'Kayıt Ol'
              )}
            </button>

            {/* Footer */}
            <div className="text-center mt-6">
              <p className="text-gray-600 text-sm">
                Zaten hesabınız var mı?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/giris')}
                  className="text-blue-600 hover:text-blue-500 font-medium underline"
                >
                  Giriş Yap
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default KullaniciKayit;