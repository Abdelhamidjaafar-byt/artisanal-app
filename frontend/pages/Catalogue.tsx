
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CRAFT_CATEGORIES, CRAFT_MATERIALS, REGIONS } from '../constants';
import ProductCard from '../components/ProductCard';
import api from '../services/api';
import { Product, User } from '../types';

const Catalogue: React.FC = () => {
  const [selectedArtisan, setSelectedArtisan] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  const [priceRange, setPriceRange] = useState<{ min?: number, max?: number }>({});
  const [onlyCustomizable, setOnlyCustomizable] = useState<boolean>(false);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
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

  // Reset to first page when filters or sorting change
  useEffect(() => {
    setPage(1);
    setProducts([]); // Clear products to show loading from fresh
  }, [selectedArtisan, selectedMaterial, selectedRegion, selectedCategory, priceRange, sortBy, onlyCustomizable, searchKeyword]);

  // Sync category from URL
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl !== selectedCategory) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let params = new URLSearchParams();
        if (selectedCategory) params.append('category', selectedCategory);
        if (selectedArtisan) params.append('artisan', selectedArtisan);
        if (selectedMaterial) params.append('material', selectedMaterial);
        if (selectedRegion) params.append('region', selectedRegion);
        if (onlyCustomizable) params.append('isCustomizable', 'true');
        if (searchKeyword) params.append('keyword', searchKeyword);
        if (priceRange.min) params.append('minPrice', priceRange.min.toString());
        if (priceRange.max) params.append('maxPrice', priceRange.max.toString());
        if (sortBy) params.append('sortBy', sortBy);
        params.append('page', page.toString());
        params.append('limit', '8');

        const response = await api.get(`/products?${params.toString()}`);
        const { products: fetchedProducts, pages: totalPages } = response.data;

        const mappedProducts: Product[] = fetchedProducts.map((p: any) => ({
          id: p._id,
          artisanId: p.artisan?._id || 'unknown',
          artisanName: p.artisan?.name || 'Artisan Inconnu',
          title: p.title,
          description: p.description,
          price: p.price,
          category: p.category,
          image: p.images?.[0] || 'https://via.placeholder.com/300',
          isCustomizable: p.isCustomizable,
          stock: p.stock,
          material: p.material
        }));

        if (page === 1) {
          setProducts(mappedProducts);
        } else {
          setProducts(prev => [...prev, ...mappedProducts]);
        }

        setHasMore(page < totalPages);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("Impossible de charger les produits. Veuillez réessayer plus tard.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedArtisan, selectedMaterial, selectedRegion, selectedCategory, priceRange, sortBy, onlyCustomizable, searchKeyword, page]);

  // Filter is now done on backend, but we could also double check locally if we wanted
  // but let's rely on backend filtering as per the useEffect logic.

  const displayProducts = products;
  return (
    <div className="max-w-7xl mx-auto px-4 py-12" style={{ backgroundImage: "url(./assets/download.png)", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", opacity: 1 }}>
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
                setSelectedMaterial(null);
                setSelectedRegion(null);
                setSelectedCategory(null);
                setSearchParams({});
                setPriceRange({});
                setSortBy('newest');
                setOnlyCustomizable(false);
                setSearchKeyword('');
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
                  className={`w-full text-left px-4 py-2 rounded-xl text-xs font-medium transition ${JSON.stringify(priceRange) === JSON.stringify(p.range) ? 'bg-orange-900 text-white' : 'bg-white text-orange-900 border border-orange-100 hover:bg-orange-50'}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-orange-900 mb-3 uppercase tracking-wider">Métiers</h4>
            <div className="space-y-1">
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSearchParams({});
                }}
                className={`w-full text-left px-4 py-2 rounded-xl text-xs font-medium transition ${!selectedCategory ? 'bg-orange-900 text-white' : 'text-orange-900 hover:bg-orange-50'}`}
              >
                Tous les métiers
              </button>
              {CRAFT_CATEGORIES.map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setSearchParams({ category: cat });
                  }}
                  className={`w-full text-left px-4 py-2 rounded-xl text-xs font-medium transition ${selectedCategory === cat ? 'bg-orange-900 text-white' : 'text-orange-900 hover:bg-orange-50'}`}
                >
                  {cat}
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

          <div>
            <h4 className="text-sm font-bold text-orange-900 mb-3 uppercase tracking-wider">Matières</h4>
            <select
              value={selectedMaterial || ''}
              onChange={(e) => setSelectedMaterial(e.target.value || null)}
              className="w-full bg-white border border-orange-100 text-orange-900 text-xs rounded-xl px-4 py-2 outline-none focus:ring-1 focus:ring-orange-800"
            >
              <option value="">Toutes les matières</option>
              {CRAFT_MATERIALS.map((mat, idx) => (
                <option key={idx} value={mat}>{mat}</option>
              ))}
            </select>
          </div>

          <div>
            <h4 className="text-sm font-bold text-orange-900 mb-3 uppercase tracking-wider">Régions</h4>
            <select
              value={selectedRegion || ''}
              onChange={(e) => setSelectedRegion(e.target.value || null)}
              className="w-full bg-white border border-orange-100 text-orange-900 text-xs rounded-xl px-4 py-2 outline-none focus:ring-1 focus:ring-orange-800"
            >
              <option value="">Toutes les régions</option>
              {REGIONS.map((region, idx) => (
                <option key={idx} value={region}>{region}</option>
              ))}
            </select>
          </div>

          <div className="pt-4 border-t border-orange-100">
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-sm font-bold text-orange-950 uppercase tracking-wide">Sur Mesure </span>
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={onlyCustomizable}
                  onChange={() => setOnlyCustomizable(!onlyCustomizable)}
                />
                <div className={`block w-10 h-6 rounded-full transition-colors ${onlyCustomizable ? 'bg-orange-800' : 'bg-orange-200'}`}></div>
                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${onlyCustomizable ? 'translate-x-4' : ''}`}></div>
              </div>
            </label>
            <p className="text-[10px] text-orange-900/50 mt-2 leading-tight">
              Afficher uniquement les pièces personnalisables par l’artisan.
            </p>
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
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Rechercher un trésor (tapis, vase, cuir...)"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full bg-white border border-orange-100 text-orange-900 text-sm rounded-2xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-orange-800/20 focus:border-orange-800 transition-all"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-900/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-6">
              <p className="text-orange-900/60 text-sm whitespace-nowrap">
                <span className="font-bold text-orange-950">{displayProducts.length}</span> Trésors
              </p>
              <div className="flex items-center gap-2">
                <label htmlFor="sortBy" className="text-xs font-bold text-orange-900 uppercase tracking-wider whitespace-nowrap">Trier par :</label>
                <select
                  id="sortBy"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-orange-100 text-orange-900 text-xs rounded-xl px-4 py-2 outline-none focus:ring-1 focus:ring-orange-800"
                >
                  <option value="newest">Nouveautés</option>
                  <option value="price-asc">Prix : Croissant</option>
                  <option value="price-desc">Prix : Décroissant</option>
                  <option value="rating">Mieux notés</option>
                </select>
              </div>
            </div>
          </div>

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

          {hasMore && !loading && displayProducts.length > 0 && (
            <div className="mt-16 text-center">
              <button
                onClick={() => setPage(prev => prev + 1)}
                className="bg-white border-2 border-orange-900 text-orange-900 px-8 py-4 rounded-2xl font-heritage font-bold text-lg hover:bg-orange-900 hover:text-white transition-all duration-300 shadow-sm"
              >
                Voir plus de trésors
              </button>
            </div>
          )}
        </main>
      </div >
    </div >
  );
};

export default Catalogue;
