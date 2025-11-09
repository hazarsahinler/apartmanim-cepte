import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, Users, Home, PlusCircle, Loader2, AlertCircle, Layers, ArrowLeft, Eye, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { duyuruService } from '../services/duyuruService';
import { blokService } from '../services/blokService';
import DuyuruList from '../components/DuyuruList';
import MainNavbar from '../components/MainNavbar';
import Sidebar from '../components/Sidebar';
import { clearAllCache, debugLocalStorage } from '../utils/clearCache';

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
  const [blokEkleModalAcik, setBlokEkleModalAcik] = useState(false);

  const toggleBlokEkleModal = () => {
    setBlokEkleModalAcik(!blokEkleModalAcik);
  };

  useEffect(() => {
    const fetchSiteData = async () => {
      try {
        setLoading(true);
        
        // SiteId debug
        console.log('SitePanelSayfasi - URL\'den gelen siteId:', siteId);
        
        // Timestamp kontrolü - eğer çok büyük bir sayıysa (timestamp) düzelt
        let validSiteId = siteId;
        if (siteId && siteId.toString().length > 10) {
          console.warn('SitePanelSayfasi - Timestamp detected, fallback to 1:', siteId);
          validSiteId = '1'; // Default site ID
        }
        
        console.log('SitePanelSayfasi - Kullanılacak siteId:', validSiteId);
        
        // Önce localStorage'dan kullanıcının sitelerini al
        const userSitesJson = localStorage.getItem('userSites');
        if (userSitesJson) {
          const userSites = JSON.parse(userSitesJson);
          // Site ID'ye göre siteyi bul (hem id hem siteId alanlarını kontrol et)
          const foundSite = userSites.find(site => 
            site.id === parseInt(validSiteId) || site.id === validSiteId ||
            site.siteId === parseInt(validSiteId) || site.siteId === validSiteId
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
        
        // SiteId debug - timestamp sorunu
        console.log('SitePanelSayfasi - Raw siteId:', siteId);
        console.log('SitePanelSayfasi - siteId type:', typeof siteId);
        
        // Timestamp kontrolü - eğer çok büyük bir sayıysa (timestamp) düzelt
        let validSiteId = siteId;
        if (siteId && siteId.toString().length > 10) {
          console.warn('SitePanelSayfasi fetchBloklar - Timestamp detected, fallback to 1:', siteId);
          validSiteId = '1'; // Default site ID
        }
        
        // SiteId'yi düzgün parse et
        const parsedSiteId = parseInt(validSiteId, 10);
        console.log('SitePanelSayfasi - Parsed siteId:', parsedSiteId);
        
        if (isNaN(parsedSiteId)) {
          console.error('SitePanelSayfasi - Geçersiz siteId:', validSiteId);
          setBloklar([]);
          return;
        }
        
        // Gerçek API çağrısı - parse edilmiş siteId kullan
        const blokData = await blokService.getBloksBySiteId(parsedSiteId);
        
        console.log('Backend\'den gelen blok listesi:', blokData);
        
        // Backend BlokResponseDTO field mapping: { siteId, blokId, blokIsmi, daireSay }
        const bloklarWithDaireSayisi = (blokData || []).map(blok => ({
          ...blok,
          // BlokResponseDTO'dan frontend'e mapping
          daireSayisi: blok.daireSay || 0, // daireSay -> daireSayisi
          // Diğer field'lar zaten doğru: blokId, blokIsmi, siteId
        }));
        
        console.log('BlokResponseDTO mapped blok listesi:', bloklarWithDaireSayisi);
        setBloklar(bloklarWithDaireSayisi);
      } catch (err) {
        console.error("Blok verisi yüklenirken hata:", err);
        setBloklar([]);
        // Hata durumunda sessizce devam et, blok listesi boş kalacak
      } finally {
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

  // Bloklar değiştiğinde toplam daire sayısını hesapla
  useEffect(() => {
    if (bloklar && bloklar.length > 0 && siteData) {
      const toplamDaireSayisi = bloklar.reduce((toplam, blok) => {
        return toplam + (blok.daireSayisi || 0);
      }, 0);
      
      console.log('Toplam daire sayısı hesaplandı:', toplamDaireSayisi);
      setSiteData(prev => ({
        ...prev,
        daireSayisi: toplamDaireSayisi,
        blokSayisi: bloklar.length
      }));
    }
  }, [bloklar, siteData?.id]); // siteData?.id dependency'si döngüyü önler

  // Duyuru detay sayfasına git
  const handleDuyuruClick = (duyuru) => {
    navigate(`/duyuru/${duyuru.id}`);
  };

  // Yeni duyuru oluştur sayfasına git
  const handleYeniDuyuruClick = () => {
    navigate('/duyuru-olustur');
  };

  // Blok ekleme modalını aç
  const handleBlokEkleClick = () => {
    setBlokEkleModalAcik(true);
  };

  // Cache temizleme fonksiyonu - DB reset sonrası kullanım için
  const handleCacheClear = () => {
    if (window.confirm('Tüm cache temizlenecek ve sayfa yenilenecek. Devam etmek istiyor musunuz?')) {
      debugLocalStorage(); // Önce debug
      clearAllCache();
      toast.success('Cache temizlendi, sayfa yenileniyor...');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <MainNavbar />
        <Sidebar />
        
        <div className="pt-16 ml-64">
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
        <MainNavbar />
        <Sidebar />
        
        <div className="pt-16 ml-64">
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
        <MainNavbar />
        <Sidebar />
        
        <div className="pt-16 ml-64">
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
      <MainNavbar />
      
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="pt-16 ml-64"> {/* Sidebar her zaman açık olduğu için sabit margin */}
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
              <div className="flex space-x-3">
                <button
                  onClick={handleCacheClear}
                  className="inline-flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                  title="Cache Temizle (DB reset sonrası kullanın)"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  onClick={handleYeniDuyuruClick}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-blue-500 hover:from-green-700 hover:to-blue-600 text-white text-sm font-medium rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Yeni Duyuru
                </button>
              </div>
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

          {/* Finansal İşlemler Butonları */}
          <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-4 mb-8">
            <button
              onClick={() => navigate(`/finansal-islemler/${siteId}`)}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 text-left group border-l-4 border-blue-500"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Finansal İşlemler</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Alacak, gider ve tüm finansal işlemleri yönetin
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </button>
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
                        key={blok.blokId}
                        className="border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <Layers className="h-5 w-5 text-blue-500 mr-2" />
                            <h3 className="font-medium text-gray-800 dark:text-white">{blok.blokIsmi}</h3>
                          </div>
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                            {blok.daireSayisi || 0} Daire
                          </span>
                        </div>
                        <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                          <button 
                            onClick={() => navigate(`/blok-detay/${blok.blokId}`)}
                            className="w-full px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Detay Gör
                          </button>
                        </div>
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

      {/* Blok Ekleme Modal */}
      {blokEkleModalAcik && (
        <BlokEkleModal
          onClose={toggleBlokEkleModal}
          siteId={siteId}
          onSuccess={async (yeniBlok) => {
            // Blok listesini API'den yeniden çek
            try {
              const blokData = await blokService.getBloksBySiteId(siteId);
              setBloklar(blokData || []);
            } catch (error) {
              console.error('Blok listesi yenilenemedi:', error);
              // Hata durumunda eski listeye manuel olarak ekle
              setBloklar(prev => [...prev, {
                blokId: Date.now(),
                blokIsmi: yeniBlok.blokIsmi,
                siteId: parseInt(siteId),
                daireList: [] // Boş daire listesi
              }]);
            }
            
            toast.success(`${yeniBlok.blokIsmi} başarıyla eklendi!`, {
              position: "top-center",
              autoClose: 3000
            });
          }}
        />
      )}
    </div>
  );
};

// BlokEkleModal Component
const BlokEkleModal = ({ onClose, siteId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    blokIsmi: '',
    katSayisi: 1,
    herKattakiDaireSayisi: 1
  });
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    console.log('HandleChange çağrıldı:', { name, value, type: typeof value });
    
    if (name === 'katSayisi' || name === 'herKattakiDaireSayisi') {
      // Sayı alanları için
      const numValue = parseInt(value, 10);
      const finalValue = isNaN(numValue) ? 1 : Math.max(1, numValue);
      
      console.log(`${name} - Original:`, value, 'Parsed:', numValue, 'Final:', finalValue);
      
      setFormData(prev => {
        const newData = {
          ...prev,
          [name]: finalValue
        };
        console.log('Updated formData:', newData);
        return newData;
      });
    } else {
      // String alanları için
      console.log(`${name} - String value:`, value);
      setFormData(prev => {
        const newData = {
          ...prev,
          [name]: value
        };
        console.log('Updated formData:', newData);
        return newData;
      });
    }
    
    // Hata temizle
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.blokIsmi.trim()) {
      errors.blokIsmi = 'Blok ismi boş olamaz';
    }
    
    const katSayisi = parseInt(formData.katSayisi, 10);
    if (isNaN(katSayisi) || katSayisi < 1) {
      errors.katSayisi = 'Kat sayısı en az 1 olmalıdır';
    }
    
    const daireSayisi = parseInt(formData.herKattakiDaireSayisi, 10);
    if (isNaN(daireSayisi) || daireSayisi < 1) {
      errors.herKattakiDaireSayisi = 'Her kattaki daire sayısı en az 1 olmalıdır';
    }
    
    console.log('Validation - formData:', formData);
    console.log('Validation - katSayisi:', katSayisi, 'daireSayisi:', daireSayisi);
    console.log('Validation errors:', errors);
    
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
    
    try {
      console.log('Form submit - Original formData:', formData);
      console.log('Form submit - siteId:', siteId, 'type:', typeof siteId);
      
      const blokData = {
        blokIsmi: formData.blokIsmi.trim(),
        katSayisi: parseInt(formData.katSayisi, 10),
        herKattakiDaireSayisi: parseInt(formData.herKattakiDaireSayisi, 10),
        siteId: parseInt(siteId, 10)
      };
      
      console.log('Final blokData before API call:', blokData);
      console.log('Type checks:');
      console.log('- blokIsmi:', typeof blokData.blokIsmi, blokData.blokIsmi);
      console.log('- katSayisi:', typeof blokData.katSayisi, blokData.katSayisi);
      console.log('- herKattakiDaireSayisi:', typeof blokData.herKattakiDaireSayisi, blokData.herKattakiDaireSayisi);
      console.log('- siteId:', typeof blokData.siteId, blokData.siteId);
      
      const response = await blokService.addBlok(blokData);
      
      const yeniBlok = {
        id: response.id || Date.now(),
        ...blokData,
        daireSayisi: formData.katSayisi * formData.herKattakiDaireSayisi,
        createdAt: new Date().toISOString()
      };
      
      onSuccess(yeniBlok);
      onClose();
    } catch (error) {
      console.error('Blok ekleme hatası:', error);
      toast.error(error.message || 'Blok eklenirken bir hata oluştu.', {
        position: "top-center",
        autoClose: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Yeni Blok Ekle
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Blok İsmi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Blok İsmi *
              </label>
              <input
                type="text"
                name="blokIsmi"
                value={formData.blokIsmi}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.blokIsmi 
                    ? 'border-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Örn: A Blok, 1. Blok"
              />
              {validationErrors.blokIsmi && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.blokIsmi}</p>
              )}
            </div>

            {/* Kat Sayısı */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Kat Sayısı *
              </label>
              <input
                type="number"
                name="katSayisi"
                value={formData.katSayisi}
                onChange={handleChange}
                min="1"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.katSayisi 
                    ? 'border-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {validationErrors.katSayisi && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.katSayisi}</p>
              )}
            </div>

            {/* Her Kattaki Daire Sayısı */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Her Kattaki Daire Sayısı *
              </label>
              <input
                type="number"
                name="herKattakiDaireSayisi"
                value={formData.herKattakiDaireSayisi}
                onChange={handleChange}
                min="1"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.herKattakiDaireSayisi 
                    ? 'border-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {validationErrors.herKattakiDaireSayisi && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.herKattakiDaireSayisi}</p>
              )}
            </div>

            {/* Toplam Daire Sayısı (Hesaplanmış) */}
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Toplam Daire Sayısı: <span className="font-semibold">
                  {formData.katSayisi * formData.herKattakiDaireSayisi}
                </span>
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Ekleniyor...' : 'Blok Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SitePanelSayfasi;