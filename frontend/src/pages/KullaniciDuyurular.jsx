import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, Calendar, User, ChevronRight, Loader2, AlertCircle,
  Clock, Building, Menu, Home, Sun, Moon, LogOut, Info
} from 'lucide-react';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';
import { userDaireService } from '../services/userDaireService';
import duyuruService from '../services/duyuruService';
import UserSidebar from '../components/UserSidebar';
import NetworkStatusMonitor from '../components/NetworkStatusMonitor';
import { useTheme } from '../contexts/ThemeContext';

const KullaniciDuyurular = () => {
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [duyurular, setDuyurular] = useState([]);
  const [daireInfo, setDaireInfo] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    authService.logout();
    navigate('/giris');
  };

  useEffect(() => {
    const fetchDuyurular = async () => {
      try {
        setLoading(true);

        // Auth kontrolü
        if (!authService.isAuthenticated()) {
          navigate('/giris');
          return;
        }

        // Kullanıcı bilgilerini al
        const userInfo = await authService.getUserInfo();
        setUser(userInfo);

        // Role kontrolü
        const decodedToken = authService.decodeToken();
        let userRole = userInfo.apartmanRol || decodedToken.apartmanRol;
        
        if (!userRole && decodedToken.roles && decodedToken.roles.length > 0) {
          userRole = decodedToken.roles[0];
        }
        
        if (userRole !== 'ROLE_APARTMANSAKIN' && userRole !== 'ApartmanSakin' && userRole !== 'Sakin' && userRole !== 'APARTMANSAKIN') {
          toast.error('Bu sayfa sadece apartman sakinleri içindir.');
          navigate('/site-yonetimi');
          return;
        }

        // Seçilen daireyi al
        const selectedDaire = userDaireService.getSelectedDaire();
        
        if (!selectedDaire) {
          toast.warning('Lütfen önce daire seçimi yapınız.');
          navigate('/kullanici-daire-secimi');
          return;
        }

        setDaireInfo(selectedDaire);
        console.log('KullaniciDuyurular - Seçilen daire:', selectedDaire);

        // Site ID'ye göre duyuruları çek
        const siteId = selectedDaire.siteId;
        console.log('KullaniciDuyurular - Site ID:', siteId);

        try {
          const duyuruData = await duyuruService.getDuyurularBySite(siteId);
          console.log('KullaniciDuyurular - API\'den gelen duyurular:', duyuruData);
          
          // Backend DuyuruResponseDTO field mapping
          const mappedDuyurular = (Array.isArray(duyuruData) ? duyuruData : []).map(duyuru => ({
            id: duyuru.duyuruId,
            baslik: duyuru.duyuruBaslik,
            icerik: duyuru.duyuruMesaji,
            olusturmaTarihi: duyuru.olusturulmaTarihi,
            oncelikDurumu: duyuru.onemSeviyesi,
            siteId: duyuru.siteId,
            siteIsmi: duyuru.siteIsmi
          }));
          
          console.log('KullaniciDuyurular - Mapped duyurular:', mappedDuyurular);
          
          // Tarihe göre sırala (en yeni önce)
          const sortedDuyurular = mappedDuyurular.sort((a, b) => {
            return new Date(b.olusturmaTarihi) - new Date(a.olusturmaTarihi);
          });
          
          setDuyurular(sortedDuyurular);
        } catch (error) {
          console.error('Duyurular yüklenirken hata:', error);
          toast.error('Duyurular yüklenirken bir hata oluştu.');
          setDuyurular([]);
        }

      } catch (err) {
        console.error('Sayfa yüklenirken hata:', err);
        toast.error('Sayfa yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchDuyurular();
  }, [navigate]);

  // Tarihi formatla
  const formatTarih = (tarih) => {
    if (!tarih) return '';
    
    try {
      return new Date(tarih).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Tarih formatlama hatası:', error);
      return tarih;
    }
  };

  // Duyuru detayına git
  const handleDuyuruClick = (duyuru) => {
    console.log('Duyuru detayı:', duyuru);
    // İsterseniz detay sayfasına yönlendirebilirsiniz
    // navigate(`/kullanici-duyuru-detay/${duyuru.id}`);
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
        <NetworkStatusMonitor />
        
        {/* Top Navigation Bar */}
        <nav className="bg-white dark:bg-gray-800 shadow-lg fixed w-full top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                    <Home className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    Apartman'ım Cepte
                  </span>
                </div>
              </div>
            </div>
          </div>
        </nav>
        
        <UserSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <div className="pt-16 lg:ml-64 min-h-screen">
          <div className="flex justify-center items-center h-96">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          </div>
        </div>
      </div>
    );
  }

  // Duyuru özetini hesapla
  const duyuruOzet = {
    toplamDuyuru: duyurular.length,
    yuksekOnem: duyurular.filter(d => d.oncelikDurumu === 'YUKSEK').length,
    ortaOnem: duyurular.filter(d => d.oncelikDurumu === 'ORTA').length,
    dusukOnem: duyurular.filter(d => d.oncelikDurumu === 'DUSUK').length
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      <NetworkStatusMonitor />
      
      {/* Top Navigation Bar - KullaniciSayfasi ile aynı */}
      <nav className="bg-white dark:bg-gray-800 shadow-lg fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Menu className="h-6 w-6" />
              </button>
              
              <div className="flex items-center ml-2 lg:ml-0">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                  <Home className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  Apartman'ım Cepte
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Çıkış
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <UserSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="pt-16 lg:ml-64 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Duyurular
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {daireInfo ? `${daireInfo.siteAdi} - Site duyurularını görüntüleyin` : 'Site duyurularını görüntüleyin'}
            </p>
          </div>

          {/* Site Bilgisi ve Özet Kartlar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Site Bilgisi */}
            {daireInfo && (
              <div className="md:col-span-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg shadow-md p-6 text-white">
                <div className="flex items-center space-x-3">
                  <Building className="h-8 w-8" />
                  <div>
                    <p className="text-sm opacity-90">Daire Bilgim</p>
                    <p className="text-lg font-bold">
                      {daireInfo.siteAdi} - {daireInfo.blokAdi} Blok, Daire {daireInfo.daireNo}
                    </p>
                  </div>
                </div>
              </div>
            )}

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

            {/* Acil Duyuru */}
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

            {/* Normal Duyuru */}
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

            {/* Bilgi Duyurusu */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Bilgi Duyurusu</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{duyuruOzet.dusukOnem}</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Info className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Duyurular Listesi */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Tüm Duyurular
            </h3>

            {duyurular.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Henüz Duyuru Bulunmuyor
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Site yöneticiniz henüz bir duyuru paylaşmadı.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {duyurular.map((duyuru) => (
                  <div
                    key={duyuru.id}
                    onClick={() => handleDuyuruClick(duyuru)}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:shadow-lg transition-all duration-300 cursor-pointer bg-gray-50 dark:bg-gray-700/50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {duyuru.baslik}
                          </h4>
                          
                          {/* Önem seviyesi badge'i */}
                          {duyuru.oncelikDurumu === 'YUKSEK' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                              Acil
                            </span>
                          )}
                          {duyuru.oncelikDurumu === 'ORTA' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                              Önemli
                            </span>
                          )}
                          {duyuru.oncelikDurumu === 'DUSUK' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                              Bilgi
                            </span>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>{formatTarih(duyuru.olusturmaTarihi)}</span>
                          </div>
                        </div>

                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {duyuru.icerik}
                        </p>
                      </div>
                      
                      <ChevronRight className="h-6 w-6 text-gray-400 flex-shrink-0 ml-4" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Geri Dön Butonu */}
          <div className="mt-8">
            <button
              onClick={() => navigate('/kullanici-sayfasi')}
              className="flex items-center space-x-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <span>Ana Sayfaya Dön</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KullaniciDuyurular;
