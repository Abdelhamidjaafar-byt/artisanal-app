
import React, { useState, useEffect } from 'react';
import { MOCK_PRODUCTS, CRAFT_CATEGORIES } from '../constants';
import ProductCard from '../components/ProductCard';
import api from '../services/api';
import { Product } from '../types';

const Catalogue: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // If selectedCategory is null, fetch all. If set, append query param.
        // Backend expects 'category' query param.
        const url = selectedCategory ? `/products?category=${encodeURIComponent(selectedCategory)}` : '/products';
        const response = await api.get(url);

        // Map backend products to frontend Product interface
        const mappedProducts: Product[] = response.data.map((p: any) => ({
          id: p._id,
          artisanId: p.artisan?._id || 'unknown',
          artisanName: p.artisan?.name || 'Artisan Inconnu',
          title: p.title,
          description: p.description,
          price: p.price,
          category: p.category,
          image: p.image || 'https://via.placeholder.com/300', // Fallback image
          isCustomizable: p.isCustomizable,
          stock: p.stock
        }));

        setProducts(mappedProducts);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("Impossible de charger les produits. Veuillez réessayer plus tard.");
        // Fallback to mock data for demo if API fails? 
        // For now, let's just show error, or maybe fallback to mock data if it's a demo environment.
        // user requested "link frontend with backend", so let's stick to API.
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

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
          <div>
            <h3 className="text-lg font-heritage font-bold text-orange-950 mb-4">Métiers</h3>
            <div className="flex flex-wrap lg:flex-col gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`text-left px-4 py-2 rounded-xl text-sm font-medium transition ${!selectedCategory ? 'bg-orange-800 text-white' : 'bg-white text-orange-900 border border-orange-100 hover:bg-orange-50'}`}
              >
                Tous les produits
              </button>
              {CRAFT_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-left px-4 py-2 rounded-xl text-sm font-medium transition ${selectedCategory === cat ? 'bg-orange-800 text-white' : 'bg-white text-orange-900 border border-orange-100 hover:bg-orange-50'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
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
      </div>
    </div>
  );
};

export default Catalogue;
