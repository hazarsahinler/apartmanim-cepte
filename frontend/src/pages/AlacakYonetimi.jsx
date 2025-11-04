import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, TrendingUp, Plus, Save, Calendar, Building, Search,
  LogOut, Menu, X, Moon, Sun, Eye, Edit, Trash2, CreditCard, 
  Filter, Download, RefreshCw, DollarSign
} from 'lucide-react';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';
import { useTheme } from '../contexts/ThemeContext';
import { financeService } from '../services/financeService';

const AlacakYonetimi = () => {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [siteData, setSiteData] = useState(null);
  const [borclar, setBorclar] = useState([]);
  const [filteredBorclar, setFilteredBorclar] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Form state
  const [borcForm, setBorcForm] = useState({
    tutar: '',
    borcTuru: '',
    aciklama: '',
    sonOdemeTarihi: '',
    siteId: siteId || ''
  });

  // Form validation errors
  const [formErrors, setFormErrors] = useState({});

  // Filter state
  const [filters, setFilters] = useState({
    borcTuru: '',
    yil: new Date().getFullYear(),
    searchText: ''
  });

  // Enum değerleri - backend'den al
  const borcTurleri = financeService.getBorcTurleri();

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

        // siteId'yi forma set et
        setBorcForm(prev => ({ ...prev, siteId: siteId }));
        
        // Borçları yükle
        await loadBorclar();
        
      } catch (err) {
        console.error('Sayfa yüklenirken hata:', err);
        toast.error('Sayfa yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    initializePage();
  }, [navigate, siteId]);

  // Borçları yükle
  const loadBorclar = async () => {
    try {
      const filterData = {
        siteId: parseInt(siteId),
        ...filters
      };
      
      const borcData = await financeService.getTanimlananBorclar(filterData);
      setBorclar(borcData);
      setFilteredBorclar(borcData);
    } catch (error) {
      console.error('Borçlar yüklenirken hata:', error);
      toast.error('Borçlar yüklenirken bir hata oluştu.');
    }
  };

  // Filtreleme işlemi
  useEffect(() => {
    let filtered = [...borclar];

    // Borç türü filtresi
    if (filters.borcTuru) {
      filtered = filtered.filter(borc => borc.borcTuru === filters.borcTuru);
    }

    // Yıl filtresi
    if (filters.yil) {
      filtered = filtered.filter(borc => {
        const borcYil = new Date(borc.olusturulmaTarihi).getFullYear();
        return borcYil === parseInt(filters.yil);
      });
    }

    // Metin arama
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(borc => 
        borc.aciklama.toLowerCase().includes(searchLower)
      );
    }

    setFilteredBorclar(filtered);
  }, [filters, borclar]);

  // Borç ekleme
  const handleBorcEkle = async (e) => {
    e.preventDefault();
    
    // Form validation
    const validation = financeService.validateBorcTanimiForm(borcForm);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      toast.error('Lütfen form hatalarını düzeltin.');
      return;
    }

    try {
      setSubmitting(true);
      setFormErrors({});
      
      const response = await financeService.addBorcTanimi(borcForm);
      
      if (response && response.message) {
        toast.success(response.message);
      } else {
        toast.success('Borç tanımı başarıyla eklendi!');
      }
      
      // Formu temizle
      setBorcForm({
        tutar: '',
        borcTuru: '',
        aciklama: '',
        sonOdemeTarihi: '',
        siteId: siteId
      });
      setShowAddForm(false);
      
      // Borçları yeniden yükle
      await loadBorclar();
      
    } catch (error) {
      console.error('Borç eklenirken hata:', error);
      toast.error(error.message || 'Borç eklenirken bir hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtreleri uygula
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Filtreleri temizle
  const clearFilters = () => {
    setFilters({
      borcTuru: '',
      yil: new Date().getFullYear(),
      searchText: ''
    });
  };

  // Refresh data
  const handleRefresh = async () => {
    setLoading(true);
    await loadBorclar();
    setLoading(false);
    toast.success('Veriler yenilendi!');
  };

  const getTurLabel = (borcTuru) => {
    const turObj = borcTurleri.find(t => t.value === borcTuru);
    return turObj ? turObj.label : borcTuru;
  };

  const getTurBadgeColor = (borcTuru) => {
    switch (borcTuru) {
      case 'AIDAT':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'OZEL_MASRAF':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getDurumBadge = (sonOdemeTarihi) => {
    const bugun = new Date();
    const sonTarih = new Date(sonOdemeTarihi);
    
    if (sonTarih < bugun) {
      return { 
        class: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        text: 'Süresi Geçti'
      };
    } else {
      const fark = Math.ceil((sonTarih - bugun) / (1000 * 60 * 60 * 24));
      if (fark <= 7) {
        return { 
          class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
          text: `${fark} gün kaldı`
        };
      } else {
        return { 
          class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
          text: 'Aktif'
        };
      }
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Alacak Yönetimi</h1>
              <p className="text-gray-600 dark:text-gray-400">Site alacaklarını yönetin ve takip edin</p>
              {siteData && (
                <div className="flex items-center mt-2">
                  <Building className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-1" />
                  <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">{siteData.siteIsmi}</span>
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              >
                <Filter className="h-5 w-5" />
                <span>Filtrele</span>
              </button>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
              >
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                <span>Yenile</span>
              </button>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>Yeni Borç</span>
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-0">Filtreler</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Filtreleri Temizle
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Borç Türü
                  </label>
                  <select
                    value={filters.borcTuru}
                    onChange={(e) => handleFilterChange('borcTuru', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Tüm Türler</option>
                    {borcTurleri.map(tur => (
                      <option key={tur.value} value={tur.value}>{tur.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Yıl
                  </label>
                  <select
                    value={filters.yil}
                    onChange={(e) => handleFilterChange('yil', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {[2023, 2024, 2025, 2026].map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Arama
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={filters.searchText}
                      onChange={(e) => handleFilterChange('searchText', e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Açıklama ara..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Borç</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {financeService.formatCurrency(
                      filteredBorclar.reduce((sum, borc) => sum + borc.tutar, 0)
                    )}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Kayıt</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredBorclar.length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Süresi Geçen</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {filteredBorclar.filter(borc => new Date(borc.sonOdemeTarihi) < new Date()).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Yeni Borç Tanımı Ekle
                </h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              <form onSubmit={handleBorcEkle} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Borç Türü *
                  </label>
                  <select
                    value={borcForm.borcTuru}
                    onChange={(e) => setBorcForm(prev => ({ ...prev, borcTuru: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      formErrors.borcTuru ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    required
                  >
                    <option value="">Borç türü seçiniz...</option>
                    {borcTurleri.map(tur => (
                      <option key={tur.value} value={tur.value}>{tur.label}</option>
                    ))}
                  </select>
                  {formErrors.borcTuru && (
                    <p className="text-red-500 dark:text-red-400 text-xs mt-1">{formErrors.borcTuru}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tutar (₺) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={borcForm.tutar}
                    onChange={(e) => setBorcForm(prev => ({ ...prev, tutar: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      formErrors.tutar ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="0.00"
                    required
                  />
                  {formErrors.tutar && (
                    <p className="text-red-500 dark:text-red-400 text-xs mt-1">{formErrors.tutar}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Son Ödeme Tarihi *
                  </label>
                  <input
                    type="date"
                    value={borcForm.sonOdemeTarihi}
                    onChange={(e) => setBorcForm(prev => ({ ...prev, sonOdemeTarihi: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      formErrors.sonOdemeTarihi ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    required
                  />
                  {formErrors.sonOdemeTarihi && (
                    <p className="text-red-500 dark:text-red-400 text-xs mt-1">{formErrors.sonOdemeTarihi}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Açıklama *
                  </label>
                  <textarea
                    value={borcForm.aciklama}
                    onChange={(e) => setBorcForm(prev => ({ ...prev, aciklama: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      formErrors.aciklama ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    rows="3"
                    placeholder="Örneğin: Kasım 2025 aylık aidat ödemesi"
                    maxLength="200"
                    required
                  />
                  {formErrors.aciklama && (
                    <p className="text-red-500 dark:text-red-400 text-xs mt-1">{formErrors.aciklama}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {borcForm.aciklama.length}/200 karakter
                  </p>
                </div>

                <div className="md:col-span-2 flex gap-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center space-x-2 px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Ekleniyor...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Borç Ekle</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setFormErrors({});
                      setBorcForm({
                        tutar: '',
                        borcTuru: '',
                        aciklama: '',
                        sonOdemeTarihi: '',
                        siteId: siteId
                      });
                    }}
                    className="px-6 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                  >
                    İptal
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Borç Listesi */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Borç Listesi ({filteredBorclar.length})
                </h3>
                {filteredBorclar.length > 0 && (
                  <button
                    onClick={() => {/* Export fonksiyonu eklenebilir */}}
                    className="flex items-center space-x-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Dışa Aktar</span>
                  </button>
                )}
              </div>
            </div>
            
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-400">Yükleniyor...</span>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tür</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Açıklama</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tutar</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Oluşturma</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Son Tarih</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Durum</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredBorclar.map((borc) => {
                      const durumBadge = getDurumBadge(borc.sonOdemeTarihi);
                      return (
                        <tr key={borc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTurBadgeColor(borc.borcTuru)}`}>
                              {getTurLabel(borc.borcTuru)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {borc.aciklama}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                              {financeService.formatCurrency(borc.tutar)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900 dark:text-white">
                              {financeService.formatDate(borc.olusturulmaTarihi)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900 dark:text-white">
                              {financeService.formatDate(borc.sonOdemeTarihi)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${durumBadge.class}`}>
                              {durumBadge.text}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button 
                                title="Detayları Görüntüle"
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button 
                                title="Düzenle"
                                className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 transition-colors"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button 
                                title="Sil"
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
              
              {!loading && filteredBorclar.length === 0 && (
                <div className="text-center py-12">
                  <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Borç Kaydı Bulunamadı</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {filters.borcTuru || filters.searchText ? 'Arama kriterlerinize uygun borç kaydı bulunamadı.' : 'Henüz hiç borç tanımı eklenmemiş.'}
                  </p>
                  {!filters.borcTuru && !filters.searchText && (
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      <span>İlk Borç Tanımını Ekle</span>
                    </button>
                  )}
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