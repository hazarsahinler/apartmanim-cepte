import React, { useState, useEffect } from 'react';
import { duyuruService } from '../services/duyuruService';
import { authService } from '../services/authService';

const Duyurular = () => {
  const [duyurular, setDuyurular] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [activeTab, setActiveTab] = useState('tum');
  
  // Kullanıcı rolünü ve duyuruları yükle
  useEffect(() => {
    const fetchUserAndDuyurular = async () => {
      try {
        setLoading(true);
        // Kullanıcı bilgisini al
        const user = await authService.getUserInfo();
        setUserRole(user.rol);
        
        // Tüm duyuruları getir
        const duyuruData = await duyuruService.getAllDuyurular();
        setDuyurular(duyuruData);
        setLoading(false);
      } catch (err) {
        console.error("Duyurular yüklenirken hata:", err);
        setError('Duyurular yüklenirken bir hata oluştu.');
        setLoading(false);
      }
    };

    fetchUserAndDuyurular();
  }, []);

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
  
  // Duyuru türüne göre filtreleme
  const filteredDuyurular = activeTab === 'tum' 
    ? duyurular 
    : duyurular.filter(duyuru => duyuru.tip === activeTab);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Hata!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Duyurular</h1>
      
      {/* Filtre Seçenekleri */}
      <div className="flex mb-6 border-b border-gray-200">
        <button 
          className={`py-2 px-4 font-medium text-sm ${activeTab === 'tum' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
          onClick={() => setActiveTab('tum')}
        >
          Tüm Duyurular
        </button>
        <button 
          className={`py-2 px-4 font-medium text-sm ${activeTab === 'genel' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
          onClick={() => setActiveTab('genel')}
        >
          Genel Duyurular
        </button>
        <button 
          className={`py-2 px-4 font-medium text-sm ${activeTab === 'onemli' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
          onClick={() => setActiveTab('onemli')}
        >
          Önemli Duyurular
        </button>
        <button 
          className={`py-2 px-4 font-medium text-sm ${activeTab === 'etkinlik' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
          onClick={() => setActiveTab('etkinlik')}
        >
          Etkinlikler
        </button>
      </div>
      
      {/* Duyuru Listesi */}
      <div className="space-y-6">
        {filteredDuyurular.length > 0 ? (
          filteredDuyurular.map((duyuru) => (
            <div 
              key={duyuru.id} 
              className="bg-white rounded-lg shadow-md overflow-hidden border-l-4 hover:shadow-lg transition-shadow duration-300"
              style={{ borderLeftColor: duyuru.tip === 'onemli' ? '#EF4444' : duyuru.tip === 'etkinlik' ? '#3B82F6' : '#10B981' }}
            >
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {duyuru.tip === 'onemli' && (
                      <span className="bg-red-100 text-red-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">Önemli</span>
                    )}
                    {duyuru.tip === 'etkinlik' && (
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">Etkinlik</span>
                    )}
                    {duyuru.tip === 'genel' && (
                      <span className="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">Genel</span>
                    )}
                    <h3 className="text-xl font-semibold text-gray-800">{duyuru.baslik}</h3>
                  </div>
                  <span className="text-sm text-gray-500">{formatDate(duyuru.tarih)}</span>
                </div>
                
                <div className="mt-3">
                  <p className="text-gray-600">{duyuru.icerik}</p>
                </div>
                
                {duyuru.ekDosyaUrl && (
                  <div className="mt-3 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-gray-500">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <a href={duyuru.ekDosyaUrl} className="ml-1 text-blue-600 hover:underline text-sm">Ek dosya</a>
                  </div>
                )}
                
                <div className="mt-4 flex items-center">
                  <img 
                    src={duyuru.yayinlayanAvatar || "https://via.placeholder.com/40"} 
                    alt="Yayınlayan" 
                    className="w-6 h-6 rounded-full mr-2"
                  />
                  <span className="text-sm text-gray-600">{duyuru.yayinlayan}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-gray-500">Bu kategoride duyuru bulunamadı.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Duyurular;