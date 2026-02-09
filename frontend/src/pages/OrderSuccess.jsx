import { motion } from "framer-motion";
import { CheckCircle2, Package, ArrowRight, Home } from "lucide-react";
import { Link } from "react-router-dom";

const OrderSuccess = () => {
    return (
        <div className="container py-24 flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-xl w-full bg-surface border border-primary/20 p-12 rounded-[2rem] text-center space-y-8 relative overflow-hidden"
            >
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'var(--zellige-pattern)', backgroundSize: '40px 40px' }}></div>

                <div className="flex justify-center">
                    <div className="relative">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className="bg-emerald/10 p-6 rounded-full text-emerald"
                        >
                            <CheckCircle2 size={64} />
                        </motion.div>
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 bg-emerald/5 rounded-full -z-10"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-5xl font-black heading tracking-tight">Payment Secured.</h1>
                    <p className="text-text-muted text-lg">
                        Your choice of heritage is now being prepared by our master artisans.
                        A notification of the soul has been sent to your registry.
                    </p>
                </div>

                <div className="pt-8 grid sm:grid-cols-2 gap-4">
                    <Link
                        to="/marketplace"
                        className="bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all uppercase tracking-widest text-[10px]"
                    >
                        Explore More <ArrowRight size={16} />
                    </Link>
                    <Link
                        to="/"
                        className="bg-surface border border-border text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/5 transition-all uppercase tracking-widest text-[10px]"
                    >
                        Return Home <Home size={16} />
                    </Link>
                </div>

                <div className="pt-8 border-t border-border flex items-center justify-center gap-3 text-text-muted text-[10px] font-black uppercase tracking-[0.2em]">
                    <Package size={14} className="text-primary" />
                    Track your masterpiece in dashboard
                </div>
            </motion.div>
        </div>
    );
};

export default OrderSuccess;
