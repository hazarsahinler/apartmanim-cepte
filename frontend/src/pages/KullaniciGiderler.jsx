import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, TrendingDown, Calendar, FileText, Building, 
  AlertCircle, Loader2, DollarSign, Eye, Download, X,
  Menu, Sun, Moon, Home, LogOut, User
} from 'lucide-react';
import { toast } from 'react-toastify';
import UserSidebar from '../components/UserSidebar';
import { authService } from '../services/authService';
import { giderService } from '../services/giderService';
import { userDaireService } from '../services/userDaireService';
import { useTheme } from '../contexts/ThemeContext';

const KullaniciGiderler = () => {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [giderler, setGiderler] = useState([]);
  const [totalGider, setTotalGider] = useState(null);
  const [siteInfo, setSiteInfo] = useState(null);
  const [filteredGiderler, setFilteredGiderler] = useState([]);
  const [giderTuruFilter, setGiderTuruFilter] = useState('HEPSI');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBelgeler, setSelectedBelgeler] = useState([]);
  const [showBelgeModal, setShowBelgeModal] = useState(false);
  const [previewUrls, setPreviewUrls] = useState({});

  // Belge preview URL'lerini oluştur
  const createPreviewUrl = async (belge) => {
    try {
      const response = await fetch(giderService.getBelgeUrl(belge.giderBelgeId), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        setPreviewUrls(prev => ({...prev, [belge.giderBelgeId]: url}));
        return url;
      }
    } catch (error) {
      console.error('Preview oluşturulamadı:', error);
    }
    return null;
  };

  // Gider türleri
  const GIDER_TURLERI = [
    { value: 'HEPSI', label: 'Tüm Giderler' },
    { value: 'ELEKTRIK', label: 'Elektrik' },
    { value: 'SU', label: 'Su' },
    { value: 'DOGALGAZ', label: 'Doğalgaz' },
    { value: 'TEMIZLIK', label: 'Temizlik' },
    { value: 'GUVENLIK', label: 'Güvenlik' },
    { value: 'ASANSOR', label: 'Asansör' },
    { value: 'TAMIRAT', label: 'Tamirat' },
    { value: 'DIGER', label: 'Diğer' }
  ];

  useEffect(() => {
    const loadGiderler = async () => {
      try {
        setLoading(true);

        if (!authService.isAuthenticated()) {
          navigate('/giris');
          return;
        }

        // Kullanıcının bu siteye erişim hakkı var mı kontrol et
        const userInfo = await authService.getUserInfo();
        setUser(userInfo);
        const telefonNo = userInfo.kullaniciTelefon || userInfo.telefonNumarasi || userInfo.telefon;
        
        try {
          const daireBilgileri = await userDaireService.getKullaniciDaireBilgileri(telefonNo);
          const kullaniciSitesi = daireBilgileri.find(daire => daire.siteId.toString() === siteId);
          
          if (!kullaniciSitesi) {
            toast.error('Bu siteye erişim yetkiniz bulunmamaktadır.');
            navigate('/kullanici-sayfasi');
            return;
          }
          
          setSiteInfo(kullaniciSitesi);
        } catch (error) {
          console.error('Site erişim kontrolü hatası:', error);
          toast.error('Site bilgileri kontrol edilemedi.');
          navigate('/kullanici-sayfasi');
          return;
        }

        // Giderleri yükle
        const [giderListesi, totalGiderData] = await Promise.all([
          giderService.getSiteGiderleri(siteId),
          giderService.getTotalSiteGider(siteId)
        ]);

        setGiderler(giderListesi);
        setTotalGider(totalGiderData);
        setFilteredGiderler(giderListesi);

        console.log('KullaniciGiderler - Giderler yüklendi:', giderListesi);
        console.log('KullaniciGiderler - Total gider:', totalGiderData);

      } catch (error) {
        console.error('Giderler yüklenirken hata:', error);
        toast.error('Giderler yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    loadGiderler();
  }, [siteId, navigate]);

  const handleLogout = () => {
    if (window.confirm('Çıkış yapmak istediğinize emin misiniz?')) {
      authService.logout();
    }
  };

  // Filtreleme fonksiyonu
  useEffect(() => {
    let filtered = giderler;

    // Gider türü filtresi
    if (giderTuruFilter !== 'HEPSI') {
      filtered = filtered.filter(gider => gider.giderTur === giderTuruFilter);
    }

    // Arama filtresi
    if (searchTerm) {
      filtered = filtered.filter(gider => 
        gider.giderAciklama?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredGiderler(filtered);
  }, [giderler, giderTuruFilter, searchTerm]);

  // Belge görüntüleme fonksiyonu
  const handleBelgeleriGoster = async (gider) => {
    setSelectedBelgeler(gider.belgeler || []);
    setShowBelgeModal(true);
    
    // Resim dosyaları için preview URL'lerini oluştur
    if (gider.belgeler) {
      for (const belge of gider.belgeler) {
        if (belge.dosyaTuru === 'IMAGE') {
          await createPreviewUrl(belge);
        }
      }
    }
  };

  const handleBelgeIndir = async (belge) => {
    try {
      await giderService.downloadBelge(belge.giderBelgeId);
    } catch (error) {
      toast.error('Belge açılırken hata oluştu: ' + error.message);
    }
  };

  const handleBelgeGoruntule = async (belge) => {
    try {
      // Admin panelindeki gibi direkt fetch ile belgeyi getir
      const response = await fetch(giderService.getBelgeUrl(belge.giderBelgeId), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Belge bulunamadı');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      // Memory temizliği
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      
    } catch (error) {
      console.error('Belge görüntüleme hatası:', error);
      toast.error('Belge görüntülenirken hata oluştu: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {/* Loading Header */}
        <nav className="bg-white dark:bg-gray-800 shadow-md fixed w-full top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-3">
                  <TrendingDown className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">Apartman Giderleri</span>
              </div>
            </div>
          </div>
        </nav>
        
        <div className="pt-16 flex justify-center items-center h-screen">
          <div className="text-center">
            <Loader2 className="h-16 w-16 text-orange-500 animate-spin mx-auto" />
            <p className="mt-4 text-gray-600 dark:text-gray-300 text-lg">Giderler yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Top Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-md fixed w-full top-0 z-50">
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
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-3">
                  <TrendingDown className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
                    Apartman Giderleri
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                    {siteInfo?.siteIsmi || 'Site'} - Gider kayıtları
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
                  <p className="text-xs text-gray-500 dark:text-gray-400">Sakin</p>
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
      
      {/* Sidebar */}
      <UserSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content */}
      <div className="pt-16 lg:pl-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/kullanici-sayfasi')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Ana Sayfaya Dön"
              >
                <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Apartman Giderleri
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    {siteInfo?.siteIsmi || 'Site'} - Tüm gider kayıtlarını görüntüleyin
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Özet Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <TrendingDown className="h-6 w-6 text-orange-600 dark:text-orange-300" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Gider</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    ₺{totalGider?.tutar ? parseFloat(totalGider.tutar).toLocaleString() : '0'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Kayıt</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {filteredGiderler.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Building className="h-6 w-6 text-green-600 dark:text-green-300" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ortalama</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ₺{giderler.length > 0 ? 
                      Math.round(parseFloat(totalGider?.tutar || 0) / giderler.length).toLocaleString() 
                      : '0'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filtreler */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Gider Türü
                </label>
                <select
                  value={giderTuruFilter}
                  onChange={(e) => setGiderTuruFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                >
                  {GIDER_TURLERI.map(tur => (
                    <option key={tur.value} value={tur.value}>
                      {tur.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ara
                </label>
                <input
                  type="text"
                  placeholder="Gider açıklamasında ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Gider Listesi */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
            {filteredGiderler.length > 0 ? (
              <div className="overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Gider Kayıtları ({filteredGiderler.length})
                  </h3>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredGiderler.map((gider, index) => (
                    <div key={gider.giderId || index} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                              {gider.giderAciklama || 'Gider açıklaması'}
                            </h4>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300">
                              {gider.giderTur === 'ELEKTRIK' ? 'Elektrik' :
                               gider.giderTur === 'SU' ? 'Su' :
                               gider.giderTur === 'DOGALGAZ' ? 'Doğalgaz' :
                               gider.giderTur === 'TEMIZLIK' ? 'Temizlik' :
                               gider.giderTur === 'GUVENLIK' ? 'Güvenlik' :
                               gider.giderTur === 'ASANSOR' ? 'Asansör' :
                               gider.giderTur === 'TAMIRAT' ? 'Tamirat' :
                               gider.giderTur === 'DIGER' ? 'Diğer' :
                               'Belirtilmemiş'}
                            </span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span className="mr-4">
                              {new Date(gider.giderOlusturulmaTarihi).toLocaleDateString('tr-TR')}
                            </span>
                            
                            {gider.belgeler && gider.belgeler.length > 0 && (
                              <>
                                <FileText className="w-4 h-4 mr-1" />
                                <span>{gider.belgeler.length} belge</span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right ml-6">
                          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                            ₺{parseFloat(gider.giderTutari || 0).toLocaleString()}
                          </p>
                          
                          {gider.belgeler && gider.belgeler.length > 0 && (
                            <button
                              onClick={() => handleBelgeleriGoster(gider)}
                              className="mt-2 inline-flex items-center px-3 py-1 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                              title="Belgeleri görüntüle"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Belgeleri Gör
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <TrendingDown className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                  {searchTerm || giderTuruFilter !== 'HEPSI' ? 'Filtre kriterlerine uygun gider bulunamadı' : 'Henüz gider kaydı yok'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {searchTerm || giderTuruFilter !== 'HEPSI' 
                    ? 'Farklı filtre kriterleri deneyin' 
                    : 'Site giderleri yönetici tarafından eklendiğinde burada görünecek'
                  }
                </p>
                {(searchTerm || giderTuruFilter !== 'HEPSI') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setGiderTuruFilter('HEPSI');
                    }}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Filtreleri Temizle
                  </button>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
      
      {/* Belge Görüntüleme Modal'ı */}
      {showBelgeModal && selectedBelgeler && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Gider Belgeleri
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {selectedBelgeler.length} belge bulundu
                </p>
              </div>
              <button
                onClick={() => {
                  setShowBelgeModal(false);
                  // Preview URL'lerini temizle
                  Object.values(previewUrls).forEach(url => {
                    window.URL.revokeObjectURL(url);
                  });
                  setPreviewUrls({});
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 gap-4">
                {selectedBelgeler.map((belge, index) => (
                  <div key={belge.giderBelgeId || index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg mr-3">
                          {belge.dosyaTuru === 'PDF' ? (
                            <FileText className="h-6 w-6 text-red-600" />
                          ) : (
                            <FileText className="h-6 w-6 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                            {belge.dosyaAdi || `Belge ${index + 1}`}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {belge.dosyaTuru} • {(belge.dosyaBoyutu / 1024).toFixed(1)} KB
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(belge.yuklemeTarihi).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleBelgeGoruntule(belge)}
                          className="inline-flex items-center px-3 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors flex-1"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Görüntüle
                        </button>
                        <button
                          onClick={() => handleBelgeIndir(belge)}
                          className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          İndir
                        </button>
                      </div>
                    </div>
                    
                    {/* Resim preview */}
                    {belge.dosyaTuru === 'IMAGE' && previewUrls[belge.giderBelgeId] && (
                      <div className="mt-3">
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                          <img 
                            src={previewUrls[belge.giderBelgeId]}
                            alt={belge.dosyaAdi || 'Belge'}
                            className="w-full max-h-48 object-contain rounded cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => handleBelgeGoruntule(belge)}
                            title="Büyük boyutta açmak için tıklayın"
                          />
                        </div>
                      </div>
                    )}
                    
                    {belge.dosyaTuru === 'PDF' && (
                      <div className="mt-3">
                        <button
                          onClick={() => handleBelgeGoruntule(belge)}
                          className="w-full text-left group"
                        >
                          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
                            <div className="flex items-center justify-center">
                              <div className="text-center">
                                <div className="text-3xl mb-2">📄</div>
                                <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                                  PDF belgesini görüntüle
                                </p>
                                <p className="text-xs text-red-500 dark:text-red-500 mt-1">
                                  Tıklayarak yeni sekmede aç
                                </p>
                              </div>
                            </div>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {selectedBelgeler.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">Bu gider için henüz belge eklenmemiş</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setShowBelgeModal(false);
                  // Preview URL'lerini temizle
                  Object.values(previewUrls).forEach(url => {
                    window.URL.revokeObjectURL(url);
                  });
                  setPreviewUrls({});
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KullaniciGiderler;