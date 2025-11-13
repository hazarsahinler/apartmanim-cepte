import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building, Home, MapPin, CheckCircle, AlertCircle, User, 
  ChevronRight, Loader2
} from 'lucide-react';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';
import { userDaireService } from '../services/userDaireService';
import { useTheme } from '../contexts/ThemeContext';
import NetworkStatusMonitor from '../components/NetworkStatusMonitor';

const KullaniciDaireSecimi = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [daireler, setDaireler] = useState([]);
  const [user, setUser] = useState(null);

  // Kullanıcı bilgilerini ve dairelerini yükle
  useEffect(() => {
    const fetchDaireData = async () => {
      try {
        setLoading(true);

        // Auth kontrolü
        if (!authService.isAuthenticated()) {
          navigate('/giris');
          return;
        }

        // Kullanıcı bilgilerini al
        const userInfo = await authService.getUserInfo();
        setUser(userInfo);

        // Role kontrolü
        const decodedToken = authService.decodeToken();
        let userRole = userInfo.apartmanRol || decodedToken.apartmanRol;
        
        if (!userRole && decodedToken.roles && decodedToken.roles.length > 0) {
          userRole = decodedToken.roles[0];
        }
        
        if (userRole !== 'ROLE_APARTMANSAKIN' && userRole !== 'ApartmanSakin' && userRole !== 'Sakin' && userRole !== 'APARTMANSAKIN') {
          toast.error('Bu sayfa sadece apartman sakinleri içindir.');
          navigate('/site-yonetimi');
          return;
        }

        // Daire bilgilerini al
        try {
          const telefonNo = userInfo.kullaniciTelefon || userInfo.telefonNumarasi || userInfo.telefon;
          console.log('KullaniciDaireSecimi - Kullanılan telefon:', telefonNo);
          console.log('KullaniciDaireSecimi - Kullanıcı bilgileri:', userInfo);
          
          const daireBilgileri = await userDaireService.getKullaniciDaireBilgileri(telefonNo);
          console.log('KullaniciDaireSecimi - Gelen daire bilgileri:', daireBilgileri);
          
          if (daireBilgileri && daireBilgileri.length > 0) {
            // Eğer tek daire varsa direk kullanıcı sayfasına yönlendir
            if (daireBilgileri.length === 1) {
              const tekDaire = userDaireService.formatDaireBilgileri(daireBilgileri[0]);
              userDaireService.setSelectedDaire(tekDaire);
              navigate('/kullanici-sayfasi');
              return;
            }
            
            // Birden fazla daire varsa seçim sun
            setDaireler(daireBilgileri);
          } else {
            toast.error('Kayıtlı daire bulunamadı. Site yöneticisi ile iletişime geçiniz.');
            navigate('/');
          }

        } catch (dairErr) {
          console.error('Daire bilgisi alınamadı:', dairErr.message);
          toast.error(dairErr.message);
          navigate('/');
        }

      } catch (err) {
        console.error('Sayfa yüklenirken hata:', err);
        toast.error('Sayfa yüklenirken bir hata oluştu.');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchDaireData();
  }, [navigate]);

  // Daire seçimi
  const handleDaireSecimi = (daire) => {
    console.log('Daire seçildi:', daire);
    
    try {
      // Daire bilgisini formatla
      const formattedDaire = userDaireService.formatDaireBilgileri(daire);
      
      // Seçilen daireyi localStorage'a kaydet
      userDaireService.setSelectedDaire(formattedDaire);
      
      // Kullanıcı sayfasına yönlendir
      navigate('/kullanici-sayfasi');
      
      toast.success(`${formattedDaire.adres} seçildi!`);
    } catch (error) {
      console.error('Daire seçimi hatası:', error);
      toast.error('Daire seçimi sırasında bir hata oluştu.');
    }
  };

  // Daire adres formatlama
  const formatDaireAdres = (daire) => {
    const siteIsmi = daire.siteIsmi || daire.adi || daire.name || 'Site';
    const blokIsmi = daire.blokIsmi || daire.blokAdi || 'Blok';
    const katNo = daire.katNo || daire.kat || '';
    const daireNo = daire.daireNo || daire.daire || '';
    
    return `${siteIsmi} - ${blokIsmi} ${katNo ? `${katNo}. Kat` : ''} Daire ${daireNo}`;
  };

  // Daire detay bilgisi formatlama
  const formatDaireDetay = (daire) => {
    const adres = daire.siteAdresi || daire.adres || daire.address || '';
    return adres;
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'} flex items-center justify-center transition-colors duration-300`}>
        <div className="text-center">
          <Loader2 className="h-16 w-16 text-green-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300 text-lg">Daire bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <NetworkStatusMonitor />
      
      <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
        <div className="min-h-screen flex items-center justify-center px-4 py-8">
          <div className="max-w-4xl w-full">
            
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mr-4">
                  <Home className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Daire Seçimi
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Hoş Geldiniz {user?.kullaniciAdi} {user?.kullaniciSoyadi}! Devam etmek için bir daire seçin.
                  </p>
                </div>
              </div>
            </div>

            {/* Kullanıcı Bilgi Kartı */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
              <div className="flex items-center">
                <User className="w-8 h-8 text-blue-600 mr-3" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Kullanıcı Bilgileri</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
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
              </div>
            </div>

            {/* Daire Seçimi */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
                Daireleriniz ({daireler.length})
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {daireler.map((daire, index) => (
                  <div 
                    key={daire.daireId || daire.id || index}
                    onClick={() => handleDaireSecimi(daire)}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-green-500 group"
                  >
                    <div className="p-6">
                      {/* Daire Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                            <Building className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                              {formatDaireAdres(daire)}
                            </h3>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-green-500 transition-colors" />
                      </div>

                      {/* Daire Detayları */}
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <MapPin className="h-4 w-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {formatDaireDetay(daire) || 'Adres bilgisi mevcut değil'}
                          </p>
                        </div>
                        
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                            Aktif Daire
                          </span>
                        </div>
                      </div>

                      {/* Action */}
                      <div className="mt-6">
                        <div className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg group-hover:from-green-600 group-hover:to-blue-600 transition-all duration-300">
                          <span className="text-sm font-medium">Bu Daireyi Seç</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {daireler.length === 0 && (
                <div className="text-center py-12">
                  <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Daire Bulunamadı
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Henüz kayıtlı daireniz bulunmuyor.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="text-center mt-8">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Sorun yaşıyorsanız site yöneticisi ile iletişime geçebilirsiniz.
              </p>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default KullaniciDaireSecimi;