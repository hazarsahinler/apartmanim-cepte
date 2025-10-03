import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { duyuruService } from '../services/duyuruService';
import { authService } from '../services/authService';

const DuyuruOlustur = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    baslik: '',
    icerik: '',
    tip: 'genel',
    siteId: '',
    ekDosya: null,
  });
  const [sites, setSites] = useState([]);

  // Kullanıcı bilgilerini ve yönettiği siteleri al
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await authService.getUserInfo();
        setUser(userData);
        
        // Yönetici ise yönettiği siteleri al
        if (userData.rol === 'YONETICI' && userData.yonettigiSiteler?.length > 0) {
          setSites(userData.yonettigiSiteler);
          // İlk siteyi varsayılan olarak seç
          setFormData(prevState => ({
            ...prevState,
            siteId: userData.yonettigiSiteler[0].id
          }));
        }
      } catch (error) {
        console.error('Kullanıcı bilgileri alınamadı:', error);
        setErrorMessage('Kullanıcı bilgileri yüklenirken bir hata oluştu.');
      }
    };
    
    fetchUserData();
  }, []);

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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      // Form verilerini formdata formatına çevir
      const submitData = new FormData();
      submitData.append('baslik', formData.baslik);
      submitData.append('icerik', formData.icerik);
      submitData.append('tip', formData.tip);
      submitData.append('siteId', formData.siteId);
      
      if (formData.ekDosya) {
        submitData.append('ekDosya', formData.ekDosya);
      }
      
      // Duyuruyu oluştur
      await duyuruService.createDuyuru(submitData);
      
      setSuccessMessage('Duyuru başarıyla oluşturuldu!');
      // Formu temizle
      setFormData({
        baslik: '',
        icerik: '',
        tip: 'genel',
        siteId: formData.siteId,
        ekDosya: null
      });
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // 2 saniye sonra duyurular sayfasına yönlendir
      setTimeout(() => {
        navigate('/duyurular');
      }, 2000);
    } catch (error) {
      console.error('Duyuru oluşturma hatası:', error);
      setErrorMessage(error.message || 'Duyuru oluşturulurken bir hata meydana geldi.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Sadece yöneticiler duyuru oluşturabilir
  if (user.rol !== 'YONETICI') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Bu sayfaya erişim yetkiniz bulunmamaktadır. Duyuru oluşturmak için yönetici hesabıyla giriş yapmalısınız.
              </p>
            </div>
          </div>
        </div>
        <button
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
          onClick={() => navigate('/duyurular')}
        >
          Duyurulara Dön
        </button>
      </div>
    );
  }
  
  // Yönetilen site yoksa uyarı göster
  if (sites.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Yönettiğiniz bir site bulunmamaktadır. Duyuru oluşturabilmek için önce bir site oluşturmalı veya bir sitenin yöneticisi olmalısınız.
              </p>
            </div>
          </div>
        </div>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => navigate('/site-olustur')}
        >
          Site Oluştur
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Yeni Duyuru Oluştur</h1>
        
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
          {/* Site Seçimi */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="siteId">
              Site
            </label>
            <select
              id="siteId"
              name="siteId"
              value={formData.siteId}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            >
              {sites.map(site => (
                <option key={site.id} value={site.id}>
                  {site.siteAdi}
                </option>
              ))}
            </select>
          </div>
          
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
          
          {/* Ek Dosya */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ekDosya">
              Ek Dosya (Opsiyonel)
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
              disabled={loading}
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Oluşturuluyor...
                </span>
              ) : 'Duyuru Oluştur'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/duyurular')}
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

export default DuyuruOlustur;