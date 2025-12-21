import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Bell, LogOut, User } from 'lucide-react';
import { authService } from '../services/authService';

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (token) {
          try {
            const userData = await authService.getUserInfo();
            setUser(userData);
          } catch (error) {
            console.error('Kullanıcı bilgileri alınırken hata:', error);
            // Token geçersizse localStorage'ı temizle
            if (error.message?.includes('Oturum süreniz dolmuş') || 
                error.response?.status === 401 || 
                error.response?.status === 403) {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
            }
          }
        }
      } catch (error) {
        console.error('Auth kontrol hatası:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <Home className="h-6 w-6 text-green-600" />
              <span className="font-bold text-xl text-gray-800">Apartman'ım Cepte</span>
            </Link>

            {/* Ana Navigasyon Linkleri */}
            <div className="hidden md:flex ml-10 space-x-8">
              <Link to="/site-yonetimi" className="text-gray-600 hover:text-green-600 px-3 py-2 text-sm font-medium">
                Duyuru Yönetimi
              </Link>
              {user && (
                <Link to="/site-yonetimi" className="text-gray-600 hover:text-green-600 px-3 py-2 text-sm font-medium">
                  Site Yönetimi
                </Link>
              )}
            </div>
          </div>

          {/* Sağ Taraf - Kullanıcı Menüsü veya Giriş Butonu */}
          <div className="flex items-center space-x-4">
            {/* Geçici: loading kontrolünü kaldırdık */}
            <>
              {user ? (
                  <div className="relative">
                    <button
                      onClick={toggleMenu}
                      className="flex items-center space-x-2 focus:outline-none"
                      aria-expanded={isMenuOpen}
                      aria-haspopup="true"
                    >
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                      <span className="hidden md:block text-sm font-medium text-gray-700">
                        {user.adSoyad || 'Kullanıcı'}
                      </span>
                    </button>

                    {/* Dropdown Menü */}
                    {isMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                        <div className="px-4 py-2 text-xs text-gray-500">
                          {user.rol === 'YONETICI' ? 'Yönetici' : 'Kullanıcı'}
                        </div>
                        <Link
                          to="/duyurular"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="flex items-center">
                            <Bell className="h-4 w-4 mr-2" />
                            <span>Duyurular</span>
                          </div>
                        </Link>
                        {user.rol === 'YONETICI' && (
                          <Link
                            to="/site-yonetimi"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <div className="flex items-center">
                              <Bell className="h-4 w-4 mr-2" />
                              <span>Duyuru Yönetimi</span>
                            </div>
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            handleLogout();
                            setIsMenuOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <div className="flex items-center">
                            <LogOut className="h-4 w-4 mr-2" />
                            <span>Çıkış Yap</span>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to="/giris"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Giriş Yap
                  </Link>
                )}
              </>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;