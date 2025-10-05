import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, Users, Home, PlusCircle, Loader2, AlertCircle, Layers, ArrowLeft } from 'lucide-react';
import { duyuruService } from '../services/duyuruService';
import DuyuruList from '../components/DuyuruList';
import MainNavbar from '../components/MainNavbar';
import Sidebar from '../components/Sidebar';

const SitePanelSayfasi = () => {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [siteData, setSiteData] = useState(null);
  const [error, setError] = useState(null);
  const [duyurular, setDuyurular] = useState([]);
  const [duyuruYukleniyor, setDuyuruYukleniyor] = useState(true);
  const [bloklar, setBloklar] = useState([]);
  const [blokYukleniyor, setBlokYukleniyor] = useState(true);
  
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    const fetchSiteData = async () => {
      try {
        setLoading(true);
        
        // Önce localStorage'dan kullanıcının sitelerini al
        const userSitesJson = localStorage.getItem('userSites');
        if (userSitesJson) {
          const userSites = JSON.parse(userSitesJson);
          // Site ID'ye göre siteyi bul (hem id hem siteId alanlarını kontrol et)
          const foundSite = userSites.find(site => 
            site.id === parseInt(siteId) || site.id === siteId ||
            site.siteId === parseInt(siteId) || site.siteId === siteId
          );
          
          if (foundSite) {
            setSiteData({
              ...foundSite,
              blokSayisi: 0,  // Bu veriler henüz API'de yok
              daireSayisi: 0,
              sakinSayisi: 0
            });
            setLoading(false);
            return;
          }
        }
        
        // localStorage'da bulunamazsa varsayılan değerler
        const defaultSiteData = {
          id: siteId,
          siteIsmi: "Site " + siteId,
          siteIl: "İstanbul",
          siteIlce: "Kadıköy", 
          siteMahalle: "Göztepe",
          siteSokak: "Dere Sokak",
          blokSayisi: 0,
          daireSayisi: 0,
          sakinSayisi: 0
        };
        
        setSiteData(defaultSiteData);
        setLoading(false);
      } catch (err) {
        console.error("Site verisi yüklenirken hata:", err);
        setError('Site bilgileri yüklenirken bir hata oluştu.');
        setLoading(false);
      }
    };

    const fetchBloklar = async () => {
      try {
        setBlokYukleniyor(true);
        // Mock veri (gerçek API olmadığında)
        setTimeout(() => {
          const mockBloklar = []; // Boş liste varsayalım, bloklar henüz eklenmemiş
          setBloklar(mockBloklar);
          setBlokYukleniyor(false);
        }, 1000);
      } catch (err) {
        console.error("Blok verisi yüklenirken hata:", err);
        setBloklar([]);
        setBlokYukleniyor(false);
      }
    };

    const fetchDuyurular = async () => {
      try {
        setDuyuruYukleniyor(true);
        // Site ID'ye göre duyuruları çek
        const duyuruData = await duyuruService.getDuyurularBySiteId(siteId);
        setDuyurular(Array.isArray(duyuruData) ? duyuruData : []);
      } catch (err) {
        console.error("Duyurular yüklenirken hata:", err);
        setDuyurular([]);
      } finally {
        setDuyuruYukleniyor(false);
      }
    };

    fetchSiteData();
    fetchBloklar();
    fetchDuyurular();
  }, [siteId]);

  // Duyuru detay sayfasına git
  const handleDuyuruClick = (duyuru) => {
    navigate(`/duyuru/${duyuru.id}`);
  };

  // Yeni duyuru oluştur sayfasına git
  const handleYeniDuyuruClick = () => {
    navigate('/duyuru-olustur');
  };

  // Blok ekleme sayfasına git
  const handleBlokEkleClick = () => {
    navigate(`/blok-ekle/${siteId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <MainNavbar toggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
        <Sidebar isOpen={sidebarOpen} />
        
        <div className={`pt-16 transition-all duration-300 ${sidebarOpen ? 'md:ml-64 sm:ml-16' : ''}`}>
          <div className="flex justify-center items-center h-screen">
            <div className="flex flex-col items-center">
              <Loader2 className="h-12 w-12 text-green-500 animate-spin" />
              <span className="mt-4 text-gray-600 dark:text-gray-300">Site bilgileri yükleniyor...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <MainNavbar toggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
        <Sidebar isOpen={sidebarOpen} />
        
        <div className={`pt-16 transition-all duration-300 ${sidebarOpen ? 'md:ml-64 sm:ml-16' : ''}`}>
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-5xl mx-auto">
              <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg relative" role="alert">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <strong className="font-bold">Hata!</strong>
                  <span className="block sm:inline ml-2">{error}</span>
                </div>
              </div>
              <button
                onClick={() => navigate('/site-yonetimi')}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Site Yönetimi Sayfasına Dön
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!siteData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <MainNavbar toggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
        <Sidebar isOpen={sidebarOpen} />
        
        <div className={`pt-16 transition-all duration-300 ${sidebarOpen ? 'md:ml-64 sm:ml-16' : ''}`}>
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-5xl mx-auto">
              <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-400 dark:border-yellow-600 text-yellow-700 dark:text-yellow-300 px-4 py-3 rounded-lg relative" role="alert">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <strong className="font-bold">Uyarı!</strong>
                  <span className="block sm:inline ml-2">Site bulunamadı.</span>
                </div>
              </div>
              <button
                onClick={() => navigate('/site-yonetimi')}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Site Yönetimi Sayfasına Dön
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Navbar */}
      <MainNavbar toggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
      
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} />
      
      {/* Main Content */}
      <div className={`pt-16 transition-all duration-300 ${sidebarOpen ? 'md:ml-64 sm:ml-16' : ''}`}>
        <div className="container mx-auto px-4 py-8">
          {/* Site Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => navigate('/site-yonetimi')}
                  className="mr-4 p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{siteData.siteIsmi}</h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {siteData.siteIl}, {siteData.siteIlce} • {siteData.siteMahalle}, {siteData.siteSokak}
                  </p>
                </div>
              </div>
              <button
                onClick={handleYeniDuyuruClick}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-blue-500 hover:from-green-700 hover:to-blue-600 text-white text-sm font-medium rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Yeni Duyuru
              </button>
            </div>
          </div>

          {/* İstatistikler */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex items-center transition-transform duration-300 hover:shadow-lg transform hover:-translate-y-1">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-3 mr-4">
                <Layers className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Toplam Blok</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{siteData.blokSayisi || 0}</p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex items-center transition-transform duration-300 hover:shadow-lg transform hover:-translate-y-1">
              <div className="rounded-full bg-green-100 dark:bg-green-900 p-3 mr-4">
                <Home className="h-6 w-6 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Toplam Daire</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{siteData.daireSayisi || 0}</p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex items-center transition-transform duration-300 hover:shadow-lg transform hover:-translate-y-1">
              <div className="rounded-full bg-purple-100 dark:bg-purple-900 p-3 mr-4">
                <Users className="h-6 w-6 text-purple-600 dark:text-purple-300" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Toplam Sakin</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{siteData.sakinSayisi || 0}</p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex items-center transition-transform duration-300 hover:shadow-lg transform hover:-translate-y-1">
              <div className="rounded-full bg-amber-100 dark:bg-amber-900 p-3 mr-4">
                <Building2 className="h-6 w-6 text-amber-600 dark:text-amber-300" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Aktif Duyuru</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{duyurular.length}</p>
              </div>
            </div>
          </div>

          {/* Ana İçerik Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sol Kolon - Bloklar ve Daireler */}
            <div className="lg:col-span-2 space-y-8">
              {/* Bloklar Bölümü */}
              <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Bloklar ve Daireler</h2>
                  <button
                    onClick={handleBlokEkleClick}
                    className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-500 hover:from-blue-700 hover:to-purple-600 text-white text-sm font-medium rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Blok Ekle
                  </button>
                </div>
                
                {blokYukleniyor ? (
                  <div className="p-8 flex justify-center">
                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                  </div>
                ) : bloklar.length > 0 ? (
                  <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {bloklar.map((blok) => (
                      <div 
                        key={blok.id}
                        className="border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                        onClick={() => navigate(`/blok/${blok.id}`)}
                      >
                        <div className="flex items-center mb-2">
                          <Layers className="h-5 w-5 text-blue-500 mr-2" />
                          <h3 className="font-medium text-gray-800 dark:text-white">{blok.blokAdi}</h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{blok.daireSayisi || 0} Daire</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <div className="mx-auto w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                      <Layers className="h-8 w-8 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Henüz Blok Bulunmuyor</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Sitenize blok ekleyerek yönetim işlemine başlayabilirsiniz.
                    </p>
                    <button
                      onClick={handleBlokEkleClick}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-500 hover:from-blue-700 hover:to-purple-600 text-white text-sm font-medium rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      İlk Bloğu Ekle
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Sağ Kolon - Duyurular */}
            <div className="space-y-8">
              {/* Duyurular */}
              <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Son Duyurular</h2>
                  <button
                    onClick={handleYeniDuyuruClick}
                    className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-green-600 to-blue-500 hover:from-green-700 hover:to-blue-600 text-white text-sm font-medium rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Duyuru Ekle
                  </button>
                </div>
                
                {duyuruYukleniyor ? (
                  <div className="p-8 flex justify-center">
                    <Loader2 className="h-8 w-8 text-green-500 animate-spin" />
                  </div>
                ) : (
                  <DuyuruList 
                    duyurular={duyurular} 
                    limit={5} 
                    onDuyuruClick={handleDuyuruClick} 
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SitePanelSayfasi;