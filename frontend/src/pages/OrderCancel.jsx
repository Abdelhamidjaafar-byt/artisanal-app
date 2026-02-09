import { motion } from "framer-motion";
import { XCircle, ShoppingBag, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const OrderCancel = () => {
    return (
        <div className="container py-24 flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-xl w-full bg-surface border border-red-500/20 p-12 rounded-[2rem] text-center space-y-8 relative overflow-hidden"
            >
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'var(--zellige-pattern)', backgroundSize: '40px 40px' }}></div>

                <div className="flex justify-center">
                    <div className="bg-red-500/10 p-6 rounded-full text-red-500">
                        <XCircle size={64} />
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-5xl font-black heading tracking-tight">Payment Cancelled.</h1>
                    <p className="text-text-muted text-lg">
                        The transaction was not completed. Your selected masterpieces are still waiting in the souk.
                    </p>
                </div>

                <div className="pt-8 flex flex-col items-center gap-4">
                    <Link
                        to="/marketplace"
                        className="w-full bg-surface border border-border text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/5 transition-all uppercase tracking-widest text-[10px]"
                    >
                        <ArrowLeft size={16} /> Back to Marketplace
                    </Link>
                    <p className="text-[10px] text-text-muted uppercase font-black tracking-widest">
                        Need help? Contact the Guild support
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default OrderCancel;
