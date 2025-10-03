import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, PlusCircle, MapPin, ChevronRight, Loader2 } from 'lucide-react';
import { authService } from '../services/authService';
import axios from 'axios';

const SiteYonetimSayfasi = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [siteler, setSiteler] = useState([]);
  const [siteEkleModalAcik, setSiteEkleModalAcik] = useState(false);
  const [user, setUser] = useState(null);

  // Sitelerim verilerini çek
  useEffect(() => {
    const fetchUserAndSites = async () => {
      try {
        setLoading(true);
        
        // Kullanıcı bilgilerini al
        const userData = await authService.getUserInfo();
        setUser(userData);
        
        if (userData && userData.id) {
          // Kullanıcının sitelerini çek
          const response = await axios.get(`/api/structure/site/${userData.id}`);
          
          if (response.data && response.data.length > 0) {
            setSiteler(response.data);
          } else {
            // Site bulunamadı, boş liste
            setSiteler([]);
            // Site ekleme modalını otomatik olarak aç
            setSiteEkleModalAcik(true);
          }
        }
      } catch (err) {
        console.error("Veriler yüklenirken hata:", err);
        setError('Siteleriniz yüklenirken bir hata oluştu.');
        // Test için örnek veriler (gerçek API olmadığında)
        const testSiteler = [
          {
            id: 1,
            siteIsmi: "Manolya Sitesi",
            siteIl: "İstanbul",
            siteIlce: "Kadıköy",
            siteMahalle: "Göztepe",
            siteSokak: "Dere Sokak"
          },
          {
            id: 2,
            siteIsmi: "Papatya Konutları",
            siteIl: "İstanbul",
            siteIlce: "Beşiktaş",
            siteMahalle: "Levent",
            siteSokak: "Çiçek Sokak"
          }
        ];
        setSiteler(testSiteler);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndSites();
  }, []);

  // Site'ye tıklandığında site paneline yönlendir
  const handleSiteClick = (siteId) => {
    navigate(`/site-panel/${siteId}`);
  };

  // Site ekleme modalını göster/gizle
  const toggleSiteEkleModal = () => {
    setSiteEkleModalAcik(!siteEkleModalAcik);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-green-500 animate-spin" />
          <span className="mt-4 text-gray-600">Siteleriniz yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Site Yönetimi</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <strong className="font-bold">Hata!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}
        
        {/* Site Listesi veya Boş Durum */}
        {siteler.length === 0 ? (
          <div className="bg-white shadow-lg rounded-lg p-8 text-center">
            <div className="mx-auto w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <Building2 className="h-12 w-12 text-blue-500" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Henüz Siteniz Bulunmuyor</h2>
            <p className="text-gray-600 mb-8">
              Site oluşturarak apartman yönetimine hemen başlayabilirsiniz. Site oluşturduktan sonra bloklar, daireler ve sakinleri ekleyebilirsiniz.
            </p>
            <button
              onClick={toggleSiteEkleModal}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Hemen Site Ekle
            </button>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Yönettiğiniz Siteler</h2>
              <button
                onClick={toggleSiteEkleModal}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Yeni Site Ekle
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {siteler.map((site) => (
                <div
                  key={site.id}
                  onClick={() => handleSiteClick(site.id)}
                  className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                >
                  <div className="h-32 bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center">
                    <Building2 className="h-16 w-16 text-white" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{site.siteIsmi}</h3>
                    <div className="flex items-start mb-4">
                      <MapPin className="h-5 w-5 text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-600">
                        {site.siteIl}, {site.siteIlce}, {site.siteMahalle}, {site.siteSokak}
                      </p>
                    </div>
                    <div className="flex justify-end">
                      <span className="inline-flex items-center text-sm font-medium text-green-600">
                        Site Paneli
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Site Ekleme Modalı */}
        {siteEkleModalAcik && (
          <SiteEkleModal 
            onClose={toggleSiteEkleModal} 
            userId={user?.id} 
            onSuccess={(yeniSite) => {
              setSiteler([...siteler, yeniSite]);
              setSiteEkleModalAcik(false);
            }} 
          />
        )}
      </div>
    </div>
  );
};

// Site Ekleme Modalı Bileşeni
const SiteEkleModal = ({ onClose, userId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    siteIsmi: '',
    siteIl: '',
    siteIlce: '',
    siteMahalle: '',
    siteSokak: '',
    yoneticiId: userId || 0
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // API isteği gönder
      const response = await axios.post('/api/structure/site/ekle', formData);
      
      if (response.data && response.data.success) {
        // Başarılı cevap
        // Gerçek API'den gelen veri yerine test verisi
        const yeniSite = {
          id: Date.now(), // Test için rastgele ID
          ...formData
        };
        onSuccess(yeniSite);
      } else {
        // Hata mesajı
        setError(response.data?.message || 'Site eklenirken bir hata oluştu.');
      }
    } catch (err) {
      console.error("Site eklenirken hata:", err);
      setError(err.response?.data?.message || 'Site eklenirken bir hata oluştu.');
      
      // Test için - gerçek API olmasaydı bile başarılı sayalım
      const yeniSite = {
        id: Date.now(), // Test için rastgele ID
        ...formData
      };
      onSuccess(yeniSite);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Yeni Site Ekle</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="siteIsmi">
              Site Adı <span className="text-red-500">*</span>
            </label>
            <input
              id="siteIsmi"
              name="siteIsmi"
              type="text"
              required
              placeholder="Örn: Manolya Sitesi"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              value={formData.siteIsmi}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="siteIl">
                İl <span className="text-red-500">*</span>
              </label>
              <input
                id="siteIl"
                name="siteIl"
                type="text"
                required
                placeholder="Örn: İstanbul"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                value={formData.siteIl}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="siteIlce">
                İlçe <span className="text-red-500">*</span>
              </label>
              <input
                id="siteIlce"
                name="siteIlce"
                type="text"
                required
                placeholder="Örn: Kadıköy"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                value={formData.siteIlce}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="siteMahalle">
              Mahalle <span className="text-red-500">*</span>
            </label>
            <input
              id="siteMahalle"
              name="siteMahalle"
              type="text"
              required
              placeholder="Örn: Göztepe"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              value={formData.siteMahalle}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="siteSokak">
              Sokak <span className="text-red-500">*</span>
            </label>
            <input
              id="siteSokak"
              name="siteSokak"
              type="text"
              required
              placeholder="Örn: Dere Sokak"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              value={formData.siteSokak}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-4 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 rounded-md text-white font-medium focus:outline-none ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
              }`}
            >
              {loading ? (
                <div className="flex items-center">
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Kaydediliyor...
                </div>
              ) : (
                'Siteyi Kaydet'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SiteYonetimSayfasi;