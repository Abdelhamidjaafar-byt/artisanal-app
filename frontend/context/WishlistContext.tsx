import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';
import { Product } from '../types';
import { useNotification } from './NotificationContext';

interface WishlistContextType {
    wishlist: Product[];
    toggleWishlist: (productId: string) => Promise<void>;
    isInWishlist: (productId: string) => boolean;
    loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, user } = useAuth();
    const { showNotification } = useNotification();
    const [wishlist, setWishlist] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchWishlist = async () => {
            if (isAuthenticated) {
                try {
                    setLoading(true);
                    const response = await api.get('/users/wishlist');
                    const mappedWishlist = response.data
                        .filter((p: any) => p !== null && p !== undefined)
                        .map((p: any) => ({
                            id: String(p._id),
                            artisanId: String(p.artisan?._id || 'unknown'),
                            artisanName: p.artisan?.name || 'Artisan Inconnu',
                            title: p.title,
                            description: p.description,
                            price: p.price,
                            category: p.category,
                            image: p.images?.[0] || 'https://via.placeholder.com/300',
                            isCustomizable: p.isCustomizable,
                            stock: p.stock
                        }));
                    setWishlist(mappedWishlist);
                } catch (error) {
                    console.error("Failed to fetch wishlist:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setWishlist([]); // Clear if not authenticated
            }
        };

        fetchWishlist();
    }, [isAuthenticated]);

    const toggleWishlist = async (productId: string) => {
        if (!isAuthenticated) {
            showNotification("Veuillez vous connecter pour gérer votre liste d'envies", "info");
            return;
        }

        const isCurrentlyIn = isInWishlist(productId);

        // Optimistic Update: Immediately add/remove from state
        if (isCurrentlyIn) {
            setWishlist(prev => prev.filter(item => item.id !== productId));
        } else {
            // Find the product in the document if possible, though we don't have full product data here easily.
            // For now, satisfy isInWishlist immediately with a partial product.
            // When the fetch completes, it will be replaced with real data.
            setWishlist(prev => [...prev, { id: productId } as Product]);
        }

        try {
            await api.post(`/users/wishlist/${productId}`);

            // Refetch to ensure state is in sync with backend and has full product data
            const wishlistRes = await api.get('/users/wishlist');
            const mappedWishlist = wishlistRes.data
                .filter((p: any) => p !== null && p !== undefined)
                .map((p: any) => ({
                    id: String(p._id),
                    artisanId: String(p.artisan?._id || 'unknown'),
                    artisanName: p.artisan?.name || 'Artisan Inconnu',
                    title: p.title,
                    description: p.description,
                    price: p.price,
                    category: p.category,
                    image: p.images?.[0] || 'https://via.placeholder.com/300',
                    isCustomizable: p.isCustomizable,
                    stock: p.stock
                }));
            setWishlist(mappedWishlist);
            showNotification(isCurrentlyIn ? "Retiré de votre liste d'envies" : "Ajouté à votre liste d'envies", "success");
        } catch (error) {
            console.error("Failed to toggle wishlist:", error);
            showNotification("Une erreur est survenue lors de la mise à jour de votre liste d'envies.", "error");
            // Rollback optimistic update on error
            if (isCurrentlyIn) {
                // If it was in and we removed it, we should add it back (but we might not have the source data easily)
                // Simple refetch is safest
                const res = await api.get('/users/wishlist');
                setWishlist(res.data.map((p: any) => ({ id: String(p._id), ...p })));
            }
        }
    };

    const isInWishlist = (productId: string) => {
        return wishlist.some(item => String(item.id) === String(productId));
    };

    return (
        <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist, loading }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};
