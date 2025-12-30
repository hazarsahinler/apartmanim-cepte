import api from './api';

export const giderService = {
  // Gider türlerini enum'dan al
  getGiderTurleri: () => {
    return [
      { value: 'ELEKTRIK', label: 'Elektrik Faturası' },
      { value: 'SU', label: 'Su Faturası' },
      { value: 'DOGALGAZ', label: 'Doğalgaz Faturası' },
      { value: 'TEMIZLIK', label: 'Temizlik Hizmeti' },
      { value: 'GUVENLIK', label: 'Güvenlik Hizmeti' },
      { value: 'ASANSOR', label: 'Asansör Bakım' },
      { value: 'BAHCE', label: 'Bahçe Bakımı' },
      { value: 'BAKIM_ONARIM', label: 'Bakım Onarım' },
      { value: 'YONETICI_UCRETI', label: 'Yönetici Ücreti' },
      { value: 'SIGORTA', label: 'Sigorta Primi' },
      { value: 'VERGI_HARCI', label: 'Vergi ve Harçlar' },
      { value: 'DIGER', label: 'Diğer Giderler' }
    ];
  },

  // Gider ekle (dosya ile birlikte)
  giderEkle: async (giderData, dosyalar = []) => {
    try {
      console.log('GiderService - Gider ekleme isteği:', giderData);
      console.log('GiderService - Dosyalar:', dosyalar);

      const formData = new FormData();
      formData.append('giderTutari', giderData.giderTutari.toString());
      formData.append('giderTur', giderData.giderTur);
      formData.append('giderAciklama', giderData.giderAciklama);
      formData.append('siteId', giderData.siteId.toString());
      
      // Gider tarihi ekle (YYYY-MM-DD formatında LocalDate)
      if (giderData.giderTarihi) {
        formData.append('giderTarihi', giderData.giderTarihi);
      }

      // Dosyaları ekle
      if (dosyalar && dosyalar.length > 0) {
        dosyalar.forEach((dosya) => {
          formData.append('dosyalar', dosya);
        });
        console.log('GiderService - Toplam dosya sayısı:', dosyalar.length);
      }

      console.log('GiderService - FormData hazırlandı');
      
      // FormData içeriğini debug için yazdır
      console.log('GiderService - FormData içeriği:');
      for (let pair of formData.entries()) {
        console.log(`  ${pair[0]}: ${pair[1]}`);
      }
      
      // Token kontrolü
      const token = localStorage.getItem('token');
      console.log('GiderService - Token var mı?', !!token);
      if (token) {
        console.log('GiderService - Token:', token.substring(0, 20) + '...');
      }

      // NOT: Content-Type'ı manuel olarak 'multipart/form-data' set etmeyin!
      // Axios otomatik olarak boundary ile birlikte ekler
      const response = await api.post('/finance/gider/ekle', formData);

      console.log('GiderService - Gider ekleme yanıtı:', response.data);
      return response.data;

    } catch (error) {
      console.error('GiderService - Gider ekleme hatası:', error);
      console.error('GiderService - Hata response:', error.response);
      console.error('GiderService - Hata data:', error.response?.data);
      console.error('GiderService - Hata status:', error.response?.status);
      console.error('GiderService - Hata statusText:', error.response?.statusText);
      console.error('GiderService - Request config:', error.config);
      console.error('GiderService - Request headers:', error.config?.headers);
      
      if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Girilen bilgileri kontrol ediniz.');
      } else if (error.response?.status === 403) {
        // Backend'den gelen mesaj varsa onu kullan, yoksa generic mesaj
        const errorMsg = error.response.data?.message 
          || error.response.data?.error
          || error.response.statusText
          || 'Bu işlem için yetkiniz bulunmamaktadır.';
        console.error('GiderService - 403 Forbidden:', errorMsg);
        console.error('GiderService - Full response:', JSON.stringify(error.response));
        throw new Error(errorMsg);
      } else if (error.response?.status === 401) {
        throw new Error('Oturumunuz sonlanmış. Lütfen tekrar giriş yapın.');
      } else if (error.response?.status === 413) {
        throw new Error('Dosya boyutu çok büyük. Maksimum 10MB yükleyebilirsiniz.');
      } else if (error.response?.status === 500) {
        const errorMsg = error.response.data?.message || error.response.data?.error;
        if (errorMsg && errorMsg.includes('upload size exceeded')) {
          throw new Error('Dosya boyutu çok büyük. Maksimum 10MB yükleyebilirsiniz.');
        }
        throw new Error('Sunucu hatası. Lütfen daha sonra tekrar deneyiniz.');
      }
      
      // Eğer hata mesajında 'upload size' varsa
      if (error.message && error.message.toLowerCase().includes('upload size')) {
        throw new Error('Dosya boyutu çok büyük. Maksimum 10MB yükleyebilirsiniz.');
      }
      
      throw new Error('Gider eklenirken beklenmeyen bir hata oluştu.');
    }
  },

  // Site giderlerini getir
  getSiteGiderleri: async (siteId) => {
    try {
      console.log('GiderService - Site giderleri getiriliyor:', siteId);
      
      const response = await api.get(`/finance/gider/getir/${siteId}`);
      
      console.log('GiderService - Site giderleri yanıtı:', response.data);
      
      // Backend direkt array döndürüyor, response.data wrapper yok
      return response.data || [];

    } catch (error) {
      console.error('GiderService - Site giderleri getirme hatası:', error);
      
      if (error.response?.status === 404) {
        return []; // Gider bulunamadıysa boş array döner
      } else if (error.response?.status === 403) {
        throw new Error('Bu verilere erişim yetkiniz bulunmamaktadır.');
      } else if (error.response?.status === 500) {
        throw new Error('Sunucu hatası. Lütfen daha sonra tekrar deneyiniz.');
      }
      
      console.warn('GiderService - Giderler getirilemedi, boş liste döndürülüyor');
      return [];
    }
  },

  // Total site gider tutarını getir
  getTotalSiteGider: async (siteId) => {
    try {
      console.log('GiderService - Total gider getiriliyor:', siteId);
      
      const response = await api.get(`/finance/total/gider/${siteId}`);
      
      console.log('GiderService - Total gider yanıtı:', response.data);
      
      return response.data || { tutar: 0 };

    } catch (error) {
      console.error('GiderService - Total gider getirme hatası:', error);
      
      if (error.response?.status === 404) {
        return { tutar: 0 }; // Gider bulunamadıysa 0 döner
      } else if (error.response?.status === 403) {
        throw new Error('Bu verilere erişim yetkiniz bulunmamaktadır.');
      } else if (error.response?.status === 500) {
        throw new Error('Sunucu hatası. Lütfen daha sonra tekrar deneyiniz.');
      }
      
      console.warn('GiderService - Total gider getirilemedi, 0 döndürülüyor');
      return { tutar: 0 };
    }
  },

  // Belge URL'sini oluştur
  getBelgeUrl: (belgeId) => {
    const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
    return `${BASE_URL}/finance/gider/belge/goster/${belgeId}`;
  },

  // Belgeyi görüntüle (token ile)
  downloadBelge: async (belgeId) => {
    try {
      console.log('GiderService - Belge görüntüleniyor:', belgeId);
      
      const response = await api.get(`/finance/gider/belge/goster/${belgeId}`, {
        responseType: 'blob'
      });
      
      console.log('GiderService - Belge yanıtı:', response);
      
      // Content-Type'ı al
      const contentType = response.headers['content-type'] || 'image/png';
      console.log('GiderService - Content-Type:', contentType);
      
      // Blob'u doğru content-type ile oluştur
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      
      console.log('GiderService - Blob URL oluşturuldu:', url);
      
      // Yeni sekmede aç
      const newWindow = window.open(url, '_blank');
      
      if (!newWindow) {
        console.warn('GiderService - Pop-up engellenmiş olabilir');
        // Pop-up engellenirse URL'i kullanıcıya göster
        alert('Pop-up engellenmiş olabilir. Lütfen tarayıcı ayarlarınızı kontrol edin.');
      }
      
      // Memory temizliği (1 dakika sonra)
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        console.log('GiderService - Blob URL temizlendi');
      }, 60000);
      
    } catch (error) {
      console.error('GiderService - Belge görüntüleme hatası:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Belge bulunamadı.');
      } else if (error.response?.status === 403) {
        throw new Error('Bu belgeyi görüntüleme yetkiniz bulunmamaktadır.');
      }
      
      throw new Error('Belge açılırken bir hata oluştu.');
    }
  },

  // Dosya türüne göre ikon
  getDosyaIkonu: (dosyaTuru) => {
    switch (dosyaTuru) {
      case 'PDF':
        return '📄';
      case 'IMAGE':
        return '🖼️';
      default:
        return '📁';
    }
  },

  // Dosya boyutunu formatla
  formatDosyaBoyutu: (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Tutar formatla
  formatTutar: (tutar) => {
    if (!tutar && tutar !== 0) return '0,00 ₺';
    
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(tutar);
  },

  // Tarih formatla
  formatTarih: (tarih) => {
    if (!tarih) return '';
    
    try {
      return new Date(tarih).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('GiderService - Tarih formatlama hatası:', error);
      return tarih;
    }
  },

  // Form validation
  validateGiderForm: (formData) => {
    const errors = {};
    
    // Tutar kontrolü
    if (!formData.giderTutari || parseFloat(formData.giderTutari) <= 0) {
      errors.giderTutari = 'Gider tutarı pozitif bir değer olmalıdır.';
    }
    
    // Gider türü kontrolü
    if (!formData.giderTur) {
      errors.giderTur = 'Gider türü seçilmelidir.';
    }
    
    // Açıklama kontrolü
    if (!formData.giderAciklama || formData.giderAciklama.trim().length < 5) {
      errors.giderAciklama = 'Açıklama en az 5 karakter olmalıdır.';
    } else if (formData.giderAciklama.trim().length > 200) {
      errors.giderAciklama = 'Açıklama en fazla 200 karakter olabilir.';
    }
    
    // Site ID kontrolü
    if (!formData.siteId || parseInt(formData.siteId) <= 0) {
      errors.siteId = 'Geçerli bir site seçilmelidir.';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
};

export default giderService;