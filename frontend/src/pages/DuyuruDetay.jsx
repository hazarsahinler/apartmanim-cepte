import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { duyuruService } from '../services/duyuruService';
import { authService } from '../services/authService';

const DuyuruDetay = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [duyuru, setDuyuru] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [siliniyorMu, setSiliniyorMu] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Eş zamanlı istekleri çalıştır
        const [duyuruData, userData] = await Promise.all([
          duyuruService.getDuyuruById(id),
          authService.getUserInfo()
        ]);
        
        setDuyuru(duyuruData);
        setUser(userData);
        setLoading(false);
      } catch (err) {
        console.error("Duyuru detayı yüklenirken hata:", err);
        setError('Duyuru detayları yüklenirken bir hata oluştu.');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };
  
  const handleSilClick = async () => {
    if (window.confirm('Bu duyuruyu silmek istediğinize emin misiniz?')) {
      try {
        setSiliniyorMu(true);
        await duyuruService.deleteDuyuru(id);
        navigate('/duyurular', { state: { message: 'Duyuru başarıyla silindi.' } });
      } catch (error) {
        console.error("Duyuru silinirken hata:", error);
        setError('Duyuru silinirken bir hata oluştu.');
        setSiliniyorMu(false);
      }
    }
  };
  
  const handleDuzenleClick = () => {
    navigate(`/duyuru-duzenle/${id}`);
  };
  
  // Kullanıcının duyuruyu düzenleyip silemeyeceğini kontrol et
  const kullaniciYetkiliMi = user && (
    user.rol === 'ADMIN' || 
    (user.rol === 'YONETICI' && user.yonettigiSiteler?.some(site => site.id === duyuru?.siteId))
  );
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Hata!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
        <div className="mt-4">
          <button
            onClick={() => navigate('/duyurular')}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
          >
            Duyurulara Dön
          </button>
        </div>
      </div>
    );
  }

  if (!duyuru) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Uyarı!</strong>
          <span className="block sm:inline"> Duyuru bulunamadı.</span>
        </div>
        <div className="mt-4">
          <button
            onClick={() => navigate('/duyurular')}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
          >
            Duyurulara Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Duyuru Başlığı ve Üst Bilgiler */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center mb-2">
                {duyuru.tip === 'onemli' && (
                  <span className="bg-red-100 text-red-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">Önemli</span>
                )}
                {duyuru.tip === 'etkinlik' && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">Etkinlik</span>
                )}
                {duyuru.tip === 'genel' && (
                  <span className="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">Genel</span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-gray-800">{duyuru.baslik}</h1>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-500">{formatDate(duyuru.tarih)}</p>
              <p className="text-sm text-gray-600 mt-1">{duyuru.siteAdi}</p>
            </div>
          </div>
        </div>
        
        {/* Duyuru İçeriği */}
        <div className="p-6">
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-line">{duyuru.icerik}</p>
          </div>
          
          {/* Ek Dosya */}
          {duyuru.ekDosyaUrl && (
            <div className="mt-6 p-4 border border-gray-200 rounded-md bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Ek Dosya</h3>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-gray-500">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <a 
                  href={duyuru.ekDosyaUrl} 
                  download
                  className="ml-2 text-blue-600 hover:text-blue-800 hover:underline text-sm"
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {duyuru.ekDosyaAdi || "Ek dosya indir"}
                </a>
              </div>
            </div>
          )}
        </div>
        
        {/* Alt Bilgiler */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img 
                src={duyuru.yayinlayanAvatar || "https://via.placeholder.com/40"} 
                alt="Yayınlayan" 
                className="w-8 h-8 rounded-full mr-3"
              />
              <div>
                <p className="text-sm font-medium text-gray-700">{duyuru.yayinlayan}</p>
                <p className="text-xs text-gray-500">Yayınlayan</p>
              </div>
            </div>
            
            {/* Düzenleme ve Silme Butonları - Sadece yetkili kullanıcılara göster */}
            {kullaniciYetkiliMi && (
              <div className="flex space-x-2">
                <button
                  onClick={handleDuzenleClick}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
                >
                  Düzenle
                </button>
                <button
                  onClick={handleSilClick}
                  disabled={siliniyorMu}
                  className={`bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm ${siliniyorMu ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {siliniyorMu ? 'Siliniyor...' : 'Sil'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Geri Dön Butonu */}
      <div className="max-w-4xl mx-auto mt-4">
        <button
          onClick={() => navigate('/duyurular')}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded inline-flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Duyurulara Dön
        </button>
      </div>
    </div>
  );
};

export default DuyuruDetay;