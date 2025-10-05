import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import siteService from '../services/siteService';
import { Building2, PlusCircle, ChevronRight, Home } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [sites, setSites] = useState([]);
  const [showAddSiteForm, setShowAddSiteForm] = useState(false);
  const [selectedSite, setSelectedSite] = useState(null);
  const [newSite, setNewSite] = useState({
    siteIsmi: '',
    siteIl: '',
    siteIlce: '',
    siteMahalle: '',
    siteSokak: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Kullanıcı bilgilerini al
        const userData = await authService.getUserInfo();
        setUserInfo(userData);
        
        try {
          // Kullanıcının sitelerini al
          const userSites = await siteService.getUserSites();
          setSites(userSites || []);
          
          // Eğer site varsa, ilkini seçili yap
          if (userSites && userSites.length > 0) {
            setSelectedSite(userSites[0]);
          }
        } catch (siteErr) {
          console.error('Site bilgileri alınırken hata:', siteErr);
          // Site bilgileri alınamazsa boş dizi kullan
          setSites([]);
        }
      } catch (err) {
        console.error('Veri yüklenirken hata:', err);
        setError('Bilgiler alınırken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAddSite = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      
      // Gerekli alan kontrolü
      if (!newSite.siteIsmi.trim()) {
        setError('Site ismi boş olamaz!');
        setLoading(false);
        return;
      }

      console.log('Site ekleme başlatılıyor:', newSite);

      // Site ekleme isteği gönder
      const response = await siteService.addSite(newSite);
      console.log('Site ekleme yanıtı:', response);
      
      if (response.success) {
        // Başarılı ise siteleri yeniden yükle
        try {
          const updatedSites = await siteService.getUserSites();
          console.log('Güncellenmiş siteler:', updatedSites);
          setSites(updatedSites || []);
          
          // Yeni eklenen siteyi seç
          if (updatedSites && updatedSites.length > 0) {
            setSelectedSite(updatedSites[0]);
          }
        } catch (loadErr) {
          console.error('Siteler güncellenirken hata:', loadErr);
          // API hatası olsa bile, form işlemi başarılı oldu, kullanıcıyı rahatsız etmeyelim
        }
        
        // Formu kapat ve temizle
        setShowAddSiteForm(false);
        setNewSite({
          siteIsmi: '',
          siteIl: '',
          siteIlce: '',
          siteMahalle: '',
          siteSokak: ''
        });
        
        // Başarı mesajı göster (kullanıcıya bilgi vermek için)
        setError(null);
        // Bildirim olarak göster
        setSuccess('Site başarıyla eklendi!');
        
        // 3 saniye sonra başarı mesajını kaldır
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } else {
        setError(response.message || 'Site eklenirken bir hata oluştu.');
      }
    } catch (err) {
      console.error('Site eklerken hata:', err);
      setError(`Site eklenirken bir hata oluştu: ${err.message || 'Bilinmeyen hata'}`);
      
      // Sunucudan bağımsız olarak verileri yerel olarak sakla
      try {
        const sitesJson = localStorage.getItem('test_sites');
        const sites = sitesJson ? JSON.parse(sitesJson) : [];
        const newSiteData = {
          siteId: Date.now(), // Geçici bir ID
          ...newSite
        };
        sites.push(newSiteData);
        localStorage.setItem('test_sites', JSON.stringify(sites));
        
        // UI'ı güncelle
        setSites([...sites]);
        setSelectedSite(newSiteData);
        
        // Formu kapat ve temizle
        setShowAddSiteForm(false);
        setNewSite({
          siteIsmi: '',
          siteIl: '',
          siteIlce: '',
          siteMahalle: '',
          siteSokak: ''
        });
        
        // Kullanıcıya bilgi ver
        setError('Site geçici olarak kaydedildi. Sunucu hatası: ' + (err.message || 'Bilinmeyen hata'));
      } catch (localErr) {
        console.error('Yerel kayıt hatası:', localErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSite(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSiteSelect = (site) => {
    setSelectedSite(site);
  };
  
  const navigateToDuyurular = () => {
    navigate('/duyurular');
  };
  
  const navigateToDaireler = () => {
    navigate('/daireler');
  };
  
  const navigateToOdemeler = () => {
    navigate('/odemeler');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-border text-green-600" role="status">
            <span className="sr-only">Yükleniyor...</span>
          </div>
          <p className="mt-2 text-gray-600">Bilgiler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {userInfo && (
          <div className="mb-6 bg-gradient-to-r from-green-50 to-green-100 shadow-lg rounded-xl p-6 border-l-4 border-green-600">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">
                  Hoş Geldiniz, {userInfo.kullaniciAdi} {userInfo.kullaniciSoyadi}
                </h1>
                <div className="flex flex-wrap items-center mt-2">
                  <span className="inline-flex items-center px-3 py-1 mr-2 mb-2 rounded-full text-xs font-medium bg-green-200 text-green-800">
                    {userInfo.ApartmanRol === 0 ? 'Yönetici' : userInfo.ApartmanRol === 1 ? 'Sakin' : userInfo.ApartmanRol || 'Yönetici'}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 mr-2 mb-2 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {userInfo.kullaniciEposta}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 mb-2 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {userInfo.kullaniciTelefon}
                  </span>
                </div>
              </div>
              <div className="hidden md:block bg-white p-3 rounded-full shadow">
                <div className="w-12 h-12 flex items-center justify-center bg-green-100 text-green-700 rounded-full text-xl font-bold">
                  {userInfo.kullaniciAdi?.charAt(0)}{userInfo.kullaniciSoyadi?.charAt(0)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Site Seçimi veya Ekleme */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium text-gray-800">Siteleriniz</h2>
            <button 
              onClick={() => setShowAddSiteForm(!showAddSiteForm)}
              className="flex items-center gap-2 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-all"
            >
              <PlusCircle size={18} />
              {showAddSiteForm ? 'İptal' : 'Site Ekle'}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 animate-fadeIn">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">
                    {error}
                  </p>
                </div>
                <div className="ml-auto pl-3">
                  <div className="-mx-1.5 -my-1.5">
                    <button
                      onClick={() => setError(null)}
                      type="button"
                      className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none"
                    >
                      <span className="sr-only">Kapat</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Başarı mesajı */}
          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4 animate-fadeIn">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            </div>
          )}

          {/* Site Ekleme Formu */}
          {showAddSiteForm && (
            <div className="bg-white border border-green-200 p-6 rounded-lg mb-6 shadow-md transition-all duration-300">
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <PlusCircle size={20} className="mr-2 text-green-600" />
                Yeni Site Ekle
              </h3>
              <form onSubmit={handleAddSite}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <span className="text-red-500 mr-1">*</span> Site Adı
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="siteIsmi"
                        value={newSite.siteIsmi}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="Sitenizin adını girin"
                        required
                      />
                      <div className="absolute left-3 top-3 text-gray-400">
                        <Building2 size={18} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      İl
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="siteIl"
                        value={newSite.siteIl}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="İl adını girin"
                      />
                      <div className="absolute left-3 top-3 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      İlçe
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="siteIlce"
                        value={newSite.siteIlce}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="İlçe adını girin"
                      />
                      <div className="absolute left-3 top-3 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M19 21v-4"/><path d="M5 21v-4"/><path d="M9 21v-4"/><path d="M15 21v-4"/><path d="M18 9h3v2"/><path d="M13 5v4"/><path d="M13 9h5"/><path d="M3 9h5"/><path d="M8 5v4"/><path d="M10 5H6a2 2 0 0 0-2 2v2"/><path d="M18 5h-4a2 2 0 0 0-2 2v2"/></svg>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mahalle
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="siteMahalle"
                        value={newSite.siteMahalle}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="Mahalle adını girin"
                      />
                      <div className="absolute left-3 top-3 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z"/><path d="m9 16 .348-.24c1.465-1.013 3.84-1.013 5.304 0L15 16"/><path d="M8 7h.01"/><path d="M16 7h.01"/><path d="M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/></svg>
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sokak
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="siteSokak"
                        value={newSite.siteSokak}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="Sokak adını girin"
                      />
                      <div className="absolute left-3 top-3 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v5"/><path d="M8 14v.5"/><path d="M12 14v.5"/><path d="M16 14v.5"/><path d="M19 14.8v5.2"/><path d="M22 14.8v5.2"/><path d="M19 22a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"/></svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddSiteForm(false)}
                    className="bg-white border border-gray-300 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all font-medium"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all font-medium shadow-md flex items-center"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Kaydediliyor...
                      </>
                    ) : (
                      'Kaydet'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Site Listesi */}
          <div className="mt-4">
            {sites.length > 0 ? (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">KAYITLI SİTELER</h3>
                <div className="space-y-3">
                  {sites.map((site, index) => (
                    <div
                      key={index}
                      onClick={() => handleSiteSelect(site)}
                      className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedSite === site ? 'border-green-500 bg-green-50 shadow-lg' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`p-3 rounded-lg ${selectedSite === site ? 'bg-green-200' : 'bg-gray-100'} mr-4`}>
                          <Building2 className={`h-6 w-6 ${selectedSite === site ? 'text-green-700' : 'text-gray-600'}`} />
                        </div>
                        <div>
                          <h3 className={`font-medium ${selectedSite === site ? 'text-green-800' : 'text-gray-800'}`}>{site.siteIsmi}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {[site.siteMahalle, site.siteIlce, site.siteIl].filter(Boolean).join(', ')}
                          </p>
                        </div>
                      </div>
                      <div className={`rounded-full p-2 ${selectedSite === site ? 'bg-green-200 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        <ChevronRight className="h-5 w-5" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-white border border-dashed border-gray-300 rounded-lg">
                <div className="bg-gray-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <Building2 className="h-10 w-10 text-gray-500" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Henüz site eklenmemiş</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">Yönetmek istediğiniz siteleri ekleyerek Apartman'ım Cepte deneyimine başlayın.</p>
                {!showAddSiteForm && (
                  <button
                    onClick={() => setShowAddSiteForm(true)}
                    className="inline-flex items-center px-5 py-3 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 transition-all"
                  >
                    <PlusCircle className="h-5 w-5 mr-2" />
                    Site Ekle
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Seçilen Site Detayları */}
        {selectedSite && (
          <div className="bg-white shadow-lg rounded-xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center">
                  <Home className="h-6 w-6 text-white mr-3" />
                  {selectedSite.siteIsmi}
                </h2>
                <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-xs font-medium">
                  Seçili Site
                </div>
              </div>
              <p className="text-green-100 mt-2 max-w-2xl">
                {[selectedSite.siteSokak, selectedSite.siteMahalle, selectedSite.siteIlce, selectedSite.siteIl].filter(Boolean).join(', ')}
              </p>
            </div>
            
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Site Yönetimi</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-green-200 hover:shadow transition-all group">
                  <div className="p-3 bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mb-4 group-hover:bg-green-200 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-700"><path d="M2 16.1A5 5 0 0 1 5.9 20M2 12.05A9 9 0 0 1 9.95 20M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6"/><line x1="2" y1="20" x2="2.01" y2="20"/></svg>
                  </div>
                  <h3 className="font-semibold mb-2 text-lg">Duyurular</h3>
                  <p className="text-sm text-gray-600 mb-4 h-12">Siteye ait duyuruları görüntüleyin ve yönetin.</p>
                  <button 
                    onClick={navigateToDuyurular}
                    className="mt-2 w-full bg-green-50 text-green-700 py-2 rounded-lg font-medium hover:bg-green-100 transition-all flex items-center justify-center">
                    <span>Duyurulara Git</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </button>
                </div>
                <div className="p-5 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-green-200 hover:shadow transition-all group">
                  <div className="p-3 bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mb-4 group-hover:bg-green-200 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-700"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                  <h3 className="font-semibold mb-2 text-lg">Daireler</h3>
                  <p className="text-sm text-gray-600 mb-4 h-12">Site dairelerini ve dairelerde yaşayan sakinleri yönetin.</p>
                  <button 
                    onClick={navigateToDaireler}
                    className="mt-2 w-full bg-green-50 text-green-700 py-2 rounded-lg font-medium hover:bg-green-100 transition-all flex items-center justify-center">
                    <span>Daireleri Yönet</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </button>
                </div>
                <div className="p-5 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-green-200 hover:shadow transition-all group">
                  <div className="p-3 bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mb-4 group-hover:bg-green-200 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-700"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="2" x2="22" y1="9" y2="9"/><path d="M12 16a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/></svg>
                  </div>
                  <h3 className="font-semibold mb-2 text-lg">Ödemeler</h3>
                  <p className="text-sm text-gray-600 mb-4 h-12">Aidat ve ödeme bilgilerini takip edin ve yönetin.</p>
                  <button 
                    onClick={navigateToOdemeler}
                    className="mt-2 w-full bg-green-50 text-green-700 py-2 rounded-lg font-medium hover:bg-green-100 transition-all flex items-center justify-center">
                    <span>Ödemeleri Görüntüle</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </button>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-100 p-4 bg-gray-50 flex justify-end">
              <button
                onClick={() => setSelectedSite(null)}
                className="text-gray-500 hover:text-gray-700 font-medium text-sm flex items-center transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="m15 18-6-6 6-6"/></svg>
                Sitelere Dön
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;