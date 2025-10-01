import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import YoneticiKayit from './pages/auth/YoneticiKayit';
import Login from './pages/auth/Login';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import './index.css';
import YoneticiDashboard from './pages/YoneticiDashboard';
function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/giris" element={<Login />} />
          <Route path="/yonetici-kayit" element={<YoneticiKayit />} />
          <Route path="/giris" element={<Login />} />
          <Route path="/yonetici-kayit" element={<YoneticiKayit />} />
          <Route path="/yonetici-dashboard" element={<YoneticiDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;