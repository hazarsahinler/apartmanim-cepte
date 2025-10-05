import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home, Users, FileText, Building, Calendar, CreditCard, Settings,
  BarChart2, MessageSquare, ChevronDown, ChevronRight, Inbox
} from 'lucide-react';
import { authService } from '../services/authService';

const Sidebar = ({ isOpen }) => {
  const [activeMenu, setActiveMenu] = useState('');
  const [user, setUser] = useState(null);
  const [siteler, setSiteler] = useState([]);
  const location = useLocation();

  // Menü öğeleri
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Ana Sayfa',
      icon: <Home size={20} />,
      path: '/yonetici-dashboard',
    },
    {
      id: 'sites',
      label: 'Sitelerim',
      icon: <Building size={20} />,
      path: '/site-yonetimi',
      hasSubmenu: true,
      submenu: siteler.map(site => ({
        id: `site-${site.id}`,
        label: site.adi || site.siteName || 'İsimsiz Site',
        path: `/site-panel/${site.id}`,
      }))
    },
    {
      id: 'announcements',
      label: 'Duyurular',
      icon: <Inbox size={20} />,
      path: '/duyurular',
    },
    {
      id: 'residents',
      label: 'Site Sakinleri',
      icon: <Users size={20} />,
      path: '/site-sakinleri',
    },
    {
      id: 'payments',
      label: 'Aidat ve Ödemeler',
      icon: <CreditCard size={20} />,
      path: '/aidat-yonetimi',
    },
    {
      id: 'expenses',
      label: 'Giderler',
      icon: <FileText size={20} />,
      path: '/giderler',
    },
    {
      id: 'calendar',
      label: 'Takvim',
      icon: <Calendar size={20} />,
      path: '/takvim',
    },
    {
      id: 'stats',
      label: 'İstatistikler',
      icon: <BarChart2 size={20} />,
      path: '/istatistikler',
    },
    {
      id: 'messages',
      label: 'Mesajlar',
      icon: <MessageSquare size={20} />,
      path: '/mesajlar',
      badge: 2 // Yeni mesaj sayısı
    },
    {
      id: 'settings',
      label: 'Ayarlar',
      icon: <Settings size={20} />,
      path: '/ayarlar',
    }
  ];

  useEffect(() => {
    // Kullanıcı bilgilerini getir
    const userData = authService.getCurrentUser();
    if (userData) {
      setUser(userData);

      // Kullanıcının sitelerini kontrol et
      if (userData.sites) {
        setSiteler(userData.sites);
      } else if (userData.siteler) {
        setSiteler(userData.siteler);
      } else if (localStorage.getItem('kullaniciSiteleri')) {
        // Lokalden siteleri oku
        try {
          const storedSites = JSON.parse(localStorage.getItem('kullaniciSiteleri'));
          if (Array.isArray(storedSites)) {
            setSiteler(storedSites);
          }
        } catch (error) {
          console.error('Site bilgileri yüklenemedi:', error);
        }
      }
    }

    // Aktif menüyü belirle
    const pathSegments = location.pathname.split('/');
    const rootPath = '/' + pathSegments[1];
    if (pathSegments[1] === 'site-panel' && pathSegments[2]) {
      setActiveMenu('sites');
    } else {
      const menuItem = menuItems.find(item => item.path === rootPath);
      setActiveMenu(menuItem ? menuItem.id : '');
    }
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Menü öğesine tıklandığında
  const toggleSubmenu = (menuId) => {
    if (activeMenu === menuId) {
      setActiveMenu('');
    } else {
      setActiveMenu(menuId);
    }
  };

  // Menü öğesinin aktif olup olmadığını kontrol et
  const isMenuActive = (menuId, path) => {
    if (menuId === 'sites' && location.pathname.includes('/site-panel')) {
      return true;
    }
    return location.pathname === path;
  };

  // Alt menü öğesinin aktif olup olmadığını kontrol et
  const isSubmenuActive = (path) => {
    return location.pathname === path;
  };

  return (
    <aside 
      className={`fixed left-0 top-16 h-full bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ease-in-out z-40
        ${isOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full sm:w-16 sm:translate-x-0'}`}
    >
      <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
        <div className={`py-4 ${!isOpen && 'hidden sm:block'}`}>
          {/* Kullanıcı bilgileri - sadece açık durumda veya büyük ekranlarda göster */}
          {isOpen && (
            <div className="px-4 py-2 mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {user && user.kullaniciAdi ? user.kullaniciAdi.charAt(0) : 'K'}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-800 dark:text-white">
                    {user ? `${user.kullaniciAdi} ${user.kullaniciSoyadi || ''}` : 'Kullanıcı'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.rol || user?.ApartmanRol || 'Yönetici'}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Ana menü */}
          <nav className="mt-1">
            <ul>
              {menuItems.map((item) => (
                <li key={item.id} className="px-2 py-1">
                  {/* Ana menü öğesi */}
                  {item.hasSubmenu ? (
                    <button
                      onClick={() => toggleSubmenu(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-all
                        ${isMenuActive(item.id, item.path) 
                          ? 'bg-green-100 dark:bg-green-800/30 text-green-600 dark:text-green-400' 
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
                    >
                      <div className="flex items-center">
                        <span className={`${!isOpen && 'mx-auto'}`}>{item.icon}</span>
                        {isOpen && <span className="ml-3 text-sm font-medium">{item.label}</span>}
                      </div>
                      
                      {isOpen && (
                        <>
                          {activeMenu === item.id ? (
                            <ChevronDown size={16} />
                          ) : (
                            <ChevronRight size={16} />
                          )}
                        </>
                      )}
                    </button>
                  ) : (
                    <Link
                      to={item.path}
                      className={`flex items-center justify-between px-3 py-2 rounded-md transition-all
                        ${isMenuActive(item.id, item.path) 
                          ? 'bg-green-100 dark:bg-green-800/30 text-green-600 dark:text-green-400' 
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
                    >
                      <div className="flex items-center">
                        <span className={`${!isOpen && 'mx-auto'}`}>{item.icon}</span>
                        {isOpen && <span className="ml-3 text-sm font-medium">{item.label}</span>}
                      </div>
                      {isOpen && item.badge && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                      
                      {/* Rozet - sadece küçük ekranlarda ve kapalı durumdayken göster */}
                      {!isOpen && item.badge && (
                        <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                      )}
                    </Link>
                  )}
                  
                  {/* Alt menü */}
                  {item.hasSubmenu && isOpen && activeMenu === item.id && (
                    <ul className="pl-8 mt-1 space-y-1">
                      {(item.submenu || []).map((subItem) => (
                        <li key={subItem.id}>
                          <Link
                            to={subItem.path}
                            className={`flex items-center px-3 py-1.5 rounded-md text-sm 
                              ${isSubmenuActive(subItem.path) 
                                ? 'bg-green-100 dark:bg-green-800/30 text-green-600 dark:text-green-400' 
                                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
                          >
                            <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full mr-2"></span>
                            {subItem.label}
                          </Link>
                        </li>
                      ))}
                      
                      {/* Yeni site ekle */}
                      <li>
                        <Link
                          to="/site-yonetimi"
                          className="flex items-center px-3 py-1.5 rounded-md text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                        >
                          <span className="w-4 h-4 flex items-center justify-center mr-1">+</span>
                          Yeni Site Ekle
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;