import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, SlidersHorizontal, ShoppingCart, Tag, MapPin } from "lucide-react";

const Marketplace = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    const categories = ["All", "Jewelry", "Textiles", "Pottery", "Leather", "Metalwork"];

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await api.get("/products");
            setProducts(res.data);
        } catch (error) {
            console.error("Failed to fetch heritage pieces", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCat = selectedCategory === "All" || p.category === selectedCategory;
        return matchesSearch && matchesCat;
    });

    return (
        <div className="container py-12">
            {/* Header Section */}
            <header className="mb-16 space-y-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <h2 className="text-5xl font-black heading golden-text">The Grand Souk</h2>
                        <p className="text-text-muted uppercase tracking-[0.3em] text-[10px] font-bold">Curated Heritage Collections</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-text-muted">{filteredProducts.length} masterpieces found</span>
                        <button className="p-3 bg-surface border border-border rounded-xl hover:border-primary transition-colors">
                            <SlidersHorizontal size={20} />
                        </button>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="grid md:grid-cols-4 gap-6">
                    <div className="md:col-span-3 relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search by name, artisan or region..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-surface border border-border rounded-2xl py-4 pl-12 pr-6 focus:border-primary outline-none transition-all font-medium"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                        <select 
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full bg-surface border border-border rounded-2xl py-4 pl-12 pr-6 focus:border-primary outline-none appearance-none font-bold text-xs uppercase tracking-widest cursor-pointer"
                        >
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
            </header>

            {/* Product Grid */}
            {loading ? (
                <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {[1,2,3,4,5,6,7,8].map(i => (
                        <div key={i} className="bg-surface/50 h-[400px] rounded-3xl animate-pulse border border-border"></div>
                    ))}
                </div>
            ) : (
                <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
                    <AnimatePresence>
                        {filteredProducts.map((product, i) => (
                            <motion.div 
                                key={product._id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: i * 0.05 }}
                                className="group zellige-card rounded-3xl overflow-hidden flex flex-col h-full bg-surface border border-border hover:border-primary/40 transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
                            >
                                <div className="relative h-64 overflow-hidden">
                                    {/* Placeholder for Product Image with Moroccan Blur */}
                                    <div className="absolute inset-0 bg-primary/5 flex items-center justify-center">
                                         <Tag className="text-primary/20 rotate-12" size={80} />
                                    </div>
                                    <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/5 text-primary">
                                        {product.category}
                                    </div>
                                    {product.customizable && (
                                        <div className="absolute top-4 right-4 bg-emerald/20 backdrop-blur-md px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald/20 text-emerald">
                                            Bespoke
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 flex flex-col flex-grow space-y-4">
                                    <div className="space-y-1">
                                        <Link to={`/product/${product._id}`}>
                                            <h3 className="heading text-xl font-bold line-clamp-1 hover:text-primary transition-colors cursor-pointer">{product.title}</h3>
                                        </Link>
                                        <div className="flex items-center gap-1.5 text-text-muted">
                                            <MapPin size={12} className="text-primary" />
                                            <span className="text-[10px] uppercase font-bold tracking-widest">Artisan: {product.artisan?.name || "Guild Master"}</span>
                                        </div>
                                    </div>

                                    <p className="text-text-muted text-xs line-clamp-2 leading-relaxed">
                                        {product.description}
                                    </p>

                                    <div className="pt-4 mt-auto flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-text-muted uppercase font-bold tracking-widest">Investment</span>
                                            <span className="text-2xl font-black heading text-primary">{product.price} <span className="text-xs ml-0.5">MAD</span></span>
                                        </div>
                                        <button className="bg-primary p-3 rounded-2xl text-white hover:scale-110 active:scale-90 transition-all shadow-lg shadow-primary/20 group-hover:bg-primary-hover">
                                            <ShoppingCart size={20} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {!loading && filteredProducts.length === 0 && (
                <div className="text-center py-24 space-y-4">
                    <div className="text-primary/20 flex justify-center mb-6">
                        <Search size={100} />
                    </div>
                    <h3 className="heading text-3xl italic text-text-muted">No hidden gems found...</h3>
                    <p className="text-sm text-text-muted uppercase tracking-widest">Try adjusting your search through the Medina</p>
                </div>
            )}
        </div>
    );
};

export default Marketplace;
