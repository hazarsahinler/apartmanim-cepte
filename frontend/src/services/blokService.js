import api from './api';
import { ENDPOINTS } from '../constants/endpoints';

export const blokService = {
  // Yeni blok ekle - BlokKayitDTO'ya göre field mapping
  addBlok: async (blokData) => {
    try {
      console.log('BlokService - Blok ekleme isteği gönderiliyor:', blokData);
      
      // Backend BlokKayitDTO'ya göre field mapping
      const backendData = {
        blokIsmi: blokData.blokIsmi,
        katSayisi: parseInt(blokData.katSayisi),
        herKattakiDaireSayisi: parseInt(blokData.herKattakiDaireSayisi),
        siteId: parseInt(blokData.siteId)
      };
      
      console.log('BlokService - Backend\'e gönderilecek veri:', backendData);
      
      const response = await api.post(ENDPOINTS.BLOK.EKLE, backendData);
      
      console.log('BlokService - Blok ekleme yanıtı:', response.data);
      return response.data;
    } catch (error) {
      console.error('BlokService - Blok ekleme hatası:', error);
      console.error('BlokService - Hata response:', error.response?.data);
      
      throw new Error(
        error.response?.data?.message || 
        error.response?.data ||
        'Blok eklenirken bir hata oluştu.'
      );
    }
  },

  // Site ID'sine göre blokları getir - Backend: GET /structure/bloklar/{siteId} -> List<BlokResponseDTO>
  getBloksBySiteId: async (siteId) => {
    try {
      console.log('BlokService - Site blokları getiriliyor');
      console.log('BlokService - Raw siteId:', siteId);
      console.log('BlokService - siteId type:', typeof siteId);
      
      // SiteId'yi integer'a çevir
      const parsedSiteId = parseInt(siteId, 10);
      
      if (isNaN(parsedSiteId)) {
        console.error('BlokService - Geçersiz siteId, NaN döndü:', siteId);
        throw new Error('Geçersiz site ID');
      }
      
      console.log('BlokService - Parsed siteId:', parsedSiteId);
      console.log('BlokService - API URL:', `${ENDPOINTS.BLOK.BY_SITE}/${parsedSiteId}`);
      
      // Backend API: GET /structure/bloklar/{siteId} -> List<BlokResponseDTO>
      const response = await api.get(`${ENDPOINTS.BLOK.BY_SITE}/${parsedSiteId}`);
      
      console.log('BlokService - Backend response:', response.data);
      console.log('BlokService - Response status:', response.status);
      
      // BlokResponseDTO mapping: { siteId, blokId, blokIsmi, daireSay }
      const bloklar = response.data || [];
      
      // Frontend için field mapping
      const mappedBloklar = bloklar.map(blok => ({
        ...blok,
        // BlokResponseDTO field'ları zaten doğru
        // daireSay -> daireSayisi mapping frontend'de yapılacak
      }));
      
      console.log('BlokService - Mapped bloklar:', mappedBloklar);
      
      return mappedBloklar;
      
      if (response.data && response.data.length === 0) {
        console.warn('Backend boş array döndürdü - Database veya Service sorunu olabilir');
      }
      
      // Backend field mapping'i düzelt (daireSay -> daireSayisi)
      const mappedData = response.data.map(blok => {
        const daireSayisi = blok.daireSay || 0;
        
        console.log(`Blok ${blok.blokIsmi} - Backend daireSay:`, blok.daireSay, '-> Frontend daireSayisi:', daireSayisi);
        
        return {
          ...blok,
          daireSayisi: daireSayisi,
          katSayisi: 0, // Backend'de yok, default değer
          herKattakiDaireSayisi: 0 // Backend'de yok, default değer
        };
      });
      
      console.log('Mapped blok data:', mappedData);
      return mappedData;
    } catch (error) {
      console.error('Blok listesi alma hatası:', error);
      
      // Backend null döndürüyorsa geçici mock
      if (error.response?.status === 500 || error.response?.data?.length === 0) {
        console.log('Backend null döndürdü - Geçici boş liste döndürülüyor');
        return []; // Boş liste döndür
      }
      
      throw new Error(
        error.response?.data?.message || 
        'Blok bilgileri alınırken bir hata oluştu.'
      );
    }
  }
};