import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <Home className="h-6 w-6 text-green-600" />
              <span className="font-bold text-xl text-gray-800">Apartman'ım Cepte</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link 
              to="/giris" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Giriş Yap
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;