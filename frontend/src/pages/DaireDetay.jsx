import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, User, Phone, Mail, Building, UserCheck, MapPin, Users, UserPlus, Plus } from 'lucide-react';
import { daireService } from '../services/daireService';
import { siteService } from '../services/siteService';
import { toast } from 'react-toastify';
import MainNavbar from '../components/MainNavbar';
import Sidebar from '../components/Sidebar';

const DaireDetay = () => {
  const { daireId } = useParams();
  const navigate = useNavigate();
  const [daire, setDaire] = useState(null);
  const [sakinler, setSakinler] = useState([]); // Çoklu sakin desteği
  const [blok, setBlok] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sakinEkleModalAcik, setSakinEkleModalAcik] = useState(false);

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
      
      // @ManyToMany: Dairede kullanıcılar varsa, hepsinin bilgilerini getir
      if (daireData.kullaniciResponseDTOS && daireData.kullaniciResponseDTOS.length > 0) {
        console.log('DaireDetay - Kullanıcı bilgileri getiriliyor, Kullanıcı sayısı:', daireData.kullaniciResponseDTOS.length);
        setSakinler(Array.from(daireData.kullaniciResponseDTOS)); // Set'i Array'e çevir
      } else {
        console.log('DaireDetay - Daire boş, kullanıcı bilgisi yok');
        setSakinler([]);
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
        <MainNavbar />
        <Sidebar />
        
        <div className="pt-16 ml-64">
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
        <MainNavbar />
        <Sidebar />
        
        <div className="pt-16 ml-64">
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

  const daireBos = !sakinler || sakinler.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <MainNavbar />
      <Sidebar />
      
      <div className="pt-16 ml-64">
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
              <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b dark:border-gray-600 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                  <Users className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                  Sakin Bilgileri ({sakinler.length})
                </h3>
                <button
                  onClick={() => setSakinEkleModalAcik(true)}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center text-sm"
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  Sakin Ekle
                </button>
              </div>
              
              <div className="p-6">
                {daireBos ? (
                  <div className="text-center py-8">
                    <UserCheck className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Sakin Bulunmuyor
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Bu dairede henüz kayıtlı sakin bulunmamaktadır.
                    </p>
                    <button
                      onClick={() => setSakinEkleModalAcik(true)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center mx-auto"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      İlk Sakini Ekle
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sakinler.map((sakin, index) => (
                      <div key={sakin.kullaniciId || index} className="border dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium text-gray-900 dark:text-white">
                            {sakin.kullaniciAdi} {sakin.kullaniciSoyadi}
                          </h5>
                          <span className={`text-xs px-2 py-1 rounded ${
                            sakin.konutKullanim === 'EvSahibi' 
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                              : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                          }`}>
                            {sakin.konutKullanim === 'EvSahibi' ? 'Ev Sahibi' : 'Kiracı'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">{sakin.kullaniciTelefon}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">{sakin.kullaniciEposta}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <Building className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">
                              {sakin.apartmanRol || 'Sakin'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sakin Ekleme Modal'ı */}
        {sakinEkleModalAcik && (
          <SakinEkleModal
            daire={daire}
            onClose={() => setSakinEkleModalAcik(false)}
            onSuccess={() => {
              console.log('Sakin ekleme başarılı, daire verileri yenileniyor...');
              // Biraz bekleyip sonra veriyi yenile (backend'in güncellenmesi için)
              setTimeout(() => {
                fetchDaireDetay();
              }, 500);
              setSakinEkleModalAcik(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

// Sakin Ekleme Modal Bileşeni - İki Aşamalı Sistem
const SakinEkleModal = ({ daire, onClose, onSuccess }) => {
  const [step, setStep] = useState(1); // 1: Telefon arama, 2: Kullanıcı seçimi, 3: Kayıt formu
  const [telefon, setTelefon] = useState('');
  const [loading, setLoading] = useState(false);
  const [bulunanKullanici, setBulunanKullanici] = useState(null);
  
  // Kayıt formu için state
  const [formData, setFormData] = useState({
    kullaniciAdi: '',
    kullaniciSoyadi: '',
    kullaniciEposta: '',
    kullaniciSifre: '',
    konutKullanim: 0 // 0: Ev Sahibi, 1: Kiracı
  });

  const handleTelefonKontrol = async () => {
    if (!telefon.trim()) {
      toast.error('Lütfen telefon numarası giriniz');
      return;
    }

    try {
      setLoading(true);
      console.log('Telefon kontrol ediliyor:', telefon);
      
      // Telefon numarası ile kullanıcı kontrolü - yeni siteService kullan
      const result = await siteService.searchUserByPhone(telefon);
      
      if (result.success && result.user) {
        // Kullanıcı kayıtlı - seçim aşamasına geç
        console.log('Kullanıcı bulundu:', result.user);
        setBulunanKullanici(result.user);
        setStep(2); // Kullanıcı seçim aşamasına geç
        toast.success(`Kullanıcı bulundu: ${result.user.kullaniciAdi} ${result.user.kullaniciSoyadi}`);
      } else {
        // Kullanıcı kayıtlı değil - kayıt formuna geç
        console.log('Kullanıcı kayıtlı değil, kayıt formuna geçiliyor');
        setBulunanKullanici(null);
        setStep(3); // Kayıt formu aşamasına geç
        toast.info('Kullanıcı kayıtlı değil. Lütfen kayıt bilgilerini doldurun.');
      }
    } catch (error) {
      console.error('Telefon kontrol hatası:', error);
      toast.error('Telefon kontrolü sırasında hata oluştu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKullaniciSec = async () => {
    if (!bulunanKullanici) {
      toast.error('Seçilecek kullanıcı bulunamadı');
      return;
    }

    try {
      setLoading(true);
      console.log('Kullanıcı daireye ekleniyor:', bulunanKullanici);
      
      await siteService.addUserToApartment(
        bulunanKullanici.kullaniciId || bulunanKullanici.id, 
        daire.daireId
      );
      
      toast.success(`${bulunanKullanici.kullaniciAdi} ${bulunanKullanici.kullaniciSoyadi} daireye eklendi!`);
      onSuccess();
    } catch (addError) {
      console.error('Daireye ekleme hatası:', addError);
      toast.error(addError.message || 'Kullanıcı daireye eklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleKayitVeEkle = async (e) => {
    e.preventDefault();
    
    if (!formData.kullaniciAdi || !formData.kullaniciSoyadi || !formData.kullaniciEposta || !formData.kullaniciSifre) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }

    try {
      setLoading(true);
      
      // ApartmanSakinKayitDTO formatında veri hazırla
      const sakinData = {
        kullaniciAdi: formData.kullaniciAdi,
        kullaniciSoyadi: formData.kullaniciSoyadi,
        kullaniciEposta: formData.kullaniciEposta,
        kullaniciSifre: formData.kullaniciSifre,
        kullaniciTelefon: telefon,
        konutKullanim: formData.konutKullanim,
        daireId: daire.daireId
      };
      
      console.log('Yeni kullanıcı kaydediliyor:', sakinData);
      
      await daireService.registerSakin(sakinData);
      
      toast.success('Kullanıcı kaydedildi ve daireye eklendi!');
      onSuccess();
    } catch (error) {
      console.error('Kayıt hatası:', error);
      toast.error('Kayıt sırasında hata oluştu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
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
        
        {step === 1 ? (
          // Telefon Kontrolü Adımı
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Telefon Numarası
              </label>
              <input
                type="tel"
                value={telefon}
                onChange={(e) => setTelefon(e.target.value)}
                placeholder="05XX XXX XX XX"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={loading}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Önce telefon numarası ile kontrol edeceğiz
              </p>
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
                type="button"
                onClick={handleTelefonKontrol}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                disabled={loading || !telefon.trim()}
              >
                {loading ? 'Kontrol Ediliyor...' : 'Kontrol Et'}
              </button>
            </div>
          </div>
        ) : step === 2 ? (
          // Kullanıcı Seçim Adımı
          <div className="space-y-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
              <strong>{telefon}</strong> numarasıyla kayıtlı kullanıcı bulundu!
            </div>
            
            {bulunanKullanici && (
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 space-y-2">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {bulunanKullanici.kullaniciAdi} {bulunanKullanici.kullaniciSoyadi}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <Phone className="w-4 h-4" />
                  <span>{bulunanKullanici.kullaniciTelefon || telefon}</span>
                </div>
                
                {bulunanKullanici.kullaniciEposta && (
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                    <Mail className="w-4 h-4" />
                    <span>{bulunanKullanici.kullaniciEposta}</span>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                disabled={loading}
              >
                Geri
              </button>
              <button
                type="button"
                onClick={handleKullaniciSec}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Ekleniyor...' : 'Daireye Ekle'}
              </button>
            </div>
          </div>
        ) : (
          // Kayıt Formu Adımı
          <form onSubmit={handleKayitVeEkle} className="space-y-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
              <strong>{telefon}</strong> numarası kayıtlı değil. Yeni kullanıcı kaydı yapılacak.
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ad
                </label>
                <input
                  type="text"
                  name="kullaniciAdi"
                  value={formData.kullaniciAdi}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Soyad
                </label>
                <input
                  type="text"
                  name="kullaniciSoyadi"
                  value={formData.kullaniciSoyadi}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                E-posta
              </label>
              <input
                type="email"
                name="kullaniciEposta"
                value={formData.kullaniciEposta}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Şifre
              </label>
              <input
                type="password"
                name="kullaniciSifre"
                value={formData.kullaniciSifre}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Konut Kullanımı
              </label>
              <select
                name="konutKullanim"
                value={formData.konutKullanim}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value={0}>Ev Sahibi</option>
                <option value={1}>Kiracı</option>
              </select>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                disabled={loading}
              >
                Geri
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Kaydediliyor...' : 'Kaydet ve Ekle'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default DaireDetay;