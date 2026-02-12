import React from 'react';
import { Link } from 'react-router-dom';

const OrderCancel: React.FC = () => {
    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4 bg-orange-50/30">
            <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-2xl w-full max-w-md border border-orange-50 text-center">
                <div className="flex justify-center mb-6">
                    <div className="bg-orange-100 p-4 rounded-full">
                        <svg className="w-16 h-16 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </div>
                </div>

                <h1 className="text-3xl font-heritage font-bold text-orange-950 mb-4">Paiement Annulé</h1>

                <p className="text-orange-800/70 mb-8 leading-relaxed">
                    Votre paiement n'a pas été finalisé. Vos articles sont toujours précieusement gardés dans votre panier.
                </p>

                <div className="space-y-4">
                    <Link
                        to="/checkout"
                        className="block w-full bg-orange-700 text-white py-4 rounded-2xl font-bold hover:bg-orange-800 transition shadow-lg"
                    >
                        Réessayer le paiement
                    </Link>
                    <Link
                        to="/catalogue"
                        className="block w-full bg-white border-2 border-orange-100 text-orange-700 py-4 rounded-2xl font-bold hover:bg-orange-50 transition"
                    >
                        Retourner à la boutique
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderCancel;
