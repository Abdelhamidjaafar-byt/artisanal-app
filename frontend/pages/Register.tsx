
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
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl w-full max-w-md border border-orange-50">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-heritage font-bold text-orange-950 mb-2">Créer un compte</h1>
                    <p className="text-gray-500">Rejoignez notre communauté artisanale</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-orange-950 mb-2">Nom complet</label>
                        <input
                            type="text"
                            name="name"
                            className="w-full px-4 py-3 rounded-xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                            placeholder="Votre nom complet"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-orange-950 mb-2">Nom d'utilisateur</label>
                        <input
                            type="text"
                            name="username"
                            className="w-full px-4 py-3 rounded-xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                            placeholder="Votre nom d'utilisateur"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-orange-950 mb-2">Email</label>
                        <input
                            type="email"
                            name="email"
                            className="w-full px-4 py-3 rounded-xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                            placeholder="votre@email.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-orange-950 mb-2">Mot de passe</label>
                        <input
                            type="password"
                            name="password"
                            className="w-full px-4 py-3 rounded-xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                            placeholder="Votre mot de passe"
                            value={formData.password}
                            onChange={handleChange}
                            minLength={6}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-orange-950 mb-2">Confirmer le mot de passe</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            className="w-full px-4 py-3 rounded-xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                            placeholder="Confirmez votre mot de passe"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-orange-950 mb-2">S'inscrire en tant que</label>
                        <select
                            name="role"
                            className="w-full px-4 py-3 rounded-xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500 transition bg-white"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="CLIENT">Client</option>
                            <option value="ARTISAN">Artisan</option>
                            <option value="ADMIN">Administrateur (Mode Test)</option>
                        </select>
                    </div>

                    {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-700 text-white py-4 rounded-xl font-bold hover:bg-orange-800 transition shadow-lg disabled:opacity-50"
                    >
                        {loading ? 'Inscription...' : 'S\'inscrire'}
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
