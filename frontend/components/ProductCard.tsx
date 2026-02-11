
import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { formatImageUrl } from '../utils/imageUtils';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();

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

  return (
    <div className="flex flex-col group h-full">
      <div className="relative moorish-arch bg-white aspect-[4/5] shadow-sm group-hover:shadow-xl transition-all duration-500 mb-4 border-b-4 border-orange-900/10">
        <div className="absolute inset-2 moorish-arch-inner overflow-hidden bg-orange-50">
          <img
            src={formatImageUrl(product.image)}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        </div>
        {product.isCustomizable && (
          <span className="absolute top-12 left-1/2 -translate-x-1/2 bg-orange-800 text-white text-[10px] font-bold uppercase tracking-widest py-1 px-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Sur Mesure
          </span>
        )}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-4 right-4 bg-white text-orange-900 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-orange-100"
          title="Ajouter au panier"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </button>
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
