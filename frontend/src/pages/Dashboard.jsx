import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import siteService from '../services/siteService';
import { Building2, PlusCircle, ChevronRight, User, Mail, Phone } from 'lucide-react';
import { toast } from 'react-toastify';

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
        toast.error('Site ismi boş olamaz!');
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
        
        // Başarı mesajı göster
        setError(null);
        toast.success('Site başarıyla eklendi!', {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        setError(response.message || 'Site eklenirken bir hata oluştu.');
        toast.error(response.message || 'Site eklenirken bir hata oluştu.');
      }
    } catch (err) {
      console.error('Site eklerken hata:', err);
      setError(`Site eklenirken bir hata oluştu: ${err.message || 'Bilinmeyen hata'}`);
      toast.error(`Site eklenirken bir hata oluştu: ${err.message || 'Bilinmeyen hata'}`);
      
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
        toast.warning('Site geçici olarak kaydedildi. Sunucu hatası: ' + (err.message || 'Bilinmeyen hata'));
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
                  <div className="flex items-center mr-6 text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-1 text-green-600" />
                    <span>{userInfo.kullaniciEposta}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-1 text-green-600" />
                    <span>{userInfo.kullaniciTelefon}</span>
                  </div>
                </div>
              </div>
              <div className="bg-white p-3 rounded-full shadow-sm">
                <User className="h-10 w-10 text-green-600" />
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Site Seçilmemişse */}
        {!selectedSite ? (
          <div>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-800">Sitelerim</h2>
                  <button
                    onClick={() => setShowAddSiteForm(!showAddSiteForm)}
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      showAddSiteForm
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {showAddSiteForm ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        <span>İptal</span>
                      </>
                    ) : (
                      <>
                        <PlusCircle className="h-4 w-4 mr-1" />
                        <span>Yeni Site Ekle</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              {showAddSiteForm ? (
                <div className="p-6 bg-gray-50">
                  <h3 className="text-md font-medium text-gray-700 mb-4">Yeni Site Ekle</h3>
                  <form onSubmit={handleAddSite}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="siteIsmi" className="block text-sm font-medium text-gray-700 mb-1">Site Adı *</label>
                        <input
                          type="text"
                          id="siteIsmi"
                          name="siteIsmi"
                          value={newSite.siteIsmi}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="siteIl" className="block text-sm font-medium text-gray-700 mb-1">İl *</label>
                        <input
                          type="text"
                          id="siteIl"
                          name="siteIl"
                          value={newSite.siteIl}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label htmlFor="siteIlce" className="block text-sm font-medium text-gray-700 mb-1">İlçe *</label>
                        <input
                          type="text"
                          id="siteIlce"
                          name="siteIlce"
                          value={newSite.siteIlce}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="siteMahalle" className="block text-sm font-medium text-gray-700 mb-1">Mahalle *</label>
                        <input
                          type="text"
                          id="siteMahalle"
                          name="siteMahalle"
                          value={newSite.siteMahalle}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="siteSokak" className="block text-sm font-medium text-gray-700 mb-1">Sokak *</label>
                        <input
                          type="text"
                          id="siteSokak"
                          name="siteSokak"
                          value={newSite.siteSokak}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setShowAddSiteForm(false)}
                        className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none"
                      >
                        İptal
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
                      >
                        {loading ? 'Kaydediliyor...' : 'Site Ekle'}
                      </button>
                    </div>
                  </form>
                </div>
              ) : sites.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                  {sites.map(site => (
                    <div 
                      key={site.id || site.siteId}
                      onClick={() => handleSiteSelect(site)}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="h-24 bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                        <Building2 className="h-10 w-10 text-white" />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-800">{site.siteIsmi}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {site.siteIl}, {site.siteIlce}, {site.siteMahalle}
                        </p>
                        <div className="mt-3 flex justify-end">
                          <span className="inline-flex items-center text-xs font-medium text-green-600">
                            <span>Yönet</span>
                            <ChevronRight className="ml-1 h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-gray-100 mb-4">
                    <Building2 className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-gray-800 font-medium mb-1">Henüz siteniz bulunmuyor</h3>
                  <p className="text-gray-600 text-sm mb-4">Site ekleyerek yönetim paneline erişebilirsiniz.</p>
                  <button
                    onClick={() => setShowAddSiteForm(true)}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
                  >
                    <PlusCircle className="h-4 w-4 mr-1" />
                    <span>Site Ekle</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">{selectedSite.siteIsmi}</h2>
                <div className="text-sm text-gray-600">
                  <span>{selectedSite.siteIl}, {selectedSite.siteIlce}, {selectedSite.siteMahalle}</span>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="text-md font-medium text-gray-700 mb-6">Site Yönetim İşlemleri</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-green-200 hover:shadow transition-all group">
                  <div className="p-3 bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mb-4 group-hover:bg-green-200 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-700"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/></svg>
                  </div>
                  <h3 className="font-semibold mb-2 text-lg">Duyurular</h3>
                  <p className="text-sm text-gray-600 mb-4 h-12">Site sakinlerine duyurular ekleyin ve mevcut duyuruları yönetin.</p>
                  <button 
                    onClick={navigateToDuyurular}
                    className="mt-2 w-full bg-green-50 text-green-700 py-2 rounded-lg font-medium hover:bg-green-100 transition-all flex items-center justify-center">
                    <span>Duyuruları Yönet</span>
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