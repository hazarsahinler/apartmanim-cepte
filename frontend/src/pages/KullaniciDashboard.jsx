import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Bell, User, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';
import { userDaireService } from '../services/userDaireService';

const KullaniciDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [daireInfo, setDaireInfo] = useState(null);

  useEffect(() => {
    const initPage = async () => {
      try {
        setLoading(true);
        
        if (!authService.isAuthenticated()) {
          navigate('/giris');
          return;
        }

        const userInfo = await authService.getUserInfo();
        setUser(userInfo);

        try {
          const daireBilgileri = await userDaireService.getKullaniciDaireBilgileri(userInfo.telefonNumarasi);
          setDaireInfo(daireBilgileri);
        } catch (dairErr) {
          console.warn('Daire bilgisi alınamadı:', dairErr.message);
        }

      } catch (err) {
        console.error('Hata:', err);
        toast.error(err.message || 'Bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    initPage();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-green-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md p-4">
        <div className="flex items-center">
          <Home className="h-6 w-6 text-green-500 mr-2" />
          <span className="text-xl font-bold">Apartmanım Cepte</span>
        </div>
      </nav>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">
          Hoş Geldiniz, {user?.ad}
        </h1>
        
        {daireInfo && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Daire Bilgilerim</h2>
            <p>Site: {daireInfo.siteAdi}</p>
            <p>Blok: {daireInfo.blokAdi}</p>
            <p>Daire No: {daireInfo.daireNo}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KullaniciDashboard;
