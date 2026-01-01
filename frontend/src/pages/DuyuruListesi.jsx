import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Bell, Search, Filter, AlertCircle, Info, CheckCircle,
  Calendar, ChevronDown, ChevronUp
} from 'lucide-react';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import MainNavbar from '../components/MainNavbar';
import { authService } from '../services/authService';
import { useTheme } from '../contexts/ThemeContext';
import duyuruService from '../services/duyuruService';

const DuyuruListesi = () => {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [siteData, setSiteData] = useState(null);
  const [duyurular, setDuyurular] = useState([]);
  const [filteredDuyurular, setFilteredDuyurular] = useState([]);
  
  // Filtre state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOnem, setSelectedOnem] = useState('ALL');
  const [expandedDuyuruId, setExpandedDuyuruId] = useState(null);

  // Önem seviyeleri
  const onemSeviyeleri = [
    { value: 'ALL', label: 'Tümü', color: '#6B7280', icon: Bell },
    { value: 'DUSUK', label: 'Düşük', color: '#10B981', icon: CheckCircle },
    { value: 'ORTA', label: 'Orta', color: '#F59E0B', icon: Info },
    { value: 'YUKSEK', label: 'Yüksek', color: '#EF4444', icon: AlertCircle }
  ];

  // Duyuruları yükle
  const fetchDuyurular = async () => {
    try {
      setLoading(true);
      const data = await duyuruService.getDuyurularBySite(siteId);
      setDuyurular(data);
      setFilteredDuyurular(data);
    } catch (error) {
      console.error('Duyurular yüklenirken hata:', error);
      toast.error('Duyurular yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

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

        // Duyuruları yükle
        await fetchDuyurular();
        
      } catch (err) {
        console.error('Sayfa yüklenirken hata:', err);
        toast.error('Sayfa yüklenirken bir hata oluştu.');
      }
    };

    if (siteId) {
      initializePage();
    }
  }, [siteId, navigate]);

  // Filtreleme efekti
  useEffect(() => {
    let filtered = [...duyurular];

    // Önem seviyesi filtresi
    if (selectedOnem !== 'ALL') {
      filtered = filtered.filter(d => d.onemSeviyesi === selectedOnem);
    }

    // Arama filtresi
    if (searchTerm.trim()) {
      filtered = filtered.filter(d => 
        (d.duyuruBaslik && d.duyuruBaslik.toLowerCase().includes(searchTerm.toLowerCase())) ||
        d.duyuruMesaji.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDuyurular(filtered);
  }, [searchTerm, selectedOnem, duyurular]);

  // Duyuru genişlet/daralt
  const toggleExpand = (duyuruId) => {
    setExpandedDuyuruId(expandedDuyuruId === duyuruId ? null : duyuruId);
  };

  // Mesajı kısalt
  const truncateMessage = (message, maxLength = 150) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  const getOnemIcon = (seviye) => {
    const onem = onemSeviyeleri.find(o => o.value === seviye);
    const IconComponent = onem?.icon || Bell;
    return IconComponent;
  };

  const getOnemLabel = (seviye) => {
    const onem = onemSeviyeleri.find(o => o.value === seviye);
    return onem?.label || seviye;
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      <MainNavbar toggleUserSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="pt-16 lg:ml-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          
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
                    Tüm Duyurular
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 truncate">
                    {siteData?.siteIsmi || siteData?.adi || `Site ${siteId}`} - Toplam {filteredDuyurular.length} duyuru
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filtre ve Arama */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              
              {/* Arama */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Duyuru ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Önem Seviyesi Filtresi */}
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={selectedOnem}
                  onChange={(e) => setSelectedOnem(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {onemSeviyeleri.map((seviye) => (
                    <option key={seviye.value} value={seviye.value}>
                      {seviye.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Duyuru Listesi */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
            </div>
          ) : filteredDuyurular.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
              <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Duyuru Bulunamadı
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || selectedOnem !== 'ALL' 
                  ? 'Filtrelere uygun duyuru bulunamadı. Farklı filtreler deneyin.'
                  : 'Henüz duyuru bulunmuyor.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredDuyurular.map((duyuru) => {
                const IconComponent = getOnemIcon(duyuru.onemSeviyesi);
                const isExpanded = expandedDuyuruId === duyuru.duyuruId;
                const shouldShowExpand = duyuru.duyuruMesaji.length > 150;
                
                return (
                  <div 
                    key={duyuru.duyuruId}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <div className="p-4 sm:p-6">
                      {/* Üst Kısım - Başlık ve Önem */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start space-x-2 sm:space-x-3 flex-1">
                          <div 
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                            style={{ backgroundColor: duyuruService.getOnemSeviyesiColor(duyuru.onemSeviyesi) }}
                          >
                            <IconComponent className="h-4 w-4 sm:h-5 sm:w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            {duyuru.duyuruBaslik && (
                              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                {duyuru.duyuruBaslik}
                              </h3>
                            )}
                            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                              <span 
                                className="px-2 py-1 rounded-md text-white font-medium"
                                style={{ backgroundColor: duyuruService.getOnemSeviyesiColor(duyuru.onemSeviyesi) }}
                              >
                                {getOnemLabel(duyuru.onemSeviyesi)}
                              </span>
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {duyuruService.formatDate(duyuru.olusturulmaTarihi)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Mesaj */}
                      <div className="mt-3">
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {isExpanded ? duyuru.duyuruMesaji : truncateMessage(duyuru.duyuruMesaji)}
                        </p>
                      </div>

                      {/* Genişlet/Daralt Butonu */}
                      {shouldShowExpand && (
                        <button
                          onClick={() => toggleExpand(duyuru.duyuruId)}
                          className="mt-3 flex items-center space-x-1 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm font-medium"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="h-4 w-4" />
                              <span>Daha az göster</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4" />
                              <span>Devamını oku</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DuyuruListesi;
