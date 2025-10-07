import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Home, PlusCircle, UserPlus, Building, UserMinus, Layers } from 'lucide-react';
import { daireService } from '../services/daireService';
import { toast } from 'react-toastify';
import MainNavbar from '../components/MainNavbar';
import Sidebar from '../components/Sidebar';

const BlokDetay = () => {
  const { blokId } = useParams();
  const navigate = useNavigate();
  const [daireler, setDaireler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sakinEkleModalAcik, setSakinEkleModalAcik] = useState(false);
  const [secilenDaire, setSecilenDaire] = useState(null);
  const [kullanicilar, setKullanicilar] = useState({}); // Kullanıcı bilgilerini cache'lemek için
  
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
      
      // Dolu daireler için kullanıcı bilgilerini getir
      const doluDaireler = siraliDaireler.filter(daire => daire.kullaniciId && daire.kullaniciId !== 0);
      const kullaniciBilgileri = {};
      
      for (const daire of doluDaireler) {
        try {
          const kullaniciBilgi = await daireService.getKullaniciBilgi(daire.kullaniciId);
          kullaniciBilgileri[daire.kullaniciId] = kullaniciBilgi;
        } catch (error) {
          console.error(`Kullanıcı ${daire.kullaniciId} bilgileri yüklenemedi:`, error);
          kullaniciBilgileri[daire.kullaniciId] = {
            kullaniciAdi: 'Bilinmeyen',
            kullaniciSoyadi: 'Kullanıcı'
          };
        }
      }
      
      setKullanicilar(kullaniciBilgileri);
    } catch (error) {
      console.error('Daire verileri yüklenirken hata:', error);
      toast.error('Daire verileri yüklenirken hata oluştu');
      setDaireler([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSakinEkle = (daire) => {
    if (!daire.kullaniciId || daire.kullaniciId === 0) {
      setSecilenDaire(daire);
      setSakinEkleModalAcik(true);
    } else {
      toast.info('Bu daire zaten dolu');
    }
  };

  const handleSakinBilgi = (daire) => {
    // DaireDetay sayfasına git
    navigate(`/daire-detay/${daire.daireId}`);
  };

  const handleSakinSil = async (daire) => {
    if (window.confirm(`${daire.katNo}. Kat Daire ${daire.daireNo}'daki kullanıcıyı silmek istediğinize emin misiniz?`)) {
      try {
        await daireService.removeSakin(daire.daireId);
        toast.success('Kullanıcı başarıyla silindi');
        fetchDaireler(); // Listeyi yenile
      } catch (error) {
        toast.error('Kullanıcı silinirken hata oluştu');
      }
    }
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
                    const dairebos = !daire.kullaniciId || daire.kullaniciId === 0;
                    
                    return (
                      <div
                        key={daire.daireId}
                        className={`relative p-4 rounded-lg border-2 transition-all duration-300 ${
                          dairebos
                            ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                            : 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/30 hover:border-green-600'
                        } hover:shadow-md transform hover:-translate-y-1`}
                      >
                        <div className="text-center">
                          <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                            dairebos ? 'bg-gray-200 dark:bg-gray-600' : 'bg-green-500 dark:bg-green-600 text-white'
                          }`}>
                            {dairebos ? (
                              <Home className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                            ) : (
                              <Users className="h-4 w-4" />
                            )}
                          </div>
                          
                          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Daire {daire.daireNo}
                          </p>
                          
                          {dairebos ? (
                            <div className="space-y-2">
                              <p className="text-xs text-gray-500 dark:text-gray-400">Boş</p>
                              <button
                                onClick={() => handleSakinEkle(daire)}
                                className="w-full px-2 py-1 text-xs bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white rounded transition-colors flex items-center justify-center"
                              >
                                <UserPlus className="h-3 w-3 mr-1" />
                                Sakin Ekle
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="text-xs text-green-700 dark:text-green-400">
                                <p className="font-medium">
                                  {kullanicilar[daire.kullaniciId] 
                                    ? `${kullanicilar[daire.kullaniciId].kullaniciAdi} ${kullanicilar[daire.kullaniciId].kullaniciSoyadi}`
                                    : 'Kullanıcı bilgisi yükleniyor...'
                                  }
                                </p>
                              </div>
                              <div className="space-y-1">
                                <button
                                  onClick={() => handleSakinBilgi(daire)}
                                  className="w-full px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white rounded transition-colors flex items-center justify-center"
                                >
                                  <Users className="h-3 w-3 mr-1" />
                                  Sakin Bilgi
                                </button>
                                <button
                                  onClick={() => handleSakinSil(daire)}
                                  className="w-full px-2 py-1 text-xs bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white rounded transition-colors flex items-center justify-center"
                                >
                                  <UserMinus className="h-3 w-3 mr-1" />
                                  Kullanıcı Sil
                                </button>
                              </div>
                            </div>
                          )}
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

      {/* Sakin Ekleme Modal'ı */}
      {sakinEkleModalAcik && secilenDaire && (
        <SakinEkleModal
          daire={secilenDaire}
          onClose={() => {
            setSakinEkleModalAcik(false);
            setSecilenDaire(null);
          }}
          onSuccess={() => {
            fetchDaireler();
            setSakinEkleModalAcik(false);
            setSecilenDaire(null);
          }}
        />
      )}
      </div>
    </div>
  );
};

// Sakin Ekleme Modal Bileşeni
const SakinEkleModal = ({ daire, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    kullaniciAdi: '',
    kullaniciSoyadi: '',
    email: '',
    sifre: '',
    telefon: '',
    konutKullanim: 'EvSahibi' // Varsayılan değer - KonutKullanimRol enum'una göre
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.kullaniciAdi || !formData.kullaniciSoyadi || !formData.email || !formData.sifre || !formData.telefon) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }

    try {
      setLoading(true);
      
      const sakinData = {
        ...formData,
        daireId: daire.daireId
      };
      
      console.log('Frontend\'den gönderilecek sakin verisi:', sakinData);
      console.log('Daire bilgisi:', daire);
      
      await daireService.registerSakin(sakinData);
      toast.success('Sakin başarıyla eklendi');
      onSuccess();
    } catch (error) {
      console.error('Sakin eklenirken hata:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      
      // Backend'den gelen hata mesajını göster
      const errorMessage = error.message || 'Sakin eklenirken hata oluştu';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Sakin Ekle - {daire.katNo}. Kat Daire {daire.daireNo}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ad
            </label>
            <input
              type="text"
              name="kullaniciAdi"
              value={formData.kullaniciAdi}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Soyad
            </label>
            <input
              type="text"
              name="kullaniciSoyadi"
              value={formData.kullaniciSoyadi}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Şifre
            </label>
            <input
              type="password"
              name="sifre"
              value={formData.sifre}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefon
            </label>
            <input
              type="tel"
              name="telefon"
              value={formData.telefon}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Konut Kullanım
            </label>
            <select
              name="konutKullanim"
              value={formData.konutKullanim}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="EvSahibi">Ev Sahibi</option>
              <option value="Kiracı">Kiracı</option>
            </select>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              disabled={loading}
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Ekleniyor...' : 'Sakin Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlokDetay;