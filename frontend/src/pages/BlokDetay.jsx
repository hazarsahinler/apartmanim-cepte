import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Home, Building, Layers } from 'lucide-react';
import { daireService } from '../services/daireService';
import { toast } from 'react-toastify';
import MainNavbar from '../components/MainNavbar';
import Sidebar from '../components/Sidebar';

const BlokDetay = () => {
  const { blokId } = useParams();
  const navigate = useNavigate();
  const [daireler, setDaireler] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Sidebar state - ana şablona uyum için
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    if (blokId) {
      fetchDaireler();
    }
  }, [blokId]);

  const fetchDaireler = async () => {
    try {
      setLoading(true);
      const daireData = await daireService.getDairesByBlokId(blokId);
      console.log('Daire verileri alındı:', daireData);
      
      // Daireleri numaraya göre sırala (sabit sıralama)
      const siraliDaireler = (daireData || []).sort((a, b) => a.daireNo - b.daireNo);
      setDaireler(siraliDaireler);
    } catch (error) {
      console.error('Daire verileri yüklenirken hata:', error);
      toast.error('Daire verileri yüklenirken hata oluştu');
      setDaireler([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSakinBilgi = (daire) => {
    // DaireDetay sayfasına git
    navigate(`/daire-detay/${daire.daireId}`);
  };

  const katlarGroupBy = () => {
    const katlar = {};
    daireler.forEach(daire => {
      if (!katlar[daire.katNo]) {
        katlar[daire.katNo] = [];
      }
      katlar[daire.katNo].push(daire);
    });
    
    // Her kattaki daireleri de numaraya göre sırala
    Object.keys(katlar).forEach(katNo => {
      katlar[katNo].sort((a, b) => a.daireNo - b.daireNo);
    });
    
    return katlar;
  };

  const katlarData = katlarGroupBy();
  const katSayilari = Object.keys(katlarData).sort((a, b) => parseInt(b) - parseInt(a));
  const doluDaireler = daireler.filter(d => d.kullaniciId && d.kullaniciId !== 0);
  const bosDaireler = daireler.filter(d => !d.kullaniciId || d.kullaniciId === 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <MainNavbar toggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
        <Sidebar isOpen={sidebarOpen} />
        
        <div className={`pt-16 transition-all duration-300 ${sidebarOpen ? 'md:ml-64 sm:ml-16' : ''}`}>
          <div className="flex justify-center items-center h-screen">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <span className="mt-4 text-gray-600 dark:text-gray-300">Blok detayları yükleniyor...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <MainNavbar toggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
      <Sidebar isOpen={sidebarOpen} />
      
      <div className={`pt-16 transition-all duration-300 ${sidebarOpen ? 'md:ml-64 sm:ml-16' : ''}`}>
        <div className="container mx-auto px-4 py-8">
          {/* Blok Header */}
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
                    Blok Detayı
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Blok dairelerini görüntüleyin ve sakin yönetimi yapın
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>{doluDaireler.length} Dolu</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Home className="h-4 w-4" />
                  <span>{bosDaireler.length} Boş</span>
                </div>
              </div>
            </div>
          </div>
        {/* İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex items-center transition-transform duration-300 hover:shadow-lg transform hover:-translate-y-1">
            <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-3 mr-4">
              <Home className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Toplam Daire</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{daireler.length}</p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex items-center transition-transform duration-300 hover:shadow-lg transform hover:-translate-y-1">
            <div className="rounded-full bg-green-100 dark:bg-green-900 p-3 mr-4">
              <Users className="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Dolu Daire</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{doluDaireler.length}</p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex items-center transition-transform duration-300 hover:shadow-lg transform hover:-translate-y-1">
            <div className="rounded-full bg-orange-100 dark:bg-orange-900 p-3 mr-4">
              <Home className="h-6 w-6 text-orange-600 dark:text-orange-300" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Boş Daire</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{bosDaireler.length}</p>
            </div>
          </div>
        </div>

        {/* Kat Kat Daireler */}
        <div className="space-y-6">
          {katSayilari.map(katNo => (
            <div key={katNo} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b dark:border-gray-600">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                  <Layers className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                  {katNo}. Kat
                </h3>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {katlarData[katNo].map(daire => {
                    const daireDolu = daire.kullaniciId && daire.kullaniciId !== 0; // @ManyToMany için basit kontrol
                    
                    return (
                      <div
                        key={daire.daireId}
                        onClick={() => handleSakinBilgi(daire)}
                        className={`relative p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer ${
                          daireDolu
                            ? 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/30 hover:border-green-600'
                            : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                        } hover:shadow-md transform hover:-translate-y-1`}
                      >
                        <div className="text-center">
                          <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                            daireDolu ? 'bg-green-500 dark:bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-600'
                          }`}>
                            {daireDolu ? (
                              <Users className="h-4 w-4" />
                            ) : (
                              <Home className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                            )}
                          </div>
                          
                          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Daire {daire.daireNo}
                          </p>
                          
                          <p className={`text-xs font-medium ${
                            daireDolu 
                              ? 'text-green-700 dark:text-green-400' 
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {daireDolu ? 'Dolu' : 'Boş'}
                          </p>
                          
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            Detaylar için tıklayın
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {daireler.length === 0 && (
          <div className="text-center py-12">
            <Building className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Henüz daire bulunmuyor
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Bu blokta henüz daire kaydı yapılmamış.
            </p>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default BlokDetay;