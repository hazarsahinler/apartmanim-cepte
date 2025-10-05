import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { siteStorageService } from '../services/siteStorageService';
import { authService } from '../services/authService';
import { Wifi, WifiOff, Database, RefreshCw, Save, CheckCircle, XCircle } from 'lucide-react';

const TestPage = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cachedSites, setCachedSites] = useState([]);
  const [user, setUser] = useState(null);
  const [testSite, setTestSite] = useState({
    siteIsmi: 'Test Sitesi',
    siteIl: 'İstanbul',
    siteIlce: 'Kadıköy',
    siteMahalle: 'Test Mah',
    siteSokak: 'Test Sk'
  });

  // Çevrimiçi durumu izle
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Kullanıcıyı yükle
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);

    // Önbellekteki siteleri yükle
    if (currentUser?.id) {
      const { sites } = siteStorageService.getSites(currentUser.id);
      setCachedSites(sites || []);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Önbellekteki siteleri güncelle
  const updateCachedSites = () => {
    if (user?.id) {
      const { sites } = siteStorageService.getSites(user.id);
      setCachedSites(sites || []);
    }
  };

  // Çevrimiçi durumunu manuel olarak değiştir (test için)
  const toggleNetworkStatus = () => {
    // Bu sadece görsel bir simülasyondur, gerçekte ağ bağlantısını değiştirmez
    setIsOnline(!isOnline);
    
    if (!isOnline) {
      toast.success('Çevrimiçi moda geçildi (simülasyon)', {
        position: "top-right",
        autoClose: 3000
      });
    } else {
      toast.warning('Çevrimdışı moda geçildi (simülasyon)', {
        position: "top-right",
        autoClose: 3000
      });
    }
  };

  // Test sitesi oluştur
  const createTestSite = () => {
    if (user?.id) {
      const newSite = {
        ...testSite,
        id: `test_${Date.now()}`,
        _testData: true,
        _createdAt: new Date().toISOString()
      };

      // Site önbelleğe ekle
      const success = siteStorageService.addSite(newSite, user.id);
      
      if (success) {
        toast.success('Test sitesi önbelleğe eklendi!', {
          position: "top-center", 
          autoClose: 3000
        });
        
        // Site listesini güncelle
        updateCachedSites();
        
        // Form alanını temizle
        setTestSite({
          siteIsmi: `Test Sitesi ${Math.floor(Math.random() * 100)}`,
          siteIl: 'İstanbul',
          siteIlce: 'Kadıköy',
          siteMahalle: 'Test Mah',
          siteSokak: 'Test Sk'
        });
      } else {
        toast.error('Site önbelleğe eklenirken bir hata oluştu!', {
          position: "top-center"
        });
      }
    } else {
      toast.error('Kullanıcı girişi yapmalısınız!', {
        position: "top-center"
      });
    }
  };

  // Önbelleği temizle
  const clearCache = () => {
    if (user?.id) {
      siteStorageService.clearUserSiteData(user.id);
      toast.info('Kullanıcı site önbelleği temizlendi', {
        position: "top-right"
      });
      updateCachedSites();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTestSite({
      ...testSite,
      [name]: value
    });
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Çevrimdışı Özellik Test Sayfası</h1>
      
      {/* Ağ Durumu */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
          Ağ Durumu
        </h2>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {isOnline ? (
              <Wifi className="h-6 w-6 text-green-500 mr-2" />
            ) : (
              <WifiOff className="h-6 w-6 text-red-500 mr-2" />
            )}
            <span className="text-lg font-medium">
              {isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}
            </span>
          </div>
          
          <button 
            onClick={toggleNetworkStatus}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            Durumu Değiştir (Test)
          </button>
        </div>
      </div>
      
      {/* Kullanıcı Bilgileri */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Kullanıcı Bilgileri</h2>
        
        {user ? (
          <div>
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Ad Soyad:</strong> {user.kullaniciAdi} {user.kullaniciSoyadi}</p>
            <p><strong>E-posta:</strong> {user.kullaniciEposta}</p>
          </div>
        ) : (
          <p className="text-red-500">Giriş yapılmamış!</p>
        )}
      </div>
      
      {/* Site Önbellek Testi */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Database className="h-5 w-5 mr-2 text-blue-500" />
          Site Önbelleği
        </h2>
        
        <div className="mb-4">
          <button 
            onClick={updateCachedSites}
            className="mr-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Önbelleği Yenile
          </button>
          
          <button 
            onClick={clearCache}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 mt-2"
          >
            Önbelleği Temizle
          </button>
        </div>
        
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Önbellekteki Siteler ({cachedSites.length})</h3>
          
          {cachedSites.length > 0 ? (
            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Site İsmi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Konum</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test?</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cachedSites.map(site => (
                    <tr key={site.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{site.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{site.siteIsmi}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{site.siteIl}, {site.siteIlce}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {site._testData ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-300" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">Önbellekte site bulunamadı.</p>
          )}
        </div>
      </div>
      
      {/* Yeni Test Sitesi Oluştur */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Save className="h-5 w-5 mr-2 text-purple-500" />
          Test Sitesi Oluştur
        </h2>
        
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Site İsmi</label>
            <input 
              type="text" 
              name="siteIsmi"
              value={testSite.siteIsmi}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">İl</label>
              <input 
                type="text" 
                name="siteIl"
                value={testSite.siteIl}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">İlçe</label>
              <input 
                type="text" 
                name="siteIlce"
                value={testSite.siteIlce}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mahalle</label>
              <input 
                type="text" 
                name="siteMahalle"
                value={testSite.siteMahalle}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sokak</label>
              <input 
                type="text" 
                name="siteSokak"
                value={testSite.siteSokak}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <button 
            type="button"
            onClick={createTestSite}
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-300 flex items-center justify-center"
          >
            <Save className="h-5 w-5 mr-2" />
            Test Sitesini Önbelleğe Ekle
          </button>
        </form>
      </div>
    </div>
  );
};

export default TestPage;