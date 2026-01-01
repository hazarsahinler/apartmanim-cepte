import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import YoneticiKayit from './pages/auth/YoneticiKayit';
import KullaniciKayit from './pages/auth/KullaniciKayit';
import Login from './pages/auth/Login';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import KullaniciDashboard from './pages/KullaniciDashboard';
import KullaniciSayfasi from './pages/KullaniciSayfasi';
import KullaniciDaireSecimi from './pages/KullaniciDaireSecimi';
import KullaniciDuyurular from './pages/KullaniciDuyurular';
import KullaniciGiderler from './pages/KullaniciGiderler';
import YoneticiDashboard from './pages/YoneticiDashboard';
import DaireBorcDetay from './pages/DaireBorcDetay';
import FinansalIslemlerSiteSecimi from './pages/FinansalIslemlerSiteSecimi';
import FinansalIslemlerPanel from './pages/FinansalIslemlerPanel';
import FinansalAlacakYonetimi from './pages/FinansalAlacakYonetimi';
import FinansalGiderYonetimi from './pages/FinansalGiderYonetimi';
import './index.css';
import TestPage from './pages/TestPage';
import DuyuruSiteSecimi from './pages/DuyuruSiteSecimi';
import DuyuruYonetimi from './pages/DuyuruYonetimi';
import DuyuruEkleme from './pages/DuyuruEkleme';
import DuyuruListesi from './pages/DuyuruListesi';
import SiteYonetimSayfasiNew from './pages/SiteYonetimSayfasiNew';
import SitePanelSayfasi from './pages/SitePanelSayfasi';
import BlokDetay from './pages/BlokDetay';
import DaireDetay from './pages/DaireDetay';
import ProfilSayfasi from './pages/ProfilSayfasi';
import OdemeIstekleriSayfasi from './pages/OdemeIstekleriSayfasi';
import NetworkStatusMonitor from './components/NetworkStatusMonitor';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen">
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
          <NetworkStatusMonitor />
          
          <Routes>
            <Route path="/" element={<><Navbar /><HomePage /></>} />
            <Route path="/giris" element={<><Navbar /><Login /></>} />
            <Route path="/yonetici-kayit" element={<><Navbar /><YoneticiKayit /></>} />
            <Route path="/kullanici-kayit" element={<><Navbar /><KullaniciKayit /></>} />
            
            <Route path="/duyurular" element={<DuyuruSiteSecimi />} />
            <Route path="/duyuru-yonetimi/:siteId" element={<DuyuruYonetimi />} />
            <Route path="/duyuru-ekleme/:siteId" element={<DuyuruEkleme />} />
            <Route path="/duyuru-listesi/:siteId" element={<DuyuruListesi />} />
            
            <Route path="/site-yonetimi" element={<SiteYonetimSayfasiNew />} />
            <Route path="/yonetici-dashboard" element={<YoneticiDashboard />} />
            <Route path="/kullanici-dashboard" element={<KullaniciDashboard />} />
            <Route path="/kullanici-sayfasi" element={<KullaniciSayfasi />} />
            <Route path="/kullanici-daire-secimi" element={<KullaniciDaireSecimi />} />
            <Route path="/kullanici-duyurular" element={<KullaniciDuyurular />} />
            <Route path="/kullanici-giderler/:siteId" element={<KullaniciGiderler />} />
            <Route path="/site-panel/:siteId" element={<SitePanelSayfasi />} />
            <Route path="/daire-borc-detay/:siteId/:borcId" element={<DaireBorcDetay />} />
            
            <Route path="/finansal-islemler" element={<FinansalIslemlerSiteSecimi />} />
            <Route path="/finansal-islemler/:siteId" element={<FinansalIslemlerPanel />} />
            <Route path="/finansal-alacak-yonetimi/:siteId" element={<FinansalAlacakYonetimi />} />
            <Route path="/finansal-gider-yonetimi/:siteId" element={<FinansalGiderYonetimi />} />
            
            <Route path="/blok-detay/:blokId" element={<BlokDetay />} />
            <Route path="/daire-detay/:daireId" element={<DaireDetay />} />
            
            <Route path="/odeme-istekleri" element={<OdemeIstekleriSayfasi />} />
            <Route path="/odeme-istekleri/:siteId" element={<OdemeIstekleriSayfasi />} />
            
            <Route path="/profil" element={<ProfilSayfasi />} />
            
            <Route path="/test" element={<><Navbar /><TestPage /></>} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
