import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, TrendingDown, Plus, Save, Eye, DollarSign,
  Building, Trash2, Upload, X, FileText, Image, Download,
  Calendar, Loader2, AlertCircle, CheckCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/MainNavbar';
import { authService } from '../services/authService';
import { useTheme } from '../contexts/ThemeContext';
import { giderService } from '../services/giderService';

const FinansalGiderYonetimi = () => {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetGiderId = searchParams.get('giderId');
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [siteData, setSiteData] = useState(null);
  const [giderler, setGiderler] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  
  // Form state
  const [giderForm, setGiderForm] = useState({
    giderTur: '',
    giderTutari: '',
    giderAciklama: '',
    siteId: siteId
  });
  
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [formErrors, setFormErrors] = useState({});

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
        console.log('Kullanıcı bilgileri:', userInfo);
        
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
        
        // Gider verilerini API'den çek
        const giderListesi = await giderService.getSiteGiderleri(siteId);
        setGiderler(giderListesi || []);
        
        // Belirli bir gidere odaklanma (URL'den gelen giderId)
        if (targetGiderId && giderListesi) {
          setTimeout(() => {
            const targetElement = document.getElementById(`gider-${targetGiderId}`);
            if (targetElement) {
              targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
              // Belirli gideri vurgula
              targetElement.classList.add('ring-2', 'ring-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20');
              setTimeout(() => {
                targetElement.classList.remove('ring-2', 'ring-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20');
              }, 3000);
            }
          }, 500);
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

  // File handling functions
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    
    // Validate files
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    
    const validFiles = files.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Desteklenmeyen dosya türü: ${file.type}`);
        return false;
      }
      
      if (file.size > maxSize) {
        toast.error(`Dosya boyutu çok büyük: ${file.name}`);
        return false;
      }
      
      return true;
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!giderForm.giderTur.trim()) {
      errors.giderTur = 'Gider türü seçimi zorunludur';
    }
    
    if (!giderForm.giderTutari || isNaN(giderForm.giderTutari) || parseFloat(giderForm.giderTutari) <= 0) {
      errors.giderTutari = 'Geçerli bir tutar giriniz';
    }
    
    if (!giderForm.giderAciklama.trim()) {
      errors.giderAciklama = 'Açıklama zorunludur';
    }
    
    return errors;
  };

  // Gider ekleme
  const handleGiderEkle = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});

    try {
      const giderData = {
        ...giderForm,
        giderTutari: parseFloat(giderForm.giderTutari),
        siteId: parseInt(siteId)
      };
      
      await giderService.giderEkle(giderData, selectedFiles);
      toast.success('Gider başarıyla eklendi!');
      
      // Reset form
      setGiderForm({
        giderTur: '',
        giderTutari: '',
        giderAciklama: '',
        siteId: siteId
      });
      setSelectedFiles([]);
      setShowAddForm(false);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Refresh data from API
      const giderListesi = await giderService.getSiteGiderleri(siteId);
      setGiderler(giderListesi || []);
      
    } catch (error) {
      console.error('Error creating expense:', error);
      toast.error('Gider ekleme başarısız. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gider silme
  const handleGiderSil = async (giderId) => {
    if (!window.confirm('Bu gideri silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      await giderService.giderSil(giderId);
      setGiderler(prev => prev.filter(g => g.id !== giderId));
      toast.success('Gider başarıyla silindi!');
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Gider silme işlemi başarısız.');
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

  const getFileIcon = (belgeTipi) => {
    if (belgeTipi === 'PDF') {
      return <FileText className="h-4 w-4" />;
    }
    return <Image className="h-4 w-4" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFormReset = () => {
    setGiderForm({
      giderTur: '',
      giderTutari: '',
      giderAciklama: '',
      siteId: siteId
    });
    setSelectedFiles([]);
    setShowAddForm(false);
    setFormErrors({});
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Toplam gideri hesapla
  const toplamGider = giderler.reduce((sum, gider) => sum + (gider.giderTutari || gider.tutar || 0), 0);
  const buAyGider = giderler
    .filter(g => new Date(g.giderOlusturulmaTarihi || g.giderTarihi || g.tarih).getMonth() === new Date().getMonth())
    .reduce((sum, gider) => sum + (gider.giderTutari || gider.tutar || 0), 0);

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
                {/* Form Error Messages */}
                {Object.keys(formErrors).length > 0 && (
                  <div className="md:col-span-2 bg-red-50 border border-red-200 rounded-lg p-3">
                    {Object.values(formErrors).map((error, index) => (
                      <p key={index} className="text-red-600 text-sm">{error}</p>
                    ))}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Gider Türü *
                  </label>
                  <select
                    value={giderForm.giderTur}
                    onChange={(e) => setGiderForm(prev => ({ ...prev, giderTur: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      formErrors.giderTur ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <option value="">Gider türü seçiniz...</option>
                    {giderKategorileri.map(kategori => (
                      <option key={kategori.value} value={kategori.value}>{kategori.label}</option>
                    ))}
                  </select>
                  {formErrors.giderTur && (
                    <p className="text-red-600 text-xs mt-1">{formErrors.giderTur}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Gider Tutarı (₺) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={giderForm.giderTutari}
                    onChange={(e) => setGiderForm(prev => ({ ...prev, giderTutari: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      formErrors.giderTutari ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="0.00"
                  />
                  {formErrors.giderTutari && (
                    <p className="text-red-600 text-xs mt-1">{formErrors.giderTutari}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Gider Açıklaması *
                  </label>
                  <textarea
                    value={giderForm.giderAciklama}
                    onChange={(e) => setGiderForm(prev => ({ ...prev, giderAciklama: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      formErrors.giderAciklama ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    rows="3"
                    placeholder="Örneğin: Kasım 2025 elektrik faturası"
                  />
                  {formErrors.giderAciklama && (
                    <p className="text-red-600 text-xs mt-1">{formErrors.giderAciklama}</p>
                  )}
                </div>

                {/* File Upload Section */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Belgeler (Fatura, Makbuz vb.)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center justify-center w-full p-3 bg-gray-50 dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-500 transition-colors"
                    >
                      <Upload className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-300" />
                      <span className="text-gray-600 dark:text-gray-300">
                        Dosya seçin veya sürükleyin
                      </span>
                    </button>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                      PDF, JPG, PNG dosyaları kabul edilir (Maks. 10MB)
                    </p>
                  </div>

                  {/* Selected Files Display */}
                  {selectedFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-600 rounded-lg">
                          <div className="flex items-center space-x-2">
                            {file.type === 'application/pdf' ? (
                              <FileText className="h-4 w-4 text-red-600" />
                            ) : (
                              <Image className="h-4 w-4 text-blue-600" />
                            )}
                            <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
                            <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-600 hover:text-red-800 p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="md:col-span-2 flex gap-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors"
                  >
                    {isSubmitting ? (
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    <span>{isSubmitting ? 'Kaydediliyor...' : 'Gider Ekle'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleFormReset}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-700 rounded-lg transition-colors"
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Belgeler</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {giderler.map((gider) => (
                    <tr key={gider.giderId || gider.id} id={`gider-${gider.giderId || gider.id}`} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getKategoriColor(gider.giderTur || gider.kategori)}`}>
                          {getKategoriLabel(gider.giderTur || gider.kategori)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {gider.giderAciklama || gider.aciklama}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                          -{(gider.giderTutari || gider.tutar).toLocaleString('tr-TR')}₺
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {new Date(gider.giderOlusturulmaTarihi || gider.giderTarihi || gider.tarih).toLocaleDateString('tr-TR')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {gider.belgeler && gider.belgeler.length > 0 ? (
                          <div className="flex space-x-1">
                            {gider.belgeler.slice(0, 3).map((belge, index) => (
                              <button
                                key={index}
                                onClick={async () => {
                                  try {
                                    const response = await fetch(giderService.getBelgeUrl(belge.giderBelgeId || belge.id), {
                                      headers: {
                                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                                      }
                                    });
                                    const blob = await response.blob();
                                    const url = window.URL.createObjectURL(blob);
                                    window.open(url, '_blank');
                                  } catch (error) {
                                    console.error('Dosya açılamadı:', error);
                                  }
                                }}
                                className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
                                title={belge.dosyaAdi || belge.belgeAdi}
                              >
                                {getFileIcon(belge.dosyaTuru || belge.belgeTipi)}
                                <span className="ml-1">{belge.dosyaTuru || belge.belgeTipi}</span>
                              </button>
                            ))}
                            {gider.belgeler.length > 3 && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                +{gider.belgeler.length - 3}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Belge yok</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Detayları Görüntüle"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {gider.belgeler && gider.belgeler.length > 0 && (
                            <button
                              onClick={() => {
                                gider.belgeler.forEach(belge => {
                                  giderService.downloadBelge(belge.giderBelgeId || belge.id);
                                });
                              }}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                              title="Belgeleri İndir"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => handleGiderSil(gider.giderId || gider.id)}
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