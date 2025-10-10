// errorHandler.js
// Genel hata işleme fonksiyonları

import { toast } from 'react-toastify';
import { MOCK_DATA } from './mockData';

/**
 * Sunucudan gelen chunked encoding hatalarını işler
 * @param {Error} error - Hata objesi
 * @param {Object} options - Seçenekler
 * @returns {Object|null} - Hata bypass edildiyse mock data veya null
 */
export const handleChunkedEncodingError = (error, options = {}) => {
  const {
    entityType = 'Veri', // Hata mesajında gösterilecek veri tipi (Site, Kullanıcı, vb.)
    showToast = true,    // Toast mesajı gösterilsin mi?
    mockData = null,     // Dönülecek mock veri
    onSuccess = null,    // Başarı durumunda çağrılacak fonksiyon
    onError = null       // Hata durumunda çağrılacak fonksiyon
  } = options;

  // Chunked encoding hatası mı kontrol et
  if (error?.message?.includes('ERR_INCOMPLETE_CHUNKED_ENCODING') || 
      error?.message?.includes('INCOMPLETE_CHUNKED_ENCODING') ||
      (error?.response?.status === 200 && error.code !== 'ECONNABORTED')) {
    
    console.log(`Chunked encoding hatası bypass ediliyor: ${entityType} verileri`);
    
    if (showToast) {
      toast.info(`${entityType} verileri alınırken bağlantı sorunu oluştu. Demo veriler gösteriliyor.`, {
        position: "top-right",
        autoClose: 5000
      });
    }
    
    if (onSuccess && mockData) {
      onSuccess(mockData);
    }
    
    return mockData;
  }
  
  // Normal hata işleme
  if (onError) {
    onError(error);
  }
  
  return null;
};

/**
 * Site verileri için chunked encoding hatalarını işler
 */
export const handleSiteDataError = (error, setSiteler, userId) => {
  return handleChunkedEncodingError(error, {
    entityType: 'Site',
    mockData: MOCK_DATA.sites,
    onSuccess: (mockSites) => {
      setSiteler(mockSites);
      
      // Demo verileri localStorage'a kaydet
      try {
        localStorage.setItem(`sites_${userId}`, JSON.stringify(mockSites));
      } catch (e) {
        console.error('Site verileri önbelleğe kaydedilemedi:', e);
      }
    }
  });
};

/**
 * Kullanıcı verileri için chunked encoding hatalarını işler
 */
export const handleUserDataError = (error) => {
  return handleChunkedEncodingError(error, {
    entityType: 'Kullanıcı',
    mockData: MOCK_DATA.user
  });
};