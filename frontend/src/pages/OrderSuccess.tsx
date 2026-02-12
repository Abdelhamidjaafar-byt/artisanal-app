import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';

const OrderSuccess: React.FC = () => {
    const { clearCart } = useCart();
    const [searchParams] = useSearchParams();
    const [, setPaymentVerified] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const verifyPayment = async () => {
            const sessionId = searchParams.get('session_id');
            console.log('OrderSuccess: Verifying session...', sessionId);

            if (sessionId) {
                try {
                    const res = await api.get(`/stripe/verify-session/${sessionId}`);
                    console.log('OrderSuccess: API Response', res.data);

                    if (res.data.paymentStatus === 'paid') {
                        console.log('OrderSuccess: Payment verified, clearing cart...');
                        setPaymentVerified(true);
                        clearCart();
                    } else {
                        console.warn('OrderSuccess: Payment not confirmed', res.data.paymentStatus);
                        setError('Le paiement n\'a pas été confirmé par Stripe.');
                    }
                } catch (err: any) {
                    console.error('OrderSuccess: Verification failed', err);
                    setError('Impossible de vérifier le paiement auprès du serveur.');
                }
            } else {
                console.log('OrderSuccess: No session ID, clearing cart as fallback');
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
                    <p className="text-orange-950 font-medium">Vérification de votre commande...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center px-4 bg-orange-50/30">
                <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-2xl w-full max-w-md border border-red-50 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="bg-red-50 p-4 rounded-full">
                            <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </div>
                    </div>
                    <h1 className="text-3xl font-heritage font-bold text-orange-950 mb-4">Paiement incomplet</h1>
                    <p className="text-orange-800/70 mb-8 leading-relaxed">{error}</p>
                    <Link
                        to="/checkout"
                        className="block w-full bg-orange-700 text-white py-4 rounded-2xl font-bold hover:bg-orange-800 transition shadow-lg"
                    >
                        Réessayer le paiement
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4 bg-orange-50/30">
            <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-2xl w-full max-w-md border border-green-50 text-center">
                <div className="flex justify-center mb-6">
                    <div className="bg-green-50 p-4 rounded-full">
                        <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                </div>

                <h1 className="text-4xl font-heritage font-bold text-orange-950 mb-4">Mabrouk ! ✨</h1>

                <p className="text-orange-800/70 mb-8 leading-relaxed">
                    Votre paiement a été confirmé. Nos artisans ont été informés et commencent déjà à préparer votre pièce d'exception.
                </p>

                <div className="space-y-4">
                    <Link
                        to="/dashboard"
                        className="block w-full bg-orange-700 text-white py-4 rounded-2xl font-bold hover:bg-orange-800 transition shadow-lg"
                    >
                        Suivre ma commande
                    </Link>
                    <Link
                        to="/catalogue"
                        className="block w-full bg-white border-2 border-orange-100 text-orange-700 py-4 rounded-2xl font-bold hover:bg-orange-50 transition"
                    >
                        Continuer ma découverte
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;
