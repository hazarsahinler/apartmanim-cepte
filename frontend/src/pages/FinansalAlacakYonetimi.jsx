import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, TrendingUp, Plus, Save, Eye, CreditCard,
  Building, Calendar, CheckCircle, AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/MainNavbar';
import { authService } from '../services/authService';
import { useTheme } from '../contexts/ThemeContext';
import { ENDPOINTS } from '../constants/endpoints';
import axios from 'axios';

const FinansalAlacakYonetimi = () => {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [siteData, setSiteData] = useState(null);
  const [alacaklar, setAlacaklar] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form state
  const [alacakForm, setAlacakForm] = useState({
    tur: '',
    tutar: '',
    aciklama: '',
    sonTarih: ''
  });

  // Enum değerleri
  const alacakTurleri = [
    { value: 'AIDAT', label: 'Aylık Aidat' },
    { value: 'OZEL_MASRAF', label: 'Özel Masraf' }
  ];

  // API'den alacakları çek
  const fetchAlacaklar = async () => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('Token bulunamadı');
      }

      const response = await axios.get(
        `http://localhost:8080/api${ENDPOINTS.FINANCE.EKLENEN_BORCLAR}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          params: {
            siteId: parseInt(siteId)
          }
        }
      );

      console.log('Finansal alacaklar API yanıtı:', response.data);
      
      // Site bilgisini al (daire sayısı için gerekli)
      let toplamDaireSayisi = 0;
      try {
        const siteResponse = await axios.get(
          `http://localhost:8080/api/structure/site/${authService.getCurrentUser()?.id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        const currentSite = siteResponse.data.find(site => 
          site.id === parseInt(siteId) || site.siteId === parseInt(siteId)
        );
        
        console.log('Site bilgileri TAMAMI:', JSON.stringify(currentSite, null, 2));
        console.log('currentSite?.daireCount:', currentSite?.daireCount);
        console.log('currentSite?.daireAdedi:', currentSite?.daireAdedi);
        console.log('currentSite?.toplamDaireSayisi:', currentSite?.toplamDaireSayisi);
        console.log('currentSite?.daireSayisi:', currentSite?.daireSayisi);
        console.log('currentSite?.totalApartments:', currentSite?.totalApartments);
        console.log('currentSite?.apartmentCount:', currentSite?.apartmentCount);
        console.log('Tüm keys:', Object.keys(currentSite || {}));
        
        // Tüm muhtemel field isimlerini dene
        toplamDaireSayisi = currentSite?.daireCount || 
                           currentSite?.daireAdedi || 
                           currentSite?.toplamDaireSayisi || 
                           currentSite?.daireSayisi ||
                           currentSite?.totalApartments ||
                           currentSite?.apartmentCount ||
                           0;
                           
        console.log('Site bilgileri:', currentSite);
        console.log('Toplam daire sayısı bulunan:', toplamDaireSayisi);
        
        // Eğer hala 0 ise, varsayılan bir değer ata
        if (toplamDaireSayisi === 0) {
          console.warn('Daire sayısı bulunamadı, varsayılan değer (20) kullanılıyor');
          toplamDaireSayisi = 20;
        }
      } catch (siteError) {
        console.error('Site bilgisi alınamadı:', siteError);
        toplamDaireSayisi = 20; // Fallback değer
      }
      
      // Backend'den gelen veriyi dönüştür ve doğru hesapla
      const transformedAlacaklar = response.data.map((borc) => {
        const tutar = parseFloat(borc.tutar);
        const odeyenDaireSay = borc.odemeYapanDaireSay || 0;
        const odenmeyen = borc.odemeYapmayanDaireSay || 0;
        
        // Toplam daire sayısını backend'den gelen verilerden hesapla
        const toplamDaireSayisiBorc = odeyenDaireSay + odenmeyen;
        
        console.log(`Borç: ${borc.aciklama}, Tutar: ${tutar}, Ödeyen: ${odeyenDaireSay}, Ödemeyen: ${odenmeyen}, Toplam Daire: ${toplamDaireSayisiBorc}, Tür: ${borc.borcTuru}`);
        
        let alacakTutari, gelenGelir, bekleyenGelir;
        
        if (borc.borcTuru === 'AIDAT') {
          // Aylık Aidat: Tutar daire başı alacak tutarı
          alacakTutari = tutar; // Daire başı tutar
          gelenGelir = alacakTutari * odeyenDaireSay;
          bekleyenGelir = alacakTutari * odenmeyen;
        } else if (borc.borcTuru === 'OZEL_MASRAF') {
          // Özel Masraf: Toplam tutarı daire sayısına böl
          if (toplamDaireSayisiBorc > 0) {
            alacakTutari = tutar / toplamDaireSayisiBorc; // Daire başı tutar
            gelenGelir = alacakTutari * odeyenDaireSay;
            bekleyenGelir = alacakTutari * odenmeyen;
          } else {
            console.error('Toplam daire sayısı 0, OZEL_MASRAF hesaplanamadı');
            alacakTutari = 0;
            gelenGelir = 0;
            bekleyenGelir = 0;
          }
        } else {
          // Diğer türler için varsayılan
          alacakTutari = tutar;
          gelenGelir = tutar * odeyenDaireSay;
          bekleyenGelir = tutar * odenmeyen;
        }
        
        return {
          id: borc.id,
          tur: borc.borcTuru,
          tutar: tutar, // Orijinal tutar (API'den gelen)
          alacakTutari: Number(alacakTutari.toFixed(2)), // Daire başı alacak tutarı
          aciklama: borc.aciklama,
          sonTarih: borc.sonOdemeTarihi,
          olusturmaTarihi: borc.olusturulmaTarihi,
          odemeYapanDaireSay: odeyenDaireSay,
          toplamDaireSayisi: toplamDaireSayisiBorc, // Backend'den hesaplanan toplam
          gelenGelir: Number(gelenGelir.toFixed(2)), // Ödenen kısım
          bekleyenGelir: Number(bekleyenGelir.toFixed(2)), // Bekleyen kısım
          toplamGelir: Number((gelenGelir + bekleyenGelir).toFixed(2)), // Toplam
          siteId: borc.siteId,
          durum: 'bekliyor'
        };
      });

      return transformedAlacaklar;
    } catch (error) {
      console.error('Alacaklar yüklenirken hata:', error);
      throw error;
    }
  };

  // Sayfa yüklendiğinde verileri çek
  useEffect(() => {
    const initializePage = async () => {
      try {
        setLoading(true);
        
        if (!authService.isAuthenticated()) {
          navigate('/giris');
          return;
        }

        const userInfo = await authService.getUserInfo();
        console.log('Kullanıcı bilgileri:', userInfo); // Auth kontrolü için
        
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
        
        // API'den alacakları çek
        try {
          const alacaklarData = await fetchAlacaklar();
          setAlacaklar(alacaklarData);
        } catch (error) {
          console.error('API hatası:', error);
          toast.error('Alacaklar yüklenemedi.');
          setAlacaklar([]);
        }
        
      } catch (err) {
        console.error('Sayfa yüklenirken hata:', err);
        toast.error('Sayfa yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    initializePage();
  }, [navigate, siteId]);

  // Alacak ekleme
  const handleAlacakEkle = async (e) => {
    e.preventDefault();
    
    if (!alacakForm.tur || !alacakForm.tutar || !alacakForm.aciklama || !alacakForm.sonTarih) {
      toast.error('Lütfen tüm alanları doldurun.');
      return;
    }

    try {
      // API'ye gönderilecek veri yapısı (backend DTO'suna uygun)
      const yeniAlacakData = {
        tutar: parseFloat(alacakForm.tutar),
        borcTuru: alacakForm.tur, // BorcTuruEnum
        aciklama: alacakForm.aciklama,
        sonOdemeTarihi: alacakForm.sonTarih, // LocalDate
        siteId: parseInt(siteId) // Long
      };

      console.log('API\'ye gönderilecek veri:', yeniAlacakData);
      
      // Gerçek API çağrısı
      const token = authService.getToken();
      if (!token) {
        throw new Error('Token bulunamadı');
      }

      const response = await axios.post(
        'http://localhost:8080/api/finance/borc/ekle',
        yeniAlacakData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('API yanıtı:', response.data);
      
      // Başarılı ise alacakları yeniden yükle
      if (response.status === 200 || response.status === 201) {
        toast.success('Alacak başarıyla eklendi!');
        
        // Alacak listesini yenile
        try {
          const updatedAlacaklar = await fetchAlacaklar();
          setAlacaklar(updatedAlacaklar);
        } catch (refreshError) {
          console.error('Liste yenileme hatası:', refreshError);
        }
        
        // Formu temizle
        setAlacakForm({
          tur: '',
          tutar: '',
          aciklama: '',
          sonTarih: ''
        });
        setShowAddForm(false);
      }
      
    } catch (error) {
      console.error('Alacak eklenirken hata detayı:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      
      // Hata mesajını kullanıcıya göster
      if (error.response?.data?.message) {
        toast.error('Hata: ' + error.response.data.message);
      } else if (error.response?.data?.errors) {
        // Validation hatalarını göster
        const validationErrors = error.response.data.errors;
        Object.values(validationErrors).forEach(errorMsg => {
          toast.error(errorMsg);
        });
      } else if (error.response?.status === 400) {
        toast.error('Geçersiz veri. Lütfen formu kontrol edin.');
      } else if (error.response?.status === 401) {
        toast.error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
      } else if (error.response?.status === 403) {
        toast.error('Bu işlem için yetkiniz bulunmuyor.');
      } else {
        toast.error('Alacak eklenirken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
      }
    }
  };

  const getTurLabel = (tur) => {
    const turObj = alacakTurleri.find(t => t.value === tur);
    return turObj ? turObj.label : tur;
  };

  const getDurumBadge = (durum) => {
    switch (durum) {
      case 'bekliyor':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'odendi':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'gecikti':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Toplam geliri hesapla (yeni mantık)
  const gelenToplamGelir = alacaklar.reduce((sum, alacak) => sum + (alacak.gelenGelir || 0), 0);
  const bekleyenToplamGelir = alacaklar.reduce((sum, alacak) => sum + (alacak.bekleyenGelir || 0), 0);
  const toplamPotansiyelGelir = alacaklar.reduce((sum, alacak) => sum + (alacak.toplamGelir || 0), 0);
  const toplamOdeyen = alacaklar.reduce((sum, alacak) => sum + (alacak.odemeYapanDaireSay || 0), 0);
  const toplamBekleyen = alacaklar.reduce((sum, alacak) => sum + ((alacak.toplamDaireSayisi || 0) - (alacak.odemeYapanDaireSay || 0)), 0);

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
        <Navbar />
        <Sidebar />
        
        <div className="pt-16 ml-64">
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
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
      <div className="pt-16 ml-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(`/finansal-islemler/${siteId}`)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Finansal İşlemlere Dön"
              >
                <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Alacak Yönetimi</h1>
                  <p className="text-gray-600 dark:text-gray-400">{siteData?.siteIsmi}</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Yeni Alacak</span>
            </button>
          </div>

          {/* Gelir İstatistikleri */}
          {alacaklar.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                    <CreditCard className="h-6 w-6 text-green-600 dark:text-green-300" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Gelen Gelir</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {gelenToplamGelir.toLocaleString('tr-TR')}₺
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                    <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-300" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Bekleyen Gelir</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {bekleyenToplamGelir.toLocaleString('tr-TR')}₺
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add Form */}
          {showAddForm && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Yeni Alacak Ekle
              </h3>
              <form onSubmit={handleAlacakEkle} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Alacak Türü *
                  </label>
                  <select
                    value={alacakForm.tur}
                    onChange={(e) => setAlacakForm(prev => ({ ...prev, tur: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Alacak türü seçiniz...</option>
                    {alacakTurleri.map(tur => (
                      <option key={tur.value} value={tur.value}>{tur.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Alacak Tutarı (₺) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={alacakForm.tutar}
                    onChange={(e) => setAlacakForm(prev => ({ ...prev, tutar: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Son Ödeme Tarihi *
                  </label>
                  <input
                    type="date"
                    value={alacakForm.sonTarih}
                    onChange={(e) => setAlacakForm(prev => ({ ...prev, sonTarih: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Alacak Açıklaması *
                  </label>
                  <textarea
                    value={alacakForm.aciklama}
                    onChange={(e) => setAlacakForm(prev => ({ ...prev, aciklama: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows="3"
                    placeholder="Örneğin: Kasım 2025 aylık aidat ödemesi"
                    required
                  />
                </div>

                <div className="md:col-span-2 flex gap-4">
                  <button
                    type="submit"
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    <span>Alacak Ekle</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-colors"
                  >
                    İptal
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Alacak Listesi */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Alacak Listesi ({alacaklar.length})
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tür</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Açıklama</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Alacak Tutarı</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ödeme Durumu</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Toplam Gelir</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Son Tarih</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {alacaklar.map((alacak) => (
                    <tr key={alacak.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {getTurLabel(alacak.tur)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {alacak.aciklama}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                          {(alacak.alacakTutari || 0).toLocaleString('tr-TR')}₺
                        </span>
                        {alacak.tur === 'OZEL_MASRAF' && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            (Toplam: {alacak.tutar.toLocaleString('tr-TR')}₺)
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1">
                              <CreditCard className="h-4 w-4 text-green-600 dark:text-green-400" />
                              <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                                {alacak.odemeYapanDaireSay || 0}
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">/ {alacak.toplamDaireSayisi}</span>
                            </div>
                          </div>
                          <div className="text-xs">
                            <span className="text-green-600 dark:text-green-400">Gelen: {(alacak.gelenGelir || 0).toLocaleString('tr-TR')}₺</span>
                            <span className="text-red-600 dark:text-red-400 ml-2">Bekleyen: {(alacak.bekleyenGelir || 0).toLocaleString('tr-TR')}₺</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                            {(alacak.toplamGelir || 0).toLocaleString('tr-TR')}₺
                          </span>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Toplam Potansiyel
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {new Date(alacak.sonTarih).toLocaleDateString('tr-TR')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => navigate(`/daire-borc-detay/${siteId}/${alacak.id}`)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Daire Detaylarını Görüntüle"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {alacaklar.length === 0 && (
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Henüz alacak kaydı bulunmuyor.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinansalAlacakYonetimi;