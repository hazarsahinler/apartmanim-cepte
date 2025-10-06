import React, { useState, useEffect } from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { duyuruService } from '../services/duyuruService';
import DuyuruList from '../components/DuyuruList';
import { 
  Home, 
  LogOut, 
  User, 
  Building2, 
  Users, 
  CreditCard, 
  Bell, 
  Settings,
  Menu,
  X,
  Calendar,
  PieChart,
  TrendingUp,
  AlertCircle,
  Plus
} from 'lucide-react';

const YoneticiDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Dashboard verileri için state'ler
  const [dashboardStats, setDashboardStats] = useState({
    apartmanCount: 2,
    sakinCount: 12,
    bekleyenAidat: "4,500₺",
    duyuruCount: 3
  });
  const [activities, setActivities] = useState([]);
  const [upcomingPayments, setUpcomingPayments] = useState([]);

  // Son duyuruları tutacak state
  const [sonDuyurular, setSonDuyurular] = useState([]);
  const [duyurularYukleniyor, setDuyurularYukleniyor] = useState(true);

  useEffect(() => {
    // Kullanıcı bilgilerini al
    const fetchUserInfo = async () => {
      try {
        // LocalStorage'dan kullanıcı bilgilerini al
        const userInfo = authService.getCurrentUser();
        
        if (userInfo) {
          // LocalStorage'da bilgi varsa kullan
          console.log('Kullanıcı bilgileri localStorage\'dan alındı:', userInfo);
          setUser(userInfo);
        } else {
          try {
            // LocalStorage'da bilgi yoksa API'den çek
            console.log('Kullanıcı bilgileri API\'den alınıyor...');
            const userData = await authService.getUserInfo();
            console.log('Kullanıcı bilgileri API\'den alındı:', userData);
            setUser(userData);
          } catch (apiError) {
            console.error('API\'den kullanıcı bilgileri alınamadı:', apiError);
            
            // API'den alınamazsa test kullanıcısı oluştur
            console.log('Test kullanıcısı oluşturuluyor...');
            const testUser = authService.createTestUser();
            setUser(testUser);
            
            // Test kullanıcısını localStorage'a kaydet
            localStorage.setItem('user', JSON.stringify(testUser));
          }
        }
      } catch (error) {
        console.error('Kullanıcı bilgileri işlenirken hata:', error);
        // Kritik hata durumunda login sayfasına yönlendir
        // navigate('/giris');
        
        // Hata durumunda da test kullanıcısı göster
        const testUser = authService.createTestUser();
        setUser(testUser);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [navigate]);
  
  // Duyuruları getir
  useEffect(() => {
    const fetchDuyurular = async () => {
      try {
        setDuyurularYukleniyor(true);
        // API'den duyuruları çek (Mock data kullanılacak)
        const response = await duyuruService.getAllDuyurular().catch(() => {
          // API bağlantısı yoksa örnek duyurular oluştur
          return {
            data: [
              {
                id: 1,
                baslik: 'Apartman Toplantısı',
                icerik: 'Bu hafta Cumartesi saat 14:00\'te apartman sakinleri toplantısı yapılacaktır. Tüm sakinlerin katılımı önemle rica olunur.',
                tip: 'onemli',
                tarih: new Date(2025, 9, 5),
                yayinlayan: 'Site Yöneticisi'
              },
              {
                id: 2,
                baslik: 'Su Kesintisi',
                icerik: 'Yarın 09:00-14:00 saatleri arasında bakım çalışması nedeniyle su kesintisi olacaktır.',
                tip: 'genel',
                tarih: new Date(2025, 9, 2),
                yayinlayan: 'Site Yönetimi'
              },
              {
                id: 3,
                baslik: 'Bahçe Temizliği Etkinliği',
                icerik: 'Önümüzdeki Pazar günü gönüllü sakinlerle bahçe temizliği etkinliği düzenlenecektir. Katılmak isteyenler yönetimle iletişime geçebilir.',
                tip: 'etkinlik',
                tarih: new Date(2025, 9, 10),
                yayinlayan: 'Etkinlik Komitesi'
              }
            ]
          };
        });
        
        setSonDuyurular(response.data);
        setDashboardStats(prev => ({
          ...prev,
          duyuruCount: response.data.length
        }));
      } catch (error) {
        console.error('Duyurular yüklenirken hata:', error);
      } finally {
        setDuyurularYukleniyor(false);
      }
    };

    fetchDuyurular();
  }, []);

  const handleLogout = () => {
    if (window.confirm('Çıkış yapmak istediğinize emin misiniz?')) {
      authService.logout();
    }
  };

  const menuItems = [
    {
      icon: <Home className="h-5 w-5" />,
      label: 'Ana Sayfa',
      path: '/yonetici-dashboard'
    },
    {
      icon: <Building2 className="h-5 w-5" />,
      label: 'Site Yönetimi',
      path: '/site-yonetimi'
    },
    {
      icon: <Building2 className="h-5 w-5" />,
      label: 'Apartmanlar',
      path: '/apartmanlar'
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: 'Sakinler',
      path: '/sakinler'
    },
    {
      icon: <CreditCard className="h-5 w-5" />,
      label: 'Aidatlar',
      path: '/aidatlar'
    },
    {
      icon: <Bell className="h-5 w-5" />,
      label: 'Duyurular',
      path: '/duyurular'
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: 'Ayarlar',
      path: '/ayarlar'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  // Konsola dashboard sayfasının render edildiğini yazdıralım
  console.log('YoneticiDashboard bileşeni render ediliyor...');
  console.log('Kullanıcı bilgisi:', user);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard rendering bilgisi */}
      <div style={{ position: 'fixed', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '5px 10px', borderRadius: '5px', zIndex: 9999 }}>
        Dashboard Render: {new Date().toLocaleTimeString()}
      </div>
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-md fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left: Logo & Menu Button */}
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mr-4 p-2 rounded-lg hover:bg-gray-100 lg:hidden"
              >
                {sidebarOpen ? (
                  <X className="h-6 w-6 text-gray-600" />
                ) : (
                  <Menu className="h-6 w-6 text-gray-600" />
                )}
              </button>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                  <Home className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 hidden sm:block">
                  Apartman'ım Cepte
                </span>
              </div>
            </div>

            {/* Right: User Info & Logout */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    Hoşgeldin, {user?.kullaniciAdi} {user?.kullaniciSoyadi}
                  </p>
                  <p className="text-xs text-gray-500">Yönetici</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span className="hidden sm:inline">Çıkış</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 h-full bg-white shadow-lg z-40 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="p-4 space-y-2">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                navigate(item.path);
                setSidebarOpen(false);
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-green-50 hover:text-green-600 transition-colors"
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="pt-16 lg:pl-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Outlet - Site Yönetimi veya Site Panel içeriği için */}
          {['/site-yonetimi', '/site-panel'].some(path => location.pathname.includes(path)) ? (
            <Outlet />
          ) : (
            <>
              {/* Welcome Section */}
              <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl shadow-xl p-8 text-white mb-8">
                <h1 className="text-3xl font-bold mb-2">
                  Hoşgeldiniz, {user?.kullaniciAdi} {user?.kullaniciSoyadi}!
                </h1>
                <p className="text-green-50">
                  Apartman yönetim sisteminize hoş geldiniz. Buradan tüm işlemlerinizi kolayca yönetebilirsiniz.
                </p>
              </div>
            
              {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Toplam Apartman</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.apartmanCount}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100">
                <span className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" /> Son 30 günde %100 artış
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Toplam Sakin</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.sakinCount}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100">
                <span className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" /> Son 30 günde %33 artış
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Bekleyen Aidat</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.bekleyenAidat}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100">
                <span className="text-xs text-orange-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" /> 3 gecikmiş ödeme
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Aktif Duyuru</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.duyuruCount}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Bell className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100">
                <span className="text-xs text-purple-600 flex items-center">
                  <Plus className="h-3 w-3 mr-1" /> Son duyuru 2 gün önce
                </span>
              </div>
            </div>
          </div>

          {/* Hızlı İşlemler */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Hızlı İşlemler
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <button className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                  <CreditCard className="h-6 w-6 text-green-600" />
                </div>
                <span className="font-medium text-green-800">Aidat Ekle</span>
              </button>
              
              <Link to="/duyuru-olustur" className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                  <Bell className="h-6 w-6 text-blue-600" />
                </div>
                <span className="font-medium text-blue-800">Duyuru Oluştur</span>
              </Link>
              
              <button className="flex flex-col items-center justify-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <span className="font-medium text-purple-800">Sakin Ekle</span>
              </button>
              
              <Link to="/site-yonetimi" className="flex flex-col items-center justify-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                  <Building2 className="h-6 w-6 text-orange-600" />
                </div>
                <span className="font-medium text-orange-800">Site Yönetimi</span>
              </Link>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Son Aktiviteler */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Son Aktiviteler</h2>
                <button className="text-sm text-blue-600 hover:text-blue-800">Tümünü Gör</button>
              </div>
              
              <div className="space-y-4">
                {/* Aktivite öğeleri */}
                <div className="flex items-start space-x-4 border-b border-gray-100 pb-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <CreditCard className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">A-101 dairesi için Mayıs 2025 aidatı ödendi</p>
                    <p className="text-xs text-gray-500">1 saat önce</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 border-b border-gray-100 pb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Bell className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Su kesintisi duyurusu oluşturuldu</p>
                    <p className="text-xs text-gray-500">3 saat önce</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Mehmet Yılmaz, B-105'e sakin olarak eklendi</p>
                    <p className="text-xs text-gray-500">1 gün önce</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Son Duyurular */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Son Duyurular</h2>
                <Link to="/duyurular" className="text-sm text-blue-600 hover:text-blue-800">Tümünü Gör</Link>
              </div>
              
              {duyurularYukleniyor ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : sonDuyurular.length > 0 ? (
                <div className="space-y-3">
                  {sonDuyurular.slice(0, 3).map((duyuru) => (
                    <Link 
                      to={`/duyuru/${duyuru.id}`}
                      key={duyuru.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div className="flex items-center">
                        {duyuru.tip === 'onemli' && (
                          <div className="w-2 h-2 rounded-full bg-red-500 mr-3"></div>
                        )}
                        {duyuru.tip === 'etkinlik' && (
                          <div className="w-2 h-2 rounded-full bg-blue-500 mr-3"></div>
                        )}
                        {duyuru.tip === 'genel' && (
                          <div className="w-2 h-2 rounded-full bg-green-500 mr-3"></div>
                        )}
                        <div>
                          <p className="text-sm font-medium">{duyuru.baslik}</p>
                          <p className="text-xs text-gray-500">{new Date(duyuru.tarih).toLocaleDateString('tr-TR')}</p>
                        </div>
                      </div>
                      <span className="text-blue-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Henüz duyuru bulunmuyor.
                  <div className="mt-2">
                    <Link to="/duyuru-olustur" className="text-blue-600 hover:underline">Yeni duyuru oluştur</Link>
                  </div>
                </div>
              )}
            </div>
            
            {/* Yaklaşan Ödemeler */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Yaklaşan Ödemeler</h2>
                <button className="text-sm text-blue-600 hover:text-blue-800">Tümünü Gör</button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Elektrik Faturası</p>
                    <p className="text-xs text-gray-500">Son Ödeme: 15 Ekim 2025</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">3,250₺</p>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Su Faturası</p>
                    <p className="text-xs text-gray-500">Son Ödeme: 20 Ekim 2025</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">1,850₺</p>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Doğalgaz Faturası</p>
                    <p className="text-xs text-gray-500">Son Ödeme: 25 Ekim 2025</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">2,750₺</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Menu Paneli */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Yönetim Paneli
            </h2>
            <p className="text-gray-600 mb-6">
              Apartman yönetim işlemlerinizi buradan gerçekleştirebilirsiniz.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuItems.slice(1, -1).map((item, index) => (
                <button
                  key={index}
                  onClick={() => navigate(item.path)}
                  className="p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:shadow-lg transition-all group"
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors">
                      {React.cloneElement(item.icon, { 
                        className: 'h-6 w-6 text-gray-600 group-hover:text-green-600' 
                      })}
                    </div>
                    <span className="font-medium text-gray-900 group-hover:text-green-600">
                      {item.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default YoneticiDashboard;