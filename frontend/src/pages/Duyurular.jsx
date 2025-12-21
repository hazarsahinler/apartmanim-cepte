import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Search, Filter, Calendar, 
  Bell, AlertCircle, Info, CheckCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/MainNavbar';
import { authService } from '../services/authService';
import duyuruService from '../services/duyuruService';
import { useTheme } from '../contexts/ThemeContext';

const Duyurular = () => {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [duyurular, setDuyurular] = useState([]);
  const [siteData, setSiteData] = useState(null);
  const [filterOnem, setFilterOnem] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const fetchDuyurular = useCallback(async () => {
    try {
      const duyuruListesi = await duyuruService.getDuyurularBySite(parseInt(siteId));
      setDuyurular(Array.isArray(duyuruListesi) ? duyuruListesi : []);
    } catch (error) {
      console.error('Duyuru yükleme hatası:', error);
      toast.error('Duyurular yüklenirken bir hata oluştu.');
      setDuyurular([]);
    }
  }, [siteId]);

  useEffect(() => {
    const initializePage = async () => {
      try {
        setLoading(true);
        
        if (!authService.isAuthenticated()) {
          navigate('/giris');
          return;
        }

        // Kullanıcı bilgilerini kontrol et
        const user = authService.getCurrentUser();
        if (!user || user.rol !== 'YONETICI') {
          toast.error('Bu sayfaya erişim yetkiniz bulunmamaktadır. Duyuru oluşturmak için yönetici hesabıyla giriş yapmalısınız.');
          navigate('/');
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
        
        await fetchDuyurular();
        
      } catch (err) {
        console.error('Sayfa yüklenirken hata:', err);
        toast.error('Sayfa yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    initializePage();
  }, [navigate, siteId, fetchDuyurular]);

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

  const filteredDuyurular = duyurular.filter(duyuru => {
    const matchesOnem = !filterOnem || duyuru.onemSeviyesi === filterOnem;
    const matchesSearch = !searchTerm || 
      duyuru.duyuruMesaji.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesOnem && matchesSearch;
  });

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
        <Navbar />
        <Sidebar />
        
        <div className="pt-20 pl-64">
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
      <Navbar />
      
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
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
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Bell className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Duyurular
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    {siteData?.siteIsmi || siteData?.adi || siteData?.name || 'Site'} Duyuruları
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate(`/duyuru-olustur/${siteId}`)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Yeni Duyuru</span>
            </button>
          </div>

          {/* Filters */}
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Duyurularda ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={filterOnem}
                  onChange={(e) => setFilterOnem(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Tüm Önem Seviyeleri</option>
                  <option value="YUKSEK">Yüksek</option>
                  <option value="ORTA">Orta</option>
                  <option value="DUSUK">Düşük</option>
                </select>
              </div>
            </div>
          </div>

          {/* Duyuru List */}
          <div className="space-y-4">
            {filteredDuyurular.length > 0 ? (
              filteredDuyurular.map((duyuru) => (
                <div key={duyuru.duyuruId} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                        style={{ backgroundColor: duyuruService.getOnemSeviyesiColor(duyuru.onemSeviyesi) }}
                      >
                        {getOnemIcon(duyuru.onemSeviyesi)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span 
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: duyuruService.getOnemSeviyesiColor(duyuru.onemSeviyesi) }}
                          >
                            {duyuruService.getOnemSeviyesiLabel(duyuru.onemSeviyesi)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {duyuru.yoneticiAdi} {duyuru.yoneticiSoyadi}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="h-4 w-4" />
                      <span>{duyuruService.formatDate(duyuru.olusturulmaTarihi)}</span>
                    </div>
                  </div>
                  
                  <div className="text-gray-900 dark:text-white">
                    <p className="whitespace-pre-wrap">{duyuru.duyuruMesaji}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Bell className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  Henüz duyuru yok
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Bu site için henüz duyuru oluşturulmamış.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => navigate(`/duyuru-olustur/${siteId}`)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    İlk Duyuruyu Oluştur
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Duyurular;