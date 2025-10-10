// mockData.js
// Sunucu bağlantı hatalarında kullanılacak yedek veriler

export const MOCK_DATA = {
  // Demo site verileri
  sites: [
    {
      siteId: 1,
      siteIsmi: "Demo Site 1",
      siteIl: "İstanbul",
      siteIlce: "Kadıköy",
      siteMahalle: "Göztepe",
      siteSokak: "Bağdat Caddesi"
    },
    {
      siteId: 2,
      siteIsmi: "Demo Site 2",
      siteIl: "İstanbul",
      siteIlce: "Beşiktaş",
      siteMahalle: "Levent",
      siteSokak: "Büyükdere Caddesi"
    }
  ],
  
  // Demo kullanıcı verileri
  user: {
    id: 1,
    isim: "Demo",
    soyisim: "Kullanıcı",
    telefon: "5442570818",
    email: "demo@apartmanim-cepte.com"
  }
};