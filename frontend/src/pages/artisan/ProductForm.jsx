import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../lib/api";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Sparkles, Image as ImageIcon, Tag, Coins, Clock } from "lucide-react";

const ProductForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
        category: "Jewelry",
        customizable: false,
        fabricationDelay: 0,
        images: []
    });

    useEffect(() => {
        if (id) {
            fetchProduct();
        }
    }, [id]);

    const fetchProduct = async () => {
        try {
            const res = await api.get(`/products/${id}`);
            const { title, description, price, category, customizable, fabricationDelay } = res.data;
            setFormData({ title, description, price, category, customizable, fabricationDelay, images: [] });
        } catch (error) {
            console.error("Failed to load product for editing", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (id) {
                await api.put(`/products/${id}`, formData);
            } else {
                await api.post("/products", formData);
            }
            navigate("/artisan/dashboard");
        } catch (error) {
            alert(error.response?.data?.message || "Failed to save masterpiece");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container py-12 max-w-3xl">
            <button 
                onClick={() => navigate("/artisan/dashboard")}
                className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors mb-8 group uppercase tracking-widest text-xs font-bold"
            >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Guild
            </button>

            <header className="mb-12">
                <h2 className="text-5xl font-black heading golden-text mb-2">{id ? "Refine Creation" : "New Masterpiece"}</h2>
                <p className="text-text-muted uppercase tracking-[0.3em] text-[10px] font-bold">Inscribing Heritage into the Souk</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8 bg-surface border border-border p-10 rounded-3xl arch-frame relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'var(--zellige-pattern)', backgroundSize: '40px 40px' }}></div>
                
                <div className="relative z-10 space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Title of the Work</label>
                        <div className="relative group">
                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                            <input 
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                className="w-full bg-background border border-border rounded-xl py-4 pl-12 pr-4 focus:border-primary outline-none transition-all font-medium"
                                placeholder="e.g. Imperial Berber Rug"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">The Story / Description</label>
                        <textarea 
                            required
                            rows="4"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            className="w-full bg-background border border-border rounded-xl py-4 px-6 focus:border-primary outline-none transition-all font-medium resize-none"
                            placeholder="Tell the story of how this piece was crafted..."
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Price */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Investment (MAD)</label>
                            <div className="relative group">
                                <Coins className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                                <input 
                                    type="number"
                                    required
                                    value={formData.price}
                                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                                    className="w-full bg-background border border-border rounded-xl py-4 pl-12 pr-4 focus:border-primary outline-none transition-all font-medium"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Collection / Category</label>
                            <select 
                                value={formData.category}
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                                className="w-full bg-background border border-border rounded-xl py-4 px-6 focus:border-primary outline-none transition-all font-bold text-xs uppercase tracking-widest cursor-pointer appearance-none"
                            >
                                <option value="Jewelry">Jewelry</option>
                                <option value="Textiles">Textiles</option>
                                <option value="Pottery">Pottery</option>
                                <option value="Leather">Leather</option>
                                <option value="Metalwork">Metalwork</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 items-end">
                        {/* Customizable */}
                        <div className="flex items-center gap-4 bg-background border border-border p-4 rounded-xl cursor-pointer hover:border-emerald/40 transition-colors" onClick={() => setFormData({...formData, customizable: !formData.customizable})}>
                            <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all ${formData.customizable ? 'bg-emerald border-emerald text-white' : 'border-border'}`}>
                                {formData.customizable && <Sparkles size={14} />}
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest">Bespoke Option</p>
                                <p className="text-[8px] text-text-muted uppercase tracking-widest mt-0.5">Allow custom requests</p>
                            </div>
                        </div>

                        {/* Fabrication Delay */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Crafting Time (Days)</label>
                            <div className="relative group">
                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                                <input 
                                    type="number"
                                    value={formData.fabricationDelay}
                                    onChange={(e) => setFormData({...formData, fabricationDelay: e.target.value})}
                                    className="w-full bg-background border border-border rounded-xl py-4 pl-12 pr-4 focus:border-primary outline-none transition-all font-medium"
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Placeholder for Images */}
                    <div className="border-2 border-dashed border-border rounded-3xl p-12 text-center space-y-4 hover:border-primary/40 transition-all group cursor-pointer bg-background/50">
                        <div className="inline-flex p-4 bg-primary/10 rounded-2xl text-primary group-hover:scale-110 transition-transform">
                            <ImageIcon size={32} />
                        </div>
                        <div className="space-y-1">
                            <p className="font-bold heading text-lg">Unveil the Visuals</p>
                            <p className="text-[10px] text-text-muted uppercase tracking-widest">Upload high-resolution captures of your work</p>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-primary text-white py-6 rounded-2xl font-black flex items-center justify-center gap-3 hover:shadow-[0_0_40px_rgba(230,126,34,0.4)] disabled:opacity-50 transition-all uppercase tracking-[0.3em] text-xs mt-8"
                    >
                        {isLoading ? "Inscribing..." : (
                            <>{id ? "Refine Masterpiece" : "Unveil to the World"} <Save size={20} /></>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;
