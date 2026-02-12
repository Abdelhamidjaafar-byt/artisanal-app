import React, { useState } from 'react';
import api from '../services/api';

interface ReviewFormProps {
    productId: string;
    onReviewSubmitted: () => void;
    editingReview?: {
        id: string;
        rating: number;
        comment: string;
        images?: string[];
    };
    onCancelEdit?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ productId, onReviewSubmitted, editingReview, onCancelEdit }) => {
    const [rating, setRating] = useState(editingReview?.rating || 5);
    const [comment, setComment] = useState(editingReview?.comment || '');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>(editingReview?.images || []);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);

            const formData = new FormData();
            formData.append('rating', rating.toString());
            formData.append('comment', comment);

            selectedFiles.forEach((file) => {
                formData.append('images', file);
            });

            if (editingReview) {
                // For editing, we send both remaining existing image URLs and new files
                existingImages.forEach(img => formData.append('images', img));
                await api.put(`/reviews/${editingReview.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                formData.append('product', productId);
                await api.post('/reviews', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            setComment('');
            setRating(5);
            setSelectedFiles([]);
            onReviewSubmitted();
        } catch (err: any) {
            setError(err.response?.data?.message || "Une erreur est survenue lors de l'envoi de votre avis.");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            // Limit to 5 images total (new + existing)
            if (filesArray.length + selectedFiles.length + existingImages.length > 5) {
                setError("Vous ne pouvez pas ajouter plus de 5 images.");
                return;
            }
            setSelectedFiles([...selectedFiles, ...filesArray]);
        }
    };

    const removeNewImage = (index: number) => {
        setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    };

    const removeExistingImage = (index: number) => {
        setExistingImages(existingImages.filter((_, i) => i !== index));
    };

    return (
        <div className="bg-orange-50/50 p-6 rounded-3xl border border-orange-100">
            <h3 className="text-xl font-heritage font-bold text-orange-950 mb-4">
                {editingReview ? 'Modifier mon avis' : 'Laisser un avis'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-orange-900 mb-1">Note</label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className={`text-2xl transition-all ${star <= rating ? 'text-orange-500 scale-110' : 'text-orange-200'}`}
                            >
                                ★
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-orange-900 mb-1">Témoignages photos</label>
                    <div className="flex flex-col gap-3">
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileChange}
                            className="text-sm text-orange-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-200 file:text-orange-900 hover:file:bg-orange-300 transition"
                        />
                        <p className="text-xs text-orange-900/60 leading-relaxed italic">
                            Partagez des photos de votre article pour aider les autres clients. (Max 5 photos)
                        </p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-orange-900 mb-1">Votre commentaire</label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                        rows={3}
                        className="w-full px-4 py-2 rounded-xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                        placeholder="Partagez votre expérience avec cet article..."
                    />
                </div>

                {(selectedFiles.length > 0 || existingImages.length > 0) && (
                    <div className="flex gap-4 overflow-x-auto py-2">
                        {existingImages.map((img, i) => (
                            <div key={`existing-${i}`} className="relative w-20 h-20 flex-shrink-0 group">
                                <img src={img} className="w-full h-full object-cover rounded-xl border border-orange-200" alt={`Existing-${i}`} />
                                <button
                                    type="button"
                                    onClick={() => removeExistingImage(i)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                                >
                                    &times;
                                </button>
                                <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-[8px] text-white text-center rounded-b-xl">Existant</span>
                            </div>
                        ))}
                        {selectedFiles.map((file, i) => (
                            <div key={`new-${i}`} className="relative w-20 h-20 flex-shrink-0 group">
                                <img src={URL.createObjectURL(file)} className="w-full h-full object-cover rounded-xl border border-orange-200" alt={`New-${i}`} />
                                <button
                                    type="button"
                                    onClick={() => removeNewImage(i)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                                >
                                    &times;
                                </button>
                                <span className="absolute bottom-0 left-0 right-0 bg-orange-500/80 text-[8px] text-white text-center rounded-b-xl">Nouveau</span>
                            </div>
                        ))}
                    </div>
                )}
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-orange-950 text-white px-6 py-2 rounded-full font-bold hover:bg-orange-800 transition disabled:opacity-50"
                    >
                        {loading ? 'Envoi...' : (editingReview ? 'Mettre à jour' : 'Publier mon avis')}
                    </button>
                    {editingReview && (
                        <button
                            type="button"
                            onClick={onCancelEdit}
                            className="px-6 py-2 rounded-full font-bold text-orange-900 hover:bg-orange-100 transition"
                        >
                            Annuler
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default ReviewForm;
