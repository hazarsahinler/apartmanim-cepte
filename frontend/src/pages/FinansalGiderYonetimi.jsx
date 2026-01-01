import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, TrendingDown, Plus, Save, Eye, DollarSign,
  Building, Trash2, X, Download, FileText
} from 'lucide-react';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/MainNavbar';
import { authService } from '../services/authService';
import { giderService } from '../services/giderService';
import { useTheme } from '../contexts/ThemeContext';

const FinansalGiderYonetimi = () => {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [siteData, setSiteData] = useState(null);
  const [giderler, setGiderler] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [toplamGiderTutar, setToplamGiderTutar] = useState(0);
  const [showBelgeModal, setShowBelgeModal] = useState(false);
  const [selectedBelgeler, setSelectedBelgeler] = useState([]);
  const [previewUrls, setPreviewUrls] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
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
        console.log('=== AUTH DEBUG ===');
        console.log('Kullanıcı bilgileri:', userInfo);
        console.log('Token:', localStorage.getItem('token')?.substring(0, 30) + '...');
        console.log('User Role:', userInfo?.role);
        console.log('==================');
        
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
        
        // API'den gerçek gider verilerini çek
        try {
          const giderData = await giderService.getSiteGiderleri(siteId);
          setGiderler(giderData || []);
          console.log('Giderler yüklendi:', giderData);
        } catch (error) {
          console.error('Giderler yüklenirken hata:', error);
          toast.warning('Gider verileri yüklenemedi.');
          setGiderler([]);
        }

        // Toplam gider tutarını çek
        try {
          const totalData = await giderService.getTotalSiteGider(siteId);
          setToplamGiderTutar(totalData.tutar || 0);
          console.log('Toplam gider:', totalData);
        } catch (error) {
          console.error('Toplam gider yüklenirken hata:', error);
          setToplamGiderTutar(0);
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

  // Gider ekleme
  const handleGiderEkle = async (e) => {
    e.preventDefault();
    
    if (!giderForm.kategori || !giderForm.tutar || !giderForm.aciklama) {
      toast.error('Lütfen zorunlu alanları doldurun.');
      return;
    }
    
    // Dosya boyutu kontrolü
    const MAX_TOTAL_SIZE = 10 * 1024 * 1024; // 10MB
    const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > MAX_TOTAL_SIZE) {
      toast.error('Toplam dosya boyutu 10MB\'ı geçemez. Lütfen daha az veya daha küçük dosyalar seçin.');
      return;
    }

    try {
      // API'ye gider ekle
      const giderData = {
        giderTutari: parseFloat(giderForm.tutar),
        giderTur: giderForm.kategori,
        giderAciklama: giderForm.aciklama,
        giderTarihi: giderForm.tarih || new Date().toISOString().split('T')[0], // YYYY-MM-DD formatında
        siteId: parseInt(siteId)
      };

      console.log('Gider ekleniyor:', giderData);
      console.log('Dosyalar:', selectedFiles);
      console.log('Toplam dosya boyutu:', (totalSize / 1024 / 1024).toFixed(2), 'MB');

      const response = await giderService.giderEkle(giderData, selectedFiles);
      console.log('Gider eklendi:', response);
      
      toast.success('Gider başarıyla eklendi!');
      
      // Giderleri yeniden yükle
      const giderData2 = await giderService.getSiteGiderleri(siteId);
      setGiderler(giderData2 || []);
      
      // Toplam gideri güncelle
      const totalData = await giderService.getTotalSiteGider(siteId);
      setToplamGiderTutar(totalData.tutar || 0);
      
      // Formu temizle
      setGiderForm({
        kategori: '',
        tutar: '',
        aciklama: '',
        tarih: ''
      });
      setSelectedFiles([]);
      setShowAddForm(false);
      
    } catch (error) {
      console.error('Gider eklenirken hata:', error);
      toast.error(error.message || 'Gider eklenirken bir hata oluştu.');
    }
  };

  // Dosya seçimi
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const MAX_TOTAL_SIZE = 10 * 1024 * 1024; // 10MB toplam
    
    // Her dosyayı kontrol et
    const oversizedFiles = files.filter(file => file.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      toast.error(`Bazı dosyalar çok büyük. Maksimum dosya boyutu: 5MB. Lütfen daha küçük dosyalar seçin.`);
      return;
    }
    
    // Toplam boyutu kontrol et
    const currentTotalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);
    const newTotalSize = files.reduce((sum, file) => sum + file.size, 0);
    
    if (currentTotalSize + newTotalSize > MAX_TOTAL_SIZE) {
      toast.error('Toplam dosya boyutu 10MB\'ı geçemez.');
      return;
    }
    
    setSelectedFiles(prev => [...prev, ...files]);
    toast.success(`${files.length} dosya eklendi.`);
  };

  // Dosya kaldır
  const handleFileRemove = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Gider silme
  const handleGiderSil = (giderId) => {
    if (window.confirm('Bu gideri silmek istediğinize emin misiniz?')) {
      setGiderler(prev => prev.filter(g => g.id !== giderId));
      toast.success('Gider başarıyla silindi!');
    }
  };

  // Belge modal'ını aç
  const handleBelgeGoruntule = async (gider) => {
    try {
      // Giderin belgesi var mı kontrol et
      if (!gider.belgeler || gider.belgeler.length === 0) {
        toast.warning('Bu gider için henüz belge eklenmemiş.');
        return;
      }

      setSelectedBelgeler(gider.belgeler || []);
      setShowBelgeModal(true);
      
      // Resim dosyaları için preview URL'lerini oluştur
      for (const belge of gider.belgeler) {
        if (belge.dosyaTuru === 'IMAGE') {
          await createPreviewUrl(belge);
        }
      }
    } catch (error) {
      console.error('Belge görüntüleme hatası:', error);
      toast.error('Belge açılırken bir hata oluştu.');
    }
  };

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

  // Belgeyi yeni sekmede aç
  const handleBelgeAc = async (belge) => {
    try {
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

  // Belgeyi indir
  const handleBelgeIndir = async (belge) => {
    try {
      await giderService.downloadBelge(belge.giderBelgeId);
    } catch (error) {
      toast.error('Belge indirilirken hata oluştu: ' + error.message);
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
  const toplamGider = toplamGiderTutar; // API'den gelen toplam
  const buAyGider = giderler
    .filter(g => {
      if (!g.giderOlusturulmaTarihi) return false;
      const giderDate = new Date(g.giderOlusturulmaTarihi);
      return giderDate.getMonth() === new Date().getMonth();
    })
    .reduce((sum, gider) => sum + Number(gider.giderTutari || 0), 0);

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
        <Navbar toggleUserSidebar={() => setSidebarOpen(!sidebarOpen)} isUserSidebarOpen={sidebarOpen} />
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <div className="pt-16 lg:ml-64 transition-all duration-300">
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
      <Navbar toggleUserSidebar={() => setSidebarOpen(!sidebarOpen)} isUserSidebarOpen={sidebarOpen} />
      
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content */}
      <div className="pt-16 lg:ml-64 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={() => navigate(`/finansal-islemler/${siteId}`)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
                title="Finansal İşlemlere Dön"
              >
                <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 dark:text-gray-300" />
              </button>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingDown className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">Gider Yönetimi</h1>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{siteData?.siteIsmi}</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">Yeni Gider</span>
            </button>
          </div>

          {/* Gider İstatistikleri */}
          {giderler.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
                <div className="flex items-center">
                  <div className="p-2 sm:p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                    <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 dark:text-red-300" />
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Gider</p>
                    <p className="text-lg sm:text-2xl font-bold text-red-600 dark:text-red-400">
                      -{toplamGider.toLocaleString('tr-TR')}₺
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
                <div className="flex items-center">
                  <div className="p-2 sm:p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-300" />
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Bu Ay</p>
                    <p className="text-lg sm:text-2xl font-bold text-orange-600 dark:text-orange-400">
                      -{buAyGider.toLocaleString('tr-TR')}₺
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
                <div className="flex items-center">
                  <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Building className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Gider Sayısı</p>
                    <p className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
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
                    Gider Tarihi
                  </label>
                  <input
                    type="date"
                    value={giderForm.tarih}
                    onChange={(e) => setGiderForm(prev => ({ ...prev, tarih: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Boş bırakılırsa bugünün tarihi kullanılır</p>
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

                {/* Dosya Yükleme */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fatura/Belge Ekle (PNG, JPG, PDF)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/jpg,application/pdf"
                    onChange={handleFileSelect}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                  />
                  {selectedFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">
                            📎 {file.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleFileRemove(index)}
                            className="ml-2 text-red-600 hover:text-red-800 dark:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="md:col-span-2 flex flex-wrap gap-4">
                  <button
                    type="submit"
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    <span>Gider Ekle</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setSelectedFiles([]);
                    }}
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
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                Gider Listesi ({giderler.length})
              </h3>
            </div>
            
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
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
                    <tr key={gider.giderId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getKategoriColor(gider.giderTur)}`}>
                          {getKategoriLabel(gider.giderTur)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {gider.giderAciklama}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                          -{Number(gider.giderTutari || 0).toLocaleString('tr-TR')}₺
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {gider.giderOlusturulmaTarihi 
                            ? new Date(gider.giderOlusturulmaTarihi).toLocaleDateString('tr-TR', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit'
                              })
                            : '-'
                          }
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleBelgeGoruntule(gider)}
                            className={`${
                              gider.belgeler && gider.belgeler.length > 0
                                ? 'text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300'
                                : 'text-gray-400 cursor-not-allowed'
                            }`}
                            title={gider.belgeler && gider.belgeler.length > 0 
                              ? `${gider.belgeler.length} Belge Görüntüle` 
                              : 'Belge Yok'}
                            disabled={!gider.belgeler || gider.belgeler.length === 0}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleGiderSil(gider.giderId)}
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
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-gray-200 dark:divide-gray-700">
              {giderler.map((gider) => (
                <div key={gider.giderId} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0 mr-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getKategoriColor(gider.giderTur)}`}>
                          {getKategoriLabel(gider.giderTur)}
                        </span>
                        {gider.belgeler && gider.belgeler.length > 0 && (
                          <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full">
                            <FileText className="h-3 w-3 mr-1" />
                            {gider.belgeler.length}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        {gider.giderAciklama}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {gider.giderOlusturulmaTarihi 
                          ? new Date(gider.giderOlusturulmaTarihi).toLocaleDateString('tr-TR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : '-'
                        }
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="text-lg font-bold text-red-600 dark:text-red-400 mb-2">
                        -{Number(gider.giderTutari || 0).toLocaleString('tr-TR')}₺
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-3 border-t border-gray-200 dark:border-gray-600">
                    <button 
                      onClick={() => handleBelgeGoruntule(gider)}
                      disabled={!gider.belgeler || gider.belgeler.length === 0}
                      className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                        gider.belgeler && gider.belgeler.length > 0
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Eye className="h-4 w-4" />
                      <span>Belgeler</span>
                    </button>
                    <button 
                      onClick={() => handleGiderSil(gider.giderId)}
                      className="flex items-center justify-center px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {giderler.length === 0 && (
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Henüz gider kaydı bulunmuyor.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Belge Görüntüleme Modal'ı */}
      {showBelgeModal && selectedBelgeler && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  Gider Belgeleri
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
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
            
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 gap-4">
                {selectedBelgeler.map((belge, index) => (
                  <div key={belge.giderBelgeId || index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center flex-1 min-w-0 mr-2">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg mr-2 sm:mr-3 flex-shrink-0">
                          {belge.dosyaTuru === 'PDF' ? (
                            <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                          ) : (
                            <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
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
                      
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 flex-shrink-0">
                        <button
                          onClick={() => handleBelgeAc(belge)}
                          className="inline-flex items-center justify-center px-2 sm:px-3 py-2 bg-red-600 text-white text-xs sm:text-sm rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                          <span className="hidden sm:inline">İncele</span>
                        </button>
                        <button
                          onClick={() => handleBelgeIndir(belge)}
                          className="inline-flex items-center justify-center px-2 sm:px-3 py-2 bg-blue-600 text-white text-xs sm:text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Download className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                          <span className="hidden sm:inline">İndir</span>
                        </button>
                      </div>
                    </div>
                    
                    {/* Resim preview */}
                    {belge.dosyaTuru === 'IMAGE' && previewUrls[belge.giderBelgeId] && (
                      <div className="mt-3">
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 sm:p-3 border border-gray-200 dark:border-gray-600">
                          <img 
                            src={previewUrls[belge.giderBelgeId]}
                            alt={belge.dosyaAdi || 'Belge'}
                            className="w-full max-h-48 object-contain rounded cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => handleBelgeAc(belge)}
                            title="Büyük boyutta açmak için tıklayın"
                          />
                        </div>
                      </div>
                    )}
                    
                    {belge.dosyaTuru === 'PDF' && (
                      <div className="mt-3">
                        <button
                          onClick={() => handleBelgeAc(belge)}
                          className="w-full text-left group"
                        >
                          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 sm:p-4 border border-red-200 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
                            <div className="flex items-center justify-center">
                              <div className="text-center">
                                <div className="text-2xl sm:text-3xl mb-2">📄</div>
                                <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 font-medium">
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
            
            <div className="flex justify-end p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setShowBelgeModal(false);
                  // Preview URL'lerini temizle
                  Object.values(previewUrls).forEach(url => {
                    window.URL.revokeObjectURL(url);
                  });
                  setPreviewUrls({});
                }}
                className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
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

export default FinansalGiderYonetimi;