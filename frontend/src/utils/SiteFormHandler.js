// SiteFormHandler.js
// Site ekleme ve güncelleme işlemlerini yönetir

import api from '../services/api';
import axios from 'axios'; // Doğrudan axios import ediyoruz
import { ENDPOINTS } from '../constants/endpoints';
import { toast } from 'react-toastify';
import { bypassSiteAddErrors } from './bypass';
import { API_BASE_URL } from '../config/apiConfig';

/**
 * Site ekleme işlemini gerçekleştirir ve hataları yönetir
 * @param {Object} requestData Site bilgileri
 * @param {Number} userId Kullanıcı ID
 * @param {Function} onSuccess Başarı callback
 * @param {Function} setError Hata mesajı set etme fonksiyonu
 * @param {Function} setLoading Loading state set etme fonksiyonu
 * @returns {Promise<Object|null>} Eklenen site veya null
 */
export const handleSiteAdd = async (requestData, userId, onSuccess, setError, setLoading) => {
  try {
    console.log('Site ekleme isteği gönderiliyor:', requestData);
    
    // Doğrudan URL kullanarak istek at
    const response = await axios.post(`${API_BASE_URL}/structure/site/ekle`, requestData);
    console.log('Site ekleme yanıtı:', response.data);
    
    // Başarılı yanıt
    if (response.data || response.status === 200) {
      toast.success('Site başarıyla eklendi', {
        position: "top-center",
        autoClose: 3000
      });
      
      // Backend'den site ID'sini al
      let realSiteId = Date.now(); // Fallback ID
      
      try {
        // Backend'den güncel site listesini al
        const sitesResponse = await axios.get(`${API_BASE_URL}/structure/site/${userId}`);
        
        if (sitesResponse.data && sitesResponse.data.length > 0) {
          // En son eklenen site'yi bul (aynı isimle)
          const addedSite = sitesResponse.data.find(site => 
            site.siteIsmi === requestData.siteIsmi &&
            site.siteIl === requestData.siteIl &&
            site.siteIlce === requestData.siteIlce
          );
          
          if (addedSite && addedSite.siteId) {
            realSiteId = addedSite.siteId;
          }
        }
      } catch (idError) {
        console.warn('Site ID alınamadı, geçici ID kullanılıyor:', idError);
      }
      
      // Frontend'e uygun site objesi
      const yeniSite = {
        id: realSiteId,
        siteId: realSiteId,
        siteIsmi: requestData.siteIsmi,
        siteIl: requestData.siteIl,
        siteIlce: requestData.siteIlce,
        siteMahalle: requestData.siteMahalle,
        siteSokak: requestData.siteSokak
      };
      
      onSuccess(yeniSite);
      return yeniSite;
    }
    
    // Başarısız yanıt
    throw new Error(response.data?.message || 'Bilinmeyen hata');
    
  } catch (error) {
    console.error('Site ekleme hatası:', error);
    
    // Chunked encoding veya network hatası kontrolü
    if (error.message?.includes('ERR_INCOMPLETE_CHUNKED_ENCODING') || 
        error.message?.includes('INCOMPLETE_CHUNKED_ENCODING') ||
        error.code === 'ERR_NETWORK' ||
        error.name === 'NetworkError') {
      
      return bypassSiteAddErrors(error, requestData, userId, onSuccess);
    }
    
    // Diğer hatalar
    const errorMessage = error.response?.data?.message || 
                        'Site eklenirken bir hata oluştu';
    
    toast.error(errorMessage, {
      position: "top-center", 
      autoClose: 5000
    });
    
    if (setError) {
      setError(errorMessage);
    }
    
    return null;
  } finally {
    if (setLoading) {
      setLoading(false);
    }
  }
};