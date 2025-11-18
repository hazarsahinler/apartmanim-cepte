import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, Calendar, Edit3, Save, X, Loader2, Menu, Sun, Moon, LogOut, ArrowLeft } from 'lucide-react';
import { authService } from '../services/authService';
import Sidebar from '../components/Sidebar';
import UserSidebar from '../components/UserSidebar';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

const ProfilSayfasi = () => {
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Kullanıcının rolüne göre uygun sidebar'ı belirle
  const isApartmentResident = () => {
    const residentRoles = ['ROLE_APARTMANSAKIN', 'ApartmanSakin', 'Sakin', 'APARTMANSAKIN'];
    return residentRoles.includes(userRole);
  };

  const renderSidebar = () => {
    if (isApartmentResident()) {
      return <UserSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />;
    } else {
      return <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />;
    }
  };

  const handleLogout = () => {
    if (window.confirm('Çıkış yapmak istediğinize emin misiniz?')) {
      authService.logout();
    }
  };

  const getHomePath = () => {
    if (isApartmentResident()) {
      return '/kullanici-sayfasi';
    }
    return '/site-yonetimi';
  };

  const getUserRoleDisplay = () => {
    if (isApartmentResident()) {
      return 'Apartman Sakin';
    }
    return 'Site Yöneticisi';
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setLoading(true);
        const user = await authService.getUserInfo();
        setUserInfo(user);
        
        // Kullanıcı rolünü belirle - daha detaylı kontrol
        const decodedToken = authService.decodeToken();
        let role = user.apartmanRol || decodedToken?.apartmanRol;
        
        // Token'daki roles array'ini de kontrol et
        if (!role && decodedToken.roles && decodedToken.roles.length > 0) {
          role = decodedToken.roles[0];
        }
        
        console.log('ProfilSayfasi - Belirlenen rol:', role);
        console.log('ProfilSayfasi - User apartmanRol:', user.apartmanRol);
        console.log('ProfilSayfasi - Token roles:', decodedToken.roles);
        
        setUserRole(role);
        
        setEditForm({
          kullaniciAdi: user.kullaniciAdi || '',
          kullaniciSoyadi: user.kullaniciSoyadi || '',
          kullaniciEposta: user.kullaniciEposta || '',
          kullaniciTelefon: user.kullaniciTelefon || ''
        });
      } catch (err) {
        console.error('Kullanıcı bilgileri yüklenirken hata:', err);
        setError('Kullanıcı bilgileri yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const handleEdit = () => {
    setEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setEditing(false);
    setEditForm({
      kullaniciAdi: userInfo.kullaniciAdi || '',
      kullaniciSoyadi: userInfo.kullaniciSoyadi || '',
      kullaniciEposta: userInfo.kullaniciEposta || '',
      kullaniciTelefon: userInfo.kullaniciTelefon || ''
    });
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // TODO: Profil güncelleme API'si eklendiğinde buraya yazılacak
      // const updatedUser = await authService.updateProfile(editForm);
      
      // Şimdilik local state'i güncelliyoruz
      setUserInfo(prev => ({
        ...prev,
        ...editForm
      }));
      
      setEditing(false);
      
      // Başarı mesajı göstermek için
      alert('Profil bilgileri güncellendi!');
    } catch (err) {
      console.error('Profil güncellenirken hata:', err);
      setError('Profil güncellenirken bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {/* Loading Header */}
        <nav className="bg-white dark:bg-gray-800 shadow-md fixed w-full top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center mr-3">
                  <User className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">Profilim</span>
              </div>
            </div>
          </div>
        </nav>
        
        <div className="pt-16 flex justify-center items-center h-screen">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-green-500 animate-spin" />
            <span className="mt-4 text-gray-600 dark:text-gray-300">Profil bilgileri yükleniyor...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error && !userInfo) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {/* Error Header */}
        <nav className="bg-white dark:bg-gray-800 shadow-md fixed w-full top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center mr-3">
                  <User className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">Profilim</span>
              </div>
            </div>
          </div>
        </nav>
        
        <div className="pt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
              <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg relative" role="alert">
                <strong className="font-bold">Hata!</strong>
                <span className="block sm:inline ml-2">{error}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Top Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-md fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Menu className="h-6 w-6" />
              </button>
              
              <button
                onClick={() => navigate(getHomePath())}
                className="hidden lg:block p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mr-2"
                title="Ana Sayfaya Dön"
              >
                <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              </button>
              
              <div className="flex items-center ml-2 lg:ml-0">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center mr-3">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
                    Profilim
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                    Hesap bilgilerinizi düzenleyin
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
                    {userInfo?.kullaniciAdi} {userInfo?.kullaniciSoyadi}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {isApartmentResident() ? 'Sakin' : 'Yönetici'}
                  </p>
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
      
      {/* Sidebar - Kullanıcı rolüne göre dinamik */}
      {renderSidebar()}
      
      {/* Main Content */}
      <div className="pt-16 lg:pl-64">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profilim</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Hesap bilgilerinizi görüntüleyin ve düzenleyin
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            {/* Profile Card */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-blue-600 to-green-500 px-6 py-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                      <User className="h-10 w-10 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h2 className="text-2xl font-bold text-white">
                        {userInfo?.kullaniciAdi} {userInfo?.kullaniciSoyadi}
                      </h2>
                      <p className="text-blue-100">{getUserRoleDisplay()}</p>
                    </div>
                  </div>
                  
                  {!editing && (
                    <button
                      onClick={handleEdit}
                      className="inline-flex items-center px-4 py-2 bg-white text-blue-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Düzenle
                    </button>
                  )}
                </div>
              </div>

              {/* Profile Content */}
              <div className="p-6">
                {editing ? (
                  /* Edit Form */
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Ad
                        </label>
                        <input
                          type="text"
                          name="kullaniciAdi"
                          value={editForm.kullaniciAdi}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Adınızı girin"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Soyad
                        </label>
                        <input
                          type="text"
                          name="kullaniciSoyadi"
                          value={editForm.kullaniciSoyadi}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Soyadınızı girin"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        E-posta
                      </label>
                      <input
                        type="email"
                        name="kullaniciEposta"
                        value={editForm.kullaniciEposta}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="E-posta adresinizi girin"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Telefon
                      </label>
                      <input
                        type="tel"
                        name="kullaniciTelefon"
                        value={editForm.kullaniciTelefon}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Telefon numaranızı girin"
                      />
                    </div>

                    {/* Edit Actions */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={handleCancel}
                        disabled={saving}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <X className="h-4 w-4 mr-2" />
                        İptal
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white text-sm font-medium rounded-lg transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        {saving ? 'Kaydediliyor...' : 'Kaydet'}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <User className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Ad</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {userInfo?.kullaniciAdi || 'Belirtilmemiş'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <User className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Soyad</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {userInfo?.kullaniciSoyadi || 'Belirtilmemiş'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Mail className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">E-posta</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {userInfo?.kullaniciEposta || 'Belirtilmemiş'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Phone className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Telefon</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {userInfo?.kullaniciTelefon || 'Belirtilmemiş'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Üyelik Tarihi</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {userInfo?.kayitTarihi 
                            ? new Date(userInfo.kayitTarihi).toLocaleDateString('tr-TR')
                            : 'Bilinmiyor'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Info Card */}
            <div className="mt-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Hesap İstatistikleri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                    {userInfo?.toplamSite || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Yönetilen Site</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-300">
                    {userInfo?.toplamDuyuru || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Toplam Duyuru</div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-300">
                    {userInfo?.aktifOturum ? 'Aktif' : 'Pasif'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Oturum Durumu</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilSayfasi;