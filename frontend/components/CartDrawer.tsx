
import React from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const CartDrawer: React.FC = () => {
    const { items, removeItem, updateQuantity, totalPrice, isCartOpen, setIsCartOpen } = useCart();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleCheckout = async () => {
        if (!isAuthenticated) {
            setIsCartOpen(false);
            navigate('/login');
            return;
        }

        // Redirect to checkout page
        setIsCartOpen(false);
        navigate('/checkout');
    };

    if (!isCartOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
                onClick={() => setIsCartOpen(false)}
            />

            {/* Drawer */}
            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out">
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-orange-100">
                        <h2 className="text-xl font-bold text-orange-950">Panier ({items.length})</h2>
                        <button
                            onClick={() => setIsCartOpen(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-grow overflow-y-auto p-4">
                        {items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                <p>Votre panier est vide</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-4 p-3 bg-orange-50 rounded-xl">
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="w-20 h-20 object-cover rounded-lg"
                                        />
                                        <div className="flex-grow">
                                            <h3 className="font-semibold text-orange-950">{item.title}</h3>
                                            <p className="text-orange-700 font-bold">{item.price.toFixed(2)} MAD</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <button
                                                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                    className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-orange-700 hover:bg-orange-100"
                                                >
                                                    -
                                                </button>
                                                <span className="text-sm font-medium">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                    className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-orange-700 hover:bg-orange-100"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeItem(item.productId)}
                                            className="text-gray-400 hover:text-red-500"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {items.length > 0 && (
                        <div className="p-4 border-t border-orange-100">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-lg font-semibold text-orange-950">Total</span>
                                <span className="text-xl font-bold text-orange-700">{totalPrice.toFixed(2)} MAD</span>
                            </div>
                            <button
                                onClick={handleCheckout}
                                className="w-full bg-orange-700 text-white py-4 rounded-xl font-bold hover:bg-orange-800 transition shadow-lg"
                            >
                                Passer la commande
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default CartDrawer;
