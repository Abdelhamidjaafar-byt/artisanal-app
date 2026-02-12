
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Catalogue from './pages/Catalogue';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import LoginSuccess from './src/pages/LoginSuccess';
import AdminDashboard from './pages/AdminDashboard';
import OrderSuccess from './pages/OrderSuccess';
import OrderCancel from './pages/OrderCancel';
import ProductDetail from './pages/ProductDetail';
import SearchResults from './pages/SearchResults';
import CartDrawer from './components/CartDrawer';
import ArtisanShowroom from './pages/ArtisanShowroom';
import Checkout from './pages/Checkout';
import Wishlist from './pages/Wishlist';
import { WishlistProvider } from './context/WishlistContext';
import Footer from './components/Footer';
import About from './pages/About';
import Artisans from './pages/Artisans';
import Contact from './pages/Contact';
import Legal from './pages/Legal';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-heritage-cream/20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-orange-700"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};


const App: React.FC = () => {
  return (
    <PayPalScriptProvider options={{
      clientId: (import.meta as any).env.VITE_PAYPAL_CLIENT_ID || "sb",
      currency: "USD"
    }}>
      <AuthProvider>
        <NotificationProvider>
          <WishlistProvider>
            <CartProvider>
              <Router>
                <div className="min-h-screen flex flex-col">
                  <Navbar />
                  <main className="flex-grow">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/catalogue" element={<Catalogue />} />
                      <Route path="/search" element={<SearchResults />} />
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
                      <Route
                        path="/admin"
                        element={
                          <PrivateRoute>
                            <AdminDashboard />
                          </PrivateRoute>
                        }
                      />
                      <Route path="/wishlist" element={<Wishlist />} />
                      <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                  </main>
                  <Footer />
                  <CartDrawer />
                </div>
              </Router>
            </CartProvider>
          </WishlistProvider>
        </NotificationProvider>
      </AuthProvider>
    </PayPalScriptProvider>
  );
};

export default App;