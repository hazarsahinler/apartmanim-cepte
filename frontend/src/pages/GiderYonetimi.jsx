import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, TrendingDown, Plus, Save, Receipt,
  LogOut, Moon, Sun, Eye, Edit, Trash2
} from 'lucide-react';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';
import { useTheme } from '../contexts/ThemeContext';

const GiderYonetimi = () => {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [siteData, setSiteData] = useState(null);
  const [giderler, setGiderler] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form state
  const [giderForm, setGiderForm] = useState({
    tur: '',
    tutar: '',
    aciklama: ''
  });

  // Enum değerleri
  const giderTurleri = [
    { value: 'ELEKTRIK', label: 'Elektrik Faturası' },
    { value: 'SU', label: 'Su Faturası' },
    { value: 'DOGALGAZ', label: 'Doğalgaz Faturası' },
    { value: 'TEMIZLIK', label: 'Temizlik Hizmeti' },
    { value: 'GUVENLIK', label: 'Güvenlik Hizmeti' },
    { value: 'ASANSOR', label: 'Asansör Bakım' },
    { value: 'BAHCE', label: 'Bahçe Bakımı' },
    { value: 'BAKIM_ONARIM', label: 'Bakım Onarım' },
    { value: 'YONETICI_UCRETI', label: 'Yönetici Ücreti' },
    { value: 'SIGORTA', label: 'Sigorta Primi' },
    { value: 'VERGI_HARCI', label: 'Vergi ve Harçlar' },
    { value: 'DIGER', label: 'Diğer Giderler' }
  ];

  const handleLogout = () => {
    if (window.confirm('Çıkış yapmak istediğinize emin misiniz?')) {
      authService.logout();
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
        
        // Örnek gider verileri (API'den gelecek)
        setGiderler([
          {
            id: 1,
            tur: 'ELEKTRIK',
            tutar: 3250,
            aciklama: 'Kasım 2025 Elektrik Faturası - Ana Dağıtım',
            olusturmaTarihi: '2025-11-01'
          },
          {
            id: 2,
            tur: 'TEMIZLIK',
            tutar: 850,
            aciklama: 'Haftalık Temizlik Hizmeti',
            olusturmaTarihi: '2025-10-28'
          },
          {
            id: 3,
            tur: 'ASANSOR',
            tutar: 1200,
            aciklama: 'Asansör Aylık Bakım ve Kontrol',
            olusturmaTarihi: '2025-10-25'
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
    
    if (!giderForm.tur || !giderForm.tutar || !giderForm.aciklama) {
      toast.error('Lütfen tüm alanları doldurun.');
      return;
    }

    try {
      const yeniGider = {
        id: Date.now(),
        ...giderForm,
        tutar: parseFloat(giderForm.tutar),
        olusturmaTarihi: new Date().toISOString().split('T')[0]
      };
      
      setGiderler(prev => [yeniGider, ...prev]);
      toast.success('Gider başarıyla eklendi!');
      setGiderForm({
        tur: '',
        tutar: '',
        aciklama: ''
      });
      setShowAddForm(false);
      
    } catch (error) {
      console.error('Gider eklenirken hata:', error);
      toast.error('Gider eklenirken bir hata oluştu.');
    }
  };

  const getTurLabel = (tur) => {
    const turObj = giderTurleri.find(t => t.value === tur);
    return turObj ? turObj.label : tur;
  };

  const getTurColor = (tur) => {
    const colors = {
      'ELEKTRIK': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'SU': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'DOGALGAZ': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'TEMIZLIK': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'GUVENLIK': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'ASANSOR': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'BAHCE': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
      'BAKIM_ONARIM': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      'YONETICI_UCRETI': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
      'SIGORTA': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
      'VERGI_HARCI': 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
      'DIGER': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    };
    return colors[tur] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <nav className="bg-white dark:bg-gray-800 shadow-md fixed w-full top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center mr-3">
                  <TrendingDown className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">Gider Yönetimi</span>
              </div>
            </div>
          </div>
        </nav>
        
        <div className="pt-16 flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
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
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center mr-3">
                  <TrendingDown className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
                    Gider Yönetimi
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gider Yönetimi</h1>
              <p className="text-gray-600 dark:text-gray-400">Site giderlerini yönetin</p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Yeni Gider</span>
            </button>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Yeni Gider Ekle
              </h3>
              <form onSubmit={handleGiderEkle} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Gider Türü *
                  </label>
                  <select
                    value={giderForm.tur}
                    onChange={(e) => setGiderForm(prev => ({ ...prev, tur: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Gider türü seçiniz...</option>
                    {giderTurleri.map(tur => (
                      <option key={tur.value} value={tur.value}>{tur.label}</option>
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

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Gider Açıklaması *
                  </label>
                  <textarea
                    value={giderForm.aciklama}
                    onChange={(e) => setGiderForm(prev => ({ ...prev, aciklama: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows="3"
                    placeholder="Gider detaylarını açıklayın..."
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tür</th>
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
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTurColor(gider.tur)}`}>
                          {getTurLabel(gider.tur)}
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
                          {new Date(gider.olusturmaTarihi).toLocaleDateString('tr-TR')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
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
              
              {giderler.length === 0 && (
                <div className="text-center py-8">
                  <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
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

export default GiderYonetimi;