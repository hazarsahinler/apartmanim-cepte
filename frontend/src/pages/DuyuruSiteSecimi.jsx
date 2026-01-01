import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowRight, Bell, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import MainNavbar from '../components/MainNavbar';
import { authService } from '../services/authService';
import { useTheme } from '../contexts/ThemeContext';

const DuyuruSiteSecimi = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [siteler, setSiteler] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const loadSiteler = async () => {
      try {
        if (!authService.isAuthenticated()) {
          navigate('/giris');
          return;
        }

        // LocalStorage'dan siteleri yükle
        const userSitesJson = localStorage.getItem('userSites');
        if (userSitesJson) {
          const userSites = JSON.parse(userSitesJson);
          setSiteler(userSites);
        } else {
          // API'den yükle
          const userData = authService.getCurrentUser();
          if (userData && userData.sites) {
            setSiteler(userData.sites);
          }
        }
      } catch (error) {
        console.error('Siteler yüklenirken hata:', error);
        toast.error('Siteler yüklenemedi');
      } finally {
        setLoading(false);
      }
    };

    loadSiteler();
  }, [navigate]);

  const handleSiteClick = (site) => {
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
    navigate(`/duyuru-yonetimi/${siteIdToUse}`);
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
        <MainNavbar toggleUserSidebar={() => setSidebarOpen(!sidebarOpen)} isUserSidebarOpen={sidebarOpen} />
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="pt-16 lg:ml-64 transition-all duration-300">
          <div className="flex justify-center items-center h-96">
            <Loader2 className="h-12 w-12 animate-spin text-green-500" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      <MainNavbar toggleUserSidebar={() => setSidebarOpen(!sidebarOpen)} isUserSidebarOpen={sidebarOpen} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="pt-16 lg:ml-64 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-600 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                  Duyuru Yönetimi
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Duyuruları yönetmek için bir site seçin
                </p>
              </div>
            </div>
          </div>

          {/* Site Kartları */}
          {siteler.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 sm:p-12 text-center">
              <Building2 className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Henüz Site Bulunmuyor
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Duyuru yönetimi için önce bir site eklemeniz gerekiyor.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {siteler.map((site) => (
                <div
                  key={site.id || site.siteId}
                  onClick={() => handleSiteClick(site)}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-600 to-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                          <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                            {site.siteIsmi || site.adi || 'İsimsiz Site'}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                            {site.siteIl || 'Bilgi yok'}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                    
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3 sm:pt-4 mt-3 sm:mt-4">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Duyuru Yönetimi</span>
                        <Bell className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-600 to-blue-500 h-1 w-0 group-hover:w-full transition-all duration-300"></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DuyuruSiteSecimi;
