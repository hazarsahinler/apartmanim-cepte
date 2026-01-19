import api from './api';
import { API_BASE_URL } from '../config/apiConfig';

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
      }
      
      // NOT: Content-Type'ı manuel olarak 'multipart/form-data' set etmeyin!
      // Axios otomatik olarak boundary ile birlikte ekler
      const response = await api.post('/finance/gider/ekle', formData);

      return response.data;

    } catch (error) {
      if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Girilen bilgileri kontrol ediniz.');
      } else if (error.response?.status === 403) {
        // Backend'den gelen mesaj varsa onu kullan, yoksa generic mesaj
        const errorMsg = error.response.data?.message 
          || error.response.data?.error
          || error.response.statusText
          || 'Bu işlem için yetkiniz bulunmamaktadır.';
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
      const response = await api.get(`/finance/gider/getir/${siteId}`);
      
      // Backend direkt array döndürüyor, response.data wrapper yok
      return response.data || [];

    } catch (error) {
      if (error.response?.status === 404) {
        return []; // Gider bulunamadıysa boş array döner
      } else if (error.response?.status === 403) {
        throw new Error('Bu verilere erişim yetkiniz bulunmamaktadır.');
      } else if (error.response?.status === 500) {
        throw new Error('Sunucu hatası. Lütfen daha sonra tekrar deneyiniz.');
      }
      
      return [];
    }
  },

  // Total site gider tutarını getir
  getTotalSiteGider: async (siteId) => {
    try {
      const response = await api.get(`/finance/total/gider/${siteId}`);
      
      return response.data || { tutar: 0 };

    } catch (error) {
      if (error.response?.status === 404) {
        return { tutar: 0 }; // Gider bulunamadıysa 0 döner
      } else if (error.response?.status === 403) {
        throw new Error('Bu verilere erişim yetkiniz bulunmamaktadır.');
      } else if (error.response?.status === 500) {
        throw new Error('Sunucu hatası. Lütfen daha sonra tekrar deneyiniz.');
      }
      
      return { tutar: 0 };
    }
  },

  // Belge URL'sini oluştur
  getBelgeUrl: (belgeId) => {
    return `${API_BASE_URL}/finance/gider/belge/goster/${belgeId}`;
  },

  // Belgeyi görüntüle (token ile)
  downloadBelge: async (belgeId) => {
    try {
      const response = await api.get(`/finance/gider/belge/goster/${belgeId}`, {
        responseType: 'blob'
      });
      
      // Content-Type'ı al
      const contentType = response.headers['content-type'] || 'image/png';
      
      // Blob'u doğru content-type ile oluştur
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      
      // Yeni sekmede aç
      const newWindow = window.open(url, '_blank');
      
      if (!newWindow) {
        // Pop-up engellenirse URL'i kullanıcıya göster
        alert('Pop-up engellenmiş olabilir. Lütfen tarayıcı ayarlarınızı kontrol edin.');
      }
      
      // Memory temizliği (1 dakika sonra)
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 60000);
      
    } catch (error) {
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
