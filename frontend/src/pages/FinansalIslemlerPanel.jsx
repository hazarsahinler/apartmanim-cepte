import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, TrendingUp, TrendingDown, CreditCard, DollarSign,
  PlusCircle, Eye, Building, Calendar, CheckCircle, AlertCircle, Menu
} from 'lucide-react';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/MainNavbar';
import { authService } from '../services/authService';
import { useTheme } from '../contexts/ThemeContext';

const FinansalIslemlerPanel = () => {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [siteData, setSiteData] = useState(null);
  const [finansalOzet, setFinansalOzet] = useState({
    toplamGelir: 0,
    toplamGider: 0,
    netKazanc: 0,
    bekleyenAlacak: 0,
    giderKayitSayisi: 0
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sayfa yüklendiğinde verileri çek
  useEffect(() => {
    const fetchSiteAndFinancialData = async () => {
      try {
        setLoading(true);
        
        if (!authService.isAuthenticated()) {
          navigate('/giris');
          return;
        }

        const userInfo = await authService.getUserInfo();
        console.log('Kullanıcı bilgileri:', userInfo);
        
        // Site bilgilerini API'den çek
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`http://localhost:8080/api/structure/site/${userInfo.id}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const siteData = await response.json();
            console.log('API\'den gelen site verisi:', siteData);
            console.log('Aranan siteId:', siteId, 'Tipi:', typeof siteId);
            
            const foundSite = siteData.find(site => {
              console.log('Site kontrolü - site.id:', site.id, 'site.siteId:', site.siteId, 'parseInt(siteId):', parseInt(siteId));
              return site.id === parseInt(siteId) || site.siteId === parseInt(siteId);
            });
            
            if (foundSite) {
              setSiteData(foundSite);
              console.log('Site verisi bulundu:', foundSite);
              
              // Finansal özet verilerini çek
              await fetchFinancialSummary(foundSite.id || foundSite.siteId, foundSite);
            } else {
              console.error('Site bulunamadı! siteData:', siteData, 'Aranan siteId:', siteId);
              toast.error('Site bulunamadı.');
              navigate('/finansal-islemler');
            }
          } else {
            throw new Error('Site verileri alınamadı');
          }
        } catch (error) {
          console.error('Site verileri yüklenirken hata:', error);
          toast.error('Site bilgileri yüklenirken bir hata oluştu.');
        }
        
        // Finansal özet verilerini API'den çek
        if (siteId) {
          await fetchFinancialSummary(siteId);
        }
        
      } catch (err) {
        console.error('Sayfa yüklenirken hata:', err);
        toast.error('Sayfa yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

  // Finansal özet verilerini API'den çek
  const fetchFinancialSummary = async (currentSiteId, currentSiteData) => {
    try {
      const token = localStorage.getItem('token');
      
      // Paralel olarak hem gelir hem gider API'lerini çağır
      const [alacakResponse, giderResponse] = await Promise.all([
        fetch(`http://localhost:8080/api/finance/eklenen/borclar?siteId=${currentSiteId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`http://localhost:8080/api/finance/total/gider/${currentSiteId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      let toplamGelir = 0;
      let bekleyenAlacak = 0;
      let toplamGider = 0;
      let giderKayitSayisi = 0;

      // Gelir verilerini işle
      if (alacakResponse.ok) {
        const alacakData = await alacakResponse.json();
        
        // Muhtemel field isimleri kontrol et
        let toplamDaireSayisi = currentSiteData?.daireCount || 
                               currentSiteData?.daireAdedi || 
                               currentSiteData?.toplamDaireSayisi || 
                               currentSiteData?.daireSayisi ||
                               currentSiteData?.totalApartments ||
                               currentSiteData?.apartmentCount ||
                               0;
                               
        console.log('Site bilgileri:', currentSiteData);
        console.log('Toplam daire sayısı bulunan:', toplamDaireSayisi);
        
        // Eğer hala 0 ise, varsayılan bir değer ata
        if (toplamDaireSayisi === 0) {
          console.warn('Daire sayısı bulunamadı, varsayılan değer (20) kullanılıyor');
          toplamDaireSayisi = 20;
        }
        
        // Toplam gelir hesapla (gelen gelir - ödenen kısım)
        toplamGelir = alacakData.reduce((toplam, borc) => {
          const tutar = parseFloat(borc.tutar);
          const odeyenDaireSay = borc.odemeYapanDaireSay || 0;
          const odenmeyen = borc.odemeYapmayanDaireSay || 0;
          const toplamDaireSayisiBorc = odeyenDaireSay + odenmeyen;
          
          if (borc.borcTuru === 'AIDAT') {
            // Aylık Aidat: Tutar × ödenen daire sayısı
            return toplam + (tutar * odeyenDaireSay);
          } else if (borc.borcTuru === 'OZEL_MASRAF') {
            // Özel Masraf: (Toplam tutar / toplam daire) × ödeme yapan daire sayısı
            if (toplamDaireSayisiBorc > 0) {
              const daireBasi = tutar / toplamDaireSayisiBorc;
              return toplam + (daireBasi * odeyenDaireSay);
            } else {
              console.error('Toplam daire sayısı 0, OZEL_MASRAF hesaplanamadı');
              return toplam;
            }
          } else {
            return toplam + (tutar * odeyenDaireSay);
          }
        }, 0);
        
        // Bekleyen alacak hesapla (backend'den gelen ödenmeyen daire sayısı kullan)
        bekleyenAlacak = alacakData.reduce((toplam, borc) => {
          const tutar = parseFloat(borc.tutar);
          const odeyenDaireSay = borc.odemeYapanDaireSay || 0;
          const odenmeyen = borc.odemeYapmayanDaireSay || 0;
          const toplamDaireSayisiBorc = odeyenDaireSay + odenmeyen;
          
          if (borc.borcTuru === 'AIDAT') {
            // Aylık Aidat: Tutar × ödenmeyen daire sayısı
            return toplam + (tutar * odenmeyen);
          } else if (borc.borcTuru === 'OZEL_MASRAF') {
            // Özel Masraf: (Toplam tutar / toplam daire) × ödenmeyen daire sayısı
            if (toplamDaireSayisiBorc > 0) {
              const daireBasi = tutar / toplamDaireSayisiBorc;
              return toplam + (daireBasi * odenmeyen);
            } else {
              console.error('Toplam daire sayısı 0, OZEL_MASRAF hesaplanamadı');
              return toplam;
            }
          } else {
            return toplam + (tutar * odenmeyen);
          }
        }, 0);
        
        console.log('Gelir verisi başarıyla yüklendi:', { toplamGelir, bekleyenAlacak });
      } else {
        console.error('Gelir verileri alınamadı');
      }

      // Gider verilerini işle
      if (giderResponse.ok) {
        const giderData = await giderResponse.json();
        console.log('Gider API yanıtı:', giderData);
        
        // API'den gelen toplam gider tutarını al
        toplamGider = giderData.tutar || giderData.totalAmount || 0;
        giderKayitSayisi = giderData.kayitSayisi || giderData.totalCount || 0;
        
        console.log('Gider verisi başarıyla yüklendi:', { toplamGider, giderKayitSayisi });
      } else {
        console.error('Gider verileri alınamadı');
      }

      // Net kazanç hesapla (Gelir - Gider)
      const netKazanc = toplamGelir - toplamGider;

      setFinansalOzet({
        toplamGelir: toplamGelir,
        toplamGider: toplamGider,
        netKazanc: netKazanc,
        bekleyenAlacak: bekleyenAlacak,
        giderKayitSayisi: giderKayitSayisi
      });
      
      console.log('Finansal özet güncellendi:', {
        toplamGelir,
        toplamGider,
        netKazanc,
        bekleyenAlacak,
        giderKayitSayisi
      });
      
    } catch (error) {
      console.error('Finansal özet yüklenirken hata:', error);
      setFinansalOzet({
        toplamGelir: 0,
        toplamGider: 0,
        netKazanc: 0,
        bekleyenAlacak: 0,
        giderKayitSayisi: 0
      });
    }
  };

    fetchSiteAndFinancialData();
  }, [navigate, siteId]);

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
        <Navbar />
        
        <Sidebar isOpen={sidebarOpen} />
        
        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed top-20 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg"
        >
          <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        </button>
        
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
        
        <div className="pt-16 ml-0 lg:ml-64 transition-all duration-300">
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
      <Sidebar isOpen={sidebarOpen} />
      
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-20 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg"
      >
        <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
      </button>
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      
      {/* Main Content */}
      <div className="pt-16 ml-0 lg:ml-64 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/finansal-islemler')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Site Seçimine Dön"
              >
                <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {siteData?.siteIsmi || siteData?.adi || siteData?.name || 'Site'} Finansal İşlemleri
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Hoş Geldiniz - Finansal işlemlerinizi buradan yönetin
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Finansal Özet Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Toplam Gelir */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-300" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Gelir</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {finansalOzet.toplamGelir.toLocaleString('tr-TR')}₺
                  </p>
                </div>
              </div>
            </div>

            {/* Toplam Gider */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                  <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-300" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Gider</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {finansalOzet.toplamGider.toLocaleString('tr-TR')}₺
                  </p>
                </div>
              </div>
            </div>

            {/* Net Kazanç */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Net Kazanç</p>
                  <p className={`text-2xl font-bold ${finansalOzet.netKazanc >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                    {finansalOzet.netKazanc.toLocaleString('tr-TR')}₺
                  </p>
                </div>
              </div>
            </div>

            {/* Bekleyen Alacak */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-300" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Bekleyen Alacak</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {finansalOzet.bekleyenAlacak.toLocaleString('tr-TR')}₺
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Ana İşlemler */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Alacak Yönetimi */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Alacak Yönetimi
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Aidat ve diğer alacakları yönetin
                    </p>
                  </div>
                </div>
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    console.log('Alacak Yönetimi butonu tıklandı, siteId:', siteId);
                    console.log('Gidilecek route:', `/finansal-alacak-yonetimi/${siteId}`);
                    navigate(`/finansal-alacak-yonetimi/${siteId}`);
                  }}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Yeni Alacak</span>
                </button>
                <button
                  onClick={() => {
                    console.log('Alacakları Görüntüle butonu tıklandı, siteId:', siteId);
                    console.log('Gidilecek route:', `/finansal-alacak-yonetimi/${siteId}`);
                    navigate(`/finansal-alacak-yonetimi/${siteId}`);
                  }}
                  className="flex items-center justify-center px-4 py-3 border border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Gider Yönetimi */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <TrendingDown className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Gider Yönetimi
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Site giderlerini yönetin
                    </p>
                  </div>
                </div>
                <AlertCircle className="h-6 w-6 text-red-500" />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    console.log('Gider Yönetimi butonu tıklandı, siteId:', siteId);
                    console.log('Gidilecek route:', `/finansal-gider-yonetimi/${siteId}`);
                    navigate(`/finansal-gider-yonetimi/${siteId}`);
                  }}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Yeni Gider</span>
                </button>
                <button
                  onClick={() => {
                    console.log('Giderleri Görüntüle butonu tıklandı, siteId:', siteId);
                    console.log('Gidilecek route:', `/finansal-gider-yonetimi/${siteId}`);
                    navigate(`/finansal-gider-yonetimi/${siteId}`);
                  }}
                  className="flex items-center justify-center px-4 py-3 border border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Finansal İstatistikler */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Finansal İstatistikler
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {siteData?.blokAdedi || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Blok Sayısı</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {siteData?.daireAdedi || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Daire Sayısı</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {finansalOzet.giderKayitSayisi || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Toplam Gider Kaydı</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {finansalOzet.toplamGider > 0 
                    ? Math.round((finansalOzet.netKazanc / finansalOzet.toplamGelir) * 100)
                    : finansalOzet.toplamGelir > 0 ? 100 : 0
                  }%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Karlılık Oranı</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinansalIslemlerPanel;