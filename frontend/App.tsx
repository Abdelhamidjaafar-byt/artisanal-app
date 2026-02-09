
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Catalogue from './pages/Catalogue';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ProductDetail from './pages/ProductDetail';
import ArtisanShowroom from './pages/ArtisanShowroom';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const Footer = () => (
  <footer className="bg-white border-t border-orange-100 py-12 mt-20">
    <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-12">
      <div className="col-span-1 md:col-span-2">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 moroccan-gradient rounded-lg flex items-center justify-center text-white font-heritage">AP</div>
          <span className="text-xl font-heritage font-bold text-orange-950">Artisanat Patrimoine</span>
        </div>
        <p className="text-gray-500 max-w-sm">
          La plateforme officielle dédiée à la valorisation et la digitalisation des métiers artisanaux traditionnels marocains. Soutenez l'authenticité.
        </p>
      </div>
      <div>
        <h4 className="font-bold text-orange-950 mb-4">Navigation</h4>
        <ul className="space-y-2 text-gray-500 text-sm">
          <li><a href="#" className="hover:text-orange-700">À propos</a></li>
          <li><a href="#" className="hover:text-orange-700">Artisans</a></li>
          <li><a href="#" className="hover:text-orange-700">Catalogue</a></li>
          <li><a href="#" className="hover:text-orange-700">Contact</a></li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold text-orange-950 mb-4">Légal</h4>
        <ul className="space-y-2 text-gray-500 text-sm">
          <li><a href="#" className="hover:text-orange-700">Mentions légales</a></li>
          <li><a href="#" className="hover:text-orange-700">Protection des données</a></li>
          <li><a href="#" className="hover:text-orange-700">Conditions de vente</a></li>
        </ul>
      </div>
    </div>
    <div className="max-w-7xl mx-auto px-4 pt-12 mt-12 border-t border-orange-50 text-center text-gray-400 text-xs uppercase tracking-widest">
      © 2024 Artisanat Patrimoine Maroc. Tous droits réservés.
    </div>
  </footer>
);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/catalogue" element={<Catalogue />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/artisan/:id" element={<ArtisanShowroom />} />
              <Route path="/login" element={<Login />} />
              <Route 
                path="/dashboard" 
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } 
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;