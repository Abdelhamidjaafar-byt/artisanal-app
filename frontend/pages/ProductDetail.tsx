
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import { Product, User, UserRole } from '../types';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';
import { useWishlist } from '../context/WishlistContext';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showNotification } = useNotification();
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customData, setCustomData] = useState({ dimensions: '', notes: '' });

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState([]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      if (!id) return;
      const [productRes, reviewsRes] = await Promise.all([
        api.get(`/products/${id}`),
        api.get(`/reviews/product/${id}`)
      ]);
      const p = productRes.data;

      const mappedProduct: Product = {
        id: p._id,
        artisanId: p.artisan?._id || 'unknown',
        artisanName: p.artisan?.name || 'Artisan Inconnu',
        title: p.title,
        description: p.description,
        price: p.price,
        category: p.category,
        image: p.images?.[0] || 'https://via.placeholder.com/600',
        isCustomizable: p.isCustomizable,
        stock: p.stock
      };

      setProduct(mappedProduct);
      setReviews(reviewsRes.data);

      const artisanData: User = {
        id: p.artisan?._id || 'unknown',
        name: p.artisan?.name || 'Artisan Inconnu',
        email: p.artisan?.email || '',
        role: UserRole.ARTISAN,
        region: p.artisan?.artisanProfile?.region || 'Maroc',
        bio: p.artisan?.artisanProfile?.bio || '',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200'
      };
      setArtisan(artisanData);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch product data:", err);
      setError("Impossible de charger le produit.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const [artisan, setArtisan] = useState<User | null>(null);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-900"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-heritage font-bold text-orange-950">{error || "Produit non trouvé"}</h2>
        <Link to="/catalogue" className="mt-4 text-orange-700 font-bold hover:underline">Retourner au catalogue</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      productId: product.id,
      title: product.title,
      price: product.price,
      quantity: 1,
      image: product.image
    });
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    alert("Votre demande sur-mesure a été envoyée à l'artisan ! Il vous contactera prochainement.");
    setIsCustomModalOpen(false);
  };

  const isFavorited = isInWishlist(product.id);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid lg:grid-cols-2 gap-16 items-start">
        {/* Left: Product Image in Arch */}
        <div className="relative moorish-arch bg-white shadow-2xl p-4 border border-orange-100">
          <div className="moorish-arch-inner overflow-hidden aspect-[4/5] bg-orange-50">
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Wishlist Toggle in Product Detail */}
          <button
            onClick={() => toggleWishlist(product.id)}
            className={`absolute top-8 right-8 p-3 rounded-full shadow-2xl transition-all duration-300 z-10 hover:scale-110 ${isFavorited ? 'bg-orange-700 text-white' : 'bg-white text-orange-900'}`}
            title={isFavorited ? "Retirer de la liste d'envies" : "Ajouter à la liste d'envies"}
          >
            <svg className={`w-6 h-6 ${isFavorited ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        {/* Right: Product Info */}
        <div className="flex flex-col h-full">
          <nav className="mb-6 flex gap-2 text-xs font-bold uppercase tracking-widest text-orange-800/60">
            <Link to="/catalogue" className="hover:text-orange-950">Catalogue</Link>
            <span>/</span>
            <span className="text-orange-950">{product.category}</span>
          </nav>

          <h1 className="text-5xl font-heritage font-bold text-orange-950 mb-4">{product.title}</h1>

          <div className="flex items-center gap-4 mb-8">
            <Link to={`/artisan/${product.artisanId}`} className="flex items-center gap-3 group">
              <img src={artisan?.avatar} className="w-12 h-12 rounded-full border-2 border-orange-100 group-hover:border-orange-800 transition" alt={product.artisanName} />
              <div>
                <p className="text-xs font-bold text-orange-800/60 uppercase">Créé par</p>
                <p className="font-heritage font-bold text-lg text-orange-950 group-hover:text-orange-800 transition">{product.artisanName}</p>
              </div>
            </Link>
            <div className="h-8 w-px bg-orange-100 mx-2"></div>
            <div>
              <p className="text-xs font-bold text-orange-800/60 uppercase">État</p>
              <p className="font-bold text-green-700">{product.stock > 0 ? 'En stock' : 'Sur commande'}</p>
            </div>
          </div>

          <div className="bg-orange-50/50 p-6 rounded-3xl mb-8 border border-orange-100/50">
            <p className="text-orange-900 leading-relaxed italic text-lg">"{product.description}"</p>
          </div>

          <div className="flex items-end gap-4 mb-10">
            <span className="text-4xl font-heritage font-black text-orange-950">{product.price} MAD</span>
            <span className="text-orange-800/40 text-sm mb-1">Livraison gratuite au Maroc</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-orange-950 text-white py-5 rounded-2xl font-bold hover:bg-orange-800 transition shadow-xl text-lg"
            >
              Ajouter au Panier
            </button>
            {product.isCustomizable && (
              <button
                onClick={() => setIsCustomModalOpen(true)}
                className="flex-1 border-2 border-orange-950 text-orange-950 py-5 rounded-2xl font-bold hover:bg-orange-950 hover:text-white transition shadow-sm text-lg"
              >
                Commander Sur Mesure
              </button>
            )}
          </div>

          <div className="mt-12 pt-12 border-t border-orange-100 grid grid-cols-2 gap-8">
            <div>
              <h4 className="font-heritage font-bold text-orange-950 mb-2">Détails Techniques</h4>
              <ul className="text-sm text-orange-900/70 space-y-1">
                <li>• Matière : 100% Naturelle</li>
                <li>• Technique : Façonné à la main</li>
                <li>• Origine : {artisan?.region}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-heritage font-bold text-orange-950 mb-2">Entretien</h4>
              <p className="text-sm text-orange-900/70 leading-relaxed">
                Nettoyage à sec recommandé pour préserver les fibres et les couleurs naturelles.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-24 pt-24 border-t border-orange-100">
        <div className="grid lg:grid-cols-3 gap-16">
          <div className="lg:col-span-1">
            <h2 className="text-3xl font-heritage font-bold text-orange-950 mb-6">Avis Clients</h2>
            {isAuthenticated ? (
              <ReviewForm productId={product.id} onReviewSubmitted={fetchProduct} />
            ) : (
              <div className="bg-orange-50/50 p-6 rounded-3xl border border-orange-100 text-center">
                <p className="text-orange-900/60 mb-4">Connectez-vous pour laisser un avis sur vos achats.</p>
                <Link to="/login" className="text-orange-700 font-bold hover:underline">Se connecter</Link>
              </div>
            )}
          </div>
          <div className="lg:col-span-2">
            <ReviewList reviews={reviews} productId={product.id} onUpdate={fetchProduct} />
          </div>
        </div>
      </div>

      {/* Custom Request Modal */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-lg p-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 moroccan-gradient"></div>
            <button
              onClick={() => setIsCustomModalOpen(false)}
              className="absolute top-6 right-6 text-orange-950 text-2xl hover:scale-110 transition"
            >
              &times;
            </button>

            <h2 className="text-3xl font-heritage font-bold text-orange-950 mb-2">Demande de Personnalisation</h2>
            <p className="text-orange-900/60 mb-8">Travaillez avec {product.artisanName} pour créer votre pièce unique.</p>

            <form onSubmit={handleCustomSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-orange-950 mb-2">Dimensions souhaitées</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Ex: 2.5m x 1.5m"
                  value={customData.dimensions}
                  onChange={(e) => setCustomData({ ...customData, dimensions: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-orange-950 mb-2">Détails ou modifications</label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Décrivez vos préférences (couleurs, motifs, usage...)"
                  value={customData.notes}
                  onChange={(e) => setCustomData({ ...customData, notes: e.target.value })}
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-orange-800 text-white py-4 rounded-xl font-bold hover:bg-orange-900 transition shadow-lg"
              >
                Envoyer ma Demande
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;