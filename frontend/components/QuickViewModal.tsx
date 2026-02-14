
import React, { useState } from 'react';
import { Product } from '../types';
import { formatImageUrl } from '../utils/imageUtils';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

interface QuickViewModalProps {
    product: Product;
    isOpen: boolean;
    onClose: () => void;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, isOpen, onClose }) => {
    const { addItem } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    if (!isOpen) return null;

    const images = product.images && product.images.length > 0 ? product.images : [product.image];
    const isFavorited = isInWishlist(product.id);

    const handleAddToCart = () => {
        addItem({
            productId: product.id,
            title: product.title,
            price: product.price,
            quantity: 1,
            image: product.image
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-orange-950/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[2rem] shadow-2xl flex flex-col md:flex-row animate-in fade-in zoom-in duration-300">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-10 p-2 bg-white/80 hover:bg-white text-orange-900 rounded-full shadow-lg transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Left Side: Images */}
                <div className="md:w-1/2 bg-orange-50/30 p-6 flex flex-col">
                    <div className="flex-1 relative aspect-[4/5] rounded-2xl overflow-hidden shadow-inner group">
                        <img
                            src={formatImageUrl(images[activeImageIndex])}
                            alt={product.title}
                            className="w-full h-full object-cover"
                        />
                        {product.isCustomizable && (
                            <span className="absolute top-4 left-4 bg-orange-900/90 text-white text-[10px] font-bold uppercase tracking-[0.2em] py-1.5 px-4 rounded-full shadow-lg backdrop-blur-sm">
                                Sur Mesure
                            </span>
                        )}
                    </div>

                    {/* Thumbnails */}
                    {images.length > 1 && (
                        <div className="flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImageIndex(idx)}
                                    className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 transition-all ${activeImageIndex === idx ? 'ring-2 ring-orange-800 scale-95' : 'opacity-60 hover:opacity-100'}`}
                                >
                                    <img src={formatImageUrl(img)} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Side: Details */}
                <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                    <p className="text-orange-600 text-xs font-bold uppercase tracking-[0.3em] mb-3">{product.category}</p>
                    <h2 className="text-3xl md:text-4xl font-heritage font-bold text-orange-950 mb-4">{product.title}</h2>

                    <div className="flex items-center gap-4 mb-6">
                        <span className="text-3xl font-heritage font-black text-orange-900">{product.price} MAD</span>
                        {product.stock > 0 ? (
                            <span className="text-emerald-600 text-xs font-bold uppercase py-1 px-3 bg-emerald-50 rounded-full">En Stock</span>
                        ) : (
                            <span className="text-red-500 text-xs font-bold uppercase py-1 px-3 bg-red-50 rounded-full">Rupture</span>
                        )}
                    </div>

                    <div className="prose prose-orange mb-8">
                        <p className="text-gray-600 leading-relaxed italic text-lg opacity-80">
                            "{product.description}"
                        </p>
                    </div>

                    {/* Additional Info Tags */}
                    <div className="flex flex-wrap gap-4 mb-8">
                        {product.material && (
                            <div className="flex items-center gap-2 text-sm text-orange-900/70 border border-orange-100 px-4 py-2 rounded-xl bg-orange-50/30">
                                <span className="font-bold uppercase text-[10px] tracking-wider text-orange-900/40">Matière:</span>
                                <span className="font-medium">{product.material}</span>
                            </div>
                        )}
                        {product.region && (
                            <div className="flex items-center gap-2 text-sm text-orange-900/70 border border-orange-100 px-4 py-2 rounded-xl bg-orange-50/30">
                                <span className="font-bold uppercase text-[10px] tracking-wider text-orange-900/40">Région:</span>
                                <span className="font-medium">{product.region}</span>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 mt-auto">
                        <button
                            onClick={handleAddToCart}
                            disabled={product.stock === 0}
                            className="flex-1 bg-orange-950 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-850 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-xl shadow-orange-900/20"
                        >
                            Ajouter au panier
                        </button>
                        <button
                            onClick={() => toggleWishlist(product.id)}
                            className={`p-4 rounded-2xl border-2 transition-all ${isFavorited ? 'bg-orange-700 border-orange-700 text-white shadow-lg' : 'border-orange-100 text-orange-900 hover:border-orange-800 hover:text-orange-800'}`}
                            title={isFavorited ? "Retirer de la liste d'envies" : "Ajouter à la liste d'envies"}
                        >
                            <svg className={`w-7 h-7 ${isFavorited ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuickViewModal;
