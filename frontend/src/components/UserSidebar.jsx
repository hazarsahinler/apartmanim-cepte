import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, Bell, User, CreditCard, FileText, 
  MessageSquare, Calendar, Settings, LogOut,
  ChevronRight
} from 'lucide-react';
import { authService } from '../services/authService';

const UserSidebar = ({ isOpen = true, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    authService.logout();
    navigate('/giris');
  };

  // Kullanıcı rolünü al ve ana sayfa path'ini belirle
  const getHomePath = () => {
    try {
      const decodedToken = authService.decodeToken();
      const userRole = decodedToken?.roles?.[0] || decodedToken?.apartmanRol;
      
      // Yönetici rolleri için site yönetimi sayfası
      if (userRole === 'ROLE_YONETICI' || userRole === 'ApartmanYonetici' || userRole === 'Yonetici') {
        return '/site-yonetimi';
      }
      
      // Apartman sakinleri için kullanıcı sayfası
      if (userRole === 'ROLE_APARTMANSAKIN' || userRole === 'ApartmanSakin' || userRole === 'Sakin') {
        return '/kullanici-sayfasi';
      }
      
      // Varsayılan olarak kullanıcı sayfası
      return '/kullanici-sayfasi';
    } catch (error) {
      console.error('UserSidebar - Role belirleme hatası:', error);
      return '/kullanici-sayfasi';
    }
  };

  // Kullanıcı menü öğeleri - apartman sakinleri için uygun
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Ana Sayfa',
      icon: Home,
      path: getHomePath(),
      description: 'Ana sayfa'
    },
    {
      id: 'announcements',
      label: 'Duyurular',
      icon: Bell,
      path: '/duyurular',
      description: 'Apartman duyurularını görüntüle'
    },
    {
      id: 'daire-secimi',
      label: 'Daire Değiştir',
      icon: Settings,
      path: '/kullanici-daire-secimi',
      description: 'Farklı bir daire seç'
    },
    {
      id: 'profile',
      label: 'Profil',
      icon: User,
      path: '/profil',
      description: 'Kişisel bilgilerimi düzenle'
    },
    {
      id: 'payments',
      label: 'Aidat Bilgilerim',
      icon: CreditCard,
      path: '/aidat-bilgilerim',
      description: 'Aidat ödemelerimi görüntüle'
    },
    {
      id: 'documents',
      label: 'Belgelerim',
      icon: FileText,
      path: '/belgelerim',
      description: 'Apartman belgeleri'
    },
    {
      id: 'requests',
      label: 'Talep ve Şikayetler',
      icon: MessageSquare,
      path: '/taleplerim',
      description: 'Yönetime gönderdiğim talepler'
    },
    {
      id: 'events',
      label: 'Etkinlikler',
      icon: Calendar,
      path: '/etkinlikler',
      description: 'Apartman etkinlikleri'
    },
    {
      id: 'settings',
      label: 'Ayarlar',
      icon: Settings,
      path: '/ayarlar',
      description: 'Uygulama ayarları'
    }
  ];

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <div className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-30 flex flex-col shadow-lg transform transition-transform duration-300 lg:translate-x-0 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    } lg:block`}
         id="user-sidebar">
      {/* Mobile Overlay */}
      {isOpen && onClose && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar Header */}
      <div className="p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 lg:w-10 h-8 lg:h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <User className="w-4 lg:w-6 h-4 lg:h-6 text-white" />
          </div>
          <div>
            <h2 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
              Sakin Paneli
            </h2>
            <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">
              Apartman İşlemleri
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-3 lg:p-4 space-y-1 lg:space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActivePath(item.path);
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center justify-between px-3 lg:px-4 py-2 lg:py-3 rounded-lg text-left transition-all duration-200 group ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
              }`}
              title={item.description}
            >
              <div className="flex items-center space-x-2 lg:space-x-3">
                <Icon 
                  className={`w-4 lg:w-5 h-4 lg:h-5 transition-colors ${
                    isActive 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                  }`} 
                />
                <span className="font-medium text-xs lg:text-sm">
                  {item.label}
                </span>
              </div>
              {isActive && (
                <ChevronRight className="w-3 lg:w-4 h-3 lg:h-4 text-blue-600 dark:text-blue-400" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 lg:p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-2 lg:space-x-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 group"
        >
          <LogOut className="w-4 lg:w-5 h-4 lg:h-5" />
          <span className="font-medium text-xs lg:text-sm">Çıkış Yap</span>
        </button>
      </div>
    </div>
  );
};

export default UserSidebar;