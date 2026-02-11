/**
 * Formats a product image URL.
 * Handles local paths from the backend and external URLs.
 * Falls back to a placeholder if no image is provided.
 */
export const formatImageUrl = (imagePath?: string): string => {
    if (!imagePath) {
        return 'https://via.placeholder.com/600x800?text=Produit+Artisanal';
    }

    // If it's already a full URL, return it
    if (imagePath.startsWith('http')) {
        return imagePath;
    }

    // If it's a relative path starting with /uploads, return it as is
    // (Assuming Vite proxy or same-origin serving is configured)
    if (imagePath.startsWith('/uploads/')) {
        return imagePath;
    }

    // If it's just a filename, prepend /uploads/
    if (imagePath && !imagePath.includes('/')) {
        return `/uploads/${imagePath}`;
    }

    return imagePath;
};
