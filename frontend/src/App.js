import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import YoneticiKayit from './pages/auth/YoneticiKayit';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Apartman'ım Cepte
              </h1>
              <p className="text-gray-600 mb-8">Apartman yönetimi artık çok kolay!</p>
              <a href="/yonetici-kayit" className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium">
                Yönetici Kayıt
              </a>
            </div>
          </div>
        } />
        <Route path="/yonetici-kayit" element={<YoneticiKayit />} />
      </Routes>
    </Router>
  );
}

export default App;