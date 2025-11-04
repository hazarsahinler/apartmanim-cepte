import api from './api';
import { ENDPOINTS } from '../constants/endpoints';

export const financeService = {
  // Yeni borç tanımı ekle
  addBorcTanimi: async (borcData) => {
    try {
      console.log('FinanceService - Borç tanımı ekleme isteği:', borcData);
      
      // Backend BorcTanimiCreateRequestDTO'ya göre field mapping
      const requestData = {
        tutar: parseFloat(borcData.tutar),
        borcTuru: borcData.borcTuru, // AIDAT veya OZEL_MASRAF
        aciklama: borcData.aciklama,
        sonOdemeTarihi: borcData.sonOdemeTarihi, // LocalDate format: YYYY-MM-DD
        siteId: parseInt(borcData.siteId)
      };
      
      console.log('FinanceService - Backend\'e gönderilecek veri:', requestData);
      
      const response = await api.post('/finance/borc/ekle', requestData);
      
      console.log('FinanceService - Borç tanımı ekleme yanıtı:', response.data);
      return response.data; // ResponseDTO
    } catch (error) {
      console.error('FinanceService - Borç tanımı ekleme hatası:', error);
      
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
      console.log('FinanceService - Tanımlanmış borçlar getiriliyor, Filtre:', filterData);
      
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
      console.log('FinanceService - API URL:', url);
      
      const response = await api.get(url);
      
      console.log('FinanceService - Tanımlanmış borçlar yanıtı:', response.data);
      
      // BorcTanimiResponseDTO[] array döner
      return response.data || [];
    } catch (error) {
      console.error('FinanceService - Tanımlanmış borçlar getirme hatası:', error);
      
      if (error.response?.status === 403) {
        throw new Error('Bu verilere erişim yetkiniz bulunmamaktadır.');
      } else if (error.response?.status === 404) {
        return []; // Veri bulunamadıysa boş array döner
      } else if (error.response?.status === 500) {
        throw new Error('Sunucu hatası. Lütfen daha sonra tekrar deneyiniz.');
      }
      
      // Hata durumunda boş array döner - kullanıcı deneyimini bozmamak için
      console.warn('FinanceService - Borçlar getirilemedi, boş liste döndürülüyor');
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
      console.error('FinanceService - Tarih formatlama hatası:', error);
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
      console.error('FinanceService - LocalDate formatı hatası:', error);
      return null;
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