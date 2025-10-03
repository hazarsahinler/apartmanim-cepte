import React from 'react';

const DuyuruList = ({ duyurular, limit = null, baslik = "Duyurular", onDuyuruClick }) => {
  // Sınırlama varsa, duyuruları sınırla
  const displayDuyurular = limit ? duyurular.slice(0, limit) : duyurular;

  // Tarih formatla
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">{baslik}</h3>
      </div>
      
      {displayDuyurular.length > 0 ? (
        <ul className="divide-y divide-gray-200">
          {displayDuyurular.map((duyuru) => (
            <li 
              key={duyuru.id} 
              className="px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer transition duration-150"
              onClick={() => onDuyuruClick && onDuyuruClick(duyuru)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {duyuru.tip === 'onemli' && (
                    <span className="flex-shrink-0 inline-block bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full mr-2">
                      Önemli
                    </span>
                  )}
                  {duyuru.tip === 'etkinlik' && (
                    <span className="flex-shrink-0 inline-block bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full mr-2">
                      Etkinlik
                    </span>
                  )}
                  <p className="text-sm font-medium text-indigo-600 truncate">{duyuru.baslik}</p>
                </div>
                <div className="ml-2 flex-shrink-0 flex">
                  <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {formatDate(duyuru.tarih)}
                  </p>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-500 line-clamp-2">
                  {duyuru.icerik}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
          Henüz duyuru bulunmamaktadır.
        </div>
      )}
      
      {limit && duyurular.length > limit && (
        <div className="px-4 py-4 sm:px-6 bg-gray-50 border-t border-gray-200">
          <div className="text-sm">
            <a href="/duyurular" className="font-medium text-indigo-600 hover:text-indigo-500">
              Tüm duyuruları görüntüle <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default DuyuruList;