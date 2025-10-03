import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import YoneticiKayit from './pages/auth/YoneticiKayit';
import Login from './pages/auth/Login';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import './index.css';
import YoneticiDashboard from './pages/YoneticiDashboard';
import TestPage from './pages/TestPage';
import Duyurular from './pages/Duyurular';
import DuyuruOlustur from './pages/DuyuruOlustur';
import DuyuruDetay from './pages/DuyuruDetay';
import DuyuruDuzenle from './pages/DuyuruDuzenle';
import SiteYonetimSayfasi from './pages/SiteYonetimSayfasi';
import SitePanelSayfasi from './pages/SitePanelSayfasi';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        {/* Navbar'ı ana sayfada göster, dashboard'da gösterme */}
        <Routes>
          {/* Ana Sayfalar */}
          <Route path="/" element={<><Navbar /><HomePage /></>} />
          <Route path="/giris" element={<><Navbar /><Login /></>} />
          <Route path="/yonetici-kayit" element={<><Navbar /><YoneticiKayit /></>} />
          
          {/* Dashboard Sayfaları */}
          <Route path="/dashboard" element={<YoneticiDashboard />} />
          <Route path="/yonetici-dashboard" element={<YoneticiDashboard />} />
          
          {/* Duyuru Sayfaları */}
          <Route path="/duyurular" element={<><Navbar /><Duyurular /></>} />
          <Route path="/duyuru/:id" element={<><Navbar /><DuyuruDetay /></>} />
          <Route path="/duyuru-olustur" element={<><Navbar /><DuyuruOlustur /></>} />
          <Route path="/duyuru-duzenle/:id" element={<><Navbar /><DuyuruDuzenle /></>} />
          
          {/* Site Yönetim Sayfaları */}
          <Route path="/site-yonetimi" element={<SiteYonetimSayfasi />} />
          <Route path="/site-panel/:siteId" element={<SitePanelSayfasi />} />
          
          {/* Test Sayfası */}
          <Route path="/test" element={<><Navbar /><TestPage /></>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;