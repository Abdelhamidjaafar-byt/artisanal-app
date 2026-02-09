
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-pink border-b border-orange-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2"><div className="w-16 h-16  moorish-arch flex items-center justify-center border-2 border-[#d48a24]/30 shadow-xl group-hover:scale-110 transition-all duration-500 overflow-hidden">
              <img
                src="../assets/DAR.png"
                alt="Logo Dar Sanعa"
                className="w-full h-full object-cover"
              />
            </div>
              <div className="w-70 h-20  flex items-center justify-center  group-hover:scale-110 transition-all duration-500 overflow-hidden">
                <img
                  src="../assets/DAR 2.png"
                  alt="Logo Dar Sanعa"
                  className="w-full h-full object-cover"
                />
              </div>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-orange-900 hover:text-orange-600 font-medium transition">Accueil</Link>
            <Link to="/catalogue" className="text-orange-900 hover:text-orange-600 font-medium transition">Boutique</Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-orange-900 hover:text-orange-600 font-medium transition">Mon Espace</Link>
                <button
                  onClick={handleLogout}
                  className="bg-orange-50 text-orange-700 px-4 py-2 rounded-full font-medium hover:bg-orange-100 transition"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <Link to="/login" className="bg-orange-700 text-white px-6 py-2 rounded-full font-medium hover:bg-orange-800 transition shadow-sm">
                Connexion
              </Link>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-orange-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-orange-100 p-4 space-y-4">
          <Link to="/" className="block text-orange-900 font-medium" onClick={() => setIsMenuOpen(false)}>Accueil</Link>
          <Link to="/catalogue" className="block text-orange-900 font-medium" onClick={() => setIsMenuOpen(false)}>Boutique</Link>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="block text-orange-900 font-medium" onClick={() => setIsMenuOpen(false)}>Mon Espace</Link>
              <button onClick={handleLogout} className="block w-full text-left text-orange-700 font-medium">Déconnexion</button>
            </>
          ) : (
            <Link to="/login" className="block bg-orange-700 text-white px-6 py-2 rounded-full text-center font-medium" onClick={() => setIsMenuOpen(false)}>Connexion</Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
