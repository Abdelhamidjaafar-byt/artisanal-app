
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { CartItem } from '../types';
import api from '../services/api';
import { PayPalButtons } from "@paypal/react-paypal-js";

interface DeliveryAddress {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    notes?: string;
}

const Checkout: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { items, totalPrice, clearCart } = useCart();
    const [step, setStep] = useState<'delivery' | 'payment' | 'confirmation'>('delivery');
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');
    const [internalOrderId, setInternalOrderId] = useState<string | null>(null);

    const [address, setAddress] = useState<DeliveryAddress>({
        fullName: user?.name || '',
        phone: user?.phone || '',
        address: user?.address || '',
        city: user?.city || '',
        postalCode: user?.postalCode || '',
        notes: ''
    });

    const handleAddressSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStep('payment');
    };

    const handlePayment = async () => {
        setLoading(true);
        try {
            // Create order in backend
            const orderItems = items.map(item => ({
                product: item.productId,
                quantity: item.quantity,
                customizationDetails: item.customizationDetails || ''
            }));

            const shippingAddress = `${address.fullName}\n${address.address}\n${address.postalCode} ${address.city}\n${address.phone}`;

            // Create the order first
            const orderRes = await api.post('/orders', {
                items: orderItems,
                shippingAddress,
                paymentInfo: {
                    method: 'stripe',
                    status: 'pending'
                }
            });

            const orderId = orderRes.data._id;

            // Create Stripe Checkout Session
            const stripeRes = await api.post('/stripe/create-checkout-session', {
                orderId
            });

            // Redirect to Stripe Checkout
            if (stripeRes.data.url) {
                window.location.href = stripeRes.data.url;
            }
        } catch (error) {
            console.error('Payment failed:', error);
            alert('Le paiement a échoué. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    const handlePayPalSuccess = async (details: any, orderId: string) => {
        try {
            // Check if captured successfully
            if (details.status === "COMPLETED") {
                clearCart();
                setStep('confirmation');
            } else {
                alert("Le paiement n'a pas pu être complété.");
            }
        } catch (error) {
            console.error("PayPal Capture Error:", error);
            alert("Erreur lors de la capture du paiement.");
        }
    };

    if (items.length === 0 && step !== 'confirmation') {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12 text-center">
                <h1 className="text-3xl font-heritage font-bold text-orange-950 mb-4">Votre panier est vide</h1>
                <p className="text-orange-800/60 mb-8">Ajoutez des produits à votre panier pour continuer.</p>
                <button
                    onClick={() => navigate('/catalogue')}
                    className="bg-orange-700 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-800 transition"
                >
                    Voir le catalogue
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <h1 className="text-4xl font-heritage font-bold text-orange-950 mb-8">Finaliser la commande</h1>

            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-4 mb-12">
                <div className={`flex items-center gap-2 ${step === 'delivery' ? 'text-orange-700' : 'text-orange-300'}`}>
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'delivery' ? 'bg-orange-700 text-white' : 'bg-orange-200'}`}>1</span>
                    <span className="font-bold">Livraison</span>
                </div>
                <div className="w-16 h-0.5 bg-orange-200"></div>
                <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-orange-700' : 'text-orange-300'}`}>
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'payment' ? 'bg-orange-700 text-white' : 'bg-orange-200'}`}>2</span>
                    <span className="font-bold">Paiement</span>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2">
                    {step === 'delivery' && (
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-orange-50">
                            <h2 className="text-2xl font-heritage font-bold text-orange-950 mb-6">Adresse de livraison</h2>
                            <form onSubmit={handleAddressSubmit} className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-orange-950 mb-2">Nom complet</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            value={address.fullName}
                                            onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-orange-950 mb-2">Téléphone</label>
                                        <input
                                            type="tel"
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            value={address.phone}
                                            onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-orange-950 mb-2">Adresse</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        value={address.address}
                                        onChange={(e) => setAddress({ ...address, address: e.target.value })}
                                    />
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-orange-950 mb-2">Ville</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            value={address.city}
                                            onChange={(e) => setAddress({ ...address, city: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-orange-950 mb-2">Code postal</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            value={address.postalCode}
                                            onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-orange-950 mb-2">Notes (optionnel)</label>
                                    <textarea
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        value={address.notes}
                                        onChange={(e) => setAddress({ ...address, notes: e.target.value })}
                                        placeholder="Informations complémentaires pour la livraison..."
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-orange-700 text-white py-4 rounded-xl font-bold hover:bg-orange-800 transition shadow-lg mt-6"
                                >
                                    Continuer vers le paiement
                                </button>
                            </form>
                        </div>
                    )}

                    {step === 'payment' && (
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-orange-50">
                            <h2 className="text-2xl font-heritage font-bold text-orange-950 mb-6">Paiement sécurisé</h2>

                            <div className="space-y-4 mb-8">
                                <button
                                    onClick={() => setPaymentMethod('stripe')}
                                    className={`w-full p-4 rounded-xl border-2 transition text-left ${paymentMethod === 'stripe' ? 'border-orange-700 bg-orange-50' : 'border-orange-100 hover:border-orange-200'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg ${paymentMethod === 'stripe' ? 'bg-orange-700 text-white' : 'bg-orange-100 text-orange-700'}`}>
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-orange-950">Carte Bancaire</h3>
                                            <p className="text-xs text-orange-800/60">Sécurisé par Stripe (VISA, Mastercard...)</p>
                                        </div>
                                        {paymentMethod === 'stripe' && <div className="ml-auto text-orange-700">✓</div>}
                                    </div>
                                </button>

                                <button
                                    onClick={() => setPaymentMethod('paypal')}
                                    className={`w-full p-4 rounded-xl border-2 transition text-left ${paymentMethod === 'paypal' ? 'border-blue-600 bg-blue-50' : 'border-orange-100 hover:border-orange-200'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg ${paymentMethod === 'paypal' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'}`}>
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M7 21L7.9 15.6C8 15.4 8.1 15.3 8.3 15.3H10.5C14.5 15.3 17 13.3 17.6 9.3C17.7 8.5 17.7 7.7 17.5 7C17.1 5 15.5 3.5 13.3 3.5H6.8C6.4 3.5 6.1 3.8 6 4.1L3.1 19.3C3 19.6 3.2 19.9 3.5 19.9H5.5C5.8 19.9 6 19.7 6.1 19.4L6.3 18.2L7 21ZM13.8 9.4C13.4 11.6 11.8 11.6 10.1 11.6H8.6L9.2 8C9.2 7.8 9.4 7.7 9.6 7.7H10C11.6 7.7 13.4 7.7 13.8 9.4Z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-orange-950">PayPal</h3>
                                            <p className="text-xs text-orange-800/60">Paiement via compte PayPal ou carte</p>
                                        </div>
                                        {paymentMethod === 'paypal' && <div className="ml-auto text-blue-600">✓</div>}
                                    </div>
                                </button>
                            </div>

                            <div className="bg-orange-50 p-4 rounded-xl mb-6">
                                <h4 className="font-bold text-orange-950 mb-2">Adresse de livraison</h4>
                                <p className="text-orange-800 text-sm">{address.fullName}</p>
                                <p className="text-orange-800 text-sm">{address.address}</p>
                                <p className="text-orange-800 text-sm">{address.postalCode} {address.city}</p>
                                <p className="text-orange-800 text-sm">📞 {address.phone}</p>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setStep('delivery')}
                                    className="flex-1 bg-orange-100 text-orange-800 py-4 rounded-xl font-bold hover:bg-orange-200 transition"
                                >
                                    Retour
                                </button>

                                {paymentMethod === 'stripe' ? (
                                    <button
                                        onClick={handlePayment}
                                        disabled={loading}
                                        className="flex-1 bg-orange-700 text-white py-4 rounded-xl font-bold hover:bg-orange-800 transition shadow-lg disabled:bg-orange-300 flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Redirection...
                                            </>
                                        ) : (
                                            `Payer ${totalPrice.toFixed(2)} MAD`
                                        )}
                                    </button>
                                ) : (
                                    <div className="flex-1 min-w-[200px]">
                                        <PayPalButtons
                                            style={{ layout: "horizontal", height: 50 }}
                                            createOrder={async () => {
                                                try {
                                                    const orderItems = items.map(item => ({
                                                        product: item.productId,
                                                        quantity: item.quantity,
                                                        customizationDetails: item.customizationDetails || ''
                                                    }));
                                                    const shippingAddress = `${address.fullName}\n${address.address}\n${address.postalCode} ${address.city}\n${address.phone}`;

                                                    const orderRes = await api.post('/orders', {
                                                        items: orderItems,
                                                        shippingAddress,
                                                        paymentInfo: { method: 'paypal', status: 'pending' }
                                                    });
                                                    const orderId = orderRes.data._id;
                                                    setInternalOrderId(orderId);

                                                    const res = await api.post('/paypal/create-order', { orderId });
                                                    return res.data.id;
                                                } catch (error) {
                                                    console.error("PayPal Order Creation Error:", error);
                                                    throw error;
                                                }
                                            }}
                                            onApprove={async (data, actions) => {
                                                try {
                                                    const res = await api.post('/paypal/capture-order', {
                                                        paypalOrderId: data.orderID,
                                                        orderId: internalOrderId
                                                    });
                                                    handlePayPalSuccess(res.data, internalOrderId || "");
                                                } catch (error) {
                                                    console.error("PayPal Approval Error:", error);
                                                }
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {step === 'confirmation' && (
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-orange-50 text-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-4xl">✓</span>
                            </div>
                            <h2 className="text-3xl font-heritage font-bold text-orange-950 mb-4">Merci pour votre commande !</h2>
                            <p className="text-orange-800/60 mb-8">
                                Votre commande a été enregistrée avec succès. Vous allez recevoir un email de confirmation.
                            </p>
                            <div className="bg-orange-50 p-6 rounded-2xl text-left mb-8">
                                <h3 className="font-bold text-orange-950 mb-4">Détails de la livraison</h3>
                                <p className="text-orange-800">{address.fullName}</p>
                                <p className="text-orange-800">{address.address}</p>
                                <p className="text-orange-800">{address.postalCode} {address.city}</p>
                                <p className="text-orange-800 mt-2">📞 {address.phone}</p>
                            </div>
                            <button
                                onClick={() => navigate('/')}
                                className="bg-orange-700 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-800 transition"
                            >
                                Retour à l'accueil
                            </button>
                        </div>
                    )}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-orange-50 sticky top-4">
                        <h3 className="text-xl font-heritage font-bold text-orange-950 mb-4">Récapitulatif</h3>

                        <div className="space-y-4 mb-6">
                            {items.map((item: CartItem) => (
                                <div key={item.id} className="flex gap-4">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-16 h-16 rounded-lg object-cover"
                                    />
                                    <div className="flex-1">
                                        <h4 className="font-bold text-orange-950 text-sm">{item.title}</h4>
                                        <p className="text-orange-700 text-sm">Quantité: {item.quantity}</p>
                                        <p className="font-bold text-orange-800">{(item.price * item.quantity).toFixed(2)} MAD</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-orange-100 pt-4 space-y-2">
                            <div className="flex justify-between text-orange-800/60">
                                <span>Sous-total</span>
                                <span>{totalPrice.toFixed(2)} MAD</span>
                            </div>
                            <div className="flex justify-between text-orange-800/60">
                                <span>Livraison</span>
                                <span>Gratuite</span>
                            </div>
                            <div className="flex justify-between font-bold text-orange-950 text-lg pt-2 border-t border-orange-100">
                                <span>Total</span>
                                <span>{totalPrice.toFixed(2)} MAD</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
