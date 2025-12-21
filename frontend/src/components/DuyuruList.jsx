import React from 'react';
import { Bell, AlertCircle, Info, CheckCircle } from 'lucide-react';

const DuyuruList = ({ duyurular, limit = null, baslik = "Duyurular", onDuyuruClick }) => {
  // Sınırlama varsa, duyuruları sınırla
  const displayDuyurular = limit ? duyurular.slice(0, limit) : duyurular;

  // Tarih formatla
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };

  // Önem seviyesi badge'i
  const getOnemBadge = (onemSeviyesi) => {
    switch (onemSeviyesi) {
      case 'YUKSEK':
        return (
          <span className="flex items-center gap-1 flex-shrink-0 inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full mr-2">
            <AlertCircle className="h-3 w-3" />
            Yüksek
          </span>
        );
      case 'ORTA':
        return (
          <span className="flex items-center gap-1 flex-shrink-0 inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full mr-2">
            <Info className="h-3 w-3" />
            Orta
          </span>
        );
      case 'DUSUK':
        return (
          <span className="flex items-center gap-1 flex-shrink-0 inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mr-2">
            <CheckCircle className="h-3 w-3" />
            Düşük
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">{baslik}</h3>
      </div>
      
      {displayDuyurular.length > 0 ? (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {displayDuyurular.map((duyuru) => (
            <li 
              key={duyuru.duyuruId} 
              className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition duration-150"
              onClick={() => onDuyuruClick && onDuyuruClick(duyuru)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1 min-w-0">
                  {getOnemBadge(duyuru.onemSeviyesi)}
                  <div className="flex-1 min-w-0">
                    {duyuru.duyuruBaslik && (
                      <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate">
                        {duyuru.duyuruBaslik}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                      {duyuru.duyuruMesaji}
                    </p>
                  </div>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                    {formatDate(duyuru.olusturulmaTarihi)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="px-4 py-5 sm:p-6 text-center text-gray-500 dark:text-gray-400">
          <Bell className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <p>Henüz duyuru bulunmamaktadır.</p>
        </div>
      )}
      
      {limit && duyurular.length > limit && (
        <div className="px-4 py-4 sm:px-6 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <div className="text-sm">
            <a href="/duyurular" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
              Tüm duyuruları görüntüle <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default DuyuruList;