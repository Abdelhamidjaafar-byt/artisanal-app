
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Register: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'CLIENT'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [shake, setShake] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setShake(false);

        if (formData.password !== formData.confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            setShake(true);
            setTimeout(() => setShake(false), 500);
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/register', {
                name: formData.name,
                username: formData.username,
                email: formData.email,
                password: formData.password,
                role: formData.role
            });
            navigate('/login');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Échec de l\'inscription');
            setShake(true);
            setTimeout(() => setShake(false), 500);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className={`bg-white p-8 md:p-12 rounded-3xl shadow-xl w-full max-w-md border border-orange-50 transition-all duration-300 ${shake ? 'animate-shake' : ''}`}>
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-heritage font-bold text-orange-950 mb-2">Créer un compte</h1>
                    <p className="text-gray-500">Rejoignez notre communauté artisanale</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="bg-red-500 text-white rounded-full p-1 mt-0.5">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p className="text-red-800 text-sm font-bold">Erreur d'inscription</p>
                                <p className="text-red-700 text-sm opacity-90">{error}</p>
                            </div>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-semibold text-orange-950 mb-2">Nom complet</label>
                        <input
                            type="text"
                            name="name"
                            className="w-full px-4 py-3 rounded-xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500 transition disabled:bg-gray-50"
                            placeholder="Votre nom complet"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-orange-950 mb-2">Nom d'utilisateur</label>
                        <input
                            type="text"
                            name="username"
                            className="w-full px-4 py-3 rounded-xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500 transition disabled:bg-gray-50"
                            placeholder="Votre nom d'utilisateur"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-orange-950 mb-2">Email</label>
                        <input
                            type="email"
                            name="email"
                            className="w-full px-4 py-3 rounded-xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500 transition disabled:bg-gray-50"
                            placeholder="votre@email.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-orange-950 mb-2">Mot de passe</label>
                        <input
                            type="password"
                            name="password"
                            className="w-full px-4 py-3 rounded-xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500 transition disabled:bg-gray-50"
                            placeholder="Votre mot de passe"
                            value={formData.password}
                            onChange={handleChange}
                            minLength={6}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-orange-950 mb-2">Confirmer le mot de passe</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            className="w-full px-4 py-3 rounded-xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500 transition disabled:bg-gray-50"
                            placeholder="Confirmez votre mot de passe"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-orange-950 mb-2">S'inscrire en tant que</label>
                        <select
                            name="role"
                            className="w-full px-4 py-3 rounded-xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500 transition bg-white disabled:bg-gray-50"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            disabled={loading}
                        >
                            <option value="CLIENT">Client</option>
                            <option value="ARTISAN">Artisan</option>
                            <option value="ADMIN">Administrateur (Mode Test)</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-orange-700 text-white py-4 rounded-xl font-bold transition shadow-lg flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-orange-800'}`}
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white"></div>
                                Inscription...
                            </>
                        ) : (
                            'S\'inscrire'
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-500">
                        Déjà un compte?{' '}
                        <Link to="/login" className="text-orange-700 font-bold hover:underline">
                            Se connecter
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
