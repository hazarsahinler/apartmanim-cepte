import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Bell, Plus, Eye, Calendar, AlertCircle, Info, CheckCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import MainNavbar from '../components/MainNavbar';
import { authService } from '../services/authService';
import { useTheme } from '../contexts/ThemeContext';
import duyuruService from '../services/duyuruService';

const DuyuruYonetimi = () => {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [siteData, setSiteData] = useState(null);
  const [duyurular, setDuyurular] = useState([]);
  const [duyuruOzet, setDuyuruOzet] = useState({
    toplamDuyuru: 0,
    yuksekOnem: 0,
    ortaOnem: 0,
    dusukOnem: 0
  });

  // Duyuruları çek
  const fetchDuyurular = async () => {
    try {
      const duyuruData = await duyuruService.getDuyurularBySite(parseInt(siteId));
      setDuyurular(Array.isArray(duyuruData) ? duyuruData : []);
      
      // Özet hesapla
      const ozet = {
        toplamDuyuru: duyuruData.length,
        yuksekOnem: duyuruData.filter(d => d.onemSeviyesi === 'YUKSEK').length,
        ortaOnem: duyuruData.filter(d => d.onemSeviyesi === 'ORTA').length,
        dusukOnem: duyuruData.filter(d => d.onemSeviyesi === 'DUSUK').length
      };
      setDuyuruOzet(ozet);
      
    } catch (error) {
      console.error('Duyurular yüklenirken hata:', error);
      toast.error('Duyurular yüklenirken bir hata oluştu.');
    }
  };

  // Sayfa yüklendiğinde
  useEffect(() => {
    const initializePage = async () => {
      try {
        setLoading(true);
        
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
        
        // Duyuruları çek
        await fetchDuyurular();
        
      } catch (err) {
        console.error('Sayfa yüklenirken hata:', err);
        toast.error('Sayfa yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    if (siteId) {
      initializePage();
    }
  }, [siteId, navigate]);

  const getOnemIcon = (seviye) => {
    switch (seviye) {
      case 'YUKSEK':
        return <AlertCircle className="h-5 w-5" />;
      case 'ORTA':
        return <Info className="h-5 w-5" />;
      case 'DUSUK':
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
        <MainNavbar />
        <Sidebar />
        <div className="pt-20 pl-64">
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
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
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(`/site-panel/${siteId}`)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Site Paneline Dön"
              >
                <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-500 rounded-lg flex items-center justify-center">
                  <Bell className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Duyuru Yönetimi
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    {siteData?.siteIsmi || siteData?.adi || 'Site'} - Duyurular
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Özet Kartlar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Toplam Duyuru */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Toplam Duyuru</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{duyuruOzet.toplamDuyuru}</p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Bell className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>

            {/* Yüksek Önem */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Acil Duyuru</p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">{duyuruOzet.yuksekOnem}</p>
                </div>
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </div>

            {/* Orta Önem */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Normal Duyuru</p>
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{duyuruOzet.ortaOnem}</p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Info className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>

            {/* Düşük Önem */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Bilgi Duyurusu</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{duyuruOzet.dusukOnem}</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>
          </div>

          {/* İşlem Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mevcut Duyuruları Görüntüle */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 hover:shadow-xl transition-all duration-300 border-l-4 border-purple-500">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Eye className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      Mevcut Duyurular
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Tüm duyuruları görüntüle ve yönet
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Toplam Duyuru:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{duyuruOzet.toplamDuyuru}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">En Son Duyuru:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {duyurular.length > 0 
                      ? new Date(duyurular[0].olusturulmaTarihi).toLocaleDateString('tr-TR')
                      : '-'
                    }
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate(`/duyuru-listesi/${siteId}`)}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
              >
                <Eye className="h-5 w-5" />
                <span>Duyuruları Görüntüle</span>
              </button>
            </div>

            {/* Yeni Duyuru Ekle */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 hover:shadow-xl transition-all duration-300 border-l-4 border-green-500">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Plus className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      Yeni Duyuru Ekle
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Site sakinlerine yeni duyuru gönder
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Başlık ve mesaj ekle</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Önem seviyesi belirle</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Anında yayınla</span>
                </div>
              </div>

              <button
                onClick={() => navigate(`/duyuru-ekleme/${siteId}`)}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
              >
                <Plus className="h-5 w-5" />
                <span>Yeni Duyuru Oluştur</span>
              </button>
            </div>
          </div>

          {/* Son Duyurular Listesi */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Son Duyurular</h3>
              <button
                onClick={() => navigate(`/duyuru-listesi/${siteId}`)}
                className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-medium"
              >
                Tümünü Gör
              </button>
            </div>

            {duyurular.length > 0 ? (
              <div className="space-y-4">
                {duyurular.slice(0, 5).map((duyuru) => (
                  <div 
                    key={duyuru.duyuruId}
                    className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    onClick={() => navigate(`/duyuru-listesi/${siteId}`)}
                  >
                    <div 
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: duyuruService.getOnemSeviyesiColor(duyuru.onemSeviyesi) + '20' }}
                    >
                      <div style={{ color: duyuruService.getOnemSeviyesiColor(duyuru.onemSeviyesi) }}>
                        {getOnemIcon(duyuru.onemSeviyesi)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      {duyuru.duyuruBaslik && (
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {duyuru.duyuruBaslik}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {duyuru.duyuruMesaji}
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span 
                          className="text-xs px-2 py-1 rounded-full text-white"
                          style={{ backgroundColor: duyuruService.getOnemSeviyesiColor(duyuru.onemSeviyesi) }}
                        >
                          {duyuruService.getOnemSeviyesiLabel(duyuru.onemSeviyesi)}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {duyuruService.formatDate(duyuru.olusturulmaTarihi)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Bell className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  Henüz duyuru yok
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Yeni duyuru ekleyerek başlayın
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DuyuruYonetimi;
