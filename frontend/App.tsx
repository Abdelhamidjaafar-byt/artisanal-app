
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Catalogue from './pages/Catalogue';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import LoginSuccess from './src/pages/LoginSuccess';
import OrderSuccess from './src/pages/OrderSuccess';
import OrderCancel from './src/pages/OrderCancel';
import ProductDetail from './pages/ProductDetail';
import CartDrawer from './components/CartDrawer';
import ArtisanShowroom from './pages/ArtisanShowroom';
import Checkout from './pages/Checkout';
import Footer from './components/Footer';
import About from './pages/About';
import Artisans from './pages/Artisans';
import Contact from './pages/Contact';
import Legal from './pages/Legal';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};


const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
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
                <Route path="/register" element={<Register />} />
                <Route path="/login-success" element={<LoginSuccess />} />
                <Route path="/order-success" element={<OrderSuccess />} />
                <Route path="/order-cancel" element={<OrderCancel />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/about" element={<About />} />
                <Route path="/artisans" element={<Artisans />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/legal" element={<Legal />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
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
            <CartDrawer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;