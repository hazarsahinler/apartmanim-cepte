import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, User, Phone, Mail, Building, UserCheck, MapPin } from 'lucide-react';
import { daireService } from '../services/daireService';
import { toast } from 'react-toastify';
import MainNavbar from '../components/MainNavbar';
import Sidebar from '../components/Sidebar';

const DaireDetay = () => {
  const { daireId } = useParams();
  const navigate = useNavigate();
  const [daire, setDaire] = useState(null);
  const [kullanici, setKullanici] = useState(null);
  const [blok, setBlok] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Sidebar state - ana şablona uyum için
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    if (daireId) {
      fetchDaireDetay();
    }
  }, [daireId]);

  const fetchDaireDetay = async () => {
    try {
      setLoading(true);
      
      console.log('DaireDetay - Daire ID:', daireId);
      
      // Daire detaylarını getir
      const daireData = await daireService.getDaireById(daireId);
      console.log('DaireDetay - Daire detayları:', daireData);
      
      if (!daireData) {
        console.error('DaireDetay - Backend null response döndü');
        toast.error('Daire bilgileri alınamadı');
        return;
      }
      
      setDaire(daireData);
      
      // Blok bilgilerini getir
      if (daireData.blokId) {
        console.log('DaireDetay - Blok bilgileri getiriliyor, ID:', daireData.blokId);
        try {
          const blokData = await daireService.getBlokById(daireData.blokId);
          console.log('DaireDetay - Blok bilgileri:', blokData);
          setBlok(blokData);
        } catch (blokError) {
          console.error('DaireDetay - Blok bilgileri yüklenemedi:', blokError);
          // Blok bilgisi yüklenemezse varsayılan değer
          setBlok({ blokAdi: `Blok ${daireData.blokId}` });
        }
      }
      
      // Eğer dairede kullanıcı varsa, kullanıcı bilgilerini getir
      if (daireData.kullaniciId && daireData.kullaniciId !== 0) {
        console.log('DaireDetay - Kullanıcı bilgileri getiriliyor, ID:', daireData.kullaniciId);
        const kullaniciData = await daireService.getKullaniciBilgi(daireData.kullaniciId);
        console.log('DaireDetay - Kullanıcı bilgileri:', kullaniciData);
        setKullanici(kullaniciData);
      } else {
        console.log('DaireDetay - Daire boş, kullanıcı bilgisi yok');
      }
    } catch (error) {
      console.error('DaireDetay - Hata detayları:', error);
      console.error('DaireDetay - Error response:', error.response?.data);
      console.error('DaireDetay - Error status:', error.response?.status);
      
      if (error.response?.status === 404) {
        toast.error('Daire bulunamadı');
      } else if (error.response?.status === 500) {
        toast.error('Sunucu hatası: ' + (error.response?.data?.message || 'Beklenmeyen hata'));
      } else {
        toast.error('Daire detayları yüklenirken hata oluştu: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <MainNavbar toggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
        <Sidebar isOpen={sidebarOpen} />
        
        <div className={`pt-16 transition-all duration-300 ${sidebarOpen ? 'md:ml-64 sm:ml-16' : ''}`}>
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!daire) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <MainNavbar toggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
        <Sidebar isOpen={sidebarOpen} />
        
        <div className={`pt-16 transition-all duration-300 ${sidebarOpen ? 'md:ml-64 sm:ml-16' : ''}`}>
          <div className="container mx-auto px-4 py-8">
            <div className="text-center py-12">
              <Home className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Daire bulunamadı
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Belirtilen daire bilgileri yüklenemedi.
              </p>
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Geri Dön
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const daireBos = !daire.kullaniciId || daire.kullaniciId === 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <MainNavbar toggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
      <Sidebar isOpen={sidebarOpen} />
      
      <div className={`pt-16 transition-all duration-300 ${sidebarOpen ? 'md:ml-64 sm:ml-16' : ''}`}>
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => navigate(-1)}
                  className="mr-4 p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Daire Detayı
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Daire ve sakin bilgilerini görüntüleyin
                  </p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                daireBos 
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200' 
                  : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
              }`}>
                {daireBos ? 'Boş' : 'Dolu'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Daire Bilgileri */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b dark:border-gray-600">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                  <Home className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                  Daire Bilgileri
                </h3>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Daire Numarası:</span>
                  <span className="text-gray-900 dark:text-white font-medium">{daire.daireNo}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Kat Numarası:</span>
                  <span className="text-gray-900 dark:text-white font-medium">{daire.katNo}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Blok:</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {blok ? blok.blokAdi || `Blok ${daire.blokId}` : `Blok ${daire.blokId}`}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Durum:</span>
                  <span className={`font-medium ${
                    daireBos 
                      ? 'text-gray-600 dark:text-gray-400' 
                      : 'text-green-600 dark:text-green-400'
                  }`}>
                    {daireBos ? 'Boş Daire' : 'Dolu Daire'}
                  </span>
                </div>
              </div>
            </div>

            {/* Sakin Bilgileri */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b dark:border-gray-600">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                  <User className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                  Sakin Bilgileri
                </h3>
              </div>
              
              <div className="p-6">
                {daireBos ? (
                  <div className="text-center py-8">
                    <UserCheck className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Sakin Bulunmuyor
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Bu dairede henüz kayıtlı sakin bulunmamaktadır.
                    </p>
                  </div>
                ) : kullanici ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Ad Soyad:</span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {kullanici.kullaniciAdi} {kullanici.kullaniciSoyadi}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400 flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        Telefon:
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {kullanici.kullaniciTelefon}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400 flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        E-posta:
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {kullanici.kullaniciEposta}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400 flex items-center">
                        <Building className="h-4 w-4 mr-1" />
                        Apartman Rolü:
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {kullanici.apartmanRol}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        Konut Kullanımı:
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {kullanici.konutKullanim}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">
                      Kullanıcı bilgileri yükleniyor...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DaireDetay;