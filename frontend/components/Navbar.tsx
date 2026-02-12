
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { totalItems, setIsCartOpen } = useCart();
  const { wishlist } = useWishlist();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const [searchKeyword, setSearchKeyword] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchKeyword.trim())}`);
      setSearchKeyword('');
    }
  };

  return (
    <nav className="border-b border-orange-100 sticky top-0 z-50" style={{ backgroundColor: '#c9a6787a' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2" >
              <div className="w-16 h-16 moorish-arch flex items-center justify-center border-2 border-[#d48a24]/30 shadow-xl group-hover:scale-110 transition-all duration-500 overflow-hidden">
                <img
                  src="../assets/DAR.png"
                  alt="Logo Dar Sanعa"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-70 h-20 flex items-center justify-center group-hover:scale-110 transition-all duration-500 overflow-hidden">
                <img
                  src="../assets/DAR 2.png"
                  alt="Logo Dar Sanعa"
                  className="w-full h-full object-cover"
                />
              </div>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-orange-900 hover:text-orange-600 font-medium transition">Accueil</Link>
            <Link to="/catalogue" className="text-orange-900 hover:text-orange-600 font-medium transition">Boutique</Link>
            <Link to="/artisans" className="text-orange-900 hover:text-orange-600 font-medium transition">Artisans</Link>
            <Link to="/about" className="text-orange-900 hover:text-orange-600 font-medium transition">À propos</Link>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative group w-40">
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full bg-white/50 border border-orange-100/50 px-4 py-1.5 rounded-full text-orange-950 placeholder-orange-900/40 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all text-sm shadow-sm"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-900/40 group-hover:text-orange-900 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>

            {/* Wishlist Button */}
            <Link
              to="/wishlist"
              className="relative text-orange-900 hover:text-orange-600 transition"
              title="Ma liste d'envies"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {wishlist.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative text-orange-900 hover:text-orange-600 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-700 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

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
            <button
              onClick={() => setIsCartOpen(true)}
              className="text-orange-900 mr-4 relative"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-700 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-orange-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-orange-100 p-4 space-y-4 shadow-xl">
          <form onSubmit={handleSearch} className="relative group mb-4">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full bg-orange-50 border border-orange-100 px-4 py-2 rounded-full text-orange-950 placeholder-orange-900/40 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm"
            />
            <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-900/40">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
          <Link to="/" className="block text-orange-900 font-medium" onClick={() => setIsMenuOpen(false)}>Accueil</Link>
          <Link to="/catalogue" className="block text-orange-900 font-medium" onClick={() => setIsMenuOpen(false)}>Boutique</Link>
          <Link to="/artisans" className="block text-orange-900 font-medium" onClick={() => setIsMenuOpen(false)}>Artisans</Link>
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
