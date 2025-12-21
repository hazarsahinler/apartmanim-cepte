import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, TrendingDown, Plus, Save, Eye, DollarSign,
  Building, Trash2
} from 'lucide-react';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/MainNavbar';
import { authService } from '../services/authService';
import { useTheme } from '../contexts/ThemeContext';

const FinansalGiderYonetimi = () => {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [siteData, setSiteData] = useState(null);
  const [giderler, setGiderler] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form state
  const [giderForm, setGiderForm] = useState({
    kategori: '',
    tutar: '',
    aciklama: '',
    tarih: ''
  });

  // Gider kategorileri
  const giderKategorileri = [
    { value: 'ELEKTRIK', label: 'Elektrik', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'SU', label: 'Su', color: 'bg-blue-100 text-blue-800' },
    { value: 'DOGALGAZ', label: 'Doğalgaz', color: 'bg-orange-100 text-orange-800' },
    { value: 'TEMIZLIK', label: 'Temizlik', color: 'bg-green-100 text-green-800' },
    { value: 'GUVENLIK', label: 'Güvenlik', color: 'bg-red-100 text-red-800' },
    { value: 'ASANSOR', label: 'Asansör', color: 'bg-purple-100 text-purple-800' },
    { value: 'BAKIM', label: 'Bakım Onarım', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'YONETIM', label: 'Yönetim Gideri', color: 'bg-gray-100 text-gray-800' },
    { value: 'SIGORTA', label: 'Sigorta', color: 'bg-pink-100 text-pink-800' },
    { value: 'VERGI', label: 'Vergi Resim', color: 'bg-cyan-100 text-cyan-800' },
    { value: 'PEYZAJ', label: 'Peyzaj Bahçe', color: 'bg-emerald-100 text-emerald-800' },
    { value: 'DIGER', label: 'Diğer', color: 'bg-slate-100 text-slate-800' }
  ];

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
        
        // Demo gider verileri (API'den gelecek)
        setGiderler([
          {
            id: 1,
            kategori: 'ELEKTRIK',
            tutar: 2500,
            aciklama: 'Kasım 2025 Elektrik Faturası',
            tarih: '2025-11-05',
            olusturmaTarihi: '2025-11-05'
          },
          {
            id: 2,
            kategori: 'SU',
            tutar: 1200,
            aciklama: 'Kasım 2025 Su Faturası',
            tarih: '2025-11-03',
            olusturmaTarihi: '2025-11-03'
          }
        ]);
        
      } catch (err) {
        console.error('Sayfa yüklenirken hata:', err);
        toast.error('Sayfa yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    initializePage();
  }, [navigate, siteId]);

  // Gider ekleme
  const handleGiderEkle = async (e) => {
    e.preventDefault();
    
    if (!giderForm.kategori || !giderForm.tutar || !giderForm.aciklama || !giderForm.tarih) {
      toast.error('Lütfen tüm alanları doldurun.');
      return;
    }

    try {
      const yeniGider = {
        id: Date.now(),
        ...giderForm,
        tutar: parseFloat(giderForm.tutar),
        olusturmaTarihi: new Date().toISOString().split('T')[0],
        siteId: parseInt(siteId)
      };
      
      setGiderler(prev => [yeniGider, ...prev]);
      toast.success('Gider başarıyla eklendi!');
      setGiderForm({
        kategori: '',
        tutar: '',
        aciklama: '',
        tarih: ''
      });
      setShowAddForm(false);
      
    } catch (error) {
      console.error('Gider eklenirken hata:', error);
      toast.error('Gider eklenirken bir hata oluştu.');
    }
  };

  // Gider silme
  const handleGiderSil = (giderId) => {
    if (window.confirm('Bu gideri silmek istediğinize emin misiniz?')) {
      setGiderler(prev => prev.filter(g => g.id !== giderId));
      toast.success('Gider başarıyla silindi!');
    }
  };

  const getKategoriLabel = (kategori) => {
    const kategoriObj = giderKategorileri.find(k => k.value === kategori);
    return kategoriObj ? kategoriObj.label : kategori;
  };

  const getKategoriColor = (kategori) => {
    const kategoriObj = giderKategorileri.find(k => k.value === kategori);
    return kategoriObj ? kategoriObj.color : 'bg-gray-100 text-gray-800';
  };

  // Toplam gideri hesapla
  const toplamGider = giderler.reduce((sum, gider) => sum + gider.tutar, 0);
  const buAyGider = giderler
    .filter(g => new Date(g.tarih).getMonth() === new Date().getMonth())
    .reduce((sum, gider) => sum + gider.tutar, 0);

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
        <Navbar />
        <Sidebar />
        
        <div className="pt-16 ml-64">
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
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
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gider Yönetimi</h1>
                  <p className="text-gray-600 dark:text-gray-400">{siteData?.siteIsmi}</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Yeni Gider</span>
            </button>
          </div>

          {/* Gider İstatistikleri */}
          {giderler.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                    <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-300" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Gider</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      -{toplamGider.toLocaleString('tr-TR')}₺
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <DollarSign className="h-6 w-6 text-orange-600 dark:text-orange-300" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Bu Ay</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      -{buAyGider.toLocaleString('tr-TR')}₺
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Building className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Gider Sayısı</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {giderler.length}
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
                Yeni Gider Ekle
              </h3>
              <form onSubmit={handleGiderEkle} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Gider Kategorisi *
                  </label>
                  <select
                    value={giderForm.kategori}
                    onChange={(e) => setGiderForm(prev => ({ ...prev, kategori: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Kategori seçiniz...</option>
                    {giderKategorileri.map(kategori => (
                      <option key={kategori.value} value={kategori.value}>{kategori.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Gider Tutarı (₺) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={giderForm.tutar}
                    onChange={(e) => setGiderForm(prev => ({ ...prev, tutar: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Gider Tarihi *
                  </label>
                  <input
                    type="date"
                    value={giderForm.tarih}
                    onChange={(e) => setGiderForm(prev => ({ ...prev, tarih: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Gider Açıklaması *
                  </label>
                  <textarea
                    value={giderForm.aciklama}
                    onChange={(e) => setGiderForm(prev => ({ ...prev, aciklama: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows="3"
                    placeholder="Örneğin: Kasım 2025 elektrik faturası"
                    required
                  />
                </div>

                <div className="md:col-span-2 flex gap-4">
                  <button
                    type="submit"
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    <span>Gider Ekle</span>
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

          {/* Gider Listesi */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Gider Listesi ({giderler.length})
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Kategori</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Açıklama</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tutar</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tarih</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {giderler.map((gider) => (
                    <tr key={gider.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getKategoriColor(gider.kategori)}`}>
                          {getKategoriLabel(gider.kategori)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {gider.aciklama}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                          -{gider.tutar.toLocaleString('tr-TR')}₺
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {new Date(gider.tarih).toLocaleDateString('tr-TR')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Detayları Görüntüle"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleGiderSil(gider.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Gideri Sil"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {giderler.length === 0 && (
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Henüz gider kaydı bulunmuyor.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinansalGiderYonetimi;