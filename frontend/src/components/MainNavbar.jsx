import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, X, User, Bell, Settings, LogOut, ChevronDown, 
  Building2, Moon, Sun, HelpCircle
} from 'lucide-react';
import { authService } from '../services/authService';
import { odemeIstekService } from '../services/odemeIstekService';
import { toast } from 'react-toastify';
import { useTheme } from '../contexts/ThemeContext';

const MainNavbar = ({ toggleUserSidebar, isUserSidebarOpen }) => {
  const [user, setUser] = useState(null);
  const { darkMode, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [bekleyenOdemeVarMi, setBekleyenOdemeVarMi] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // URL'den siteId'yi çıkar
  const getSiteIdFromUrl = () => {
    const match = location.pathname.match(/\/site-panel\/(\d+)|\/duyuru-yonetimi\/(\d+)|\/finansal-islemler\/(\d+)/);
    return match ? (match[1] || match[2] || match[3]) : null;
  };

  useEffect(() => {
    const loadUser = async () => {
      const userData = authService.getCurrentUser();
      if (userData) {
        setUser(userData);
      } else {
        // Kullanıcı bilgisi yoksa API'den çekmeyi dene
        try {
          await authService.getUserInfo();
          const refreshedUser = authService.getCurrentUser();
          setUser(refreshedUser);
        } catch (error) {
          console.error('Kullanıcı bilgileri yüklenemedi:', error);
        }
      }
    };

    loadUser();
  }, []);

  // Ödeme isteklerini kontrol et
  useEffect(() => {
    const checkOdemeIstekleri = async () => {
      const siteId = getSiteIdFromUrl();
      if (!siteId) {
        setBekleyenOdemeVarMi(false);
        return;
      }

      try {
        const istekler = await odemeIstekService.getSiteOdemeIstekleri(siteId);
        // Bekleyen (ONAY_BEKLIYOR) ödeme istekleri var mı kontrol et
        const bekleyenVar = Array.isArray(istekler) && istekler.some(
          istek => istek.odemeIstekDurum === 'ONAY_BEKLIYOR' || istek.durumu === 'Beklemede'
        );
        setBekleyenOdemeVarMi(bekleyenVar);
      } catch (error) {
        console.error('Ödeme istekleri kontrol hatası:', error);
        setBekleyenOdemeVarMi(false);
      }
    };

    checkOdemeIstekleri();
  }, [location.pathname]);

  const handleLogout = () => {
    authService.logout();
    navigate('/giris');
  };

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const closeDropdown = () => setDropdownOpen(false);

  const isDashboard = location.pathname.includes('/dashboard') || 
                    location.pathname.includes('/site-yonetimi') || 
                    location.pathname.includes('/site-panel') ||
                    location.pathname.includes('/blok-detay') ||
                    location.pathname.includes('/daire-detay') ||
                    location.pathname.includes('/finansal-islemler') ||
                    location.pathname.includes('/finansal-alacak-yonetimi') ||
                    location.pathname.includes('/finansal-gider-yonetimi') ||
                    location.pathname.includes('/duyurular') ||
                    location.pathname.includes('/duyuru-yonetimi') ||
                    location.pathname.includes('/duyuru-ekleme') ||
                    location.pathname.includes('/duyuru-listesi');

  // Sadece dashboard sayfalarında nav ve sidebar göster
  if (!isDashboard) return null;

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md fixed w-full top-0 z-50 transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            {/* Hamburger Menu Button - Mobile Only */}
            {(toggleUserSidebar) && (
              <button
                onClick={toggleUserSidebar}
                className="lg:hidden mr-3 p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {isUserSidebarOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            )}
            
            {/* Logo */}
            <Link to="/site-yonetimi" className="flex-shrink-0 flex items-center">
              <Building2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              <span className="ml-2 text-lg font-semibold text-gray-800 dark:text-white">Apartmanım<span className="text-green-600 dark:text-green-400">Cepte</span></span>
            </Link>
          </div>
          
          {/* Sağ taraf menüsü */}
          <div className="flex items-center">
            {/* Tema değiştirme butonu */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              aria-label={darkMode ? "Açık temaya geç" : "Koyu temaya geç"}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {/* Bildirimler - Sadece siteId varsa göster */}
            {getSiteIdFromUrl() && (
              <button 
                onClick={() => {
                  const siteId = getSiteIdFromUrl();
                  navigate(`/odeme-istekleri/${siteId}`);
                }}
                className="ml-2 p-2 rounded-md text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none relative"
                aria-label="Bildirimler"
              >
                <Bell size={20} />
                {bekleyenOdemeVarMi && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
            )}
            
            {/* Profil dropdown */}
            <div className="ml-3 relative">
              <div>
                <button 
                  onClick={toggleDropdown} 
                  className="flex items-center space-x-2 rounded-full focus:outline-none"
                >
                  <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center text-white text-sm font-medium overflow-hidden">
                    {user && user.kullaniciAdi ? (
                      user.kullaniciAdi.charAt(0) + (user.kullaniciSoyadi ? user.kullaniciSoyadi.charAt(0) : '')
                    ) : (
                      <User size={16} />
                    )}
                  </div>
                  <div className="hidden md:flex md:flex-col md:items-start">
                    <span className="text-sm font-medium text-gray-700 dark:text-white">
                      {user ? `${user.kullaniciAdi} ${user.kullaniciSoyadi || ''}` : 'Kullanıcı'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.ApartmanRol || 'Yönetici'}
                    </span>
                  </div>
                  <ChevronDown size={16} className="hidden md:block text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              
              {/* Dropdown menü */}
              {dropdownOpen && (
                <div 
                  className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none py-1"
                  onClick={closeDropdown}
                >
                  <Link 
                    to="/profil" 
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-center">
                      <User size={16} className="mr-3" />
                      Profilim
                    </div>
                  </Link>
                  <Link 
                    to="/ayarlar" 
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-center">
                      <Settings size={16} className="mr-3" />
                      Ayarlar
                    </div>
                  </Link>
                  <Link 
                    to="/yardim" 
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-center">
                      <HelpCircle size={16} className="mr-3" />
                      Yardım
                    </div>
                  </Link>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-center">
                      <LogOut size={16} className="mr-3" />
                      Çıkış Yap
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default MainNavbar;