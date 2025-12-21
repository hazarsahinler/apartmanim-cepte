import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import duyuruService from '../services/duyuruService';
import { authService } from '../services/authService';

const DuyuruDuzenle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    baslik: '',
    icerik: '',
    tip: 'genel',
    siteId: '',
    ekDosya: null,
  });
  const [mevcutDosya, setMevcutDosya] = useState({
    dosyaAdi: '',
    dosyaUrl: '',
  });
  const [dosyaSil, setDosyaSil] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Duyuru ve kullanıcı bilgilerini eş zamanlı al
        const [duyuruData, userData] = await Promise.all([
          duyuruService.getDuyuruById(id),
          authService.getUserInfo()
        ]);
        
        setFormData({
          baslik: duyuruData.baslik || '',
          icerik: duyuruData.icerik || '',
          tip: duyuruData.tip || 'genel',
          siteId: duyuruData.siteId || '',
        });
        
        if (duyuruData.ekDosyaUrl) {
          setMevcutDosya({
            dosyaAdi: duyuruData.ekDosyaAdi || 'Ek Dosya',
            dosyaUrl: duyuruData.ekDosyaUrl,
          });
        }
        
        setUser(userData);
        
        // Kullanıcının bu duyuruyu düzenleme yetkisi var mı kontrol et
        const yetkiliMi = userData.rol === 'ADMIN' || 
          (userData.rol === 'YONETICI' && 
           userData.yonettigiSiteler?.some(site => site.id === duyuruData.siteId));
        
        if (!yetkiliMi) {
          setErrorMessage('Bu duyuruyu düzenleme yetkiniz bulunmamaktadır.');
          navigate('/duyurular');
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Duyuru verileri yüklenirken hata:", err);
        setErrorMessage('Duyuru verileri yüklenirken bir hata oluştu.');
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Dosya boyutu kontrolü (5MB maksimum)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Dosya boyutu 5MB\'dan küçük olmalıdır.');
        fileInputRef.current.value = '';
        return;
      }
      
      setFormData({
        ...formData,
        ekDosya: file
      });
      
      // Yeni dosya seçildiğinde mevcut dosyanın silinmesi işaretlenir
      if (mevcutDosya.dosyaUrl) {
        setDosyaSil(true);
      }
    }
  };
  
  const handleDosyaSil = () => {
    setDosyaSil(true);
    setMevcutDosya({
      dosyaAdi: '',
      dosyaUrl: '',
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    setFormData({
      ...formData,
      ekDosya: null
    });
  };
  
  const handleDosyaKorumaDegisikligi = () => {
    setDosyaSil(!dosyaSil);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      // Form verilerini formdata formatına çevir
      const submitData = new FormData();
      submitData.append('baslik', formData.baslik);
      submitData.append('icerik', formData.icerik);
      submitData.append('tip', formData.tip);
      submitData.append('siteId', formData.siteId);
      submitData.append('dosyaSil', dosyaSil);
      
      if (formData.ekDosya) {
        submitData.append('ekDosya', formData.ekDosya);
      }
      
      // Duyuruyu güncelle
      await duyuruService.updateDuyuru(id, submitData);
      
      setSuccessMessage('Duyuru başarıyla güncellendi!');
      
      // 2 saniye sonra duyuru detay sayfasına yönlendir
      setTimeout(() => {
        navigate(`/duyuru/${id}`);
      }, 2000);
    } catch (error) {
      console.error('Duyuru güncelleme hatası:', error);
      setErrorMessage(error.message || 'Duyuru güncellenirken bir hata meydana geldi.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Duyuru Düzenle</h1>
        
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{errorMessage}</span>
          </div>
        )}
        
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{successMessage}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          {/* Duyuru Tipi */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tip">
              Duyuru Tipi
            </label>
            <select
              id="tip"
              name="tip"
              value={formData.tip}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            >
              <option value="genel">Genel Duyuru</option>
              <option value="onemli">Önemli Duyuru</option>
              <option value="etkinlik">Etkinlik</option>
            </select>
          </div>
          
          {/* Başlık */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="baslik">
              Başlık
            </label>
            <input
              id="baslik"
              name="baslik"
              type="text"
              placeholder="Duyuru başlığı"
              value={formData.baslik}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
              maxLength="100"
            />
          </div>
          
          {/* İçerik */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="icerik">
              İçerik
            </label>
            <textarea
              id="icerik"
              name="icerik"
              placeholder="Duyuru içeriği"
              value={formData.icerik}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
              required
            />
          </div>
          
          {/* Mevcut Dosya Bilgisi */}
          {mevcutDosya.dosyaUrl && !dosyaSil && (
            <div className="mb-4 p-3 bg-gray-50 border rounded">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-gray-500">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <span className="ml-2 text-gray-700">{mevcutDosya.dosyaAdi}</span>
                </div>
                <button
                  type="button"
                  onClick={handleDosyaSil}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          
          {/* Dosya Silindi Uyarısı */}
          {mevcutDosya.dosyaUrl && dosyaSil && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-300 rounded">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="ml-2 text-yellow-700">Mevcut dosya kaydedildiğinde silinecek</span>
                <button
                  type="button"
                  onClick={handleDosyaKorumaDegisikligi}
                  className="ml-auto text-blue-500 hover:text-blue-700 text-sm underline"
                >
                  Geri Al
                </button>
              </div>
            </div>
          )}
          
          {/* Ek Dosya */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ekDosya">
              {mevcutDosya.dosyaUrl && !dosyaSil ? 'Dosyayı Değiştir (Opsiyonel)' : 'Ek Dosya (Opsiyonel)'}
            </label>
            <input
              id="ekDosya"
              name="ekDosya"
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            <p className="text-gray-500 text-xs mt-1">
              Maksimum dosya boyutu: 5MB. İzin verilen formatlar: PDF, DOC, DOCX, JPG, PNG
            </p>
          </div>
          
          {/* Butonlar */}
          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={submitting}
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {submitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Güncelleniyor...
                </span>
              ) : 'Duyuruyu Güncelle'}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/duyuru/${id}`)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DuyuruDuzenle;