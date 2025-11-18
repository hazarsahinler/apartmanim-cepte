import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building, CreditCard, TrendingUp, AlertCircle, CheckCircle, Menu
} from 'lucide-react';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import MainNavbar from '../components/MainNavbar';
import { authService } from '../services/authService';
import { useTheme } from '../contexts/ThemeContext';

const FinansalIslemlerSiteSecimi = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [siteler, setSiteler] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Kullanıcı bilgilerini ve sitelerini yükle
  useEffect(() => {
    const fetchSiteData = async () => {
      try {
        setLoading(true);

        // Auth kontrolü
        if (!authService.isAuthenticated()) {
          console.log('Kullanıcı giriş yapmamış, giriş sayfasına yönlendiriliyor...');
          toast.error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.', {
            position: "top-center",
            autoClose: 5000
          });
          setTimeout(() => navigate('/giris'), 1500);
          return;
        }

        // Kullanıcı bilgilerini al
        let userData = authService.getCurrentUser();
        
        if (!userData) {
          try {
            userData = await authService.getUserInfo();
          } catch (error) {
            console.error('API kullanıcı bilgileri hatası:', error);
            if (error.response?.status === 403) {
              toast.warning('Yetkilendirme hatası. Giriş yenileniyor...', {
                position: "top-center",
                autoClose: 3000
              });
              setTimeout(() => {
                authService.logout();
              }, 2000);
              return;
            }
          }
        }

        if (userData && userData.id) {
          try {
            console.log('Site verileri API\'den çekiliyor...');
            const token = localStorage.getItem('token');
            
            if (!token) {
              console.error('Token bulunamadı');
              throw new Error('Oturumunuz sonlanmış. Lütfen tekrar giriş yapın.');
            }

            console.log('API çağrısı yapılıyor:', `http://localhost:8080/api/structure/site/${userData.id}`);
            
            // siteService import etmek gerekiyor
            const response = await fetch(`http://localhost:8080/api/structure/site/${userData.id}`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (!response.ok) {
              throw new Error('Site verileri alınamadı');
            }

            const siteData = await response.json();
            
            if (siteData && siteData.length > 0) {
              setSiteler(siteData);
              console.log('Kullanıcının siteleri başarıyla yüklendi:', siteData);
              console.log('İlk site örneği:', siteData[0]);
            } else {
              console.log('Kullanıcıya ait site bulunamadı');
              setSiteler([]);
            }
          } catch (error) {
            console.error('Site verileri yüklenirken hata:', error);
            toast.error(error.message || 'Site bilgileri yüklenirken bir hata oluştu.');
            setSiteler([]);
          }
        }
        
      } catch (err) {
        console.error('Sayfa yüklenirken hata:', err);
        toast.error('Sayfa yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchSiteData();
  }, [navigate]);

  // Site seçimi
  const handleSiteSecimi = (site) => {
    console.log('Site seçildi:', site);
    if (!site) {
      console.error('Site objesi undefined!');
      toast.error('Site bilgisi bulunamadı');
      return;
    }
    const siteIdToUse = site.id || site.siteId;
    console.log('Kullanılacak siteId:', siteIdToUse);
    if (!siteIdToUse) {
      console.error('Site ID bulunamadı!', site);
      toast.error('Site ID bulunamadı');
      return;
    }
    navigate(`/finansal-islemler/${siteIdToUse}`);
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
        <MainNavbar />
        
        <Sidebar isOpen={sidebarOpen} />
        
        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed top-20 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg"
        >
          <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        </button>
        
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
        
        <div className="pt-16 ml-0 lg:ml-64 transition-all duration-300">
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      {/* Top Navigation */}
      <MainNavbar />
      
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} />
      
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-20 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg"
      >
        <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
      </button>
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      
      {/* Main Content */}
      <div className="pt-16 ml-0 lg:ml-64 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                  Finansal İşlemler
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Site finansal işlemlerini yönetmek için bir site seçin
                </p>
              </div>
            </div>
          </div>

          {/* Site Seçimi */}
          {siteler.length > 0 ? (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Site Seçimi ({siteler.length})
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {siteler.map((site) => (
                  <div 
                    key={site.id || site.siteId}
                    onClick={() => handleSiteSecimi(site)}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-blue-500"
                  >
                    <div className="p-6">
                      {/* Site Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <Building className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {site.siteIsmi || site.adi || site.name || 'Site Adı'}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {site.siteAdresi || site.adres || site.address || 'Adres Bilgisi Yok'}
                            </p>
                          </div>
                        </div>
                        {site.aktif ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-yellow-500" />
                        )}
                      </div>

                      {/* Action Button */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSiteSecimi(site);
                        }}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-lg transition-all duration-300 group"
                      >
                        <TrendingUp className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        <span>Finansal İşlemleri Yönet</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Site Bulunamadı
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Henüz yönettiğiniz bir site bulunmuyor.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinansalIslemlerSiteSecimi;