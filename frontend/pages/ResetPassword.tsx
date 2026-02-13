import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const ResetPassword: React.FC = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setStatus('error');
            setMessage('Les mots de passe ne correspondent pas.');
            return;
        }

        setStatus('loading');
        setMessage('');

        try {
            await api.post(`/auth/reset-password/${token}`, { password });
            setStatus('success');
            setMessage('Votre mot de passe a été réinitialisé avec succès.');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err: any) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'Le lien est invalide ou a expiré.');
        }
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center px-4 py-20">
            <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-2xl w-full max-w-lg border border-orange-50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 via-orange-600 to-orange-800"></div>

                <div className="text-center mb-10">
                    <h1 className="text-4xl font-heritage font-bold text-orange-950 mb-3">Réinitialisation</h1>
                    <p className="text-orange-900/40 italic">Choisissez votre nouveau mot de passe</p>
                </div>

                {status === 'success' ? (
                    <div className="space-y-6 text-center">
                        <div className="bg-green-50 text-green-700 p-6 rounded-2xl border border-green-100">
                            <p className="font-medium text-lg mb-2">Succès !</p>
                            <p>{message}</p>
                            <p className="text-sm mt-2 font-normal">Vous allez être redirigé vers la page de connexion...</p>
                        </div>
                        <Link
                            to="/login"
                            className="block w-full bg-orange-700 text-white py-5 rounded-2xl font-bold hover:bg-orange-800 transition-all text-center"
                        >
                            Aller à la connexion
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-orange-950 ml-1">Nouveau mot de passe</label>
                            <input
                                type="password"
                                className="w-full px-5 py-4 rounded-2xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-orange-50/10"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                disabled={status === 'loading'}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-orange-950 ml-1">Confirmer le mot de passe</label>
                            <input
                                type="password"
                                className="w-full px-5 py-4 rounded-2xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-orange-50/10"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
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
                            {status === 'loading' ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
