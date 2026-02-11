
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setShake(false);

    try {
      const success = await login(email, password);
      if (success) {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Échec de la connexion. Vérifiez vos identifiants.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = (provider: 'google' | 'facebook') => {
    window.location.href = `http://localhost:3000/auth/${provider}`;
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className={`bg-white p-8 md:p-12 rounded-3xl shadow-xl w-full max-w-md border border-orange-50 transition-all duration-300 ${shake ? 'animate-shake' : ''}`}>
        <div className="text-center mb-10">
          <h1 className="text-3xl font-heritage font-bold text-orange-950 mb-2">Bon Retour</h1>
          <p className="text-gray-500">Connectez-vous à votre espace patrimoine</p>
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
                <p className="text-red-800 text-sm font-bold">Erreur de connexion</p>
                <p className="text-red-700 text-sm opacity-90">{error}</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-orange-950 mb-2">Email</label>
            <input
              type="email"
              className="w-full px-4 py-3 rounded-xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500 transition disabled:bg-gray-50"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-orange-950 mb-2">Mot de passe</label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500 transition disabled:bg-gray-50"
              placeholder="Votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-orange-700 text-white py-4 rounded-xl font-bold transition shadow-lg flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-orange-800'}`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white"></div>
                Connexion...
              </>
            ) : (
              'Se Connecter'
            )}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-orange-100"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">ou</span>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={() => handleOAuthLogin('google')}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continuer avec Google
            </button>

            <button
              type="button"
              onClick={() => handleOAuthLogin('facebook')}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition shadow-sm"
            >
              <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Continuer avec Facebook
            </button>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-orange-50 text-center">
          <p className="text-gray-500 mb-4">
            Pas encore de compte?{' '}
            <Link to="/register" className="text-orange-700 font-bold hover:underline">
              S'inscrire
            </Link>
          </p>
          {/* <p className="text-sm text-gray-500 mb-4 italic">Emails de test disponibles:</p>
          <div className="flex flex-col gap-2">
            {/* <button type="button" onClick={() => { setEmail('ahmed@fassi.ma'); setPassword('123456'); }} className="text-xs bg-orange-50 text-orange-700 py-1 px-3 rounded hover:bg-orange-100">Artisan: ahmed@fassi.ma (mdp: 123456)</button>
            <button type="button" onClick={() => { setEmail('admin@artisanat.ma'); setPassword('123456'); }} className="text-xs bg-orange-50 text-orange-700 py-1 px-3 rounded hover:bg-orange-100">Admin: admin@artisanat.ma (mdp: 123456)</button>
            <button type="button" onClick={() => { setEmail('youssef@client.ma'); setPassword('123456'); }} className="text-xs bg-orange-50 text-orange-700 py-1 px-3 rounded hover:bg-orange-100">Client: youssef@client.ma (mdp: 123456)</button> 
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Login;
