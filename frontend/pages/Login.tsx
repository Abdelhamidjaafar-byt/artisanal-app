
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Échec de la connexion. Vérifiez vos identifiants.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl w-full max-w-md border border-orange-50">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-heritage font-bold text-orange-950 mb-2">Bon Retour</h1>
          <p className="text-gray-500">Connectez-vous à votre espace patrimoine</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-orange-950 mb-2">Email</label>
            <input
              type="email"
              className="w-full px-4 py-3 rounded-xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-orange-950 mb-2">Mot de passe</label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
              placeholder="Votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

          <button
            type="submit"
            className="w-full bg-orange-700 text-white py-4 rounded-xl font-bold hover:bg-orange-800 transition shadow-lg"
          >
            Se Connecter
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-orange-50 text-center">
          <p className="text-sm text-gray-500 mb-4 italic">Emails de test disponibles:</p>
          <div className="flex flex-col gap-2">
            <button type="button" onClick={() => { setEmail('ahmed@fassi.ma'); setPassword('123456'); }} className="text-xs bg-orange-50 text-orange-700 py-1 px-3 rounded hover:bg-orange-100">Artisan: ahmed@fassi.ma (mdp: 123456)</button>
            <button type="button" onClick={() => { setEmail('admin@artisanat.ma'); setPassword('123456'); }} className="text-xs bg-orange-50 text-orange-700 py-1 px-3 rounded hover:bg-orange-100">Admin: admin@artisanat.ma (mdp: 123456)</button>
            <button type="button" onClick={() => { setEmail('youssef@client.ma'); setPassword('123456'); }} className="text-xs bg-orange-50 text-orange-700 py-1 px-3 rounded hover:bg-orange-100">Client: youssef@client.ma (mdp: 123456)</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
