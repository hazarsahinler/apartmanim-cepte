// API endpoint'lerinin tanımlandığı dosya
export const ENDPOINTS = {
  IDENTITY: {
    YONETICI_KAYIT: '/identity/yonetici/kayit',
    KULLANICI_KAYIT: '/identity/kullanici/kayit', // KullaniciKayitDTO için
    SAKIN_KAYIT: '/identity/apartman/sakin/kayit',
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
    DAIRE_BY_ID: '/structure/daire', // Daire detaylarını ID ile getirmek için
    KULLANICI_DAIRE: '/structure/kullanici/daire/bul' // Telefon numarasıyla kullanıcının daire bilgilerini getir
  },
  FINANCE: {
    BORC_EKLE: '/finance/borc/ekle', // POST - Yeni borç tanımı ekleme (YONETICI)
    EKLENEN_BORCLAR: '/finance/eklenen/borclar', // GET - Tanımlanmış borçları getirme (YONETICI)
    DAIRELER_BORC: '/finance/daireler/borc', // POST - Dairelere borç atama (YONETICI)
    ODEME_ISTEK_GONDER: '/finance/odeme/istek/gonder', // POST - Ödeme isteği gönderme (APARTMANSAKINI/YONETICI)
    ODEME_ISTEKLER: '/finance/odeme/istekler', // GET - Site ödeme isteklerini getirme (YONETICI) - Backend: /finance/odeme/istekler/{siteId}
    ODEME_ISTEK_KABUL: '/finance/odeme/istek/kabul', // POST - Ödeme isteğini kabul etme (YONETICI) - Backend: /finance/odeme/istek/kabul/{daireBorcId}
    KULLANICI_DAIRE_BORCLAR: '/finance/kullanici/daire/borclar', // GET - Kullanıcının daire borçları (APARTMANSAKINI)
    KULLANICI_FINANSAL_OZET: '/finance/kullanici/ozet', // GET - Kullanıcı finansal özeti (APARTMANSAKINI)
    DAIRE_BORC: '/finance/daire/borc', // GET - DaireId ile daire borçları (Backend: /finance/daire/borc/{daireId})
    DAIRELER_BORC_BY_ID: '/finance/daireler/borc', // GET - BorcId ile daire borçlarını getir (Backend: /finance/daireler/borc/{borcId})
    ODEME_ISTEK_DURUM: '/finance/odeme/istek/onay/durum' // GET - Ödeme isteği durumu kontrolü (Backend: /finance/odeme/istek/onay/durum/{daireBorcId})
  }
};