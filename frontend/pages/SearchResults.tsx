import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import api from '../services/api';
import { Product, User } from '../types';

const SearchResults: React.FC = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [products, setProducts] = useState<Product[]>([]);
    const [artisans, setArtisans] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) return;
            try {
                setLoading(true);
                const [productsRes, artisansRes] = await Promise.all([
                    api.get(`/products?keyword=${encodeURIComponent(query)}`),
                    api.get(`/users/artisans?keyword=${encodeURIComponent(query)}`)
                ]);

                // Map products
                const mappedProducts: Product[] = productsRes.data.map((p: any) => ({
                    id: p._id,
                    artisanId: p.artisan?._id || 'unknown',
                    artisanName: p.artisan?.name || 'Artisan Inconnu',
                    title: p.title,
                    description: p.description,
                    price: p.price,
                    category: p.category,
                    image: p.images?.[0] || 'https://images.unsplash.com/photo-1610631782207-04d4b926eefe?auto=format&fit=crop&w=400&q=80',
                    isCustomizable: p.isCustomizable,
                    stock: p.stock
                }));

                // Map artisans
                const mappedArtisans: User[] = artisansRes.data.map((a: any) => ({
                    ...a,
                    id: a._id || a.id
                }));

                setProducts(mappedProducts);
                setArtisans(mappedArtisans);
                setError(null);
            } catch (err) {
                console.error("Search failed:", err);
                setError("La recherche a échoué. Veuillez réessayer.");
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query]);

    if (!query) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-16 text-center">
                <h1 className="text-3xl font-heritage font-bold text-orange-950 mb-4">Que recherchez-vous ?</h1>
                <p className="text-orange-800/60">Entrez un mot-clé dans la barre de recherche pour explorer notre catalogue.</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-heritage font-bold text-orange-950 mb-8">
                Résultats pour : <span className="text-orange-700 italic">"{query}"</span>
            </h1>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-900"></div>
                </div>
            ) : error ? (
                <div className="text-center py-12 bg-white rounded-3xl border border-red-50">
                    <p className="text-red-500">{error}</p>
                </div>
            ) : (
                <div className="space-y-16">
                    {/* Artisans Results */}
                    {artisans.length > 0 && (
                        <div>
                            <h2 className="text-2xl font-heritage font-bold text-orange-950 mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 text-sm">👤</span>
                                Artisans ({artisans.length})
                            </h2>
                            <div className="grid md:grid-cols-4 gap-6">
                                {artisans.map((artisan) => (
                                    <Link key={artisan.id} to={`/artisan/${artisan.id}`} className="group bg-white p-6 rounded-2xl shadow-sm border border-orange-50 text-center hover:shadow-md transition-all">
                                        <img src={artisan.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e'} className="w-20 h-20 rounded-full mx-auto mb-4 border-2 border-orange-50 object-cover group-hover:scale-105 transition-transform" alt={artisan.name} />
                                        <h3 className="font-bold text-orange-950 mb-1">{artisan.name}</h3>
                                        <p className="text-xs text-orange-700 font-medium">
                                            {artisan.artisanProfile?.region || 'Maroc'}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Products Results */}
                    {products.length > 0 ? (
                        <div>
                            <h2 className="text-2xl font-heritage font-bold text-orange-950 mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 text-sm">📦</span>
                                Produits ({products.length})
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                {products.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        </div>
                    ) : artisans.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-orange-50">
                            <p className="text-orange-950/40 text-lg">Aucun résultat trouvé pour votre recherche.</p>
                            <Link to="/catalogue" className="mt-4 inline-block text-orange-700 hover:underline">Voir tout le catalogue</Link>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
};

export default SearchResults;
