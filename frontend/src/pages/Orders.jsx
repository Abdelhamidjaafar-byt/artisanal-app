import { useState, useEffect } from "react";
import api from "../lib/api";
import { motion } from "framer-motion";
import { Package, Truck, CheckCircle, Clock } from "lucide-react";

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await api.get("/orders/myorders");
            setOrders(res.data);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="container py-24 text-center heading text-xl animate-pulse">Consulting the Ledger...</div>;
    if (orders.length === 0) return <div className="container py-24 text-center heading text-xl">Your history is yet to be written.</div>;

    return (
        <div className="container py-12">
            <h1 className="text-4xl font-black heading golden-text mb-12 text-center">My Acquisitions</h1>

            <div className="space-y-6 max-w-4xl mx-auto">
                {orders.map((order) => (
                    <motion.div
                        key={order._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-surface border border-primary/20 p-6 rounded-2xl relative overflow-hidden"
                    >
                        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'var(--zellige-pattern)', backgroundSize: '40px 40px' }}></div>

                        <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
                            <div className="space-y-4 flex-1">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
                                        Order #{order._id.slice(-6)}
                                    </span>
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${order.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                            'bg-orange-500/10 text-orange-500 border-orange-500/20'
                                        }`}>
                                        {order.status}
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex gap-4 items-center">
                                            {item.product?.images?.[0] && (
                                                <img src={item.product.images[0]} alt={item.product.title} className="w-12 h-12 object-cover rounded-lg border border-border" />
                                            )}
                                            <div>
                                                <p className="font-bold heading text-lg">{item.product?.title || 'Unknown Artifact'}</p>
                                                <p className="text-xs text-text-muted">{item.quantity} x {item.product?.price} MAD</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col justify-between items-end gap-4 min-w-[150px]">
                                <div className="text-right">
                                    <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Total Investment</p>
                                    <p className="text-2xl font-black heading text-primary">{order.totalAmount} MAD</p>
                                </div>
                                <div className="flex flex-col gap-2 w-full md:w-auto">
                                    {order.status === 'paid' && (
                                        <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold uppercase tracking-wide">
                                            <CheckCircle size={14} /> Paid via {order.paymentInfo?.method}
                                        </div>
                                    )}
                                    {order.status === 'in_cart' && (
                                        <button className="bg-primary text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:shadow-lg hover:bg-primary-dark transition-all">
                                            Complete Ritual
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Orders;
