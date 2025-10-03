import api from './api';
import { ENDPOINTS } from '../constants/endpoints';

const DUYURU_API_URL = ENDPOINTS.DUYURU.BASE;

// Mock veri
const mockDuyurular = [
  {
    id: 1,
    baslik: 'Apartman Toplantısı',
    icerik: 'Bu hafta Cumartesi saat 14:00\'te apartman sakinleri toplantısı yapılacaktır. Tüm sakinlerin katılımı önemle rica olunur.',
    tip: 'onemli',
    tarih: new Date(2025, 9, 5),
    yayinlayan: 'Site Yöneticisi',
    siteId: 1,
    siteAdi: 'Örnek Sitesi'
  },
  {
    id: 2,
    baslik: 'Su Kesintisi',
    icerik: 'Yarın 09:00-14:00 saatleri arasında bakım çalışması nedeniyle su kesintisi olacaktır.',
    tip: 'genel',
    tarih: new Date(2025, 9, 2),
    yayinlayan: 'Site Yönetimi',
    siteId: 1,
    siteAdi: 'Örnek Sitesi'
  },
  {
    id: 3,
    baslik: 'Bahçe Temizliği Etkinliği',
    icerik: 'Önümüzdeki Pazar günü gönüllü sakinlerle bahçe temizliği etkinliği düzenlenecektir. Katılmak isteyenler yönetimle iletişime geçebilir.',
    tip: 'etkinlik',
    tarih: new Date(2025, 9, 10),
    yayinlayan: 'Etkinlik Komitesi',
    siteId: 1,
    siteAdi: 'Örnek Sitesi'
  }
];

export const duyuruService = {
  // Tüm duyuruları getir
  getAllDuyurular: async () => {
    try {
      // Gerçek API isteği 
      const response = await api.get(DUYURU_API_URL).catch(() => {
        // API bağlantısı başarısız olursa mock veri döndür
        console.log('Mock duyuru verileri kullanılıyor');
        return { data: mockDuyurular };
      });
      return response;
    } catch (error) {
      console.error('Duyuru getirme hatası:', error);
      // Hata durumunda da mock veri döndür
      return { data: mockDuyurular };
    }
  },

  // Site/bina ID'sine göre duyuruları getir
  getDuyurularBySiteId: async (siteId) => {
    try {
      const response = await api.get(`${ENDPOINTS.DUYURU.BY_SITE}/${siteId}`).catch(() => {
        // API bağlantısı başarısız olursa mock veri döndür
        console.log('Mock site duyuru verileri kullanılıyor');
        return { data: mockDuyurular.filter(d => d.siteId === parseInt(siteId)) };
      });
      return response.data;
    } catch (error) {
      console.error('Site duyuruları getirme hatası:', error);
      // Hata durumunda da mock veri döndür
      return mockDuyurular.filter(d => d.siteId === parseInt(siteId));
    }
  },

  // Belirli bir duyuruyu getir
  getDuyuruById: async (id) => {
    try {
      const response = await api.get(`${ENDPOINTS.DUYURU.BY_ID}/${id}`).catch(() => {
        // API bağlantısı başarısız olursa mock veri döndür
        console.log('Mock duyuru detay verisi kullanılıyor');
        const bulunanDuyuru = mockDuyurular.find(d => d.id === parseInt(id));
        return { data: bulunanDuyuru || null };
      });
      return response.data;
    } catch (error) {
      console.error('Duyuru detayları getirme hatası:', error);
      // Hata durumunda da mock veri döndür
      return mockDuyurular.find(d => d.id === parseInt(id)) || null;
    }
  },
  
  // Yeni duyuru oluştur
  createDuyuru: async (duyuruData) => {
    try {
      const response = await api.post(DUYURU_API_URL, duyuruData).catch(() => {
        // API bağlantısı başarısız olursa mock işlem
        console.log('Mock duyuru oluşturma kullanılıyor');
        const yeniDuyuru = {
          id: mockDuyurular.length + 1,
          baslik: duyuruData.get('baslik') || 'Yeni Duyuru',
          icerik: duyuruData.get('icerik') || 'Duyuru içeriği',
          tip: duyuruData.get('tip') || 'genel',
          tarih: new Date(),
          yayinlayan: 'Test Kullanıcı',
          siteId: parseInt(duyuruData.get('siteId')) || 1,
          siteAdi: 'Örnek Sitesi',
          ekDosyaUrl: duyuruData.get('ekDosya') ? 'mockFile.pdf' : null,
        };
        
        // Mock verilere ekle
        mockDuyurular.push(yeniDuyuru);
        return { data: yeniDuyuru };
      });
      
      return response.data;
    } catch (error) {
      console.error('Duyuru oluşturma hatası:', error);
      return { success: false, message: 'Duyuru oluşturulurken bir hata oluştu.' };
    }
  },
  
  // Duyuruyu güncelle
  updateDuyuru: async (id, duyuruData) => {
    try {
      const response = await api.put(`${DUYURU_API_URL}/${id}`, duyuruData).catch(() => {
        // API bağlantısı başarısız olursa mock işlem
        console.log('Mock duyuru güncelleme kullanılıyor');
        
        // Duyuruyu bul ve güncelle
        const index = mockDuyurular.findIndex(d => d.id === parseInt(id));
        if (index !== -1) {
          const guncelDuyuru = {
            ...mockDuyurular[index],
            baslik: duyuruData.get('baslik') || mockDuyurular[index].baslik,
            icerik: duyuruData.get('icerik') || mockDuyurular[index].icerik,
            tip: duyuruData.get('tip') || mockDuyurular[index].tip,
            // Diğer alanları da benzer şekilde güncelleyebilirsiniz
          };
          
          mockDuyurular[index] = guncelDuyuru;
          return { data: guncelDuyuru };
        }
        
        throw new Error('Duyuru bulunamadı');
      });
      
      return response.data;
    } catch (error) {
      console.error('Duyuru güncelleme hatası:', error);
      return { success: false, message: 'Duyuru güncellenirken bir hata oluştu.' };
    }
  },
  
  // Duyuruyu sil
  deleteDuyuru: async (id) => {
    try {
      const response = await api.delete(`${DUYURU_API_URL}/${id}`).catch(() => {
        // API bağlantısı başarısız olursa mock işlem
        console.log('Mock duyuru silme kullanılıyor');
        
        // Duyuruyu bul ve sil
        const index = mockDuyurular.findIndex(d => d.id === parseInt(id));
        if (index !== -1) {
          const silinenDuyuru = mockDuyurular[index];
          mockDuyurular.splice(index, 1);
          return { data: { success: true, message: 'Duyuru başarıyla silindi' } };
        }
        
        throw new Error('Duyuru bulunamadı');
      });
      
      return response.data;
    } catch (error) {
      console.error('Duyuru silme hatası:', error);
      return { success: false, message: 'Duyuru silinirken bir hata oluştu.' };
    }
  }
};

export default duyuruService;