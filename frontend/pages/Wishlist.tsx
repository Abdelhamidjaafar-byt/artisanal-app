import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';

const Wishlist: React.FC = () => {
    const { wishlist, loading } = useWishlist();

    return (
        <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="mb-12 text-center">
                <h1 className="text-4xl font-heritage font-bold text-orange-950 mb-4">Ma Liste d'Envies</h1>
                <p className="text-orange-900/60 max-w-2xl mx-auto font-light">
                    Retrouvez ici toutes les pièces d'exception qui ont capturé votre regard.
                </p>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-900"></div>
                </div>
            ) : wishlist.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {wishlist.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-[40px] border-2 border-orange-50/50 shadow-sm">

                    <h2 className="text-2xl font-heritage font-bold text-orange-950 mb-4">Votre liste est vide</h2>
                    <p className="text-orange-900/60 mb-8 max-w-sm mx-auto">
                        Explorez notre catalogue pour découvrir des trésors faits à la main par nos maîtres artisans.
                    </p>
                    <Link
                        to="/catalogue"
                        className="inline-block bg-orange-700 text-white px-8 py-3 rounded-full font-bold hover:bg-orange-800 transition shadow-lg"
                    >
                        Explorer le Catalogue
                    </Link>
                </div>
            )}
        </div>
    );
};

export default Wishlist;
