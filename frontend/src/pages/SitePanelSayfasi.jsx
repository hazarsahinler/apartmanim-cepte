import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, Users, Home, PlusCircle, Loader2, AlertCircle, Layers } from 'lucide-react';
import axios from 'axios';
import { duyuruService } from '../services/duyuruService';
import DuyuruList from '../components/DuyuruList';

const SitePanelSayfasi = () => {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [siteData, setSiteData] = useState(null);
  const [error, setError] = useState(null);
  const [duyurular, setDuyurular] = useState([]);
  const [duyuruYukleniyor, setDuyuruYukleniyor] = useState(true);
  const [bloklar, setBloklar] = useState([]);
  const [blokYukleniyor, setBlokYukleniyor] = useState(true);

  useEffect(() => {
    const fetchSiteData = async () => {
      try {
        setLoading(true);
        // Gerçek API çağrısı
        // const response = await axios.get(`/api/structure/site/detay/${siteId}`);
        // setSiteData(response.data);
        
        // Mock veri (gerçek API olmadığında)
        setTimeout(() => {
          const mockSiteData = {
            id: siteId,
            siteIsmi: "Manolya Sitesi",
            siteIl: "İstanbul",
            siteIlce: "Kadıköy",
            siteMahalle: "Göztepe",
            siteSokak: "Dere Sokak",
            blokSayisi: 0,
            daireSayisi: 0,
            sakinSayisi: 0
          };
          setSiteData(mockSiteData);
          setLoading(false);
        }, 800);
      } catch (err) {
        console.error("Site verisi yüklenirken hata:", err);
        setError('Site bilgileri yüklenirken bir hata oluştu.');
        setLoading(false);
      }
    };

    const fetchBloklar = async () => {
      try {
        setBlokYukleniyor(true);
        // Gerçek API çağrısı
        // const response = await axios.get(`/api/structure/blok/site/${siteId}`);
        // setBloklar(response.data);
        
        // Mock veri (gerçek API olmadığında)
        setTimeout(() => {
          const mockBloklar = []; // Boş liste varsayalım, bloklar henüz eklenmemiş
          setBloklar(mockBloklar);
          setBlokYukleniyor(false);
        }, 1000);
      } catch (err) {
        console.error("Blok verisi yüklenirken hata:", err);
        setBloklar([]);
        setBlokYukleniyor(false);
      }
    };

    const fetchDuyurular = async () => {
      try {
        setDuyuruYukleniyor(true);
        // Site ID'ye göre duyuruları çek
        const duyuruData = await duyuruService.getDuyurularBySiteId(siteId);
        setDuyurular(Array.isArray(duyuruData) ? duyuruData : []);
      } catch (err) {
        console.error("Duyurular yüklenirken hata:", err);
        setDuyurular([]);
      } finally {
        setDuyuruYukleniyor(false);
      }
    };

    fetchSiteData();
    fetchBloklar();
    fetchDuyurular();
  }, [siteId]);

  // Duyuru detay sayfasına git
  const handleDuyuruClick = (duyuru) => {
    navigate(`/duyuru/${duyuru.id}`);
  };

  // Yeni duyuru oluştur sayfasına git
  const handleYeniDuyuruClick = () => {
    navigate('/duyuru-olustur');
  };

  // Blok ekleme sayfasına git
  const handleBlokEkleClick = () => {
    navigate(`/blok-ekle/${siteId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-green-500 animate-spin" />
          <span className="mt-4 text-gray-600">Site bilgileri yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Hata!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
          <button
            onClick={() => navigate('/site-yonetim')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Site Yönetimi Sayfasına Dön
          </button>
        </div>
      </div>
    );
  }

  if (!siteData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Uyarı!</strong>
            <span className="block sm:inline"> Site bulunamadı.</span>
          </div>
          <button
            onClick={() => navigate('/site-yonetim')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Site Yönetimi Sayfasına Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Site Başlık ve Özet Bilgiler */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mr-4">
                <Building2 className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{siteData.siteIsmi}</h1>
                <p className="text-gray-600">
                  {siteData.siteIl}, {siteData.siteIlce}, {siteData.siteMahalle}, {siteData.siteSokak}
                </p>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleYeniDuyuruClick}
                className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Duyuru Oluştur
              </button>
              <button
                onClick={() => navigate('/site-yonetim')}
                className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-md"
              >
                Sitelere Dön
              </button>
            </div>
          </div>
        </div>
        
        {/* Ana İçerik - İstatistikler ve Bloklar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sol Kolon - Bloklar ve Daireler */}
          <div className="lg:col-span-2 space-y-8">
            {/* Bloklar Bölümü */}
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Bloklar ve Daireler</h2>
                <button
                  onClick={handleBlokEkleClick}
                  className="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Blok Ekle
                </button>
              </div>
              
              {blokYukleniyor ? (
                <div className="p-8 flex justify-center">
                  <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                </div>
              ) : bloklar.length > 0 ? (
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {bloklar.map((blok) => (
                    <div 
                      key={blok.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                      onClick={() => navigate(`/blok/${blok.id}`)}
                    >
                      <div className="flex items-center mb-2">
                        <Layers className="h-5 w-5 text-blue-500 mr-2" />
                        <h3 className="font-medium text-gray-800">{blok.blokAdi}</h3>
                      </div>
                      <p className="text-sm text-gray-600">{blok.daireSayisi || 0} Daire</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    <Layers className="h-8 w-8 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Henüz Blok Bulunmuyor</h3>
                  <p className="text-gray-600 mb-6">
                    Sitenize blok ekleyerek yönetim işlemine başlayabilirsiniz.
                  </p>
                  <button
                    onClick={handleBlokEkleClick}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    İlk Bloğu Ekle
                  </button>
                </div>
              )}
            </div>
            
            {/* İstatistikler */}
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Site İstatistikleri</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="mx-auto w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                    <Layers className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-blue-700">{siteData.blokSayisi || 0}</div>
                  <p className="text-sm text-gray-600">Blok</p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="mx-auto w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2">
                    <Home className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-green-700">{siteData.daireSayisi || 0}</div>
                  <p className="text-sm text-gray-600">Daire</p>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="mx-auto w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-purple-700">{siteData.sakinSayisi || 0}</div>
                  <p className="text-sm text-gray-600">Sakin</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sağ Kolon - Duyurular */}
          <div className="space-y-8">
            {/* Duyurular */}
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Son Duyurular</h2>
                <button
                  onClick={handleYeniDuyuruClick}
                  className="inline-flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Duyuru Ekle
                </button>
              </div>
              
              {duyuruYukleniyor ? (
                <div className="p-8 flex justify-center">
                  <Loader2 className="h-8 w-8 text-green-500 animate-spin" />
                </div>
              ) : (
                <DuyuruList 
                  duyurular={duyurular} 
                  limit={5} 
                  onDuyuruClick={handleDuyuruClick} 
                />
              )}
            </div>
            
            {/* Hızlı İşlemler */}
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Hızlı İşlemler</h2>
              <div className="space-y-3">
                <button
                  onClick={handleBlokEkleClick}
                  className="w-full flex items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                >
                  <Layers className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="text-blue-800 font-medium">Blok Ekle</span>
                </button>
                
                <button
                  onClick={handleYeniDuyuruClick}
                  className="w-full flex items-center p-3 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
                >
                  <AlertCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-green-800 font-medium">Duyuru Yayınla</span>
                </button>
                
                <button
                  onClick={() => navigate(`/sakin-ekle/${siteId}`)}
                  className="w-full flex items-center p-3 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors"
                >
                  <Users className="h-5 w-5 text-purple-600 mr-3" />
                  <span className="text-purple-800 font-medium">Sakin Ekle</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SitePanelSayfasi;