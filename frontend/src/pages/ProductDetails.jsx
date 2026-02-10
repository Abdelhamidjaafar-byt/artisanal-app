import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { ArrowLeft, ShoppingCart, Sparkles, Clock, ShieldCheck, MapPin, CreditCard } from "lucide-react";
import PayPalPayment from "../components/PayPalPayment";
import { PayPalButtons } from "@paypal/react-paypal-js";

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [orderModal, setOrderModal] = useState(false);
    const [customDetails, setCustomDetails] = useState("");
    const [isOrdering, setIsOrdering] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [userRating, setUserRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("stripe");

    useEffect(() => {
        if (id) {
            fetchProduct();
            fetchReviews();
        }
    }, [id]);

    const createOurOrder = async () => {
        try {
            const orderPayload = {
                orderItems: [{
                    product: product._id,
                    quantity: 1,
                    customizationDetails: customDetails
                }],
                shippingAddress: "To be provided", // Placeholder
                paymentMethod: paymentMethod,
                mobileNumber: "0000000000" // Placeholder
            };

            const orderRes = await api.post("/orders", orderPayload);
            return orderRes.data._id;
        } catch (error) {
            console.error("Order creation failed:", error);
            throw error;
        }
    };

    const handleOrder = async () => {
        setIsOrdering(true);
        try {
            const orderId = await createOurOrder();

            // 2. Initiate Stripe Payment
            const paymentRes = await api.post("/stripe/create-checkout-session", {
                orderId: orderId
            });

            // 3. Redirect to Stripe
            if (paymentRes.data.url) {
                window.location.href = paymentRes.data.url;
            } else {
                throw new Error("Payment link not received from the oracle.");
            }

        } catch (error) {
            console.error("Order or Payment failed:", error);
            const message = error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || error.message || "Unknown error";
            alert(`The order spell failed: ${message}`);
            setIsOrdering(false);
        }
    };

    const fetchProduct = async () => {
        try {
            const res = await api.get(`/products/${id}`);
            setProduct(res.data);
        } catch (error) {
            console.error("Masterpiece could not be found", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            const res = await api.get(`/reviews/product/${id}`);
            setReviews(res.data);
        } catch (error) {
            console.error("Whispers could not be gathered", error);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setIsSubmittingReview(true);
        try {
            const res = await api.post("/reviews", {
                productId: id,
                rating: userRating,
                comment: reviewComment
            });
            setReviews([res.data, ...reviews]);
            setReviewComment("");
            alert("Your whisper has been heard.");
        } catch (error) {
            console.error("Review failed", error);
            alert("Could not inscribe review. Have you logged in?");
        } finally {
            setIsSubmittingReview(false);
        }
    };

    if (loading) return <div className="container py-24 text-center heading text-2xl animate-pulse">Unveiling Masterpiece...</div>;
    if (!product) return <div className="container py-24 text-center heading text-2xl">This piece has returned to the shadows.</div>;

    return (
        <div className="container py-12">
            <button
                onClick={() => navigate("/marketplace")}
                className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors mb-12 group uppercase tracking-widest text-xs font-bold"
            >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Return to the Souk
            </button>

            <div className="grid lg:grid-cols-2 gap-16">
                {/* Visual Section */}
                <div className="space-y-6">
                    <div className="arch-frame aspect-square bg-surface border border-primary/20 relative overflow-hidden shadow-2xl">
                        {product.images && product.images.length > 0 ? (
                            <img
                                src={`http://localhost:3000/${product.images[0]}`}
                                alt={product.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <>
                                <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'var(--zellige-pattern)', backgroundSize: '60px 60px' }}></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Sparkles className="text-primary/10" size={120} />
                                </div>
                                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-xl border border-white/5 px-6 py-3 rounded-full flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-emerald animate-pulse"></div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Genuine Craftsmanship</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Info Section */}
                <div className="space-y-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-1.5 rounded-full text-[9px] font-black tracking-[0.2em] border border-primary/20 text-primary uppercase">
                            {product.category} Collection
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black heading leading-tight">{product.title}</h1>
                        <div className="flex items-center gap-3 text-text-muted text-sm border-l-2 border-primary pl-4">
                            <MapPin size={16} className="text-primary" />
                            <span className="uppercase tracking-[0.1em] font-bold">Artisan Master: {product.artisan?.name}</span>
                        </div>
                    </div>

                    <p className="text-text-muted text-lg leading-relaxed italic">
                        "{product.description}"
                    </p>

                    <div className="grid grid-cols-2 gap-6 pt-4 border-y border-border py-8">
                        <div className="space-y-1">
                            <p className="text-[10px] text-text-muted uppercase font-black tracking-widest">Heritage Value</p>
                            <p className="text-4xl font-black heading text-primary">{product.price} <span className="text-sm">MAD</span></p>
                        </div>
                        {product.customizable && (
                            <div className="space-y-1">
                                <p className="text-[10px] text-text-muted uppercase font-black tracking-widest">Type</p>
                                <p className="text-xl font-bold heading text-emerald flex items-center gap-2">
                                    <Sparkles size={18} /> Bespoke
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-text-muted">
                            <div className="flex items-center gap-2"><Clock size={16} className="text-primary" /> {product.fabricationDelay || 0} Days Handcrafting</div>
                            <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-primary" /> Guild Verified</div>
                        </div>

                        <button
                            onClick={() => setOrderModal(true)}
                            className="w-full bg-primary text-white py-6 rounded-2xl font-black flex items-center justify-center gap-4 hover:shadow-[0_0_40px_rgba(230,126,34,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-[0.3em] text-sm mt-4"
                        >
                            Acquire Masterpiece <ShoppingCart size={20} />
                        </button>
                    </div>

                    {/* Order Modal */}
                    {orderModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/80 backdrop-blur-md">
                            <div className="w-full max-w-lg bg-surface border border-primary/20 p-10 arch-frame shadow-2xl relative">
                                <h3 className="text-3xl font-black heading golden-text mb-4 text-center">Inscribe Order</h3>
                                <p className="text-xs text-text-muted uppercase tracking-widest text-center mb-8 font-bold">Personalize your heritage acquisition</p>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Customization Requests</label>
                                        <textarea
                                            value={customDetails}
                                            onChange={(e) => setCustomDetails(e.target.value)}
                                            className="w-full bg-background border border-border rounded-xl py-4 px-6 focus:border-primary outline-none transition-all font-medium resize-none"
                                            rows="4"
                                            placeholder="Specific sizes, colors, or engravings..."
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Select Payment Ritual</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                onClick={() => setPaymentMethod("stripe")}
                                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${paymentMethod === "stripe" ? "border-primary bg-primary/10 shadow-lg shadow-primary/20" : "border-border bg-background/50"}`}
                                            >
                                                <CreditCard size={24} className={paymentMethod === "stripe" ? "text-primary" : "text-text-muted"} />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Card / Stripe</span>
                                            </button>
                                            <button
                                                onClick={() => setPaymentMethod("paypal")}
                                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${paymentMethod === "paypal" ? "border-primary bg-primary/10 shadow-lg shadow-primary/20" : "border-border bg-background/50"}`}
                                            >
                                                <div className="w-6 h-6 flex items-center justify-center font-black text-primary italic">P</div>
                                                <span className="text-[10px] font-bold uppercase tracking-widest">PayPal</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/10">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Final Investment</span>
                                        <span className="text-2xl font-black heading text-primary">{product.price} MAD</span>
                                    </div>

                                    <div className="space-y-4 pt-4">
                                        {paymentMethod === "stripe" ? (
                                            <div className="grid grid-cols-2 gap-4">
                                                <button
                                                    onClick={() => setOrderModal(false)}
                                                    className="py-4 rounded-xl border border-border text-[10px] font-black uppercase tracking-widest hover:bg-background transition-all"
                                                >
                                                    Chose Again
                                                </button>
                                                <button
                                                    onClick={handleOrder}
                                                    disabled={isOrdering}
                                                    className="py-4 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
                                                >
                                                    {isOrdering ? "Inscribing..." : "Confirm Ritual"}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <PayPalPayment
                                                    createOrderInDB={createOurOrder}
                                                    onSuccess={(details) => {
                                                        alert("The ritual is complete! Your order has been placed.");
                                                        setOrderModal(false);
                                                        navigate("/orders");
                                                    }}
                                                    onError={(err) => {
                                                        alert("The PayPal ritual failed. Please try again.");
                                                    }}
                                                />
                                                <button
                                                    onClick={() => setOrderModal(false)}
                                                    className="w-full py-4 rounded-xl border border-border text-[10px] font-black uppercase tracking-widest hover:bg-background transition-all"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-surface/50 border border-border p-6 rounded-2xl">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 flex items-center gap-2">
                            <Sparkles size={14} className="text-primary" /> Artisan's Note
                        </h4>
                        <p className="text-xs text-text-muted italic leading-relaxed">
                            This piece is part of the sacred heritage of Moroccan {product.category.toLowerCase()}.
                            Every subtle imperfection is a signature of its unique soul.
                        </p>
                    </div>
                </div>
                {/* Reviews Section */}
                <div className="mt-16 bg-surface border border-border p-8 rounded-3xl relative overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'var(--zellige-pattern)', backgroundSize: '40px 40px' }}></div>
                    <div className="relative z-10">
                        <h3 className="text-3xl font-black heading golden-text mb-8">Whispers of the Souk</h3>

                        {/* Review Form */}
                        <form onSubmit={handleReviewSubmit} className="mb-12 bg-background/50 p-6 rounded-2xl border border-border">
                            <h4 className="text-lg font-bold mb-4">Leave your mark</h4>
                            <div className="flex gap-4 mb-4">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setUserRating(star)}
                                        className={`text-2xl transition-colors ${star <= userRating ? 'text-orange-500' : 'text-gray-300'}`}
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>
                            <textarea
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                placeholder="Share your experience with this masterpiece..."
                                className="w-full bg-background border border-border rounded-xl p-4 mb-4 outline-none focus:border-primary transition-all resize-none"
                                rows="3"
                            ></textarea>
                            <button
                                type="submit"
                                disabled={isSubmittingReview}
                                className="bg-primary text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:shadow-lg transition-all"
                            >
                                {isSubmittingReview ? "Inscribing..." : "Inscribe Review"}
                            </button>
                        </form>

                        {/* Reviews List */}
                        <div className="space-y-6">
                            {reviews.length === 0 ? (
                                <p className="text-text-muted italic text-center py-8">No whispers yet. Be the first to speak.</p>
                            ) : (
                                reviews.map((review) => (
                                    <div key={review._id} className="border-b border-border pb-6 last:border-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs border border-primary/20">
                                                    {review.client?.name?.[0] || '?'}
                                                </div>
                                                <span className="font-bold text-sm">{review.client?.name || 'Unknown Voyager'}</span>
                                            </div>
                                            <div className="flex text-orange-400 text-xs">
                                                {[...Array(5)].map((_, i) => (
                                                    <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-text-muted text-sm leading-relaxed">{review.comment}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
