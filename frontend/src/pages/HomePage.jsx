import React from 'react';
import { Building2, Users, CreditCard, Clock, Shield, Smartphone } from 'lucide-react';

const HomePage = () => {
  const features = [
    {
      icon: <Building2 className="h-8 w-8 text-green-600" />,
      title: "Apartman Yönetimi",
      description: "Tüm apartman işlerinizi tek bir yerden kolayca yönetin"
    },
    {
      icon: <Users className="h-8 w-8 text-green-600" />,
      title: "Sakin İletişimi",
      description: "Apartman sakinleriyle anlık iletişim kurun"
    },
    {
      icon: <CreditCard className="h-8 w-8 text-green-600" />,
      title: "Aidat Takibi",
      description: "Aidat ödemelerini kolayca takip edin ve yönetin"
    },
    {
      icon: <Clock className="h-8 w-8 text-green-600" />,
      title: "Anlık Bildirimler",
      description: "Önemli duyuru ve bilgileri anında alın"
    },
    {
      icon: <Shield className="h-8 w-8 text-green-600" />,
      title: "Güvenli Erişim",
      description: "Verileriniz güvenle saklanır ve korunur"
    },
    {
      icon: <Smartphone className="h-8 w-8 text-green-600" />,
      title: "Mobil Uyumlu",
      description: "Her cihazdan kolayca erişin ve yönetin"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Modern Apartman Yönetimi</span>
              <span className="block text-green-600">Artık Çok Kolay</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Apartmanınızı akıllı telefonunuzdan yönetin. Aidat takibi, duyurular, arıza bildirimi ve daha fazlası...
            </p>
            <div className="mt-10">
              <button
                onClick={() => window.location.href = 'mailto:info@apartmanimcepte.com'}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 md:text-lg"
              >
                İletişime Geçin
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-green-100">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Hemen Başlayın
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Apartman yönetiminizi modernleştirmek için bizimle iletişime geçin.
            </p>
            <div className="mt-8">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = 'mailto:info@apartmanimcepte.com';
                }}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                Detaylı Bilgi Alın
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;