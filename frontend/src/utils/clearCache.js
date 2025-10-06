// Cache temizleme utility fonksiyonları

export const clearAllCache = () => {
  try {
    // Tüm localStorage'ı temizle
    localStorage.clear();
    
    // Session storage'ı da temizle
    sessionStorage.clear();
    
    console.log('Tüm cache temizlendi');
    return true;
  } catch (error) {
    console.error('Cache temizlenirken hata:', error);
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
    
    console.log('Uygulama cache\'i temizlendi');
    return true;
  } catch (error) {
    console.error('Uygulama cache temizlenirken hata:', error);
    return false;
  }
};

export const debugLocalStorage = () => {
  console.log('=== localStorage Debug ===');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    console.log(`${key}:`, value);
  }
  console.log('=== localStorage Debug End ===');
};