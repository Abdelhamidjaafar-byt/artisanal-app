import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit3, Trash2, Package, TrendingUp, Star, LayoutGrid, List } from "lucide-react";

const ArtisanDashboard = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        custom: 0,
        avgPrice: 0
    });

    useEffect(() => {
        fetchMyProducts();
    }, []);

    const fetchMyProducts = async () => {
        try {
            // In a real app, you might have a dedicated /artisan/products endpoint
            // For now, we'll filter globally or assume backend handles artisan scope
            const res = await api.get("/products");
            const myProducts = res.data.filter(p => p.artisan?._id === user?.id || p.artisan === user?.id);
            setProducts(myProducts);
            
            // Calculate Stats
            const custom = myProducts.filter(p => p.customizable).length;
            const avg = myProducts.length ? Math.round(myProducts.reduce((acc, p) => acc + p.price, 0) / myProducts.length) : 0;
            
            setStats({
                total: myProducts.length,
                custom,
                avgPrice: avg
            });
        } catch (error) {
            console.error("Failed to load your collection", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to remove this masterpiece from the guild?")) return;
        try {
            await api.delete(`/products/${id}`);
            setProducts(products.filter(p => p._id !== id));
        } catch (error) {
            alert("Failed to delete product");
        }
    };

    return (
        <div className="container py-12">
            <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <h2 className="text-5xl font-black heading golden-text">Guild Hall</h2>
                    <p className="text-text-muted uppercase tracking-[0.3em] text-[10px] font-bold">Managing {user?.name}'s Collection</p>
                </div>
                <Link to="/artisan/product/new" className="bg-primary text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 hover:shadow-[0_0_30px_rgba(230,126,34,0.4)] transition-all uppercase tracking-widest text-xs">
                    <Plus size={20} /> New Masterpiece
                </Link>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {[
                    { label: "Active Pieces", value: stats.total, icon: <Package size={24} />, color: "var(--primary)" },
                    { label: "Bespoke Offers", value: stats.custom, icon: <Star size={24} />, color: "var(--emerald)" },
                    { label: "Avg. Investment", value: `${stats.avgPrice} MAD`, icon: <TrendingUp size={24} />, color: "var(--majorelle)" }
                ].map((stat, i) => (
                    <div key={i} className="bg-surface border border-border p-8 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform" style={{ color: stat.color }}>{stat.icon}</div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">{stat.label}</p>
                        <h4 className="text-3xl font-black heading" style={{ color: stat.color }}>{stat.value}</h4>
                    </div>
                ))}
            </div>

            {/* Product Management Table/List */}
            <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <h3 className="heading text-xl">Your Collection</h3>
                    <div className="flex bg-background p-1 rounded-xl border border-border">
                        <button className="p-2 text-primary bg-surface rounded-lg shadow-sm"><LayoutGrid size={18} /></button>
                        <button className="p-2 text-text-muted hover:text-white"><List size={18} /></button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border text-[10px] uppercase tracking-[0.2em] text-text-muted font-black">
                                <th className="px-8 py-6">Masterpiece</th>
                                <th className="px-8 py-6">Category</th>
                                <th className="px-8 py-6">Status</th>
                                <th className="px-8 py-6 text-right">Investment</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                [1,2,3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="px-8 py-10 bg-white/5"></td>
                                    </tr>
                                ))
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <p className="text-text-muted italic heading text-xl">The workshop is quiet... Begin your first creation.</p>
                                    </td>
                                </tr>
                            ) : (
                                products.map(product => (
                                    <tr key={product._id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center text-primary/40">
                                                    <Package size={20} />
                                                </div>
                                                <span className="font-bold heading text-lg">{product.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted bg-background px-3 py-1 rounded-full border border-border">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            {product.customizable ? (
                                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald bg-emerald/10 border border-emerald/20 px-3 py-1 rounded-full">Bespoke Available</span>
                                            ) : (
                                                <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Standard</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 text-right font-black heading text-primary">
                                            {product.price} MAD
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link to={`/artisan/product/edit/${product._id}`} className="p-3 bg-background border border-border rounded-xl text-majorelle hover:bg-majorelle hover:text-white transition-all">
                                                    <Edit3 size={18} />
                                                </Link>
                                                <button 
                                                    onClick={() => handleDelete(product._id)}
                                                    className="p-3 bg-background border border-border rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ArtisanDashboard;
