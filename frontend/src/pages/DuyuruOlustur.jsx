import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import MainNavbar from '../components/MainNavbar';
import { authService } from '../services/authService';
import duyuruService from '../services/duyuruService';
import { useTheme } from '../contexts/ThemeContext';
import { 
  ArrowLeft, Plus, Bell, AlertCircle, Info, CheckCircle
} from 'lucide-react';
import { API_BASE_URL } from '../config/apiConfig';

const DuyuruOlustur = () => {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [siteData, setSiteData] = useState(null);
  
  const [formData, setFormData] = useState({
    duyuruMesaji: '',
    duyuruBaslik: '',
    onemSeviyesi: 'ORTA',
    siteId: siteId
  });

  useEffect(() => {
    const initializePage = async () => {
      try {
        if (!authService.isAuthenticated()) {
          navigate('/giris');
          return;
        }

        const userData = await authService.getUserInfo();
        
        // Yönetici kontrolü
        const userRole = userData?.apartmanRol || userData?.rol;
        if (!userData || (userRole !== 'YONETICI' && userRole !== 'Yonetici' && userRole !== 'ROLE_YONETICI')) {
          toast.error('Bu sayfaya erişim yetkiniz bulunmamaktadır.');
          navigate(`/site-panel/${siteId}`);
          return;
        }
        
        // Site bilgilerini API'den çek
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/structure/site/${userData.id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const sites = await response.json();
          const foundSite = sites.find(site => site.id === parseInt(siteId) || site.siteId === parseInt(siteId));
          
          if (foundSite) {
            setSiteData(foundSite);
            setFormData(prev => ({
              ...prev,
              siteId: foundSite.id || foundSite.siteId
            }));
          } else {
            toast.error('Site bulunamadı.');
            navigate('/site-yonetimi');
          }
        }
      } catch (error) {
        console.error('Sayfa yüklenirken hata:', error);
        toast.error('Sayfa yüklenirken bir hata oluştu.');
      }
    };
    
    initializePage();
  }, [navigate, siteId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.duyuruMesaji.trim()) {
      toast.error('Duyuru mesajı boş olamaz');
      return;
    }

    if (formData.duyuruMesaji.length < 10) {
      toast.error('Duyuru mesajı en az 10 karakter olmalıdır');
      return;
    }

    try {
      setLoading(true);
      
      const duyuruData = {
        duyuruMesaji: formData.duyuruMesaji,
        duyuruBaslik: formData.duyuruBaslik || null,
        siteId: parseInt(formData.siteId),
        onemSeviyesi: formData.onemSeviyesi
      };

      await duyuruService.createDuyuru(duyuruData);
      
      toast.success('Duyuru başarıyla oluşturuldu!');
      
      // Site paneline dön
      navigate(`/site-panel/${formData.siteId}`);
      
    } catch (error) {
      console.error('Duyuru oluşturma hatası:', error);
      toast.error(error.message || 'Duyuru oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getOnemIcon = (seviye) => {
    switch (seviye) {
      case 'YUKSEK':
        return <AlertCircle className="h-4 w-4" />;
      case 'ORTA':
        return <Info className="h-4 w-4" />;
      case 'DUSUK':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      {/* Top Navigation */}
      <MainNavbar />
      
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content - Finansal İşlemler gibi aynı padding */}
      <div className="pt-20 pl-64">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Geri Dön"
              >
                <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-500 rounded-lg flex items-center justify-center">
                  <Bell className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Yeni Duyuru Oluştur
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Site sakinleri için duyuru oluşturun
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Site Bilgisi (Read-only) */}
              {siteData && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    <strong>Site:</strong> {siteData.siteIsmi || siteData.adi || `Site ${siteData.id}`}
                  </p>
                </div>
              )}

              {/* Duyuru Başlığı */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duyuru Başlığı (Opsiyonel)
                </label>
                <input
                  type="text"
                  name="duyuruBaslik"
                  value={formData.duyuruBaslik}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Örn: Aidat Hatırlatması"
                  maxLength={100}
                />
              </div>

              {/* Önem Seviyesi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Önem Seviyesi *
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {['DUSUK', 'ORTA', 'YUKSEK'].map((seviye) => (
                    <label
                      key={seviye}
                      className={`relative flex items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        formData.onemSeviyesi === seviye
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-500'
                      }`}
                    >
                      <input
                        type="radio"
                        name="onemSeviyesi"
                        value={seviye}
                        checked={formData.onemSeviyesi === seviye}
                        onChange={handleInputChange}
                        className="absolute opacity-0"
                      />
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                          style={{ backgroundColor: duyuruService.getOnemSeviyesiColor(seviye) }}
                        >
                          {getOnemIcon(seviye)}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {duyuruService.getOnemSeviyesiLabel(seviye)}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Duyuru Mesajı */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duyuru Mesajı *
                </label>
                <textarea
                  name="duyuruMesaji"
                  value={formData.duyuruMesaji}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={6}
                  minLength={10}
                  maxLength={2000}
                  placeholder="Duyuru mesajınızı buraya yazın..."
                  required
                />
                <div className="mt-1 flex justify-between">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Minimum 10 karakter gerekli
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formData.duyuruMesaji.length}/2000 karakter
                  </p>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-600">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-green-600 to-blue-500 hover:from-green-700 hover:to-blue-600 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Oluşturuluyor...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      <span>Duyuru Oluştur</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DuyuruOlustur;