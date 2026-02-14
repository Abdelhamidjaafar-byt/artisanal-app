
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { formatImageUrl } from '../utils/imageUtils';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useNotification } from '../context/NotificationContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showNotification } = useNotification();
  const [debugFlash, setDebugFlash] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      title: product.title,
      price: product.price,
      quantity: 1,
      image: product.image
    });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDebugFlash(true);
    setTimeout(() => setDebugFlash(false), 500);
    // showNotification("Clic détecté sur le favori...", "info"); // DEBUG
    toggleWishlist(product.id);
  };

  const isFavorited = isInWishlist(product.id);

  return (
    <div className="flex flex-col group h-full">
      <div className="arch-frame shadow-sm group-hover:shadow-2xl transition-all duration-500 mb-6 bg-white">
        <div className="relative aspect-[4/5]">
          <div className="absolute inset-0 bg-orange-50/50">
            <img
              src={formatImageUrl(product.image)}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
          </div>

          {/* Wishlist Toggle */}
          <button
            onClick={handleToggleWishlist}
            className={`absolute top-4 right-4 p-2 rounded-full shadow-lg transition-all duration-300 z-50 ${debugFlash ? 'ring-4 ring-orange-500 scale-125' : ''} ${isFavorited ? 'bg-orange-700 text-white' : 'bg-white/80 text-orange-900 hover:bg-white'}`}
            title={isFavorited ? "Retirer de la liste d'envies" : "Ajouter à la liste d'envies"}
          >
            <svg className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          {product.isCustomizable && (
            <span className="absolute top-12 left-1/2 -translate-x-1/2 bg-orange-850/90 text-white text-[10px] font-bold uppercase tracking-[0.2em] py-1.5 px-4 rounded-full shadow-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300">
              Sur Mesure
            </span>
          )}
          <button
            onClick={handleAddToCart}
            className="absolute bottom-6 right-6 bg-white/90 text-orange-900 p-3 rounded-full shadow-xl translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 hover:bg-orange-950 hover:text-white backdrop-blur-sm"
            title="Ajouter au panier"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="text-center px-2 flex-1 flex flex-col">
        <p className="text-orange-600 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">{product.category}</p>
        <h3 className="text-xl font-heritage font-bold text-orange-950 mb-2 line-clamp-1">{product.title}</h3>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2 italic">"{product.description}"</p>

        <div className="mt-auto pt-4 border-t border-orange-100 flex flex-col items-center gap-3">
          <span className="text-2xl font-heritage font-black text-orange-900">{product.price} MAD</span>
          <Link
            to={`/product/${product.id}`}
            className="w-full bg-orange-950 text-white py-3 rounded-lg font-semibold text-sm hover:bg-orange-800 transition-colors shadow-sm"
          >
            Découvrir l'œuvre
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
