import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, PlusCircle, MapPin, ChevronRight, Loader2, 
  AlertCircle, WifiOff, Menu
} from 'lucide-react';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';
import { siteService } from '../services/siteService';
import { siteStorageService } from '../services/siteStorageService';
import { iller, getIlceler } from '../constants/turkiyeVeri';
import { ENDPOINTS } from '../constants/endpoints';
import NetworkStatusMonitor from '../components/NetworkStatusMonitor';
import MainNavbar from '../components/MainNavbar';
import Sidebar from '../components/Sidebar';
import { useTheme } from '../contexts/ThemeContext';
import api from '../services/api';
import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';

const SiteYonetimSayfasi = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [siteler, setSiteler] = useState([]);
  const [siteEkleModalAcik, setSiteEkleModalAcik] = useState(false);
  const [user, setUser] = useState(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Infinite loop önlemek için flag kullanıyoruz
  const [isDataFetched, setIsDataFetched] = useState(false);



  // Sitelerim verilerini çek - sadece bir kez çalışacak
  useEffect(() => {
    // Eğer veri zaten çekilmişse tekrar çekme
    if (isDataFetched) return;
    
    const fetchUserAndSites = async () => {
      try {
        setLoading(true);
        setIsDataFetched(true); // Veri çekme işleminin başladığını işaretle
        
        // Test verilerini temizle (sadece ilk çalıştırmada)
        const hasCleanedTestData = localStorage.getItem('hasCleanedTestData');
        if (!hasCleanedTestData) {
          localStorage.removeItem('userSites');
          localStorage.removeItem('test_sites');
          localStorage.setItem('hasCleanedTestData', 'true');
        }
        
        // Önce token kontrolü yap
        if (!authService.isAuthenticated()) {
          toast.error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.', {
            position: "top-center",
            autoClose: 5000
          });
          setTimeout(() => navigate('/giris'), 1500);
          return;
        }
        
        // Kullanıcı bilgilerini al - localStorage'dan önce kontrol edelim
        let userData = authService.getCurrentUser();
        
        // Eğer localStorage'da bilgi yoksa API'den çekelim
        if (!userData) {
          try {
            userData = await authService.getUserInfo();
          } catch (error) {
            console.error('API kullanıcı bilgileri hatası:', error);
            // 403 hatası için özel mesaj gösterelim
            if (error.response?.status === 403) {
              toast.warning('Yetkilendirme hatası. Giriş yenileniyor...', {
                position: "top-center",
                autoClose: 3000
              });
              setTimeout(() => {
                authService.logout(); // Yeniden giriş yapmaya zorla
              }, 2000);
              return;
            }
          }
        }
        
        setUser(userData);
        
        if (userData && userData.id) {
          // Önce önbellekten site verilerini kontrol edelim (geçici olarak gösterim için)
          const { sites: cachedSites, lastFetch } = siteStorageService.getSites(userData.id);
          
          // Önbellek verileri varsa, geçici olarak göster (API'dan veri gelene kadar)
          if (cachedSites && cachedSites.length > 0) {
            setSiteler(cachedSites);
            
            // Önbellek güncel değilse (24 saatten eski), arka planda güncelleme yapalım
            if (siteStorageService.isCacheStale(lastFetch)) {
              toast.info('Site verileriniz arka planda güncelleniyor...', { 
                position: "bottom-right", 
                autoClose: 2000 
              });
            }
          }
          
          try {
            // Doğrudan URL kullanarak - chunked encoding hatasını aşmak için
            const token = localStorage.getItem('token');
            
            if (!token) {
              console.error('Token bulunamadı');
              throw new Error('Oturumunuz sonlanmış. Lütfen tekrar giriş yapın.');
            }
            
            // Token'ı decode et ve rol bilgilerini kontrol et
            const decodedToken = authService.decodeToken();
            
            
            // siteService kullanarak API çağrısı yap
            const siteData = await siteService.getUserSites(userData.id);
            
            if (siteData && siteData.length > 0) {
              // API'den gelen verileri set et ve önbelleğe al
              setSiteler(siteData);
              siteStorageService.saveSites(siteData, userData.id);
              
              
              // Eski önbellek varsa, güncellendiğini bildir
              if (cachedSites && cachedSites.length > 0 && 
                  JSON.stringify(cachedSites) !== JSON.stringify(siteData)) {
                toast.success('Site bilgileriniz güncellendi', {
                  position: "bottom-right", 
                  autoClose: 3000
                });
              }
            } else {
              
              // Kullanıcının sitesi yoksa state'i ve önbelleği temizle
              setSiteler([]);
              siteStorageService.clearUserSiteData(userData.id);
              
              // Önbellekte site varsa ama API'de yoksa, kullanıcıya bildir
              if (cachedSites && cachedSites.length > 0) {
                toast.warning('Site verileriniz sunucuda bulunamadı. Önbellek temizlendi.', {
                  position: "bottom-center", 
                  autoClose: 5000
                });
              }
              
              // Site bulunamadı, mecburi site ekleme modalını aç
              setSiteEkleModalAcik(true);
              toast.info('Henüz site eklememişsiniz. Lütfen ilk sitenizi ekleyin!', { 
                position: "top-center", 
                autoClose: 4000 
              });
            }
          } catch (siteErr) {
            console.error("Site verileri alınamadı:", siteErr);
            
            if (siteErr.response?.status === 403) {
              toast.error('Site bilgilerini görüntüleme yetkiniz yok. Lütfen tekrar giriş yapın.', { 
                position: "top-center" 
              });
              // Yetkisiz erişimde localStorage'daki bilgileri de temizleyelim
              setTimeout(() => {
                siteStorageService.clearUserSiteData(userData.id);
                authService.logout();
              }, 3000);
              return;
            }
            
            // Önbellekten veri gösteriliyor mu kontrol edelim
            if (cachedSites && cachedSites.length > 0) {
              // API hatası varsa önbelleği de temizle (tutarsızlık olmasın)
              setSiteler([]);
              siteStorageService.clearUserSiteData(userData.id);
              
              toast.warning('Sunucuya erişilemiyor ve veri tutarsızlığı olabilir. Önbellek temizlendi.', {
                position: "bottom-right", 
                autoClose: 5000
              });
            } else {
              // API'den site alınamadı, hata handling
              if (siteErr.response?.status === 404) {
                setSiteEkleModalAcik(true);
                toast.info('Henüz site eklememişsiniz. İlk sitenizi ekleyin!', {
                  position: "top-center", 
                  autoClose: 4000
                });
              } else if (siteErr.code === 'ERR_NETWORK' || siteErr.message.includes('Network Error')) {
                setError('Sunucuya bağlanılamıyor. Lütfen daha sonra tekrar deneyin.');
                toast.error(
                  <div className="flex items-center gap-2">
                    <WifiOff className="h-4 w-4 text-red-500" />
                    <span>Sunucu bağlantısı kurulamadı</span>
                  </div>,
                  { position: "top-center", autoClose: 5000 }
                );
              } else {
                setError('Site verileri yüklenirken bir hata oluştu.');
                toast.error(
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span>Site verileri yüklenirken hata oluştu</span>
                  </div>,
                  { position: "top-center", autoClose: 5000 }
                );
              }
            }
          }
        }
      } catch (err) {
        console.error("Veriler yüklenirken hata:", err);
        setError('Siteleriniz yüklenirken bir hata oluştu.');
        
        // Önbellekte site verisi var mı kontrol et
        const currentUser = authService.getCurrentUser();
        if (currentUser && currentUser.id) {
          const { sites: fallbackSites } = siteStorageService.getSites(currentUser.id);
          if (fallbackSites && fallbackSites.length > 0) {
            setSiteler(fallbackSites);
            toast.warning('Sunucu hatası, önbellek verileri gösteriliyor', {
              position: "bottom-center"
            });
            return;
          }
        }
        
        // API hatası durumunda boş liste göster
        setSiteler([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndSites();
  }, [navigate, isDataFetched]); // navigate ve isDataFetched dependency'lerini dahil ettik

  // Site'ye tıklandığında site paneline yönlendir
  const handleSiteClick = (siteId) => {
    navigate(`/site-panel/${siteId}`);
  };

  // Site ekleme modalını göster/gizle
  // Site ekle modal toggle - Eğer site yoksa kapatmaya izin verme
  const toggleSiteEkleModal = () => {
    // Eğer hiç site yoksa, modal'ı kapatmaya izin verme
    if (siteler.length === 0) {
      toast.warning('Devam edebilmek için en az bir site eklemelisiniz!', {
        position: "top-center", 
        autoClose: 3000
      });
      return;
    }
    setSiteEkleModalAcik(!siteEkleModalAcik);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-green-500 animate-spin" />
          <span className="mt-4 text-gray-600 dark:text-gray-300">Siteleriniz yükleniyor...</span>
        </div>
      </div>
    );
  }

  // İstatistikler
  const activeUserCount = Math.floor(Math.random() * 40) + 10;
  const totalApartments = siteler.reduce((sum, site) => sum + (site.daireCount || 0), 0);
  const totalBlocks = siteler.reduce((sum, site) => sum + (site.bloklarCount || 0), 0);

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      {/* Navbar */}
      <MainNavbar toggleUserSidebar={() => setSidebarOpen(!sidebarOpen)} isUserSidebarOpen={sidebarOpen} />
      
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content */}
      <div className="pt-16 lg:ml-64 transition-all duration-300">
        <div className="container mx-auto px-4 py-8">
          {/* Başlık ve Özetler */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4 md:mb-0">
                Site Yönetimi
              </h1>
              
              <button
                onClick={toggleSiteEkleModal}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md bg-green-600 text-white shadow-md hover:bg-green-700 transition-colors"
              >
                <PlusCircle size={16} className="mr-2" />
                Yeni Site
              </button>
            </div>
            
            {/* İstatistikler */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex items-center transition-transform duration-300 hover:shadow-lg transform hover:-translate-y-1">
                <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-3 mr-4">
                  <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Toplam Site</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">{siteler.length}</p>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex items-center transition-transform duration-300 hover:shadow-lg transform hover:-translate-y-1">
                <div className="rounded-full bg-green-100 dark:bg-green-900 p-3 mr-4">
                  <svg className="h-6 w-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Toplam Blok</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">{totalBlocks}</p>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex items-center transition-transform duration-300 hover:shadow-lg transform hover:-translate-y-1">
                <div className="rounded-full bg-purple-100 dark:bg-purple-900 p-3 mr-4">
                  <svg className="h-6 w-6 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Toplam Daire</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">{totalApartments}</p>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex items-center transition-transform duration-300 hover:shadow-lg transform hover:-translate-y-1">
                <div className="rounded-full bg-amber-100 dark:bg-amber-900 p-3 mr-4">
                  <svg className="h-6 w-6 text-amber-600 dark:text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Aktif Kullanıcı</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">{activeUserCount}</p>
                </div>
              </div>
            </div>
            

          </div>
          
          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded-md mb-6 animate-fadeIn" role="alert">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span className="font-medium">Hata!</span>
                <span className="ml-2">{error}</span>
              </div>
            </div>
          )}
          
          {/* Site Listesi veya Boş Durum */}
          {siteler.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 text-center transform transition duration-500 hover:scale-[1.02] animate-fadeIn">
              <div className="mx-auto w-24 h-24 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
                <Building2 className="h-12 w-12 text-blue-500 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                Henüz Siteniz Bulunmuyor
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                Site oluşturarak apartman yönetimine hemen başlayabilirsiniz. Site oluşturduktan sonra bloklar, daireler ve sakinleri ekleyebilirsiniz.
              </p>
              <button
                onClick={toggleSiteEkleModal}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 transform hover:scale-105"
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Hemen Site Ekle
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {siteler.map((site, index) => (
                <div
                  key={site.siteId || site.id || index}
                  onClick={() => handleSiteClick(site.siteId || site.id)}
                  className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 animate-slideUp"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="h-32 bg-gradient-to-r from-blue-600 to-green-500 dark:from-blue-800 dark:to-green-700 flex items-center justify-center relative">
                    <Building2 className="h-16 w-16 text-white" />
                    
                    {/* Rozet - Demo Data */}
                    {site._isDemoData && (
                      <div className="absolute top-2 right-2">
                        <span className="bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-300 text-xs px-2 py-1 rounded-full font-medium">
                          Demo Veri
                        </span>
                      </div>
                    )}
                    
                    {/* Rozet - Blok ve Daire Sayısı */}
                    {(site.bloklarCount || site.daireCount) && (
                      <div className="absolute bottom-2 right-3 flex space-x-2">
                        {site.bloklarCount && (
                          <div className="bg-white dark:bg-gray-800 bg-opacity-90 rounded-full px-2 py-1 text-xs font-medium flex items-center">
                            <svg className="h-3 w-3 mr-1 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                            </svg>
                            <span className="text-blue-800 dark:text-blue-300">{site.bloklarCount} Blok</span>
                          </div>
                        )}
                        {site.daireCount && (
                          <div className="bg-white dark:bg-gray-800 bg-opacity-90 rounded-full px-2 py-1 text-xs font-medium flex items-center">
                            <svg className="h-3 w-3 mr-1 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span className="text-purple-800 dark:text-purple-300">{site.daireCount} Daire</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{site.siteIsmi}</h3>
                      {site._offlineCreated && (
                        <span className="bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-300 text-xs px-2 py-1 rounded-full">Çevrimdışı</span>
                      )}
                    </div>
                    
                    <div className="flex items-start mb-4">
                      <MapPin className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-600 dark:text-gray-300">
                        {site.siteIl}, {site.siteIlce}{site.siteMahalle && `, ${site.siteMahalle}`}{site.siteSokak && `, ${site.siteSokak}`}
                      </p>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      {site.createdAt && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(site.createdAt).toLocaleDateString('tr-TR')}
                        </span>
                      )}
                      <span className="inline-flex items-center text-sm font-medium text-green-600 dark:text-green-400 group">
                        Site Paneli
                        <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Yeni Site Ekleme Kartı */}
              <div
                onClick={toggleSiteEkleModal}
                className="bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden hover:border-green-500 dark:hover:border-green-500 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center p-8 h-full min-h-[240px]"
              >
                <div className="rounded-full bg-green-100 dark:bg-green-900 p-5 mb-4">
                  <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2 text-center">Yeni Site Ekle</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Yönetiminize yeni bir site ekleyin
                </p>
              </div>
            </div>
          )}
          
          {/* Site Ekleme Modalı */}
          {siteEkleModalAcik && (
            <SiteEkleModal 
              onClose={toggleSiteEkleModal} 
              userId={user?.id} 
              onSuccess={(yeniSite) => {
                setSiteler([...siteler, yeniSite]);
                setSiteEkleModalAcik(false);
                
                // İlk başarı mesajı
                toast.success('🏢 Site başarıyla oluşturuldu!', {
                  position: "top-right",
                  autoClose: 4000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                });
                
                // Kullanıcıya bir sonraki adım için bilgi ver ve site paneli linkini göster
                setTimeout(() => {
                  toast.info(
                    <div>
                      <p>Site panelinize giderek blok ve daire ekleyebilirsiniz.</p>
                      <button 
                        onClick={() => navigate(`/site-panel/${yeniSite.id}`)}
                        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 w-full text-center"
                      >
                        Site Paneline Git
                      </button>
                    </div>,
                    {
                      position: "top-right",
                      autoClose: 10000,
                      hideProgressBar: false,
                      closeOnClick: false
                    }
                  );
                }, 1500);
              }}
            />
          )}
        </div>
        
        {/* Footer */}
        <footer className="mt-12 border-t border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center mb-4 md:mb-0">
                <Building2 className="h-6 w-6 text-green-600 dark:text-green-400 mr-2" />
                <span className="text-gray-600 dark:text-gray-300 text-sm">
                  Apartmanım Cepte &copy; {new Date().getFullYear()}
                </span>
              </div>
              <div className="flex space-x-6">
                <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm">Yardım</button>
                <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm">Gizlilik</button>
                <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm">Kullanım Şartları</button>
                <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm">İletişim</button>
              </div>
            </div>
          </div>
        </footer>
      </div>

      <NetworkStatusMonitor />
    </div>
  );
};

// Site Ekleme Modalı Bileşeni - Backend API'sine uygun
const SiteEkleModal = ({ onClose, userId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    siteIsmi: '',
    siteIl: '',
    siteIlce: '',
    siteMahalle: '',
    siteSokak: '',
    yoneticiId: userId || 0
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [selectedIl, setSelectedIl] = useState('');
  const [availableIlceler, setAvailableIlceler] = useState([]);

  // İl seçildiğinde ilçeleri getir
  useEffect(() => {
    if (selectedIl) {
      const ilceler = getIlceler(selectedIl);
      setAvailableIlceler(ilceler);
      setFormData(prev => ({ ...prev, siteIl: selectedIl, siteIlce: '' }));
    } else {
      setAvailableIlceler([]);
    }
  }, [selectedIl]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Real-time validasyon
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: null
      });
    }
  };

  const handleIlChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedIl(selectedValue);
    
    if (validationErrors.siteIl) {
      setValidationErrors({
        ...validationErrors,
        siteIl: null
      });
    }
  };

  const handleIlceChange = (e) => {
    const selectedValue = e.target.value;
    setFormData(prev => ({ ...prev, siteIlce: selectedValue }));
    
    if (validationErrors.siteIlce) {
      setValidationErrors({
        ...validationErrors,
        siteIlce: null
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.siteIsmi.trim()) {
      errors.siteIsmi = 'Site ismi boş olamaz';
    } else if (formData.siteIsmi.trim().length < 2) {
      errors.siteIsmi = 'Site ismi en az 2 karakter olmalıdır';
    }
    
    if (!formData.siteIl.trim()) {
      errors.siteIl = 'İl seçimi zorunludur';
    }
    
    if (!formData.siteIlce.trim()) {
      errors.siteIlce = 'İlçe seçimi zorunludur';
    }
    
    if (!formData.siteMahalle.trim()) {
      errors.siteMahalle = 'Mahalle bilgisi zorunludur';
    }
    
    if (!formData.siteSokak.trim()) {
      errors.siteSokak = 'Sokak bilgisi zorunludur';
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error('Lütfen gerekli alanları doldurun', {
        position: "top-center",
        autoClose: 3000
      });
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // userId kontrolü
      if (!userId) {
        toast.error('Kullanıcı bilgisi bulunamadı. Lütfen tekrar giriş yapın.', {
          position: "top-center",
          autoClose: 3000
        });
        setLoading(false);
        return;
      }

      // Backend API'sine uygun request
      const requestData = {
        siteIsmi: formData.siteIsmi.trim(),
        siteIl: formData.siteIl,
        siteIlce: formData.siteIlce,
        siteMahalle: formData.siteMahalle.trim(),
        siteSokak: formData.siteSokak.trim(),
        yoneticiId: parseInt(userId, 10) || 0 // userId'yi sayı olarak gönderelim
      };
      
      
      // Doğrudan URL kullanarak - chunked encoding hatasını aşmak için
      const response = await axios.post(`${API_BASE_URL}/structure/site/ekle`, requestData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });
      
      
      if (response.data && response.data.message) {
        // Backend'den başarılı response - ResponseDTO: { message, token }
        let realSiteId = Date.now(); // Fallback ID
        
        try {
          // Backend'den site listesini yeniden çek - SiteResponseDTO listesi
          const sitesResponse = await axios.get(`${API_BASE_URL}/structure/site/${userId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            },
            timeout: 30000
          });
          
          if (sitesResponse.data && sitesResponse.data.length > 0) {
            // En son eklenen site (siteIsmi ile eşleştir) - SiteResponseDTO
            const addedSite = sitesResponse.data.find(site => site.siteIsmi === requestData.siteIsmi);
            if (addedSite && addedSite.siteId) {
              realSiteId = addedSite.siteId; // SiteResponseDTO.siteId
            }
          }
        } catch (siteIdError) {
        }
        
        // SiteResponseDTO field'larına uygun site objesi
        const yeniSite = {
          id: realSiteId, // Frontend için
          siteId: realSiteId, // SiteResponseDTO.siteId
          siteIsmi: requestData.siteIsmi, // SiteResponseDTO.siteIsmi
          siteIl: requestData.siteIl, // SiteResponseDTO.siteIl
          siteIlce: requestData.siteIlce, // SiteResponseDTO.siteIlce
          siteMahalle: requestData.siteMahalle, // SiteResponseDTO.siteMahalle
          siteSokak: requestData.siteSokak, // SiteResponseDTO.siteSokak
          createdAt: new Date().toISOString(),
          _isNew: true // Frontend işareti
        };
        
        // Önbelleğe kaydet
        siteStorageService.addSite(yeniSite, userId);
        
        toast.success(`${yeniSite.siteIsmi} başarıyla eklendi! ${response.data.message}`, {
          position: "top-center", 
          autoClose: 4000
        });
        
        setTimeout(() => {
          onSuccess(yeniSite);
        }, 800);
      } else {
        throw new Error('Backend\'den beklenmeyen yanıt formatı');
      }
    } catch (err) {
      console.error("Site eklenirken hata:", err);
      
      let errorMessage = 'Site eklenirken bir hata oluştu.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        errorMessage = 'Yetkilendirme hatası. Lütfen tekrar giriş yapın.';
        toast.error(errorMessage, {
          position: "top-center",
          autoClose: 5000
        });
        setTimeout(() => {
          authService.logout();
        }, 2000);
        return;
      } else if (err.response?.status === 400) {
        errorMessage = err.response?.data?.message || 'Geçersiz form verileri. Lütfen kontrol edip tekrar deneyin.';
      } else if (err.response?.status === 409) {
        errorMessage = 'Bu isimde bir site zaten mevcut. Lütfen farklı bir site ismi kullanın.';
      } else if (err.code === 'ERR_NETWORK' || err.message.includes('Network Error')) {
        errorMessage = 'Sunucuya bağlanılamıyor. İnternet bağlantınızı kontrol edin.';
      } else if (err.response?.status === 500) {
        errorMessage = 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  // Modal kapanmasını kontrol et - Hiç site yoksa kapatmaya izin verme
  const handleModalClose = () => {
    // Parent componentteki siteler listesini kontrol etmek için
    // onClose fonksiyonunu çağırırken, eğer hiç site yoksa uyarı göster
    onClose();
  };

  const handleOutsideClick = (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
      handleModalClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-60 flex items-center justify-center z-50 modal-backdrop animate-fadeIn" onClick={handleOutsideClick}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 md:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 animate-scaleIn mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Building2 className="h-6 w-6 text-blue-600" />
            Yeni Site Ekle
          </h2>
          <button 
            onClick={handleModalClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            aria-label="Kapat"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-500 text-red-700 dark:text-red-400 rounded-md">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Site İsmi */}
          <div>
            <label htmlFor="siteIsmi" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Site İsmi *
            </label>
            <input
              type="text"
              id="siteIsmi"
              name="siteIsmi"
              value={formData.siteIsmi}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                validationErrors.siteIsmi ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Örn: Manolya Sitesi"
              autoFocus
            />
            {validationErrors.siteIsmi && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.siteIsmi}</p>
            )}
          </div>

          {/* İl Seçimi */}
          <div>
            <label htmlFor="siteIl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              İl *
            </label>
            <select
              id="siteIl"
              value={selectedIl}
              onChange={handleIlChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                validationErrors.siteIl ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">İl seçin</option>
              {iller.map((il) => (
                <option key={il} value={il}>
                  {il}
                </option>
              ))}
            </select>
            {validationErrors.siteIl && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.siteIl}</p>
            )}
          </div>

          {/* İlçe Seçimi */}
          <div>
            <label htmlFor="siteIlce" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              İlçe *
            </label>
            <select
              id="siteIlce"
              value={formData.siteIlce}
              onChange={handleIlceChange}
              disabled={!selectedIl}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed ${
                validationErrors.siteIlce ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">İlçe seçin</option>
              {availableIlceler.map((ilce) => (
                <option key={ilce} value={ilce}>
                  {ilce}
                </option>
              ))}
            </select>
            {validationErrors.siteIlce && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.siteIlce}</p>
            )}
          </div>

          {/* Mahalle */}
          <div>
            <label htmlFor="siteMahalle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mahalle *
            </label>
            <input
              type="text"
              id="siteMahalle"
              name="siteMahalle"
              value={formData.siteMahalle}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                validationErrors.siteMahalle ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Örn: Göztepe Mahallesi"
            />
            {validationErrors.siteMahalle && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.siteMahalle}</p>
            )}
          </div>

          {/* Sokak */}
          <div>
            <label htmlFor="siteSokak" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sokak *
            </label>
            <input
              type="text"
              id="siteSokak"
              name="siteSokak"
              value={formData.siteSokak}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                validationErrors.siteSokak ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Örn: Çiçek Sokak No:15"
            />
            {validationErrors.siteSokak && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.siteSokak}</p>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Site Ekleniyor...
                </>
              ) : (
                <>
                  <PlusCircle className="h-4 w-4" />
                  Site Ekle
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default SiteYonetimSayfasi;
