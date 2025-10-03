import React from 'react';

const TestPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-6 text-green-600">
          Test Sayfası
        </h1>
        <p className="text-gray-700 mb-4">
          Bu sayfa çalışıyorsa, React router ve bileşenler doğru yapılandırılmış demektir.
        </p>
        <div className="border-t border-gray-200 my-6"></div>
        <div className="text-center">
          <p className="text-gray-500 text-sm">
            Şu an görüntülediğiniz sayfa: <span className="font-mono bg-gray-100 p-1 rounded">TestPage.jsx</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestPage;