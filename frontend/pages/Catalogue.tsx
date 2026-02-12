
import React, { useState, useEffect } from 'react';
import { CRAFT_CATEGORIES } from '../constants';
import ProductCard from '../components/ProductCard';
import api from '../services/api';
import { Product, User } from '../types';

const Catalogue: React.FC = () => {
  const [selectedArtisan, setSelectedArtisan] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<{ min?: number, max?: number }>({});
  const [artisans, setArtisans] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [artisansRes, filtersRes] = await Promise.all([
          api.get('/users/artisans'),
          api.get('/products/filters')
        ]);
        setArtisans(artisansRes.data);
      } catch (err) {
        console.error("Failed to fetch filters:", err);
      }
    };
    fetchFilters();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let params = new URLSearchParams();
        if (selectedArtisan) params.append('artisan', selectedArtisan);
        if (priceRange.min) params.append('minPrice', priceRange.min.toString());
        if (priceRange.max) params.append('maxPrice', priceRange.max.toString());

        const response = await api.get(`/products?${params.toString()}`);

        const mappedProducts: Product[] = response.data.map((p: any) => ({
          id: p._id,
          artisanId: p.artisan?._id || 'unknown',
          artisanName: p.artisan?.name || 'Artisan Inconnu',
          title: p.title,
          description: p.description,
          price: p.price,
          category: p.category,
          image: p.images?.[0] || 'https://via.placeholder.com/300',
          isCustomizable: p.isCustomizable,
          stock: p.stock
        }));

        setProducts(mappedProducts);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("Impossible de charger les produits. Veuillez réessayer plus tard.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedArtisan, priceRange]);

  // Filter is now done on backend, but we could also double check locally if we wanted
  // but let's rely on backend filtering as per the useEffect logic.

  const displayProducts = products;
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-heritage font-bold text-orange-950 mb-4">Découvrez l'Excellence Marocaine</h1>
        <p className="text-orange-900/60 max-w-2xl mx-auto">
          Chaque objet est une pièce unique façonnée par le temps et la passion. Filtrez par métier pour explorer nos trésors.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:w-64 space-y-8">
          <div className="flex justify-between items-center lg:block">
            <h3 className="text-lg font-heritage font-bold text-orange-950 mb-4">Filtres</h3>
            <button
              onClick={() => {
                setSelectedArtisan(null);
                setPriceRange({});
              }}
              className="text-orange-700 text-xs font-bold hover:underline mb-4"
            >
              Réinitialiser
            </button>
          </div>

          <div>
            <h4 className="text-sm font-bold text-orange-900 mb-3 uppercase tracking-wider">Prix (MAD)</h4>
            <div className="space-y-2">
              {[
                { label: 'Tous les prix', range: {} },
                { label: 'Moins de 500', range: { max: 500 } },
                { label: '500 - 2000', range: { min: 500, max: 2000 } },
                { label: 'Plus de 2000', range: { min: 2000 } }
              ].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setPriceRange(p.range)}
                  className={`w-full text-left px-4 py-2 rounded-xl text-xs font-medium transition ${JSON.stringify(priceRange) === JSON.stringify(p.range) ? 'bg-orange-850 text-white' : 'bg-white text-orange-900 border border-orange-100 hover:bg-orange-50'}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-orange-900 mb-3 uppercase tracking-wider">Artisans</h4>
            <select
              value={selectedArtisan || ''}
              onChange={(e) => setSelectedArtisan(e.target.value || null)}
              className="w-full bg-white border border-orange-100 text-orange-900 text-xs rounded-xl px-4 py-2 outline-none focus:ring-1 focus:ring-orange-800"
            >
              <option value="">Tous les artisans</option>
              {artisans.map(art => (
                <option key={art.id || (art as any)._id} value={art.id || (art as any)._id}>{art.name}</option>
              ))}
            </select>
          </div>

          <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
            <h4 className="font-heritage font-bold text-orange-950 mb-2">Saviez-vous ?</h4>
            <p className="text-xs text-orange-900/70 leading-relaxed">
              Le Zellige marocain nécessite une découpe à la main de chaque pièce de carrelage émaillé. Un seul panneau peut prendre des semaines de travail.
            </p>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-900"></div>
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-red-100">
              <p className="text-red-500 text-lg">{error}</p>
            </div>
          ) : displayProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-orange-50">
              <p className="text-orange-900/40 text-lg">Aucun produit trouvé dans cette catégorie pour le moment.</p>
            </div>
          )}
        </main>
      </div >
    </div >
  );
};

export default Catalogue;
