import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            const response = await api.post('/auth/forgot-password', { email });
            setStatus('success');
            setMessage(response.data.message || 'Un lien de réinitialisation a été envoyé à votre adresse email.');
        } catch (err: any) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.');
        }
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center px-4 py-20">
            <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-2xl w-full max-w-lg border border-orange-50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 via-orange-600 to-orange-800"></div>

                <div className="text-center mb-10">
                    <h1 className="text-4xl font-heritage font-bold text-orange-950 mb-3">Mot de passe oublié</h1>
                    <p className="text-orange-900/40 italic">Entrez votre email pour réinitialiser votre mot de passe</p>
                </div>

                {status === 'success' ? (
                    <div className="space-y-6 text-center">
                        <div className="bg-green-50 text-green-700 p-6 rounded-2xl border border-green-100">
                            <p className="font-medium text-lg mb-2">Email envoyé !</p>
                            <p>{message}</p>
                        </div>
                        <Link
                            to="/login"
                            className="block w-full bg-orange-700 text-white py-5 rounded-2xl font-bold hover:bg-orange-800 transition-all text-center"
                        >
                            Retour à la connexion
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-orange-950 ml-1">Email</label>
                            <input
                                type="email"
                                className="w-full px-5 py-4 rounded-2xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-orange-50/10"
                                placeholder="votre@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={status === 'loading'}
                            />
                        </div>

                        {status === 'error' && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
                                ⚠️ {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full bg-orange-700 text-white py-5 rounded-2xl font-bold hover:bg-orange-800 transition-all shadow-xl hover:shadow-orange-900/20 hover:-translate-y-0.5 transform active:scale-[0.98] text-lg disabled:opacity-50"
                        >
                            {status === 'loading' ? 'Envoi en cours...' : 'Envoyer le lien'}
                        </button>

                        <div className="text-center">
                            <Link to="/login" className="text-orange-700 font-bold hover:text-orange-900 transition-colors">
                                Retour à la connexion
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
