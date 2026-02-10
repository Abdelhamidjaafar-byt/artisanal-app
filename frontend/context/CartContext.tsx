
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartItem } from '../types';

interface CartContextType {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'id'>) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
    isCartOpen: boolean;
    setIsCartOpen: (open: boolean) => void;
    isCartLoaded: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('artisan_cart');
        if (savedCart) {
            try {
                const parsed = JSON.parse(savedCart);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setItems(parsed);
                }
            } catch (e) {
                console.error('Failed to parse cart from localStorage');
            }
        }
        setIsLoaded(true);
    }, []);

    // Save cart to localStorage on change
    useEffect(() => {
        localStorage.setItem('artisan_cart', JSON.stringify(items));
    }, [items]);

    const addItem = useCallback((item: Omit<CartItem, 'id'>) => {
        setItems(prev => {
            const existingItem = prev.find(i => i.productId === item.productId);
            if (existingItem) {
                return prev.map(i =>
                    i.productId === item.productId
                        ? { ...i, quantity: i.quantity + item.quantity }
                        : i
                );
            }
            return [...prev, { ...item, id: `${item.productId}-${Date.now()}` }];
        });
        setIsCartOpen(true);
    }, []);

    const removeItem = useCallback((productId: string) => {
        setItems(prev => prev.filter(i => i.productId !== productId));
    }, []);

    const updateQuantity = useCallback((productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeItem(productId);
            return;
        }
        setItems(prev => prev.map(i =>
            i.productId === productId ? { ...i, quantity } : i
        ));
    }, [removeItem]);

    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{
            items,
            addItem,
            removeItem,
            updateQuantity,
            clearCart,
            totalItems,
            totalPrice,
            isCartOpen,
            setIsCartOpen,
            isCartLoaded: isLoaded
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
