import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ReviewForm from './ReviewForm';

const BACKEND_URL = 'http://localhost:3000'; // Simple constant for now

interface Review {
    _id: string;
    user: {
        _id: string;
        name: string;
        avatar?: string;
    };
    rating: number;
    comment: string;
    images?: string[];
    createdAt: string;
}

interface ReviewListProps {
    reviews: Review[];
    productId: string;
    onUpdate: () => void;
}

const ReviewList: React.FC<ReviewListProps> = ({ reviews, productId, onUpdate }) => {
    const { user, isAuthenticated } = useAuth();
    const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

    const handleDelete = async (reviewId: string) => {
        if (!window.confirm("Voulez-vous vraiment supprimer cet avis ?")) return;
        try {
            await api.delete(`/reviews/${reviewId}`);
            onUpdate();
        } catch (error) {
            console.error("Failed to delete review:", error);
            alert("Erreur lors de la suppression de l'avis.");
        }
    };

    return (
        <div className="space-y-8">
            {reviews.length === 0 ? (
                <p className="text-orange-900/40 italic">Aucun avis pour le moment.</p>
            ) : (
                reviews.map((review) => (
                    <div key={review._id} className="border-b border-orange-100 pb-6 last:border-0">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold overflow-hidden border border-orange-200">
                                {review.user.avatar ? (
                                    <img src={review.user.avatar} alt={review.user.name} className="w-full h-full object-cover" />
                                ) : (
                                    review.user.name.charAt(0)
                                )}
                            </div>
                            <div>
                                <h4 className="font-bold text-orange-950">{review.user.name}</h4>
                                <div className="flex text-orange-500 text-xs">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className={i < review.rating ? 'fill-current' : 'text-orange-200'}>
                                            ★
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <span className="ml-auto text-xs text-orange-900/40">
                                {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        {editingReviewId === review._id ? (
                            <ReviewForm
                                productId={productId}
                                onReviewSubmitted={() => {
                                    setEditingReviewId(null);
                                    onUpdate();
                                }}
                                editingReview={{
                                    id: review._id,
                                    rating: review.rating,
                                    comment: review.comment,
                                    images: review.images
                                }}
                                onCancelEdit={() => setEditingReviewId(null)}
                            />
                        ) : (
                            <>
                                <p className="text-orange-900/70 leading-relaxed italic mb-4">
                                    "{review.comment}"
                                </p>

                                {review.images && review.images.length > 0 && (
                                    <div className="flex gap-4 overflow-x-auto py-2 mb-4">
                                        {review.images.map((img, i) => (
                                            <img
                                                key={i}
                                                src={img.startsWith('http') ? img : `${BACKEND_URL}${img}`}
                                                className="w-24 h-24 object-cover rounded-xl border border-orange-100 shadow-sm"
                                                alt={`Testimony-${i}`}
                                            />
                                        ))}
                                    </div>
                                )}

                                {isAuthenticated && user?.id === review.user._id && (
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setEditingReviewId(review._id)}
                                            className="text-xs font-bold text-orange-700 hover:text-orange-900 transition flex items-center gap-1"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                            Modifier
                                        </button>
                                        <button
                                            onClick={() => handleDelete(review._id)}
                                            className="text-xs font-bold text-red-600 hover:text-red-800 transition flex items-center gap-1"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            Supprimer
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ))
            )}
        </div>
    );
};

export default ReviewList;
