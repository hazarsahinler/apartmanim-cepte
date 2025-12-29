import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Bell, User, CheckCircle, Clock, AlertTriangle,
  Home, Calendar, MapPin, Loader2, RefreshCw,
  CreditCard, Building, ChevronLeft, FileText,
  DollarSign, AlertCircle as AlertIcon, Menu,
  Sun, Moon, LogOut, ArrowLeft
} from 'lucide-react';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import { odemeIstekService } from '../services/odemeIstekService';
import { authService } from '../services/authService';
import { useTheme } from '../contexts/ThemeContext';

const OdemeIstekleriSayfasi = () => {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [istekler, setIstekler] = useState([]);
  const [filtreliIstekler, setFiltreliIstekler] = useState([]);
  const [error, setError] = useState(null);
  const [islemYapiliyor, setIslemYapiliyor] = useState(false);
  const [selectedIstek, setSelectedIstek] = useState(null);
  const [aramaMetni, setAramaMetni] = useState('');
  const [durumuFilter, setDurumuFilter] = useState('hepsi');
  const [borcDetaylari, setBorcDetaylari] = useState({});
  const [detayYukleniyor, setDetayYukleniyor] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchOdemeIstekleri = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Yetki kontrolü
        if (!authService.isAuthenticated()) {
          navigate('/giris');
          return;
        }

        // SiteId kontrolü - yoksa site yönetimi sayfasına yönlendir
        if (!siteId) {
          toast.warning('Lütfen önce bir site seçin');
          navigate('/site-yonetimi');
          return;
        }

        // Kullanıcı bilgilerini al
        const userInfo = await authService.getUserInfo();
        setUser(userInfo);

        // Cache'den önce dene
        const cachedData = odemeIstekService.getSavedOdemeIstekleri(siteId);
        if (cachedData) {
          const formattedData = odemeIstekService.formatOdemeIstekleri(cachedData);
          setIstekler(formattedData);
          setFiltreliIstekler(formattedData);
        }

        // API'den güncel veriyi çek
        const data = await odemeIstekService.getSiteOdemeIstekleri(siteId);
        const formattedData = odemeIstekService.formatOdemeIstekleri(data);
        
        setIstekler(formattedData);
        setFiltreliIstekler(formattedData);
        
        // Cache'e kaydet
        odemeIstekService.saveOdemeIstekleri(siteId, data);
        
      } catch (err) {
        console.error('Ödeme istekleri yüklenirken hata:', err);
        setError(err.message || 'Ödeme istekleri yüklenirken bir hata oluştu.');
        toast.error(err.message || 'Ödeme istekleri yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchOdemeIstekleri();
  }, [siteId, navigate]);

  const handleLogout = () => {
    if (window.confirm('Çıkış yapmak istediğinize emin misiniz?')) {
      authService.logout();
    }
  };

  // Filtreleme ve arama
  useEffect(() => {
    let filtered = [...istekler];

    // Arama filtresi
    if (aramaMetni) {
      filtered = filtered.filter(istek => 
        istek.daireAdresi.toLowerCase().includes(aramaMetni.toLowerCase()) ||
        istek.blokIsmi.toLowerCase().includes(aramaMetni.toLowerCase()) ||
        istek.daireNo.toString().includes(aramaMetni)
      );
    }

    setFiltreliIstekler(filtered);
  }, [istekler, aramaMetni, durumuFilter]);

  // Borç detaylarını yükle
  const loadBorcDetaylari = async (daireBorcId, daireId = null) => {
    if (borcDetaylari[daireBorcId] || detayYukleniyor[daireBorcId]) {
      return; // Zaten yüklenmişse veya yükleniyorsa tekrar yükleme
    }

    try {
      setDetayYukleniyor(prev => ({ ...prev, [daireBorcId]: true }));
      
      // Önce daireId ile borç detaylarını çekmeyi dene
      let borcData = null;
      
      if (daireId) {
        try {
          console.log('OdemeIstekleriSayfasi - DaireId ile borç detayları çekiliyor:', daireId);
          borcData = await odemeIstekService.getDaireBorcByDaireId(daireId);
          
          // daireBorcId ile eşleşen borcu bul
          if (borcData && Array.isArray(borcData)) {
            const matchingBorc = borcData.find(borc => borc.id === daireBorcId);
            borcData = matchingBorc || (borcData.length > 0 ? borcData[0] : null);
          }
        } catch (daireIdError) {
          console.warn('DaireId ile borç detayları alınamadı, borcId ile denenecek:', daireIdError.message);
        }
      }
      
      // Eğer daireId ile çekilemezse eski yöntemi kullan
      if (!borcData) {
        console.log('OdemeIstekleriSayfasi - BorcId ile borç detayları çekiliyor:', daireBorcId);
        const fallbackData = await odemeIstekService.getDaireBorcByBorcId(daireBorcId);
        borcData = fallbackData && fallbackData.length > 0 ? fallbackData[0] : null;
      }
      
      // Borç verilerini state'e kaydet
      setBorcDetaylari(prev => ({ 
        ...prev, 
        [daireBorcId]: borcData 
      }));
      
    } catch (error) {
      console.error('Borç detayları yükleme hatası:', error);
      setBorcDetaylari(prev => ({ ...prev, [daireBorcId]: null }));
    } finally {
      setDetayYukleniyor(prev => ({ ...prev, [daireBorcId]: false }));
    }
  };

  // İstekler yüklendiğinde borç detaylarını da yükle
  useEffect(() => {
    if (filtreliIstekler.length > 0) {
      filtreliIstekler.forEach(istek => {
        // Eğer istek objesinde daireId varsa onu kullan
        const daireId = istek.daireId || null;
        loadBorcDetaylari(istek.daireBorcId, daireId);
      });
    }
  }, [filtreliIstekler]);

  const handleOdemeIstegiKabul = async (istekId, daireBorcId) => {
    if (!window.confirm('Bu ödeme isteğini kabul etmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      setIslemYapiliyor(true);
      setSelectedIstek(istekId);
      
      await odemeIstekService.odemeIstegiKabulEt(daireBorcId);
      
      toast.success('Ödeme isteği başarıyla kabul edildi!');
      
      // Listeyi güncelle
      const updatedData = await odemeIstekService.getSiteOdemeIstekleri(siteId);
      const formattedData = odemeIstekService.formatOdemeIstekleri(updatedData);
      setIstekler(formattedData);
      setFiltreliIstekler(formattedData);
      
      // Cache'i güncelle
      odemeIstekService.saveOdemeIstekleri(siteId, updatedData);
      
    } catch (err) {
      console.error('Ödeme isteği kabul hatası:', err);
      toast.error(err.message || 'Ödeme isteği kabul edilirken bir hata oluştu.');
    } finally {
      setIslemYapiliyor(false);
      setSelectedIstek(null);
    }
  };

  const handleYenile = async () => {
    try {
      setLoading(true);
      odemeIstekService.clearCache(siteId);
      
      const data = await odemeIstekService.getSiteOdemeIstekleri(siteId);
      const formattedData = odemeIstekService.formatOdemeIstekleri(data);
      
      setIstekler(formattedData);
      setFiltreliIstekler(formattedData);
      
      toast.success('Ödeme istekleri güncellendi.');
      
    } catch (err) {
      toast.error(err.message || 'Veriler güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && istekler.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Loading Header */}
        <nav className="bg-white dark:bg-gray-800 shadow-md fixed w-full top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-3">
                  <Bell className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">Ödeme İstekleri</span>
              </div>
            </div>
          </div>
        </nav>
        
        <div className="pt-16 flex justify-center items-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <Loader2 className="h-16 w-16 text-green-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300 text-lg">Ödeme istekleri yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && istekler.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Error Header */}
        <nav className="bg-white dark:bg-gray-800 shadow-md fixed w-full top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-3">
                  <Bell className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">Ödeme İstekleri</span>
              </div>
            </div>
          </div>
        </nav>
        
        <div className="pt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto text-center">
              <AlertTriangle className="w-20 h-20 text-red-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Hata Oluştu</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
              <div className="space-x-4">
                <button
                  onClick={handleYenile}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Tekrar Dene
                </button>
                <button
                  onClick={() => navigate(-1)}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Geri Dön
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-md fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Menu className="h-6 w-6" />
              </button>
              
              <button
                onClick={() => navigate(-1)}
                className="hidden lg:block p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mr-2"
                title="Geri Dön"
              >
                <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              </button>
              
              <div className="flex items-center ml-2 lg:ml-0">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-3">
                  <Bell className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
                    Ödeme İstekleri
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                    Site sakinlerinden gelen ödeme onay istekleri
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
      
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content */}
      <div className="pt-16 lg:pl-64">
        <div className="container mx-auto px-4 py-8">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <button
                onClick={() => navigate(-1)}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <div className="flex items-center">
                <Bell className="w-8 h-8 text-orange-600 mr-3" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Ödeme İstekleri
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Site sakinlerinden gelen ödeme onay istekleri
                  </p>
                </div>
              </div>
            </div>

            {/* İstatistikler */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mr-4">
                    <Bell className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Toplam İstek</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {istekler.length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center mr-4">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Bekleyen</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {filtreliIstekler.length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mr-4">
                    <CreditCard className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Bu Hafta</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {istekler.filter(i => i.gecenGunSayisi <= 7).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Arama ve Filtreler */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                <div className="flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="Daire, blok veya daire no ile ara..."
                    value={aramaMetni}
                    onChange={(e) => setAramaMetni(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleYenile}
                    disabled={loading}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Yenile
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* İstek Listesi */}
          {filtreliIstekler.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center shadow-sm">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {aramaMetni ? 'Arama sonucu bulunamadı' : 'Ödeme isteği bulunmuyor'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {aramaMetni 
                  ? 'Farklı arama terimleri deneyebilirsiniz.'
                  : 'Henüz hiç ödeme isteği gönderilmemiş.'
                }
              </p>
            </div>
          ) : (
            <>
              {/* İstek Listesi - Desktop */}
              <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Ödeme İsteği Listesi ({filtreliIstekler.length})
                </h3>
              </div>
              
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filtreliIstekler.map((istek) => (
                  <div key={istek.borcOdemeIstekId} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <Building className="w-5 h-5 text-gray-400 mr-2" />
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                            {istek.daireAdresi}
                          </h4>
                          
                          <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            istek.gecenGunSayisi <= 1 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                              : istek.gecenGunSayisi <= 3
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                          }`}>
                            {istek.gecenGunSayisi <= 1 ? 'Yeni' : `${istek.gecenGunSayisi} gün önce`}
                          </span>
                        </div>
                        
                        {/* Borç Detayları */}
                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          {detayYukleniyor[istek.daireBorcId] ? (
                            <div className="flex items-center text-sm text-gray-500">
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Borç detayları yükleniyor...
                            </div>
                          ) : borcDetaylari[istek.daireBorcId] ? (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <FileText className="w-4 h-4 mr-2 text-blue-600" />
                                  <span className="font-medium text-sm text-gray-900 dark:text-white">
                                    {odemeIstekService.formatBorcTuru(borcDetaylari[istek.daireBorcId].borcAciklamasi)}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <DollarSign className="w-4 h-4 mr-1 text-green-600" />
                                  <span className="font-bold text-green-700 dark:text-green-400">
                                    ₺{parseFloat(borcDetaylari[istek.daireBorcId].tutar || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 dark:text-gray-400">
                                <div>
                                  <span className="font-medium">Son Ödeme:</span>
                                  <span className="ml-1">
                                    {borcDetaylari[istek.daireBorcId].sonOdemeTarihi 
                                      ? new Date(borcDetaylari[istek.daireBorcId].sonOdemeTarihi).toLocaleDateString('tr-TR')
                                      : 'Belirtilmemiş'
                                    }
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium">Durum:</span>
                                  <span className={`ml-1 ${
                                    borcDetaylari[istek.daireBorcId].odendiMi 
                                      ? 'text-green-600 dark:text-green-400' 
                                      : 'text-red-600 dark:text-red-400'
                                  }`}>
                                    {borcDetaylari[istek.daireBorcId].odendiMi ? 'Ödendi' : 'Ödenmedi'}
                                  </span>
                                </div>
                              </div>
                              
                              {borcDetaylari[istek.daireBorcId].borcAciklamasi && (
                                <div className="text-xs text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-600">
                                  <span className="font-medium">Açıklama:</span>
                                  <span className="ml-1">{borcDetaylari[istek.daireBorcId].borcAciklamasi}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center text-sm text-red-500">
                              <AlertIcon className="w-4 h-4 mr-2" />
                              Borç detayları yüklenemedi
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4 mt-2">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {istek.istekTarihiFormatli}
                          </div>
                          <div className="flex items-center">
                            <CreditCard className="w-4 h-4 mr-1" />
                            Borç ID: {istek.daireBorcId}
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-6 flex-shrink-0">
                        <button
                          onClick={() => handleOdemeIstegiKabul(istek.borcOdemeIstekId, istek.daireBorcId)}
                          disabled={islemYapiliyor && selectedIstek === istek.borcOdemeIstekId}
                          className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors font-medium"
                        >
                          {islemYapiliyor && selectedIstek === istek.borcOdemeIstekId ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Onaylanıyor...
                            </>
                          ) : (
                            'Ödemeyi Onayla'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* İstek Listesi - Mobile Cards */}
            <div className="lg:hidden space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Ödeme İstekleri ({filtreliIstekler.length})
                </h3>
              </div>
              
              {filtreliIstekler.map((istek) => (
                <div key={istek.borcOdemeIstekId} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-2">
                      <Building className="w-5 h-5 text-gray-400" />
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        {istek.daireAdresi}
                      </h4>
                    </div>
                    
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      istek.gecenGunSayisi <= 1 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                        : istek.gecenGunSayisi <= 3
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                    }`}>
                      {istek.gecenGunSayisi <= 1 ? 'Yeni' : `${istek.gecenGunSayisi} gün önce`}
                    </span>
                  </div>

                  {/* Borç Detayları */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
                    {detayYukleniyor[istek.daireBorcId] ? (
                      <div className="flex items-center text-sm text-gray-500">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Borç detayları yükleniyor...
                      </div>
                    ) : borcDetaylari[istek.daireBorcId] ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <FileText className="w-4 h-4 mr-2 text-blue-600" />
                            <span className="font-medium text-sm text-gray-900 dark:text-white">
                              {odemeIstekService.formatBorcTuru(borcDetaylari[istek.daireBorcId].borcAciklamasi)}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1 text-green-600" />
                            <span className="font-bold text-green-700 dark:text-green-400">
                              ₺{parseFloat(borcDetaylari[istek.daireBorcId].tutar || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 dark:text-gray-400">
                          <div>
                            <span className="font-medium">Son Ödeme:</span>
                            <div className="text-gray-900 dark:text-white">
                              {borcDetaylari[istek.daireBorcId].sonOdemeTarihi 
                                ? new Date(borcDetaylari[istek.daireBorcId].sonOdemeTarihi).toLocaleDateString('tr-TR')
                                : 'Belirtilmemiş'
                              }
                            </div>
                          </div>
                          <div>
                            <span className="font-medium">Durum:</span>
                            <div className={`${
                              borcDetaylari[istek.daireBorcId].odendiMi 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {borcDetaylari[istek.daireBorcId].odendiMi ? 'Ödendi' : 'Ödenmedi'}
                            </div>
                          </div>
                        </div>
                        
                        {borcDetaylari[istek.daireBorcId].borcAciklamasi && (
                          <div className="text-xs text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-600">
                            <span className="font-medium">Açıklama:</span>
                            <div className="text-gray-900 dark:text-white mt-1">
                              {borcDetaylari[istek.daireBorcId].borcAciklamasi}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center text-sm text-red-500">
                        <AlertIcon className="w-4 h-4 mr-2" />
                        Borç detayları yüklenemedi
                      </div>
                    )}
                  </div>

                  {/* İstek Bilgileri */}
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{istek.istekTarihiFormatli}</span>
                    </div>
                    <div className="flex items-center">
                      <CreditCard className="w-4 h-4 mr-1" />
                      <span>ID: {istek.daireBorcId}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleOdemeIstegiKabul(istek.borcOdemeIstekId, istek.daireBorcId)}
                      disabled={islemYapiliyor && selectedIstek === istek.borcOdemeIstekId}
                      className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors font-medium"
                    >
                      {islemYapiliyor && selectedIstek === istek.borcOdemeIstekId ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Onaylanıyor...
                        </>
                      ) : (
                        'Ödemeyi Onayla'
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default OdemeIstekleriSayfasi;