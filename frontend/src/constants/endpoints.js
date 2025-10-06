// API endpoint'lerinin tanımlandığı dosya
export const ENDPOINTS = {
  IDENTITY: {
    YONETICI_KAYIT: '/identity/yonetici/kayit',
    SAKIN_KAYIT: '/identity/apartman/sakin/kayit',
    LOGIN: '/identity/giris', // Backend'de /giris endpoint'i var
    KULLANICI_BILGI: '/identity/kullanici/bilgi' // Kullanıcı bilgisi endpoint'i
  },
  DUYURU: {
    BASE: '/duyuru',
    BY_SITE: '/duyuru/site',
    BY_ID: '/duyuru'
  },
  SITE: {
    BASE: '/structure/site',
    BY_KULLANICI: '/structure/site',  // Kullanıcı ID'si ile site bilgilerini almak için
    EKLE: '/structure/site/ekle',
    DETAY: '/structure/site/detay'
  },
  BLOK: {
    BASE: '/structure/blok',
    EKLE: '/structure/blok/ekle',
    BY_SITE: '/structure/bloklar' // Site ID'si ile blokları getirmek için
  },
  DAIRE: {
    BASE: '/structure/daire',
    BY_BLOK: '/structure/daireler' // Blok ID'si ile daireleri getirmek için - backend endpoint'i
  }
};