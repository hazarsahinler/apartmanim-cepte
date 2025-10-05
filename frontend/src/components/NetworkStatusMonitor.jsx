import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

/**
 * NetworkStatusMonitor bileşeni
 * Kullanıcının ağ bağlantı durumunu takip eder ve arayüzde görsel bir gösterge sağlar
 */
const NetworkStatusMonitor = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineNotice, setShowOfflineNotice] = useState(false);
  const [showReconnectedNotice, setShowReconnectedNotice] = useState(false);

  useEffect(() => {
    // Çevrimiçi/çevrimdışı durum değişikliklerini dinle
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnectedNotice(true);
      // 5 saniye sonra bildirimi kapat
      setTimeout(() => setShowReconnectedNotice(false), 5000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineNotice(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Çevrimdışı bildirimi kapat
  const handleCloseOfflineNotice = () => {
    setShowOfflineNotice(false);
  };

  // Çevrimdışı modda bildirimi gösteriyoruz
  if (!isOnline && showOfflineNotice) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-red-500 text-white p-3 shadow-lg z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <WifiOff className="h-5 w-5 mr-2" />
            <span className="font-medium">İnternet bağlantısı yok!</span>
            <span className="ml-2 text-sm hidden sm:inline">
              Bazı işlemler sınırlı olabilir. Verileriniz cihazınıza kaydedilecek ve bağlantı sağlandığında otomatik olarak senkronize edilecektir.
            </span>
          </div>
          <button 
            onClick={handleCloseOfflineNotice}
            className="text-white hover:text-red-100 focus:outline-none"
            aria-label="Kapat"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // Bağlantı yeniden sağlandığında
  if (isOnline && showReconnectedNotice) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-green-500 text-white p-3 shadow-lg z-50 animate-slideUp">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Wifi className="h-5 w-5 mr-2" />
            <span className="font-medium">İnternet bağlantısı yeniden sağlandı!</span>
            <span className="ml-2 text-sm hidden sm:inline">
              Verileriniz otomatik olarak senkronize ediliyor...
            </span>
          </div>
          <button 
            onClick={() => setShowReconnectedNotice(false)}
            className="text-white hover:text-green-100 focus:outline-none"
            aria-label="Kapat"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // Statik gösterge - her zaman sağ alt köşede duran küçük bir ikon
  return (
    <div className="fixed bottom-4 right-4 z-40">
      {isOnline ? (
        <div className="bg-green-500 text-white p-2 rounded-full shadow-md" title="Çevrimiçi">
          <Wifi className="h-4 w-4" />
        </div>
      ) : (
        <div className="bg-red-500 text-white p-2 rounded-full shadow-md animate-pulse" title="Çevrimdışı">
          <WifiOff className="h-4 w-4" />
        </div>
      )}
    </div>
  );
};

export default NetworkStatusMonitor;