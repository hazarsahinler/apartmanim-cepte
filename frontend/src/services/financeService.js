import api from './api';
import { ENDPOINTS } from '../constants/endpoints';

export const financeService = {
  // Yeni borç tanımı ekle
  addBorcTanimi: async (borcData) => {
    try {
      // Backend BorcTanimiCreateRequestDTO'ya göre field mapping
      const requestData = {
        tutar: parseFloat(borcData.tutar),
        borcTuru: borcData.borcTuru, // AIDAT veya OZEL_MASRAF
        aciklama: borcData.aciklama,
        sonOdemeTarihi: borcData.sonOdemeTarihi, // LocalDate format: YYYY-MM-DD
        siteId: parseInt(borcData.siteId)
      };
      const response = await api.post('/finance/borc/ekle', requestData);
      return response.data; // ResponseDTO
    } catch (error) {
      if (error.response?.status === 400) {
        // Validation hatası
        throw new Error(error.response.data?.message || 'Girilen bilgileri kontrol ediniz.');
      } else if (error.response?.status === 403) {
        throw new Error('Bu işlem için yetkiniz bulunmamaktadır.');
      } else if (error.response?.status === 500) {
        throw new Error('Sunucu hatası. Lütfen daha sonra tekrar deneyiniz.');
      }
      
      throw new Error('Borç tanımı eklenirken beklenmeyen bir hata oluştu.');
    }
  },

  // Tanımlanmış borçları getir (filtreleyerek)
  getTanimlananBorclar: async (filterData = {}) => {
    try {
      // TanimlanmisBorcFiltreDTO'ya göre query parametreleri oluştur
      const queryParams = new URLSearchParams();
      
      if (filterData.borcTuru) {
        queryParams.append('borcTuru', filterData.borcTuru);
      }
      if (filterData.yil) {
        queryParams.append('yil', filterData.yil);
      }
      if (filterData.siteId) {
        queryParams.append('siteId', filterData.siteId);
      }
      if (filterData.daireId) {
        queryParams.append('daireId', filterData.daireId);
      }
      
      const url = `/finance/eklenen/borclar${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await api.get(url);
      // BorcTanimiResponseDTO[] array döner
      return response.data || [];
    } catch (error) {
      if (error.response?.status === 403) {
        throw new Error('Bu verilere erişim yetkiniz bulunmamaktadır.');
      } else if (error.response?.status === 404) {
        return []; // Veri bulunamadıysa boş array döner
      } else if (error.response?.status === 500) {
        throw new Error('Sunucu hatası. Lütfen daha sonra tekrar deneyiniz.');
      }
      
      // Hata durumunda boş array döner - kullanıcı deneyimini bozmamak için
      return [];
    }
  },

  // Borç türü enum değerlerini frontend için formatla
  getBorcTurleri: () => {
    return [
      { value: 'AIDAT', label: 'Aylık Aidat', description: 'Apartman aylık aidat bedeli' },
      { value: 'OZEL_MASRAF', label: 'Özel Masraf', description: 'Özel masraf ve giderler' }
    ];
  },

  // Toplam site giderini getir
  getTotalSiteGider: async (siteId) => {
    try {
      const response = await api.get(`/finance/total/gider/${siteId}`);
      // TotalApartmanGiderResponseDTO döner: { tutar: BigDecimal }
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

  // Tutar formatla (Türk Lirası)
  formatCurrency: (amount) => {
    if (!amount && amount !== 0) return '0,00 ₺';
    
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  },

  // Tarih formatla (Türkiye formatı)
  formatDate: (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  },

  // LocalDate formatına çevir (YYYY-MM-DD)
  toLocalDateFormat: (dateInput) => {
    if (!dateInput) return null;
    
    try {
      const date = new Date(dateInput);
      return date.toISOString().split('T')[0]; // YYYY-MM-DD formatı
    } catch (error) {
      return null;
    }
  },

  // Total apartman geliri getir
  getTotalApartmanGelir: async (siteId) => {
    try {
      const response = await api.get(`/finance/total/gelir/${siteId}`);
      // TotalApartmanGelirResponseDTO döner: { tutar: BigDecimal }
      return response.data;
    } catch (error) {
      if (error.response?.status === 403) {
        throw new Error('Bu bilgilere erişim yetkiniz bulunmamaktadır.');
      } else if (error.response?.status === 404) {
        // Gelir bulunamadıysa sıfır döner
        return { tutar: 0 };
      } else if (error.response?.status === 500) {
        throw new Error('Sunucu hatası. Lütfen daha sonra tekrar deneyiniz.');
      }
      
      // Hata durumunda sıfır döner
      return { tutar: 0 };
    }
  },

  // Form validation helper
  validateBorcTanimiForm: (formData) => {
    const errors = {};
    
    // Tutar kontrolü
    if (!formData.tutar || parseFloat(formData.tutar) <= 0) {
      errors.tutar = 'Tutar pozitif bir değer olmalıdır.';
    }
    
    // Borç türü kontrolü
    if (!formData.borcTuru) {
      errors.borcTuru = 'Borç türü seçilmelidir.';
    }
    
    // Açıklama kontrolü
    if (!formData.aciklama || formData.aciklama.trim().length < 5) {
      errors.aciklama = 'Açıklama en az 5 karakter olmalıdır.';
    } else if (formData.aciklama.trim().length > 200) {
      errors.aciklama = 'Açıklama en fazla 200 karakter olabilir.';
    }
    
    // Son ödeme tarihi kontrolü
    if (!formData.sonOdemeTarihi) {
      errors.sonOdemeTarihi = 'Son ödeme tarihi seçilmelidir.';
    } else {
      const sonTarih = new Date(formData.sonOdemeTarihi);
      const bugun = new Date();
      bugun.setHours(0, 0, 0, 0);
      
      if (sonTarih < bugun) {
        errors.sonOdemeTarihi = 'Son ödeme tarihi bugünden ileri bir tarih olmalıdır.';
      }
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

export default financeService;
