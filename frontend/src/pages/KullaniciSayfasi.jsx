import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, User, Home, AlertCircle, Loader2, CreditCard, Building, 
  MapPin, DollarSign, Calendar, Clock, LogOut, Menu, Sun, Moon,
  CheckCircle, XCircle, TrendingDown, FileText
} from 'lucide-react';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';
import { userDaireService } from '../services/userDaireService';
import { giderService } from '../services/giderService';
import NetworkStatusMonitor from '../components/NetworkStatusMonitor';
import UserSidebar from '../components/UserSidebar';
import { useTheme } from '../contexts/ThemeContext';

const KullaniciSayfasi = () => {
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [daireInfo, setDaireInfo] = useState(null);
  const [finansalOzet, setFinansalOzet] = useState(null);
  const [daireBorclari, setDaireBorclari] = useState([]);
  const [odemeIstekDurumlari, setOdemeIstekDurumlari] = useState({});
  const [totalApartmanGeliri, setTotalApartmanGeliri] = useState(null);
  const [totalApartmanGideri, setTotalApartmanGideri] = useState(null);
  const [siteGiderleri, setSiteGiderleri] = useState([]);
  const [odemeYukleniyor, setOdemeYukleniyor] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

        // Role kontrolü
        const decodedToken = authService.decodeToken();
        let userRole = userInfo.apartmanRol || decodedToken.apartmanRol;
        
        // Token'daki roles array'ini de kontrol et
        if (!userRole && decodedToken.roles && decodedToken.roles.length > 0) {
          userRole = decodedToken.roles[0]; // İlk role'u al
        }
        
        if (userRole !== 'ROLE_APARTMANSAKIN' && userRole !== 'ApartmanSakin' && userRole !== 'Sakin' && userRole !== 'APARTMANSAKIN') {
          toast.error('Bu sayfa sadece apartman sakinleri içindir.');
          navigate('/site-yonetimi');
          return;
        }

        // Daire bilgilerini al
        try {
          const telefonNo = userInfo.kullaniciTelefon || userInfo.telefonNumarasi || userInfo.telefon;
          console.log('KullaniciSayfasi - Kullanılan telefon:', telefonNo);
          console.log('KullaniciSayfasi - Kullanıcı bilgileri:', userInfo);
          
          // Önce seçilen daire var mı kontrol et
          const selectedDaire = userDaireService.getSelectedDaire();
          
          if (selectedDaire) {
            console.log('KullaniciSayfasi - Seçilen daire kullanılıyor:', selectedDaire);
            setDaireInfo(selectedDaire);
            
            // Finansal verilerini yükle
            await loadFinancialData(selectedDaire);
          } else {
            // Seçilen daire yoksa API'den çek
            const daireBilgileri = await userDaireService.getKullaniciDaireBilgileri(telefonNo);
            console.log('KullaniciSayfasi - API\'den gelen daire bilgileri:', daireBilgileri);
            
            if (daireBilgileri && daireBilgileri.length > 0) {
              // Eğer birden fazla daire varsa seçim sayfasına yönlendir
              if (daireBilgileri.length > 1) {
                navigate('/kullanici-daire-secimi');
                return;
              }
              
              // Tek daire varsa onu kullan
              const formattedDaire = userDaireService.formatDaireBilgileri(daireBilgileri[0]);
              setDaireInfo(formattedDaire);
              userDaireService.setSelectedDaire(formattedDaire);
              
              // Finansal verilerini yükle
              await loadFinancialData(formattedDaire);
            } else {
              throw new Error('Kayıtlı daire bulunamadı.');
            }
          }

        } catch (dairErr) {
          console.warn('Daire bilgisi alınamadı:', dairErr.message);
          toast.warn(dairErr.message);
          setDaireInfo(null);
        }

      } catch (err) {
        console.error('Sayfa yüklenirken hata:', err);
        setError(err.message);
        toast.error('Sayfa yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    // Finansal verileri yükle
    const loadFinancialData = async (daireData) => {
      if (!daireData || !daireData.daireId) return;
      
      try {
        // Finansal özeti hesapla (daire borçları üzerinden)
        const finansalData = await userDaireService.getKullaniciFinansalOzet(daireData.daireId);
        setFinansalOzet(finansalData);
        
        // Daire borçlarını da çek
        const borclar = await userDaireService.getKullaniciDaireBorclari(daireData.daireId);
        setDaireBorclari(borclar);
        
        // Ödeme isteği durumlarını yükle
        await loadOdemeIstekDurumlari(borclar);
        
        // Total apartman gelirini yükle
        try {
          const gelirData = await userDaireService.getTotalApartmanGelir(daireData.siteId);
          setTotalApartmanGeliri(gelirData);
          console.log('KullaniciSayfasi - Total apartman geliri yüklendi:', gelirData);
        } catch (gelirErr) {
          console.warn('Total apartman geliri alınamadı:', gelirErr.message);
          setTotalApartmanGeliri({ tutar: 0 });
        }
        
        // Total apartman giderini yükle
        try {
          const giderData = await giderService.getTotalSiteGider(daireData.siteId);
          setTotalApartmanGideri(giderData);
          console.log('KullaniciSayfasi - Total apartman gideri yüklendi:', giderData);
        } catch (giderErr) {
          console.warn('Total apartman gideri alınamadı:', giderErr.message);
          setTotalApartmanGideri({ tutar: 0 });
        }
        
        // Son 5 gideri yükle (kullanıcı için özet)
        try {
          const giderListesi = await giderService.getSiteGiderleri(daireData.siteId);
          setSiteGiderleri(giderListesi.slice(0, 5)); // Sadece son 5'i göster
          console.log('KullaniciSayfasi - Site giderleri yüklendi:', giderListesi);
        } catch (giderErr) {
          console.warn('Site giderleri alınamadı:', giderErr.message);
          setSiteGiderleri([]);
        }
        
      } catch (finErr) {
        console.warn('Finansal özet alınamadı:', finErr.message);
      }
    };

    initializePage();
  }, [navigate]);

  const handleLogout = () => {
    if (window.confirm('Çıkış yapmak istediğinize emin misiniz?')) {
      authService.logout();
    }
  };

  const handleOdemeIstegi = async (borcId) => {
    try {
      setOdemeYukleniyor(true);
      
      await userDaireService.odemeIstegiGonder(borcId);
      
      toast.success('Ödeme isteği başarıyla gönderildi! Yönetici onayını bekliyor.');
      
      // Borçları yenile
      if (daireInfo?.daireId) {
        const guncelBorclar = await userDaireService.getKullaniciDaireBorclari(daireInfo.daireId);
        setDaireBorclari(guncelBorclar);
        
        const guncelFinansal = await userDaireService.getKullaniciFinansalOzet(daireInfo.daireId);
        setFinansalOzet(guncelFinansal);
        
        // Ödeme isteği durumlarını güncelle
        await loadOdemeIstekDurumlari(guncelBorclar);
        
        // Total apartman gelirini de güncelle
        try {
          const guncelGelir = await userDaireService.getTotalApartmanGelir(daireInfo.siteId);
          setTotalApartmanGeliri(guncelGelir);
          console.log('KullaniciSayfasi - Total apartman geliri güncellendi:', guncelGelir);
        } catch (gelirErr) {
          console.warn('Total apartman geliri güncellenemedi:', gelirErr.message);
        }
        
        // Total apartman giderini de güncelle
        try {
          const guncelGider = await giderService.getTotalSiteGider(daireInfo.siteId);
          setTotalApartmanGideri(guncelGider);
        } catch (giderErr) {
          console.warn('Total apartman gideri güncellenemedi:', giderErr.message);
        }
      }
      
    } catch (error) {
      console.error('Ödeme isteği hatası:', error);
      toast.error(error.message || 'Ödeme isteği gönderilirken bir hata oluştu.');
    } finally {
      setOdemeYukleniyor(false);
    }
  };

  // Ödeme isteği durumlarını yükle
  const loadOdemeIstekDurumlari = async (borclar) => {
    try {
      const durumlar = {};
      
      // Her borç için ödeme isteği durumunu kontrol et
      for (const borc of borclar) {
        try {
          const durum = await userDaireService.odemeIstekDurumKontrol(borc.id);
          durumlar[borc.id] = durum.onaylandiMi;
        } catch (error) {
          console.warn(`Borç ${borc.id} için durum kontrol edilemedi:`, error.message);
          durumlar[borc.id] = null; // Durum bilinmiyor
        }
      }
      
      setOdemeIstekDurumlari(durumlar);
      console.log('UserDaireService - Ödeme isteği durumları:', durumlar);
      
    } catch (error) {
      console.error('Ödeme isteği durumları yüklenirken hata:', error);
    }
  };

  // Ödeme isteği durumu bileşenini render et
  const renderOdemeIstekDurumu = (borcId) => {
    const durum = odemeIstekDurumlari[borcId];
    
    if (durum === null || durum === undefined) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
          <Clock className="w-3 h-3 mr-1" />
          Durum Kontrol Ediliyor
        </span>
      );
    }
    
    if (durum === true) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
          <CheckCircle className="w-3 h-3 mr-1" />
          ONAYLANDI
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
        <Clock className="w-3 h-3 mr-1" />
        ONAY BEKLENİYOR
      </span>
    );
  };

  // Ödeme butonunun durumunu belirle
  const getOdemeButonDurumu = (borcId) => {
    const durum = odemeIstekDurumlari[borcId];
    
    if (durum === true) {
      return {
        disabled: true,
        text: 'Onaylandı',
        icon: CheckCircle,
        className: 'px-4 py-2 bg-green-100 text-green-600 text-sm rounded-lg cursor-not-allowed'
      };
    }
    
    if (durum === false) {
      return {
        disabled: true,
        text: 'İstek Gönderildi',
        icon: Clock,
        className: 'px-4 py-2 bg-yellow-100 text-yellow-600 text-sm rounded-lg cursor-not-allowed'
      };
    }
    
    // Durum bilinmiyorsa ödeme isteği gönderilebilir
    return {
      disabled: odemeYukleniyor,
      text: odemeYukleniyor ? 'Gönderiliyor...' : 'Ödedim, Onayla',
      icon: odemeYukleniyor ? Loader2 : CreditCard,
      className: 'px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm rounded-lg transition-colors'
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 text-green-500 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-300 text-lg">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Hata Oluştu</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <NetworkStatusMonitor />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <nav className="bg-white dark:bg-gray-800 shadow-lg fixed w-full top-0 z-50">
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
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                    <Home className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    Apartman'ım Cepte
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Çıkış
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Sidebar */}
        <UserSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <div className="pt-16 lg:pl-64">
          <div className="container mx-auto px-4 py-8">
            {/* Hoşgeldin Mesajı */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Hoş Geldiniz, {user?.kullaniciAdi} {user?.kullaniciSoyadi}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {daireInfo 
                  ? `${daireInfo.adres} - Apartman bilgilerinizi ve ödemelerinizi takip edin.`
                  : 'Daire bilgileri yüklendiğinde apartman özelliklerine erişebilirsiniz.'
                }
              </p>
            </div>

            {/* Daire Bilgisi Yoksa Uyarı */}
            {!daireInfo && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-6 mb-8">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                      Daire Bilginiz Bulunamadı
                    </h3>
                    <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                      Hesabınıza henüz bir daire atanmamış. Site yöneticisi ile iletişime geçiniz.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Ana Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Sol Kolon - Profil ve Daire Bilgileri */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Profil Kartı */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <div className="flex items-center mb-4">
                    <User className="w-8 h-8 text-blue-600 mr-3" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Profil Bilgilerim</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                      <p className="font-medium text-gray-900 dark:text-white">{user?.kullaniciEposta || user?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Telefon</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user?.kullaniciTelefon || user?.telefonNumarasi || user?.telefon}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Daire Bilgi Kartı */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <div className="flex items-center mb-4">
                    <Building className="w-8 h-8 text-purple-600 mr-3" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Daire Bilgilerim</h3>
                  </div>
                  {daireInfo ? (
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Site</p>
                        <p className="font-medium text-gray-900 dark:text-white">{daireInfo.siteIsmi}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Blok</p>
                        <p className="font-medium text-gray-900 dark:text-white">{daireInfo.blokIsmi}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Daire</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {daireInfo.katNo}. Kat, Daire {daireInfo.daireNo}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Adres</p>
                        <p className="text-sm text-gray-900 dark:text-white">{daireInfo.siteAdresi}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Building className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 dark:text-gray-400">Daire bilgisi bulunamadı</p>
                    </div>
                  )}
                </div>

              </div>

              {/* Sağ Kolon - Finansal Özet ve Hızlı Erişim */}
              <div className="lg:col-span-8 space-y-6">

                {/* Finansal Özet */}
                {daireInfo && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                    <div className="flex items-center mb-6">
                      <CreditCard className="w-8 h-8 text-green-600 mr-3" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">Finansal Özet</h3>
                    </div>
                    
                    {finansalOzet ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                          <div className="flex items-center">
                            <Building className="w-6 h-6 text-purple-600 mr-2" />
                            <div>
                              <p className="text-sm text-purple-600 dark:text-purple-400">Apartman Kasası</p>
                              <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                                ₺{(() => {
                                  const gelir = totalApartmanGeliri?.tutar ? parseFloat(totalApartmanGeliri.tutar) : 0;
                                  const gider = totalApartmanGideri?.tutar ? parseFloat(totalApartmanGideri.tutar) : 0;
                                  const netKasa = gelir - gider;
                                  return netKasa.toLocaleString();
                                })()}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                          <div className="flex items-center">
                            <DollarSign className="w-6 h-6 text-blue-600 mr-2" />
                            <div>
                              <p className="text-sm text-blue-600 dark:text-blue-400">Total Gelirler</p>
                              <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                                ₺{totalApartmanGeliri?.tutar ? parseFloat(totalApartmanGeliri.tutar).toLocaleString() : '0'}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                          <div className="flex items-center">
                            <TrendingDown className="w-6 h-6 text-orange-600 mr-2" />
                            <div>
                              <p className="text-sm text-orange-600 dark:text-orange-400">Total Giderler</p>
                              <p className="text-lg font-bold text-orange-700 dark:text-orange-300">
                                ₺{totalApartmanGideri?.tutar ? parseFloat(totalApartmanGideri.tutar).toLocaleString() : '0'}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                          <div className="flex items-center">
                            <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                            <div>
                              <p className="text-sm text-green-600 dark:text-green-400">Toplam Ödediğim</p>
                              <p className="text-lg font-bold text-green-700 dark:text-green-300">
                                ₺{finansalOzet.toplamOdenen?.toLocaleString() || '0'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">Finansal bilgi yükleniyor...</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Borç Listesi */}
                {daireInfo && daireBorclari.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <CreditCard className="w-8 h-8 text-orange-600 mr-3" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">Ödeme Bekleyen Borçlar</h3>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {daireBorclari.filter(b => !b.odendiMi).length} ödenmemiş borç
                      </span>
                    </div>
                    
                    <div className="space-y-4">
                      {daireBorclari
                        .filter(borc => !borc.odendiMi) // Sadece ödenmemiş borçları göster
                        .map((borc) => (
                          <div key={borc.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:border-orange-300 dark:hover:border-orange-600 transition-colors">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className="font-medium text-gray-900 dark:text-white">
                                    {borc.borcAciklamasi || 'Borç açıklaması'}
                                  </h4>
                                  {renderOdemeIstekDurumu(borc.id)}
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Son ödeme tarihi: {new Date(borc.sonOdemeTarihi).toLocaleDateString('tr-TR')}
                                </p>
                              </div>
                              <div className="text-right ml-4">
                                <p className="text-lg font-bold text-red-600 dark:text-red-400">
                                  ₺{borc.tutar?.toLocaleString()}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                                  new Date(borc.sonOdemeTarihi) < new Date() ? 'bg-red-500' : 'bg-yellow-500'
                                }`}></span>
                                {new Date(borc.sonOdemeTarihi) < new Date() ? 'Vadesi geçmiş' : 'Ödeme bekliyor'}
                              </div>
                              
                              {(() => {
                                const buttonConfig = getOdemeButonDurumu(borc.id);
                                const Icon = buttonConfig.icon;
                                
                                return (
                                  <button
                                    onClick={() => !buttonConfig.disabled && handleOdemeIstegi(borc.id)}
                                    disabled={buttonConfig.disabled}
                                    className={buttonConfig.className + ' flex items-center'}
                                  >
                                    <Icon className={`w-4 h-4 mr-2 ${odemeYukleniyor ? 'animate-spin' : ''}`} />
                                    {buttonConfig.text}
                                  </button>
                                );
                              })()}
                            </div>
                          </div>
                        ))}
                      
                      {daireBorclari.filter(b => !b.odendiMi).length === 0 && (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CreditCard className="w-8 h-8 text-green-600" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            Harika! Ödenmemiş borcunuz yok
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400">
                            Tüm ödemeleriniz güncel durumda
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Site Giderleri Listesi */}
                {daireInfo && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <TrendingDown className="w-8 h-8 text-orange-600 mr-3" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">Son Apartman Giderleri</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Toplam Gider</p>
                        <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                          ₺{totalApartmanGideri?.tutar ? parseFloat(totalApartmanGideri.tutar).toLocaleString() : '0'}
                        </p>
                      </div>
                    </div>
                    
                    {siteGiderleri.length > 0 ? (
                      <div className="space-y-4">
                        {siteGiderleri.slice(0, 3).map((gider, index) => (
                          <div key={gider.giderId || index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:border-orange-300 dark:hover:border-orange-600 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {gider.giderAciklama || 'Gider açıklaması'}
                                </h4>
                                <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  {new Date(gider.giderOlusturulmaTarihi).toLocaleDateString('tr-TR')}
                                  {gider.giderTur && (
                                    <>
                                      <span className="mx-2">•</span>
                                      <span className="capitalize">
                                        {gider.giderTur === 'ELEKTRIK' ? 'Elektrik' :
                                         gider.giderTur === 'SU' ? 'Su' :
                                         gider.giderTur === 'DOGALGAZ' ? 'Doğalgaz' :
                                         gider.giderTur === 'TEMIZLIK' ? 'Temizlik' :
                                         gider.giderTur === 'GUVENLIK' ? 'Güvenlik' :
                                         gider.giderTur === 'ASANSOR' ? 'Asansör' :
                                         gider.giderTur === 'TAMIRAT' ? 'Tamirat' :
                                         gider.giderTur === 'DIGER' ? 'Diğer' :
                                         gider.giderTur.toLowerCase()}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="text-right ml-4">
                                <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                                  ₺{parseFloat(gider.giderTutari || 0).toLocaleString()}
                                </p>
                                {gider.belgeler && gider.belgeler.length > 0 && (
                                  <div className="flex items-center justify-end mt-1">
                                    <FileText className="w-4 h-4 text-gray-400 mr-1" />
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {gider.belgeler.length} belge
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                          </div>
                        ))}
                        
                        {siteGiderleri.length > 3 && (
                          <div className="mt-4 text-center">
                            <button
                              onClick={() => navigate(`/kullanici-giderler/${daireInfo.siteId}`)}
                              className="px-4 py-2 text-orange-600 border border-orange-600 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                            >
                              Tüm Giderleri Görüntüle ({siteGiderleri.length})
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <TrendingDown className="w-8 h-8 text-orange-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          Henüz gider kaydı yok
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                          Site giderleri yönetici tarafından eklendiğinde burada görünecek
                        </p>
                      </div>
                    )}
                    
                    {siteGiderleri.length > 0 && (
                      <div className="mt-4 text-center">
                        <button
                          onClick={() => navigate(`/kullanici-giderler/${daireInfo.siteId}`)}
                          className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                        >
                          Tüm Giderleri Görüntüle
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Hızlı Erişim Menüsü */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Hızlı Erişim</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <button 
                      onClick={() => navigate('/duyurular')}
                      className="flex flex-col items-center p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      disabled={!daireInfo}
                    >
                      <Bell className="w-8 h-8 text-yellow-600 mb-2" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Duyurular</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {daireInfo ? 'Görüntüle' : 'Erişim yok'}
                      </span>
                    </button>
                    
                    <button 
                      onClick={() => navigate('/profil')}
                      className="flex flex-col items-center p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <User className="w-8 h-8 text-blue-600 mb-2" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Profil</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Düzenle</span>
                    </button>
                    
                    <button 
                      className="flex flex-col items-center p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      disabled={!daireInfo}
                    >
                      <CreditCard className="w-8 h-8 text-green-600 mb-2" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Ödemeler</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {daireInfo ? 'Detaylar' : 'Erişim yok'}
                      </span>
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default KullaniciSayfasi;