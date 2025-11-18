import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Building, Check, Eye, CreditCard,
  LogOut, Moon, Sun, DollarSign, Clock, Home
} from 'lucide-react';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';
import { useTheme } from '../contexts/ThemeContext';
import { ENDPOINTS } from '../constants/endpoints';
import axios from 'axios';

const DaireBorcDetay = () => {
  const { siteId, borcId } = useParams();
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [daireBorclar, setDaireBorclar] = useState([]);
  const [borcBilgi, setBorcBilgi] = useState(null);
  const [odemeDurumlari, setOdemeDurumlari] = useState({});
  const [islemYapiliyor, setIslemYapiliyor] = useState(false);
  const [selectedBorc, setSelectedBorc] = useState(null);

  const handleLogout = () => {
    if (window.confirm('Çıkış yapmak istediğinize emin misiniz?')) {
      authService.logout();
    }
  };

  // Daire borç detaylarını API'den çek
  const fetchDaireBorclar = async (borcId) => {
    try {
      console.log('fetchDaireBorclar - Gelen borcId parametresi:', borcId);
      
      const token = authService.getToken();
      if (!token) {
        throw new Error('Token bulunamadı');
      }

      const apiUrl = `http://localhost:8080/api${ENDPOINTS.FINANCE.DAIRELER_BORC_BY_ID}/${borcId}`;
      console.log('fetchDaireBorclar - API URL:', apiUrl);

      const response = await axios.get(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        // Timestamp ekleyerek cache'i bypass et
        params: {
          '_t': Date.now()
        }
      });

      console.log('fetchDaireBorclar - API yanıtı:', response.data);
      console.log('fetchDaireBorclar - İlk kayıt detayı:', response.data[0]);
      console.log('fetchDaireBorclar - API yanıtında kaç kayıt var:', response.data.length);
      return response.data;
    } catch (error) {
      console.error('Daire borçları yüklenirken hata:', error);
      throw error;
    }
  };

  // Ödeme isteği durumunu kontrol et
  const checkOdemeDurumu = async (daireBorcId) => {
    try {
      const token = authService.getToken();
      const response = await axios.get(
        `http://localhost:8080/api${ENDPOINTS.FINANCE.ODEME_ISTEK_DURUM}/${daireBorcId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Ödeme durumu kontrol hatası:', error);
      return null;
    }
  };

  // Ödeme isteğini onayla
  const onaylaOdemeIstegi = async (daireBorcId) => {
    if (!window.confirm('Bu ödeme isteğini onaylamak istediğinize emin misiniz?')) {
      return;
    }

    try {
      setIslemYapiliyor(true);
      setSelectedBorc(daireBorcId);
      
      const token = authService.getToken();
      const response = await axios.post(
        `http://localhost:8080/api${ENDPOINTS.FINANCE.ODEME_ISTEK_KABUL}/${daireBorcId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      toast.success('Ödeme isteği başarıyla onaylandı!');
      
      // Durumları yeniden yükle
      await loadOdemeDurumlari();
      
    } catch (error) {
      console.error('Ödeme onaylama hatası:', error);
      toast.error(error.response?.data?.message || 'Ödeme onaylanırken bir hata oluştu.');
    } finally {
      setIslemYapiliyor(false);
      setSelectedBorc(null);
    }
  };

  // Tüm borçlar için ödeme durumlarını yükle
  const loadOdemeDurumlari = async () => {
    if (daireBorclar.length === 0) return;
    
    const durumlar = {};
    
    for (const borc of daireBorclar) {
      const durum = await checkOdemeDurumu(borc.id);
      durumlar[borc.id] = durum;
    }
    
    setOdemeDurumlari(durumlar);
  };

  // Sayfa yüklendiğinde verileri çek
  useEffect(() => {
    const initializePage = async () => {
      try {
        setLoading(true);
        
        // State'leri temizle (cache problemini önlemek için)
        setDaireBorclar([]);
        setBorcBilgi(null);
        setOdemeDurumlari({});
        
        if (!authService.isAuthenticated()) {
          navigate('/giris');
          return;
        }

        const userInfo = await authService.getUserInfo();
        setUser(userInfo);
        
        // Site bilgilerini yükle (opsiyonel - sadece navigation için)
        const userSitesJson = localStorage.getItem('userSites');
        if (userSitesJson) {
          const userSites = JSON.parse(userSitesJson);
          const foundSite = userSites.find(site => 
            site.id === parseInt(siteId) || site.id === siteId
          );
          
          // Site bulundu ama şu an kullanmıyoruz
          if (foundSite) {
            console.log('Site bilgisi:', foundSite);
          }
        }
        
        // API'den daire borçlarını çek
        try {
          console.log('DaireBorcDetay - URL\'den gelen borcId:', borcId);
          console.log('DaireBorcDetay - URL\'den gelen siteId:', siteId);
          
          const daireBorcListesi = await fetchDaireBorclar(borcId);
          console.log('DaireBorcDetay - API\'den dönen daire borç listesi:', daireBorcListesi);
          setDaireBorclar(daireBorcListesi);
          
          // İlk elemandan borç bilgisini çıkar
          if (daireBorcListesi && daireBorcListesi.length > 0) {
            setBorcBilgi({
              aciklama: daireBorcListesi[0].borcAciklamasi,
              tutar: daireBorcListesi[0].tutar,
              sonOdemeTarihi: daireBorcListesi[0].sonOdemeTarihi
            });
          }
          
        } catch (error) {
          console.error('API hatası:', error);
          toast.error('Daire borç bilgileri yüklenemedi. Demo veriler gösteriliyor.');
          
          // Demo veriler
          const demoDaireBorclar = [
            {
              "id": 1,
              "tutar": 450.00,
              "odendiMi": false,
              "odemeTarihi": null,
              "daireId": 1,
              "daireNo": 1,
              "borcAciklamasi": "Kasım 2025 Aidat Ödemesi",
              "sonOdemeTarihi": "2025-11-15"
            },
            {
              "id": 2,
              "tutar": 450.00,
              "odendiMi": false,
              "odemeTarihi": null,
              "daireId": 2,
              "daireNo": 2,
              "borcAciklamasi": "Kasım 2025 Aidat Ödemesi",
              "sonOdemeTarihi": "2025-11-15"
            },
            {
              "id": 3,
              "tutar": 450.00,
              "odendiMi": true,
              "odemeTarihi": "2025-11-05",
              "daireId": 3,
              "daireNo": 3,
              "borcAciklamasi": "Kasım 2025 Aidat Ödemesi",
              "sonOdemeTarihi": "2025-11-15"
            }
          ];
          
          setDaireBorclar(demoDaireBorclar);
          setBorcBilgi({
            aciklama: "Kasım 2025 Aidat Ödemesi",
            tutar: 450.00,
            sonOdemeTarihi: "2025-11-15"
          });
        }
        
      } catch (err) {
        console.error('Sayfa yüklenirken hata:', err);
        toast.error('Sayfa yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    initializePage();
  }, [navigate, siteId, borcId]);

  // Daire borçları yüklendiğinde ödeme durumlarını da yükle
  useEffect(() => {
    if (daireBorclar.length > 0) {
      loadOdemeDurumlari();
    }
  }, [daireBorclar]);

  // Ödeme durumuna göre badge rengi
  const getOdemeDurumuBadge = (odendiMi, sonOdemeTarihi, daireBorcId) => {
    const durumResponse = odemeDurumlari[daireBorcId];
    
    // Backend'den message varsa onu kullan
    if (durumResponse && durumResponse.message) {
      const message = durumResponse.message.toLowerCase();
      
      if (message.includes('onaylandı') || message.includes('onaylandi')) {
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      } else if (message.includes('onay bekliyor') || message.includes('bekleniyor')) {
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      }
    }
    
    // Eski boolean kontrol (geriye uyumluluk)
    if (durumResponse !== undefined && durumResponse !== null) {
      if (typeof durumResponse === 'boolean') {
        if (durumResponse === true) {
          return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        } else if (durumResponse === false) {
          return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
        }
      } else if (typeof durumResponse === 'object') {
        if (durumResponse.onaylandiMi === true) {
          return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        } else if (durumResponse.onaylandiMi === false) {
          return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
        }
      }
    }
    
    // Ödeme isteği yoksa geleneksel durum kontrolü
    if (odendiMi) {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    }
    
    const bugun = new Date();
    const sonTarih = new Date(sonOdemeTarihi);
    
    if (bugun > sonTarih) {
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    }
    
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const getOdemeDurumuText = (odendiMi, sonOdemeTarihi, daireBorcId) => {
    const durumResponse = odemeDurumlari[daireBorcId];
    
    // Backend'den message varsa direkt onu kullan
    if (durumResponse && durumResponse.message) {
      return durumResponse.message;
    }
    
    // Eski boolean kontrol (geriye uyumluluk)
    if (durumResponse !== undefined && durumResponse !== null) {
      if (typeof durumResponse === 'boolean') {
        if (durumResponse === true) {
          return 'Onaylandı';
        } else if (durumResponse === false) {
          return 'Onay Bekliyor';
        }
      } else if (typeof durumResponse === 'object') {
        if (durumResponse.onaylandiMi === true) {
          return 'Onaylandı';
        } else if (durumResponse.onaylandiMi === false && durumResponse.message === null) {
          return 'Bekliyor'; // İstek yok
        } else if (durumResponse.onaylandiMi === false) {
          return 'Onay Bekliyor'; // İstek var ama onaylanmamış
        }
      }
    }
    
    // Ödeme isteği yoksa geleneksel durum kontrolü
    if (odendiMi) {
      return 'Ödendi';
    }
    
    const bugun = new Date();
    const sonTarih = new Date(sonOdemeTarihi);
    
    if (bugun > sonTarih) {
      return 'Gecikti';
    }
    
    return 'Bekliyor';
  };

  // Özet istatistikleri
  const getOzet = () => {
    const toplamDaire = daireBorclar.length;
    const odenenDaire = daireBorclar.filter(borc => borc.odendiMi).length;
    const bekleyenDaire = toplamDaire - odenenDaire;
    const toplamTutar = daireBorclar.reduce((sum, borc) => sum + borc.tutar, 0);
    const odenenTutar = daireBorclar.filter(borc => borc.odendiMi).reduce((sum, borc) => sum + borc.tutar, 0);
    const bekleyenTutar = toplamTutar - odenenTutar;
    
    return {
      toplamDaire,
      odenenDaire,
      bekleyenDaire,
      toplamTutar,
      odenenTutar,
      bekleyenTutar
    };
  };

  const ozet = getOzet();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <nav className="bg-white dark:bg-gray-800 shadow-md fixed w-full top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-3">
                  <Building className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">Daire Borç Detayları</span>
              </div>
            </div>
          </div>
        </nav>
        
        <div className="pt-16 flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Top Navigation Bar */}
      <nav className="bg-white dark:bg-gray-800 shadow-md fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate(`/finansal-alacak-yonetimi/${siteId}`)}
                className="mr-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Finansal Alacak Yönetimine Dön"
              >
                <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              </button>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-3">
                  <Building className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
                    Daire Borç Detayları
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                    {borcBilgi?.aciklama}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={darkMode ? 'Açık tema' : 'Karanlık tema'}
              >
                {darkMode ? (
                  <Sun className="h-5 w-5 text-yellow-500" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                )}
              </button>

              <div className="hidden md:flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.kullaniciAdi} {user?.kullaniciSoyadi}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Yönetici</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-800 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span className="hidden sm:inline">Çıkış</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Borç Bilgisi Header */}
          {borcBilgi && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {borcBilgi.aciklama}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Son Ödeme: {new Date(borcBilgi.sonOdemeTarihi).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Daire Başı Tutar</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {borcBilgi.tutar.toLocaleString('tr-TR')}₺
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* İstatistikler */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Home className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Daire</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{ozet.toplamDaire}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Check className="h-6 w-6 text-green-600 dark:text-green-300" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ödenen</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{ozet.odenenDaire}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-300" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Bekleyen</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{ozet.bekleyenDaire}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                  <DollarSign className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Tutar</p>
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {ozet.toplamTutar.toLocaleString('tr-TR')}₺
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Daire Borç Listesi - Desktop Table */}
          <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Daire Borç Listesi ({daireBorclar.length})
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Toplam: {ozet.toplamTutar.toLocaleString('tr-TR')}₺ | 
                Ödenen: {ozet.odenenTutar.toLocaleString('tr-TR')}₺ | 
                Bekleyen: {ozet.bekleyenTutar.toLocaleString('tr-TR')}₺
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Blok
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Kat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Daire No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Açıklama
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Tutar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Son Ödeme Tarihi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Ödeme Tarihi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {daireBorclar.map((borc) => (
                    <tr key={borc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {borc.daireBlok || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {borc.daireKat !== undefined ? `${borc.daireKat}. Kat` : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-3">
                            <Home className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            Daire {borc.daireNo}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {borc.borcAciklamasi}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                          {borc.tutar.toLocaleString('tr-TR')}₺
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {new Date(borc.sonOdemeTarihi).toLocaleDateString('tr-TR')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {borc.odemeTarihi ? new Date(borc.odemeTarihi).toLocaleDateString('tr-TR') : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getOdemeDurumuBadge(borc.odendiMi, borc.sonOdemeTarihi, borc.id)}`}>
                          {getOdemeDurumuText(borc.odendiMi, borc.sonOdemeTarihi, borc.id)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            title="Detayları Görüntüle"
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          
                          {/* Onay Bekliyor durumunda onaylama butonu göster */}
                          {(() => {
                            const durumResponse = odemeDurumlari[borc.id];
                            // Message'da "onay bekliyor" varsa veya eski sistemde false ise buton göster
                            const onayBekliyor = (durumResponse?.message && durumResponse.message.toLowerCase().includes('onay bekliyor')) ||
                                               (durumResponse === false) ||
                                               (durumResponse?.onaylandiMi === false && durumResponse?.message !== null);
                            
                            return onayBekliyor && (
                              <button 
                                title="Ödeme İsteğini Onayla"
                                onClick={() => onaylaOdemeIstegi(borc.id)}
                                disabled={islemYapiliyor && selectedBorc === borc.id}
                                className="px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center"
                              >
                                {islemYapiliyor && selectedBorc === borc.id ? (
                                  <>
                                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-1"></div>
                                    Onaylanıyor...
                                  </>
                                ) : (
                                  'Onayla'
                                )}
                              </button>
                            );
                          })()}
                          
                          {/* Geleneksel ödendi olarak işaretleme (sadece ödenmediyse ve ödeme isteği yoksa) */}
                          {(() => {
                            const durumResponse = odemeDurumlari[borc.id];
                            // Ödeme isteği hiç yoksa (message null veya response null)
                            const istekYok = !durumResponse || 
                                           durumResponse === null || 
                                           (durumResponse?.message === null);
                            
                            return !borc.odendiMi && istekYok && (
                              <button 
                                title="Ödendi Olarak İşaretle"
                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
                              >
                                İşaretle
                              </button>
                            );
                          })()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {daireBorclar.length === 0 && (
                <div className="text-center py-8">
                  <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Bu borç için daire kaydı bulunmuyor.</p>
                </div>
              )}
            </div>
          </div>

          {/* Daire Borç Listesi - Mobile Cards */}
          <div className="lg:hidden space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Daire Borç Listesi ({daireBorclar.length})
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Toplam: {ozet.toplamTutar.toLocaleString('tr-TR')}₺ | 
                Ödenen: {ozet.odenenTutar.toLocaleString('tr-TR')}₺ | 
                Bekleyen: {ozet.bekleyenTutar.toLocaleString('tr-TR')}₺
              </p>
            </div>
            
            {daireBorclar.map((borc) => (
              <div key={borc.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                {/* Header - Daire Bilgileri */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                      <Home className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Daire {borc.daireNo}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {borc.daireBlok ? `${borc.daireBlok} Blok` : ''} 
                        {borc.daireKat !== undefined ? ` • ${borc.daireKat}. Kat` : ''}
                      </p>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getOdemeDurumuBadge(borc.odendiMi, borc.sonOdemeTarihi, borc.id)}`}>
                    {getOdemeDurumuText(borc.odendiMi, borc.sonOdemeTarihi, borc.id)}
                  </span>
                </div>

                {/* Açıklama */}
                <div className="mb-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Açıklama:</p>
                  <p className="text-sm text-gray-900 dark:text-white">{borc.borcAciklamasi}</p>
                </div>

                {/* Tutar ve Tarih Bilgileri */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Tutar</p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {borc.tutar.toLocaleString('tr-TR')}₺
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Son Ödeme</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(borc.sonOdemeTarihi).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>

                {/* Ödeme Tarihi */}
                {borc.odemeTarihi && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 mb-4">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Ödeme Tarihi</p>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">
                      {new Date(borc.odemeTarihi).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-2">
                  <button 
                    title="Detayları Görüntüle"
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-2"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  
                  {/* Onay Bekliyor durumunda onaylama butonu göster */}
                  {(() => {
                    const durumResponse = odemeDurumlari[borc.id];
                    // Message'da "onay bekliyor" varsa veya eski sistemde false ise buton göster
                    const onayBekliyor = (durumResponse?.message && durumResponse.message.toLowerCase().includes('onay bekliyor')) ||
                                       (durumResponse === false) ||
                                       (durumResponse?.onaylandiMi === false && durumResponse?.message !== null);
                    
                    return onayBekliyor && (
                      <button 
                        title="Ödeme İsteğini Onayla"
                        onClick={() => onaylaOdemeIstegi(borc.id)}
                        disabled={islemYapiliyor && selectedBorc === borc.id}
                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center"
                      >
                        {islemYapiliyor && selectedBorc === borc.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                            Onaylanıyor...
                          </>
                        ) : (
                          'Onayla'
                        )}
                      </button>
                    );
                  })()}
                  
                  {/* Geleneksel ödendi olarak işaretleme (sadece ödenmediyse ve ödeme isteği yoksa) */}
                  {(() => {
                    const durumResponse = odemeDurumlari[borc.id];
                    // Ödeme isteği hiç yoksa (message null veya response null)
                    const istekYok = !durumResponse || 
                                   durumResponse === null || 
                                   (durumResponse?.message === null);
                    
                    return !borc.odendiMi && istekYok && (
                      <button 
                        title="Ödendi Olarak İşaretle"
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        İşaretle
                      </button>
                    );
                  })()}
                </div>
              </div>
            ))}
            
            {daireBorclar.length === 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Bu borç için daire kaydı bulunmuyor.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DaireBorcDetay;