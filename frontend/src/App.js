import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import YoneticiKayit from './pages/auth/YoneticiKayit';
import Login from './pages/auth/Login';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import './index.css';
import TestPage from './pages/TestPage';
import Duyurular from './pages/Duyurular';
import DuyuruOlustur from './pages/DuyuruOlustur';
import DuyuruDetay from './pages/DuyuruDetay';
import DuyuruDuzenle from './pages/DuyuruDuzenle';
import SiteYonetimSayfasiNew from './pages/SiteYonetimSayfasiNew';
import SitePanelSayfasi from './pages/SitePanelSayfasi';
import ProfilSayfasi from './pages/ProfilSayfasi';
import NetworkStatusMonitor from './components/NetworkStatusMonitor';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
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
        />
        {/* Global ağ durumu izleyicisi */}
        <NetworkStatusMonitor />
        
        {/* Navbar'ı ana sayfada göster, dashboard'da gösterme */}
        <Routes>
          {/* Ana Sayfalar */}
          <Route path="/" element={<><Navbar /><HomePage /></>} />
          <Route path="/giris" element={<><Navbar /><Login /></>} />
          <Route path="/yonetici-kayit" element={<><Navbar /><YoneticiKayit /></>} />
          
          {/* Duyuru Sayfaları */}
          <Route path="/duyurular" element={<><Navbar /><Duyurular /></>} />
          <Route path="/duyuru/:id" element={<><Navbar /><DuyuruDetay /></>} />
          <Route path="/duyuru-olustur" element={<><Navbar /><DuyuruOlustur /></>} />
          <Route path="/duyuru-duzenle/:id" element={<><Navbar /><DuyuruDuzenle /></>} />
          
          {/* Site Yönetim Sayfaları */}
          <Route path="/site-yonetimi" element={<SiteYonetimSayfasiNew />} />
          <Route path="/site-panel/:siteId" element={<SitePanelSayfasi />} />
          
          {/* Profil Sayfası */}
          <Route path="/profil" element={<ProfilSayfasi />} />
          
          {/* Test Sayfası */}
          <Route path="/test" element={<><Navbar /><TestPage /></>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;