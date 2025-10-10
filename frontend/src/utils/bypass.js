// bypass.js
// Encoding hatalarını bypass eden ve mockData kullanan yardımcı fonksiyonlar

import { MOCK_DATA } from './mockData';
import { toast } from 'react-toastify';
import { siteStorageService } from '../services/siteStorageService';

/**
 * Kullanıcı sitelerini getirme hatalarını bypass eder
 * 
 * @param {Error} error Hata objesi
 * @param {Function} setSiteler Site state'ini set eden fonksiyon
 * @param {Number} userId Kullanıcı ID'si
 * @param {Array} cachedSites Önbellekteki siteler (opsiyonel)
 * @returns {Boolean} Bypass edildi mi?
 */
export const bypassSiteLoadingErrors = (error, setSiteler, userId, cachedSites = null) => {
  console.log('Site yükleme hatası bypass kontrol:', error);
  
  // Önbellekteki verileri kontrol et
  if (!cachedSites) {
    const cacheData = siteStorageService.getSites(userId);
    cachedSites = cacheData?.sites || [];
  }
  
  // Önbellekteki veriyi kullan
  if (cachedSites && cachedSites.length > 0) {
    console.log('Önbellekteki site verilerini kullanma');
    setSiteler(cachedSites);
    toast.warning('Sunucu bağlantı sorunu. Önbellekteki veriler gösteriliyor.', { 
      position: "bottom-right",
      autoClose: 4000
    });
    return true;
  }
  
  // Önbellekte veri yoksa mock data kullan
  console.log('Demo site verilerini kullanma');
  setSiteler(MOCK_DATA.sites);
  
  // Demo verileri önbelleğe kaydet
  siteStorageService.saveSites(MOCK_DATA.sites, userId);
  
  toast.info('Site verilerine erişilemiyor. Demo veriler gösteriliyor.', { 
    position: "top-center",
    autoClose: 5000
  });
  
  return true;
};

/**
 * Site ekleme hatalarını bypass eder
 * 
 * @param {Error} error Hata objesi
 * @param {Object} siteData Site verileri
 * @param {Number} userId Kullanıcı ID'si
 * @param {Function} onSuccess Başarı callback'i
 * @returns {Boolean} Bypass edildi mi?
 */
export const bypassSiteAddErrors = (error, siteData, userId, onSuccess) => {
  console.log('Site ekleme hatası bypass kontrol:', error);
  
  // Demo site objesi
  const demoSite = {
    id: new Date().getTime(),
    siteId: new Date().getTime(),
    siteIsmi: siteData.siteIsmi,
    siteIl: siteData.siteIl,
    siteIlce: siteData.siteIlce,
    siteMahalle: siteData.siteMahalle,
    siteSokak: siteData.siteSokak,
    _isDemo: true
  };
  
  // Önbelleğe ekle
  const cachedSites = siteStorageService.getSites(userId) || [];
  const updatedSites = [...cachedSites, demoSite];
  siteStorageService.saveSites(updatedSites, userId);
  
  toast.success('Site başarıyla eklendi! (Demo mod)', {
    position: "top-center",
    autoClose: 3000
  });
  
  // Callback ile demo site gönder
  if (onSuccess) {
    onSuccess(demoSite);
  }
  
  return true;
};

/**
 * Verilen hatanın bir chunked encoding hatası olup olmadığını kontrol eder
 * 
 * @param {Error} error Kontrol edilecek hata objesi
 * @returns {Boolean} Chunked encoding hatası mı?
 */
export const isChunkedEncodingError = (error) => {
  if (!error) return false;
  
  // Hata mesajı veya kodu kontrol
  return (
    (error.message && (
      error.message.includes('ERR_INCOMPLETE_CHUNKED_ENCODING') ||
      error.message.includes('INCOMPLETE_CHUNKED_ENCODING') ||
      error.message.includes('unexpected end of file') ||
      error.message.includes('network error')
    )) ||
    error.code === 'ERR_NETWORK' ||
    error.name === 'NetworkError' ||
    (error.response && error.response.status === 200 && error.code !== 'ECONNABORTED')
  );
};

/**
 * API hatası sonrası bypass işlemi yapar ve veriyi önbelleğe alır
 * 
 * @param {String} operationType İşlem türü ('addSite', 'getSites', 'updateSite', etc.)
 * @param {Object|Array} data Önbelleğe kaydedilecek veri
 * @param {Number} userId Kullanıcı ID
 * @returns {Object|Array} İşlenen veri
 */
export const handleBypassAndCache = (operationType, data, userId) => {
  console.log(`Bypass işlemi: ${operationType}`, data);
  
  switch (operationType) {
    case 'addSite': {
      // Yeni site ekleme işlemi
      const cacheResult = siteStorageService.getSites(userId);
      const cachedSites = cacheResult?.sites || [];
      const updatedSites = [...cachedSites, data];
      siteStorageService.saveSites(updatedSites, userId);
      return data;
    }
    
    case 'getSites': {
      // Site listesi kaydetme işlemi
      siteStorageService.saveSites(data, userId);
      return data;
    }
    
    case 'updateSite': {
      // Site güncelleme işlemi
      const cacheResult = siteStorageService.getSites(userId);
      const cachedSites = cacheResult?.sites || [];
      const updatedSites = cachedSites.map(site => 
        site.id === data.id || site.siteId === data.id ? data : site
      );
      siteStorageService.saveSites(updatedSites, userId);
      return data;
    }
    
    default:
      console.warn('Bilinmeyen bypass operasyon tipi:', operationType);
      return data;
  }
};