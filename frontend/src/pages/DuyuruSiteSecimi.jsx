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

  const handleSiteClick = (siteId) => {
    navigate(`/duyuru-yonetimi/${siteId}`);
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
        <MainNavbar />
        <Sidebar />
        <div className="pt-20 pl-64">
          <div className="flex justify-center items-center h-96">
            <Loader2 className="h-12 w-12 animate-spin text-green-500" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      <MainNavbar />
      <Sidebar />
      
      <div className="pt-20 pl-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-500 rounded-lg flex items-center justify-center">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Duyuru Yönetimi
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Duyuruları yönetmek için bir site seçin
                </p>
              </div>
            </div>
          </div>

          {/* Site Kartları */}
          {siteler.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
              <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Henüz Site Bulunmuyor
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Duyuru yönetimi için önce bir site eklemeniz gerekiyor.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {siteler.map((site) => (
                <div
                  key={site.id}
                  onClick={() => handleSiteClick(site.id)}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Building2 className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {site.siteIsmi || site.adi || 'İsimsiz Site'}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {site.siteIl || 'Bilgi yok'}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                    </div>
                    
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Duyuru Yönetimi</span>
                        <Bell className="h-4 w-4 text-green-600" />
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
