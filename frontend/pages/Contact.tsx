
import React, { useState } from 'react';

const Contact: React.FC = () => {
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-16">
            <div className="grid md:grid-cols-2 gap-16">
                <div>
                    <h1 className="text-4xl font-heritage font-bold text-orange-950 mb-6">Contactez-nous</h1>
                    <p className="text-lg text-gray-600 mb-8">
                        Une question sur un produit ? Besoin d'une commande sur mesure ? Notre équipe est là pour vous accompagner.
                    </p>

                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <span className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-2xl">📧</span>
                            <div>
                                <h4 className="font-bold text-orange-950">Email</h4>
                                <p className="text-gray-500">contact@darsanaa.ma</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <span className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-2xl">📞</span>
                            <div>
                                <h4 className="font-bold text-orange-950">Téléphone</h4>
                                <p className="text-gray-500">+212 5 22 XX XX XX</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <span className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-2xl">📍</span>
                            <div>
                                <h4 className="font-bold text-orange-950">Siège</h4>
                                <p className="text-gray-500">Quartier des Artisans, Casablanca, Maroc</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-xl border border-orange-50">
                    {submitted ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                            <span className="text-5xl text-green-500">✓</span>
                            <h2 className="text-2xl font-bold text-orange-950">Message envoyé !</h2>
                            <p className="text-gray-500">Incha'Allah nous vous répondrons dans les plus brefs délais.</p>
                            <button
                                onClick={() => setSubmitted(false)}
                                className="text-orange-700 font-bold hover:underline pt-4"
                            >
                                Envoyer un autre message
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-orange-950 mb-2">Nom</label>
                                    <input type="text" className="w-full px-4 py-3 rounded-xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-orange-950 mb-2">Sujet</label>
                                    <input type="text" className="w-full px-4 py-3 rounded-xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-orange-950 mb-2">Email</label>
                                <input type="email" className="w-full px-4 py-3 rounded-xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500" required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-orange-950 mb-2">Message</label>
                                <textarea rows={5} className="w-full px-4 py-3 rounded-xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500" required></textarea>
                            </div>
                            <button className="w-full bg-orange-700 text-white py-4 rounded-xl font-bold hover:bg-orange-800 transition shadow-lg">
                                Envoyer le message
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Contact;
