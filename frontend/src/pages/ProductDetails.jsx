import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { motion } from "framer-motion";
import { ArrowLeft, ShoppingCart, Sparkles, Clock, ShieldCheck, MapPin } from "lucide-react";

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProduct();
    }, [id]);

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
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6"
                >
                    <div className="arch-frame aspect-square bg-surface border border-primary/20 relative overflow-hidden shadow-2xl">
                        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'var(--zellige-pattern)', backgroundSize: '60px 60px' }}></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Sparkles className="text-primary/10" size={120} />
                        </div>
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-xl border border-white/5 px-6 py-3 rounded-full flex items-center gap-3">
                             <div className="w-2 h-2 rounded-full bg-emerald animate-pulse"></div>
                             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Genuine Craftsmanship</span>
                        </div>
                    </div>
                </motion.div>

                {/* Info Section */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8"
                >
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

                        <button className="w-full bg-primary text-white py-6 rounded-2xl font-black flex items-center justify-center gap-4 hover:shadow-[0_0_40px_rgba(230,126,34,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-[0.3em] text-sm mt-4">
                            Acquire Masterpiece <ShoppingCart size={20} />
                        </button>
                    </div>

                    <div className="bg-surface/50 border border-border p-6 rounded-2xl">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 flex items-center gap-2">
                            <Sparkles size={14} className="text-primary" /> Artisan's Note
                        </h4>
                        <p className="text-xs text-text-muted italic leading-relaxed">
                            This piece is part of the sacred heritage of Moroccan {product.category.toLowerCase()}. 
                            Every subtle imperfection is a signature of its unique soul.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ProductDetails;
