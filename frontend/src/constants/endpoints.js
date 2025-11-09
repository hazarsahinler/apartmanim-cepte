// API endpoint'lerinin tanımlandığı dosya
export const ENDPOINTS = {
  IDENTITY: {
    YONETICI_KAYIT: '/identity/yonetici/kayit',
    SAKIN_KAYIT: '/identity/kullanici/kayit',
    LOGIN: '/identity/giris', // Backend'de /giris endpoint'i var
    KULLANICI_BILGI: '/identity/kullanici/bilgi', // Kullanıcı bilgisi endpoint'i
    TELEFON_KONTROL: '/identity/kullanici/telefon' // Backend: /identity/kullanici/telefon/{telefon}
  },
  DUYURU: {
    BASE: '/duyuru',
    BY_SITE: '/duyuru/site',
    BY_ID: '/duyuru'
  },
  SITE: {
    BASE: '/structure/site',
    BY_KULLANICI: '/structure/site',  // Backend: GET /structure/site/{kullaniciId}
    EKLE: '/structure/site/ekle',
    DETAY: '/structure/site/detay'
  },
  BLOK: {
    BASE: '/structure/blok',
    EKLE: '/structure/blok/ekle',
    BY_SITE: '/structure/bloklar', // Site ID'si ile blokları getirmek için
    BY_ID: '/structure/blok' // Blok detaylarını ID ile getirmek için
  },
  DAIRE: {
    BASE: '/structure/daire',
    BY_BLOK: '/structure/daireler', // Blok ID'si ile daireleri getirmek için - backend endpoint'i
    SAKIN_EKLE: '/structure/daire/ekle' // Mevcut kullanıcıyı daireye ekleme
  },
  STRUCTURE: {
    DAIRE_BY_ID: '/structure/daire' // Daire detaylarını ID ile getirmek için
  },
  FINANCE: {
    BORC_EKLE: '/finance/borc/ekle', // POST - Yeni borç tanımı ekleme
    EKLENEN_BORCLAR: '/finance/eklenen/borclar', // GET - Tanımlanmış borçları getirme
    DAIRE_BORCLAR: '/finance/daireler/borc' // GET - Belirli borca ait daire borçları
  }
};