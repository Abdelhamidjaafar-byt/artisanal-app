import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { User } from '../types';

const Artisans: React.FC = () => {
    const [artisans, setArtisans] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchArtisans = async () => {
            try {
                const response = await api.get('/users/artisans');
                setArtisans(response.data);
            } catch (err) {
                console.error('Failed to fetch artisans:', err);
                setError('Impossible de charger les artisans.');
            } finally {
                setLoading(false);
            }
        };

        fetchArtisans();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-700 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-16 text-center">
                <p className="text-red-500 font-bold">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 text-orange-700 hover:underline"
                >
                    Réessayer
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-16">
            <h1 className="text-4xl font-heritage font-bold text-orange-950 mb-12 text-center">Nos Maîtres Artisans</h1>
            {artisans.length === 0 ? (
                <p className="text-center text-gray-500">Aucun artisan trouvé pour le moment.</p>
            ) : (
                <div className="grid md:grid-cols-3 gap-8">
                    {artisans.map((artisan: any) => (
                        <Link key={artisan.id || artisan._id} to={`/artisan/${artisan.id || artisan._id}`} className="group bg-white p-8 rounded-3xl shadow-sm border border-orange-50 text-center hover:shadow-xl transition-all duration-300">
                            <img src={artisan.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e'} className="w-32 h-32 rounded-full mx-auto mb-6 border-4 border-orange-50 object-cover group-hover:scale-110 transition-transform" alt={artisan.name} />
                            <h3 className="text-2xl font-heritage font-bold text-orange-950 mb-2">{artisan.name}</h3>
                            <p className="text-orange-700 font-bold mb-4">
                                {artisan.artisanProfile?.specialties?.join(', ') || 'Maître Artisan'}
                            </p>
                            <p className="text-sm text-gray-500 mb-6 flex items-center justify-center gap-2">
                                <span>📍</span> {artisan.artisanProfile?.region || artisan.region || 'Maroc'}
                            </p>
                            <div className="pt-6 border-t border-orange-50">
                                <span className="text-orange-900 text-sm font-bold uppercase tracking-widest group-hover:text-orange-700 transition">Voir la vitrine ➔</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Artisans;
