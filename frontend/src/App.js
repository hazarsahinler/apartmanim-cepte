import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import YoneticiKayit from './pages/auth/YoneticiKayit';
import KullaniciKayit from './pages/auth/KullaniciKayit';
import Login from './pages/auth/Login';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import KullaniciDashboard from './pages/KullaniciDashboard';
import YoneticiDashboard from './pages/YoneticiDashboard';
import DaireBorcDetay from './pages/DaireBorcDetay';
import FinansalIslemlerSiteSecimi from './pages/FinansalIslemlerSiteSecimi';
import FinansalIslemlerPanel from './pages/FinansalIslemlerPanel';
import FinansalAlacakYonetimi from './pages/FinansalAlacakYonetimi';
import FinansalGiderYonetimi from './pages/FinansalGiderYonetimi';
import './index.css';
import TestPage from './pages/TestPage';
import Duyurular from './pages/Duyurular';
import DuyuruOlustur from './pages/DuyuruOlustur';
import DuyuruDetay from './pages/DuyuruDetay';
import DuyuruDuzenle from './pages/DuyuruDuzenle';
import SiteYonetimSayfasiNew from './pages/SiteYonetimSayfasiNew';
import SitePanelSayfasi from './pages/SitePanelSayfasi';
import BlokDetay from './pages/BlokDetay';
import DaireDetay from './pages/DaireDetay';
import ProfilSayfasi from './pages/ProfilSayfasi';
import NetworkStatusMonitor from './components/NetworkStatusMonitor';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen">
          {/* Toast notifikasyonları için global konteyner */}
          <ToastContainer 
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
          {/* Global ağ durumu izleyicisi */}
          <NetworkStatusMonitor />
          
          {/* Navbar'ı ana sayfada göster, dashboard'da gösterme */}
          <Routes>
            {/* Ana Sayfalar */}
            <Route path="/" element={<><Navbar /><HomePage /></>} />
            <Route path="/giris" element={<><Navbar /><Login /></>} />
            <Route path="/yonetici-kayit" element={<><Navbar /><YoneticiKayit /></>} />
            <Route path="/kullanici-kayit" element={<><Navbar /><KullaniciKayit /></>} />
            
            {/* Duyuru Sayfaları */}
            <Route path="/duyurular" element={<><Navbar /><Duyurular /></>} />
            <Route path="/duyuru/:id" element={<><Navbar /><DuyuruDetay /></>} />
            <Route path="/duyuru-olustur" element={<><Navbar /><DuyuruOlustur /></>} />
            <Route path="/duyuru-duzenle/:id" element={<><Navbar /><DuyuruDuzenle /></>} />
            
            {/* Site Yönetim Sayfaları */}
            <Route path="/site-yonetimi" element={<SiteYonetimSayfasiNew />} />
            <Route path="/yonetici-dashboard" element={<YoneticiDashboard />} />
            <Route path="/kullanici-dashboard" element={<KullaniciDashboard />} />
            <Route path="/site-panel/:siteId" element={<SitePanelSayfasi />} />
            <Route path="/daire-borc-detay/:siteId/:borcId" element={<DaireBorcDetay />} />
            
            {/* Finansal İşlemler Routes */}
            <Route path="/finansal-islemler" element={<FinansalIslemlerSiteSecimi />} />
            <Route path="/finansal-islemler/:siteId" element={<FinansalIslemlerPanel />} />
            <Route path="/finansal-alacak-yonetimi/:siteId" element={<FinansalAlacakYonetimi />} />
            <Route path="/finansal-gider-yonetimi/:siteId" element={<FinansalGiderYonetimi />} />
            
            <Route path="/blok-detay/:blokId" element={<BlokDetay />} />
            <Route path="/daire-detay/:daireId" element={<DaireDetay />} />
            
            {/* Profil Sayfası */}
            <Route path="/profil" element={<ProfilSayfasi />} />
            
            {/* Test Sayfası */}
            <Route path="/test" element={<><Navbar /><TestPage /></>} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;