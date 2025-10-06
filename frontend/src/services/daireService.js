import api from './api';
import { ENDPOINTS } from '../constants/endpoints';

export const daireService = {
  // Blok ID'sine göre daireleri getir - Backend: GET /structure/daireler/{blokId} -> List<DaireResponseDTO>
  getDairesByBlokId: async (blokId) => {
    try {
      console.log('DaireService - Blok daireleri getiriliyor, Blok ID:', blokId);
      
      // BlokId'yi integer'a çevir
      const parsedBlokId = parseInt(blokId, 10);
      
      if (isNaN(parsedBlokId)) {
        console.error('DaireService - Geçersiz blokId:', blokId);
        throw new Error('Geçersiz blok ID');
      }
      
      console.log('DaireService - Parsed blokId:', parsedBlokId);
      console.log('DaireService - API URL:', `${ENDPOINTS.DAIRE.BY_BLOK}/${parsedBlokId}`);
      
      // Backend API: GET /structure/daireler/{blokId} -> List<DaireResponseDTO>
      const response = await api.get(`${ENDPOINTS.DAIRE.BY_BLOK}/${parsedBlokId}`);
      
      console.log('DaireService - Backend response:', response.data);
      
      // DaireResponseDTO mapping: { daireId, daireNo, katNo, blokId, kullaniciId }
      const daireler = response.data || [];
      
      // Frontend için field mapping
      const mappedDaireler = daireler.map(daire => {
        // kullaniciId kontrolü - null/0 olabilir
        const hasUser = daire.kullaniciId && daire.kullaniciId !== null && daire.kullaniciId !== 0;
        
        console.log(`DaireService - Daire ${daire.daireNo}: kullaniciId=${daire.kullaniciId}, hasUser=${hasUser}`);
        
        return {
          ...daire,
          // DaireResponseDTO field'ları zaten doğru
          kullaniciId: daire.kullaniciId || null,
          bos: !hasUser, // kullaniciId varsa dolu, yoksa boş
          // Ek frontend field'ları
          kullaniciAdi: '', // Backend'de kullanıcı bilgileri döndürülmüyor
          kullaniciSoyadi: '' // Backend'de kullanıcı bilgileri döndürülmüyor
        };
      });
      
      console.log('DaireService - Mapped daireler:', mappedDaireler);
      
      return mappedDaireler;
    } catch (error) {
      console.error('Daire listesi alma hatası:', error);
      
      // Backend hatası durumunda boş liste döndür
      if (error.response?.status === 500 || error.code === 'ECONNABORTED') {
        console.log('Backend hatası - Boş daire listesi döndürülüyor');
        return [];
      }
      
      throw new Error(
        error.response?.data?.message || 
        'Daire bilgileri alınırken bir hata oluştu.'
      );
    }
  },

  // Apartman sakin kaydı - ApartmanSakinKayitDTO'ya göre field mapping
  registerSakin: async (sakinData) => {
    try {
      // Backend ApartmanSakinKayitDTO'ya göre field mapping
      const backendData = {
        kullaniciAdi: sakinData.kullaniciAdi,
        kullaniciSoyadi: sakinData.kullaniciSoyadi,
        kullaniciEposta: sakinData.email, // frontend: email -> backend: kullaniciEposta
        kullaniciTelefon: sakinData.telefon, // frontend: telefon -> backend: kullaniciTelefon
        kullaniciSifre: sakinData.sifre, // frontend: sifre -> backend: kullaniciSifre
        konutKullanim: sakinData.konutKullanim === 'EvSahibi' ? 0 : 1, // KonutKullanimRol enum: EvSahibi=0, Kiracı=1
        daireId: parseInt(sakinData.daireId)
      };
      
      console.log('Sakin kayıt isteği gönderiliyor (ApartmanSakinKayitDTO):', backendData);
      
      const response = await api.post(ENDPOINTS.IDENTITY.SAKIN_KAYIT, backendData);
      
      console.log('Sakin kayıt yanıtı:', response.data);
      return response.data;
    } catch (error) {
      console.error('Sakin kayıt hatası:', error);
      throw new Error(
        error.response?.data?.message || 
        error.response?.data ||
        'Sakin kaydı sırasında bir hata oluştu.'
      );
    }
  },

  // Kullanıcı silme (daireden çıkarma)
  removeSakin: async (daireId) => {
    try {
      console.log('Kullanıcı silme isteği gönderiliyor, Daire ID:', daireId);
      
      // Backend'de kullanıcı silme API'si yoksa PUT ile kullanıcıyı null yapabiliriz
      // Şimdilik mock response döndürelim
      console.warn('Kullanıcı silme API\'si henüz backend\'de yok - mock response');
      
      return { message: 'Kullanıcı başarıyla silindi (Mock)' };
    } catch (error) {
      console.error('Kullanıcı silme hatası:', error);
      throw new Error(
        error.response?.data?.message || 
        'Kullanıcı silinirken bir hata oluştu.'
      );
    }
  }
};