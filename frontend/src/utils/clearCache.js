// Cache temizleme utility fonksiyonları

export const clearAllCache = () => {
  try {
    // Tüm localStorage'ı temizle
    localStorage.clear();
    
    // Session storage'ı da temizle
    sessionStorage.clear();
    
    return true;
  } catch (error) {
    return false;
  }
};

export const clearAppSpecificCache = () => {
  try {
    // Uygulama özelinde kullanılan key'leri temizle
    const keysToRemove = [
      'token',
      'user',
      'userSites',
      'test_sites',
      'userSitesMapping',
      'hasCleanedTestData'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    return true;
  } catch (error) {
    return false;
  }
};

// Debug fonksiyonu (production'da kullanılmamalı)
export const debugLocalStorage = () => {
  // Production'da debug devre dışı
  if (process.env.NODE_ENV === 'production') return;
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    localStorage.getItem(key);
  }
};
