import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Bell, Plus, AlertCircle, Info, CheckCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import MainNavbar from '../components/MainNavbar';
import { authService } from '../services/authService';
import { useTheme } from '../contexts/ThemeContext';
import duyuruService from '../services/duyuruService';

const DuyuruEkleme = () => {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [siteData, setSiteData] = useState(null);
  
  // Form state
  const [duyuruForm, setDuyuruForm] = useState({
    duyuruBaslik: '',
    duyuruMesaji: '',
    onemSeviyesi: 'ORTA'
  });

  // Önem seviyeleri
  const onemSeviyeleri = [
    { value: 'DUSUK', label: 'Düşük', color: '#10B981', icon: CheckCircle },
    { value: 'ORTA', label: 'Orta', color: '#F59E0B', icon: Info },
    { value: 'YUKSEK', label: 'Yüksek', color: '#EF4444', icon: AlertCircle }
  ];

  // Sayfa yüklendiğinde
  useEffect(() => {
    const initializePage = async () => {
      try {
        if (!authService.isAuthenticated()) {
          navigate('/giris');
          return;
        }

        // Site bilgilerini yükle
        const userSitesJson = localStorage.getItem('userSites');
        if (userSitesJson) {
          const userSites = JSON.parse(userSitesJson);
          const foundSite = userSites.find(site => 
            site.id === parseInt(siteId) || site.id === siteId
          );
          
          if (foundSite) {
            setSiteData(foundSite);
          }
        }
        
      } catch (err) {
        console.error('Sayfa yüklenirken hata:', err);
        toast.error('Sayfa yüklenirken bir hata oluştu.');
      }
    };

    if (siteId) {
      initializePage();
    }
  }, [siteId, navigate]);

  // Form input değişikliği
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDuyuruForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Önem seviyesi seçimi
  const handleOnemSeviyesiChange = (seviye) => {
    setDuyuruForm(prev => ({
      ...prev,
      onemSeviyesi: seviye
    }));
  };

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasyon
    if (!duyuruForm.duyuruMesaji.trim()) {
      toast.error('Duyuru mesajı boş olamaz!');
      return;
    }

    if (duyuruForm.duyuruMesaji.length < 10) {
      toast.error('Duyuru mesajı en az 10 karakter olmalıdır!');
      return;
    }

    try {
      setLoading(true);

      const duyuruData = {
        duyuruMesaji: duyuruForm.duyuruMesaji,
        duyuruBaslik: duyuruForm.duyuruBaslik || null,
        siteId: parseInt(siteId),
        onemSeviyesi: duyuruForm.onemSeviyesi
      };

      console.log('Gönderilen duyuru verisi:', duyuruData);

      await duyuruService.createDuyuru(duyuruData);
      
      toast.success('Duyuru başarıyla oluşturuldu!');
      
      // Formu temizle
      setDuyuruForm({
        duyuruBaslik: '',
        duyuruMesaji: '',
        onemSeviyesi: 'ORTA'
      });
      
      // Duyuru yönetimine dön
      setTimeout(() => {
        navigate(`/duyuru-yonetimi/${siteId}`);
      }, 1500);
      
    } catch (error) {
      console.error('Duyuru oluşturma hatası:', error);
      toast.error(error.message || 'Duyuru oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getOnemIcon = (seviye) => {
    const onem = onemSeviyeleri.find(o => o.value === seviye);
    const IconComponent = onem?.icon || Bell;
    return <IconComponent className="h-5 w-5" />;
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      <MainNavbar toggleUserSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="pt-16 lg:ml-64">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={() => navigate(`/duyuru-yonetimi/${siteId}`)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Geri Dön"
              >
                <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 dark:text-gray-300" />
              </button>
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-600 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                    Yeni Duyuru Oluştur
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 truncate">
                    Site sakinleri için duyuru oluşturun
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              
              {/* Site Bilgisi */}
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
                  value={duyuruForm.duyuruBaslik}
                  onChange={handleInputChange}
                  placeholder="Örn: Aidat Hatırlatması"
                  maxLength={100}
                  className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {duyuruForm.duyuruBaslik.length}/100 karakter
                </p>
              </div>

              {/* Önem Seviyesi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Önem Seviyesi *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  {onemSeviyeleri.map((seviye) => (
                    <label
                      key={seviye.value}
                      className={`relative flex items-center justify-center p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        duyuruForm.onemSeviyesi === seviye.value
                          ? 'border-current shadow-lg transform scale-105'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                      style={{ 
                        borderColor: duyuruForm.onemSeviyesi === seviye.value ? seviye.color : undefined,
                        backgroundColor: duyuruForm.onemSeviyesi === seviye.value ? `${seviye.color}10` : undefined
                      }}
                    >
                      <input
                        type="radio"
                        name="onemSeviyesi"
                        value={seviye.value}
                        checked={duyuruForm.onemSeviyesi === seviye.value}
                        onChange={() => handleOnemSeviyesiChange(seviye.value)}
                        className="sr-only"
                      />
                      <div className="flex flex-col items-center space-y-2">
                        <div 
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-white"
                          style={{ backgroundColor: seviye.color }}
                        >
                          {getOnemIcon(seviye.value)}
                        </div>
                        <span className="font-medium text-sm sm:text-base text-gray-900 dark:text-white">
                          {seviye.label}
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
                  value={duyuruForm.duyuruMesaji}
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
                    {duyuruForm.duyuruMesaji.length}/2000 karakter
                  </p>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 sm:space-x-4 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-600">
                <button
                  type="button"
                  onClick={() => navigate(`/duyuru-yonetimi/${siteId}`)}
                  className="w-full sm:w-auto px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  disabled={loading}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-2 bg-gradient-to-r from-green-600 to-blue-500 hover:from-green-700 hover:to-blue-600 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default DuyuruEkleme;
