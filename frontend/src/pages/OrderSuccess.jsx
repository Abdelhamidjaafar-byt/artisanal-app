
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';

const OrderSuccess = () => {
  const { clearCart } = useCart();
  const [searchParams] = useSearchParams();
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get('session_id');
      
      if (sessionId) {
        try {
          const res = await api.get(`/stripe/verify-session/${sessionId}`);
          if (res.data.paymentStatus === 'paid') {
            setPaymentVerified(true);
            clearCart();
          } else {
            setError('Le paiement n\'a pas été confirmé.');
          }
        } catch (err) {
          console.error('Payment verification failed:', err);
          setError('Impossible de vérifier le paiement.');
        }
      } else {
        // If no session_id, still clear cart for direct access
        clearCart();
        setPaymentVerified(true);
      }
      setLoading(false);
    };

    verifyPayment();
  }, [searchParams, clearCart]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-700 mx-auto mb-4"></div>
          <p className="text-orange-950">Vérification du paiement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl w-full max-w-md border border-red-100 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-red-100 p-4 rounded-full">
              <svg className="w-16 h-16 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-heritage font-bold text-orange-950 mb-4">Erreur de paiement</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <Link
            to="/checkout"
            className="block w-full bg-orange-700 text-white py-4 rounded-xl font-bold hover:bg-orange-800 transition shadow-lg"
          >
            Réessayer le paiement
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl w-full max-w-md border border-green-100 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-4 rounded-full">
            <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-heritage font-bold text-orange-950 mb-4">Paiement Confirmé !</h1>
        
        <p className="text-gray-600 mb-8">
          Merci pour votre commande. Votre pièce artisanale est en cours de préparation par nos artisans.
          Un email de confirmation vous sera envoyé sous peu.
        </p>

        <div className="space-y-4">
          <Link
            to="/dashboard"
            className="block w-full bg-orange-700 text-white py-4 rounded-xl font-bold hover:bg-orange-800 transition shadow-lg"
          >
            Voir mes commandes
          </Link>
          <Link
            to="/catalogue"
            className="block w-full bg-orange-50 text-orange-700 py-4 rounded-xl font-bold hover:bg-orange-100 transition"
          >
            Continuer vos achats
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
