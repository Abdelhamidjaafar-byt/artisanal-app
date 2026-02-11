
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

        if (formData.password !== formData.confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
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
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[90vh] flex items-center justify-center px-4 py-12">
            <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-2xl w-full max-w-2xl border border-orange-50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 via-orange-600 to-orange-800"></div>

                <div className="text-center mb-12">
                    <h1 className="text-4xl font-heritage font-bold text-orange-950 mb-3">Créer un compte</h1>
                    <p className="text-orange-900/40 italic">Rejoignez notre communauté d'artisans d'excellence</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Role Selection - Full Width Span */}
                    <div className="md:col-span-2 space-y-4">
                        <label className="block text-sm font-bold text-orange-950 ml-1 text-center">S'inscrire en tant que</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'CLIENT' })}
                                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${formData.role === 'CLIENT'
                                    ? 'border-orange-600 bg-orange-50 text-orange-950 shadow-md'
                                    : 'border-orange-100 text-gray-400 hover:border-orange-200'
                                    }`}
                            >
                                <span className="text-2xl">🛍️</span>
                                <span className="font-bold text-sm">Client</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'ARTISAN' })}
                                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${formData.role === 'ARTISAN'
                                    ? 'border-orange-600 bg-orange-50 text-orange-950 shadow-md'
                                    : 'border-orange-100 text-gray-400 hover:border-orange-200'
                                    }`}
                            >
                                <span className="text-2xl">🏺</span>
                                <span className="font-bold text-sm">Artisan</span>
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {/* Row 1: Name & Username */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-orange-950 ml-1">Nom complet</label>
                            <input
                                type="text"
                                name="name"
                                className="w-full px-5 py-4 rounded-2xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-orange-50/10"
                                placeholder="Votre nom complet"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-orange-950 ml-1">Nom d'utilisateur</label>
                            <input
                                type="text"
                                name="username"
                                className="w-full px-5 py-4 rounded-2xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-orange-50/10"
                                placeholder="Identifiant unique"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Row 2: Email & Role Label (Occupies 1 col, but role UI is below) */}
                        <div className="md:col-span-2 space-y-2">
                            <label className="block text-sm font-bold text-orange-950 ml-1">Email</label>
                            <input
                                type="email"
                                name="email"
                                className="w-full px-5 py-4 rounded-2xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-orange-50/10"
                                placeholder="votre@email.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>



                        {/* Row 4: Passwords */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-orange-950 ml-1">Mot de passe</label>
                            <input
                                type="password"
                                name="password"
                                className="w-full px-5 py-4 rounded-2xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-orange-50/10"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                minLength={6}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-orange-950 ml-1">Confirmation</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                className="w-full px-5 py-4 rounded-2xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-orange-50/10"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-700 text-white py-5 rounded-2xl font-bold hover:bg-orange-800 transition-all shadow-xl hover:shadow-orange-900/20 hover:-translate-y-0.5 transform active:scale-[0.98] disabled:opacity-50 text-lg"
                    >
                        {loading ? 'Création du compte...' : "S'inscrire Maintenant"}
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-orange-50 pt-8">
                    <p className="text-gray-500">
                        Déjà membre ?{' '}
                        <Link to="/login" className="text-orange-700 font-bold hover:text-orange-900 transition-colors">
                            Se connecter ici
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
