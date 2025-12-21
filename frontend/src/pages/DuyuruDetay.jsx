import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, AlertCircle, Info, CheckCircle, Bell } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import MainNavbar from '../components/MainNavbar';
import { useTheme } from '../contexts/ThemeContext';
import duyuruService from '../services/duyuruService';

const DuyuruDetay = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [duyuru, setDuyuru] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Backend'de tek duyuru getiren endpoint olmadığı için
        // şimdilik tüm duyuruları çekip ID ile eşleşeni buluyoruz
        const allDuyurular = await duyuruService.getDuyurular();
        const foundDuyuru = allDuyurular.find(d => d.duyuruId === parseInt(id));
        
        if (foundDuyuru) {
          setDuyuru(foundDuyuru);
        } else {
          setError('Duyuru bulunamadı');
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Duyuru detayı yüklenirken hata:", err);
        setError('Duyuru detayları yüklenirken bir hata oluştu.');
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const getOnemIcon = (seviye) => {
    switch (seviye) {
      case 'YUKSEK':
        return <AlertCircle className="h-6 w-6" />;
      case 'ORTA':
        return <Info className="h-6 w-6" />;
      case 'DUSUK':
        return <CheckCircle className="h-6 w-6" />;
      default:
        return <Bell className="h-6 w-6" />;
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
        <MainNavbar />
        <Sidebar />
        <div className="pt-20 pl-64">
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !duyuru) {
    return (
      <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
        <MainNavbar />
        <Sidebar />
        <div className="pt-20 pl-64">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg" role="alert">
              <strong className="font-bold">Hata!</strong>
              <span className="block sm:inline"> {error || 'Duyuru bulunamadı'}</span>
            </div>
            <div className="mt-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Geri Dön</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      {/* Top Navigation */}
      <MainNavbar />
      
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="pt-20 pl-64">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Geri Dön"
              >
                <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              </button>
              <div className="flex items-center space-x-3">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: duyuruService.getOnemSeviyesiColor(duyuru.onemSeviyesi) }}
                >
                  {getOnemIcon(duyuru.onemSeviyesi)}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {duyuru.duyuruBaslik || 'Duyuru Detayı'}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    {duyuru.siteIsmi || 'Site Duyurusu'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Duyuru Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            
            {/* Önem Seviyesi ve Tarih */}
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <span 
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: duyuruService.getOnemSeviyesiColor(duyuru.onemSeviyesi) }}
                >
                  {duyuruService.getOnemSeviyesiLabel(duyuru.onemSeviyesi)}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="h-4 w-4" />
                <span>{duyuruService.formatDate(duyuru.olusturulmaTarihi)}</span>
              </div>
            </div>

            {/* Duyuru İçeriği */}
            <div className="prose max-w-none dark:prose-invert">
              <div className="text-gray-900 dark:text-white text-base leading-relaxed whitespace-pre-wrap">
                {duyuru.duyuruMesaji}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DuyuruDetay;
