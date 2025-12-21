import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, TrendingUp, Plus, Save, Calendar, Building, Search,
  LogOut, Menu, X, Moon, Sun, Eye, Edit, Trash2, CreditCard
} from 'lucide-react';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';
import { useTheme } from '../contexts/ThemeContext';
import { ENDPOINTS } from '../constants/endpoints';
import axios from 'axios';

const AlacakYonetimi = () => {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
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

  const handleLogout = () => {
    if (window.confirm('Çıkış yapmak istediğinize emin misiniz?')) {
      authService.logout();
    }
  };

  // API'den alacakları çek
  const fetchAlacaklar = async () => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('Token bulunamadı');
      }

      // TanimlanmisBorcFiltreDTO parametreleri ile API çağrısı
      const response = await axios.get(
        `http://localhost:8080/api${ENDPOINTS.FINANCE.EKLENEN_BORCLAR}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          params: {
            siteId: siteId // Site ID filtresi
          }
        }
      );

      console.log('Alacaklar API yanıtı:', response.data);
      
      // Backend'den gelen BorcTanimiResponseDTO formatını frontend formatına dönüştür
      const transformedAlacaklar = response.data.map((borc, index) => {
        console.log(`Alacak ${index + 1}:`, borc);
        console.log(`odemeYapanDaireSay değeri:`, borc.odemeYapanDaireSay);
        
        return {
          id: borc.id,
          tur: borc.borcTuru,
          tutar: parseFloat(borc.tutar),
          aciklama: borc.aciklama,
          sonTarih: borc.sonOdemeTarihi,
          olusturmaTarihi: borc.olusturulmaTarihi,
          odemeYapanDaireSay: borc.odemeYapanDaireSay,
          siteId: borc.siteId,
          durum: 'bekliyor' // Varsayılan durum
        };
      });

      console.log('Dönüştürülmüş alacaklar:', transformedAlacaklar);
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
        setUser(userInfo);
        
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
          toast.error('Alacaklar yüklenemedi. Demo veriler gösteriliyor.');
          
          // Demo veriler - API hatası durumunda
          setAlacaklar([
            {
              id: 1,
              tur: 'AIDAT',
              tutar: 1500,
              aciklama: 'Kasım 2025 Aylık Aidat',
              sonTarih: '2025-11-30',
              olusturmaTarihi: '2025-11-01',
              odemeYapanDaireSay: 15,
              siteId: parseInt(siteId),
              durum: 'bekliyor'
            },
            {
              id: 2,
              tur: 'OZEL_MASRAF',
              tutar: 250,
              aciklama: 'Asansör Tamiratı Payı',
              sonTarih: '2025-11-15',
              olusturmaTarihi: '2025-10-28',
              odemeYapanDaireSay: 8,
              siteId: parseInt(siteId),
              durum: 'bekliyor'
            }
          ]);
        }
        
      } catch (err) {
        console.error('Sayfa yüklenirken hata:', err);
        toast.error('Sayfa yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    initializePage();
  }, [navigate, siteId]); // fetchAlacaklar fonksiyonu stable olduğu için dependency'ye eklemeye gerek yok

  // Alacak ekleme
  const handleAlacakEkle = async (e) => {
    e.preventDefault();
    
    if (!alacakForm.tur || !alacakForm.tutar || !alacakForm.aciklama || !alacakForm.sonTarih) {
      toast.error('Lütfen tüm alanları doldurun.');
      return;
    }

    try {
      const yeniAlacak = {
        id: Date.now(),
        ...alacakForm,
        tutar: parseFloat(alacakForm.tutar),
        olusturmaTarihi: new Date().toISOString().split('T')[0],
        durum: 'bekliyor'
      };
      
      setAlacaklar(prev => [yeniAlacak, ...prev]);
      toast.success('Alacak başarıyla eklendi!');
      setAlacakForm({
        tur: '',
        tutar: '',
        aciklama: '',
        sonTarih: ''
      });
      setShowAddForm(false);
      
    } catch (error) {
      console.error('Alacak eklenirken hata:', error);
      toast.error('Alacak eklenirken bir hata oluştu.');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <nav className="bg-white dark:bg-gray-800 shadow-md fixed w-full top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">Alacak Yönetimi</span>
              </div>
            </div>
          </div>
        </nav>
        
        <div className="pt-16 flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
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
                onClick={() => navigate(`/site-panel/${siteId}`)}
                className="mr-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Site Paneline Dön"
              >
                <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              </button>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
                    Alacak Yönetimi
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                    {siteData?.siteIsmi}
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
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Alacak Yönetimi</h1>
              <p className="text-gray-600 dark:text-gray-400">Site alacaklarını yönetin</p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Yeni Alacak</span>
            </button>
          </div>

          {/* İstatistik Kartları */}
          {alacaklar.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {/* Toplam Alacak Sayısı */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Building className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Alacak</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{alacaklar.length}</p>
                  </div>
                </div>
              </div>

              {/* Toplam Tutar */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-300" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Tutar</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {alacaklar.reduce((sum, alacak) => sum + alacak.tutar, 0).toLocaleString('tr-TR')}₺
                    </p>
                  </div>
                </div>
              </div>

              {/* Toplam Ödeme Yapan Daire */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                    <CreditCard className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ödeme Yapan</p>
                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      {alacaklar.reduce((sum, alacak) => sum + (alacak.odemeYapanDaireSay || 0), 0)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ortalama Ödeme Oranı */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                    <Calendar className="h-6 w-6 text-yellow-600 dark:text-yellow-300" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ort. Ödeme</p>
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {alacaklar.length > 0 ? 
                        Math.round(alacaklar.reduce((sum, alacak) => sum + (alacak.odemeYapanDaireSay || 0), 0) / alacaklar.length) 
                        : 0} daire
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tutar</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Son Tarih</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ödeme Durumu</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Durum</th>
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
                        <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                          {alacak.tutar.toLocaleString('tr-TR')}₺
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {new Date(alacak.sonTarih).toLocaleDateString('tr-TR')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <CreditCard className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                              {alacak.odemeYapanDaireSay || 0}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">daire ödedi</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDurumBadge(alacak.durum)}`}>
                          {alacak.durum === 'bekliyor' ? 'Bekliyor' : 
                           alacak.durum === 'odendi' ? 'Ödendi' : 
                           alacak.durum === 'gecikti' ? 'Gecikti' : alacak.durum}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => navigate(`/daire-borc-detay/${siteId}/${alacak.id}`)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Daire Borç Detaylarını Görüntüle"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                            <Trash2 className="h-4 w-4" />
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

export default AlacakYonetimi;