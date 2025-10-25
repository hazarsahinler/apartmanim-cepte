import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, User, Home, Clock, ChevronRight, 
  Loader2, AlertCircle, CreditCard, Building
} from 'lucide-react';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';
import NetworkStatusMonitor from '../components/NetworkStatusMonitor';
import MainNavbar from '../components/MainNavbar';
import UserSidebar from '../components/UserSidebar';

const KullaniciDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [duyurular, setDuyurular] = useState([]);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Sayfa yüklendiğinde kullanıcı bilgilerini çek
  useEffect(() => {
    const initializePage = async () => {
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
        console.log('KullaniciDashboard - userInfo:', userInfo);

        // Token'dan rol bilgisini de al
        const decodedToken = authService.decodeToken();
        console.log('KullaniciDashboard - decodedToken:', decodedToken);
        
        // Kullanıcının sakin olup olmadığını kontrol et
        let userRole = userInfo.apartmanRol;
        
        // Eğer API'dan rol gelmiyorsa token'dan al
        if (userRole === null || userRole === undefined) {
          userRole = decodedToken.apartmanRol;
        }
        
        console.log('KullaniciDashboard - Final userRole:', userRole);
        
        if (userRole !== 'ROLE_APARTMANSAKIN' && userRole !== 'ApartmanSakin' && userRole !== 'Sakin') {
          console.log('Bu sayfa sadece apartman sakinleri için, kullanıcı rolü:', userRole);
          toast.error('Bu sayfa sadece apartman sakinleri içindir.');
          navigate('/site-yonetimi');
          return;
        }

        // TODO: Kullanıcının dairesi varsa duyuruları çek
        setDuyurular([
          {
            id: 1,
            baslik: 'Genel temizlik duyurusu',
            icerik: 'Yarın saat 09:00\'da apartman genel temizliği yapılacaktır.',
            tarih: '2024-01-15',
            okundu: false
          },
          {
            id: 2,
            baslik: 'Asansör bakımı',
            icerik: 'Asansör bakımı pazartesi günü saat 14:00-16:00 arası yapılacaktır.',
            tarih: '2024-01-14',
            okundu: true
          }
        ]);

      } catch (err) {
        console.error('Sayfa yüklenirken hata:', err);
        setError(err.message);
        toast.error('Sayfa yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    initializePage();
  }, [navigate]);

  const handleProfile = () => {
    navigate('/profil');
  };

  const handleDuyuruDetay = (duyuruId) => {
    navigate(`/duyuru/${duyuruId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <MainNavbar toggleUserSidebar={toggleSidebar} isUserSidebarOpen={isSidebarOpen} />
        <UserSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <div className="pt-16 ml-0 lg:ml-64">
          <div className="flex justify-center items-center h-screen">
            <div className="flex flex-col items-center">
              <Loader2 className="h-12 w-12 text-green-500 animate-spin" />
              <span className="mt-4 text-gray-600 dark:text-gray-300">Kullanıcı bilgileri yükleniyor...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <MainNavbar toggleUserSidebar={toggleSidebar} isUserSidebarOpen={isSidebarOpen} />
        <UserSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <div className="pt-16 ml-0 lg:ml-64">
          <div className="flex justify-center items-center h-screen">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Bir Hata Oluştu</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Tekrar Dene
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <NetworkStatusMonitor />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <MainNavbar toggleUserSidebar={toggleSidebar} isUserSidebarOpen={isSidebarOpen} />
        <UserSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <div className="pt-16 ml-0 lg:ml-64">
          <div className="container mx-auto px-4 py-6 lg:py-8">
            {/* Hoş Geldiniz Başlığı */}
            <div className="mb-6 lg:mb-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Hoş Geldiniz, {user?.kullaniciAdi} {user?.kullaniciSoyadi}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm lg:text-base">
                Apartman bilgilerinizi ve duyurularınızı buradan takip edebilirsiniz.
              </p>
            </div>

            {/* Hızlı Eylemler */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
              <button
                onClick={() => navigate('/duyurular')}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6 hover:shadow-md transition-all duration-300 text-left group"
              >
                <div className="flex items-center">
                  <div className="w-10 lg:w-12 h-10 lg:h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-3 lg:mr-4 group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
                    <Bell className="w-5 lg:w-6 h-5 lg:h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm lg:text-base">Duyurular</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs lg:text-sm">Apartman duyurularını görüntüle</p>
                  </div>
                </div>
                <ChevronRight className="w-4 lg:w-5 h-4 lg:h-5 text-gray-400 float-right mt-2" />
              </button>

              <button
                onClick={handleProfile}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6 hover:shadow-md transition-all duration-300 text-left group"
              >
                <div className="flex items-center">
                  <div className="w-10 lg:w-12 h-10 lg:h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3 lg:mr-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                    <User className="w-5 lg:w-6 h-5 lg:h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm lg:text-base">Profil</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs lg:text-sm">Kişisel bilgilerinizi düzenleyin</p>
                  </div>
                </div>
                <ChevronRight className="w-4 lg:w-5 h-4 lg:h-5 text-gray-400 float-right mt-2" />
              </button>

              <button
                onClick={() => navigate('/aidat-bilgilerim')}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6 hover:shadow-md transition-all duration-300 text-left group"
              >
                <div className="flex items-center">
                  <div className="w-10 lg:w-12 h-10 lg:h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-3 lg:mr-4 group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors">
                    <CreditCard className="w-5 lg:w-6 h-5 lg:h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm lg:text-base">Aidat Bilgilerim</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs lg:text-sm">Aidat ödemelerinizi görüntüleyin</p>
                  </div>
                </div>
                <ChevronRight className="w-4 lg:w-5 h-4 lg:h-5 text-gray-400 float-right mt-2" />
              </button>
            </div>

            {/* Kullanıcı Bilgi Kartları */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6">
                <div className="flex items-center">
                  <div className="w-10 lg:w-12 h-10 lg:h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3 lg:mr-4">
                    <User className="w-5 lg:w-6 h-5 lg:h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm lg:text-base">Profil Bilgilerim</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs lg:text-sm">{user?.email}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6">
                <div className="flex items-center">
                  <div className="w-10 lg:w-12 h-10 lg:h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-3 lg:mr-4">
                    <Home className="w-5 lg:w-6 h-5 lg:h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm lg:text-base">Daire Bilgim</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs lg:text-sm">
                      {user?.daire ? `Daire: ${user.daire}` : 'Henüz daire atanmamış'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6">
                <div className="flex items-center">
                  <div className="w-10 lg:w-12 h-10 lg:h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-3 lg:mr-4">
                    <Building className="w-5 lg:w-6 h-5 lg:h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm lg:text-base">Apartman Rolü</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs lg:text-sm">Apartman Sakini</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Son Duyurular */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="px-4 lg:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <Bell className="w-4 lg:w-5 h-4 lg:h-5 mr-2 text-blue-600 dark:text-blue-400" />
                    Son Duyurular
                  </h3>
                  <button
                    onClick={() => navigate('/duyurular')}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs lg:text-sm font-medium flex items-center transition-colors"
                  >
                    Tümünü Gör
                    <ChevronRight className="w-3 lg:w-4 h-3 lg:h-4 ml-1" />
                  </button>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {duyurular.length > 0 ? (
                  duyurular.slice(0, 3).map((duyuru) => (
                    <div
                      key={duyuru.id}
                      onClick={() => handleDuyuruDetay(duyuru.id)}
                      className="px-4 lg:px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                            {duyuru.baslik}
                          </h4>
                          <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {duyuru.icerik}
                          </p>
                          <div className="flex items-center mt-2">
                            <Clock className="w-3 lg:w-4 h-3 lg:h-4 text-gray-400 mr-1" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">{duyuru.tarih}</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          {!duyuru.okundu && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 lg:px-6 py-8 text-center">
                    <Bell className="w-8 lg:w-12 h-8 lg:h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Henüz duyuru bulunmuyor.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default KullaniciDashboard;