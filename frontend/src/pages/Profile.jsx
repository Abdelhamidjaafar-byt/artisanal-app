import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { User, Mail, Shield, LogOut } from "lucide-react";
import api from "../lib/api";

const Profile = () => {
    const { user, logout } = useAuth();

    const handleDeleteAccount = async () => {
        if (!window.confirm("Are you sure you want to leave the guild forever? This action cannot be undone.")) return;
        try {
            await api.delete(`/users/${user.id || user._id}`);
            alert("You have departed the guild.");
            logout();
        } catch (error) {
            console.error("Failed to delete account", error);
            alert("The guild masters could not process your departure.");
        }
    };

    if (!user) return <div className="container py-24 text-center heading text-2xl">Access Denied. Return to the souk.</div>;

    return (
        <div className="container py-24 min-h-[80vh] flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-2xl bg-surface border border-primary/20 p-12 arch-frame shadow-2xl relative overflow-hidden"
            >
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'var(--zellige-pattern)', backgroundSize: '60px 60px' }}></div>

                <div className="relative z-10 space-y-12">
                    <div className="text-center">
                        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-primary/20">
                            <User size={48} className="text-primary" />
                        </div>
                        <h1 className="text-5xl font-black heading golden-text mb-2">{user.name}</h1>
                        <p className="text-text-muted uppercase tracking-[0.3em] font-bold text-xs">{user.role} of the Medina</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-background/50 border border-border p-6 rounded-2xl space-y-2">
                            <p className="text-[10px] text-text-muted uppercase font-black tracking-widest flex items-center gap-2">
                                <Mail size={12} className="text-primary" /> Medina Email
                            </p>
                            <p className="text-sm font-bold">{user.email}</p>
                        </div>
                        <div className="bg-background/50 border border-border p-6 rounded-2xl space-y-2">
                            <p className="text-[10px] text-text-muted uppercase font-black tracking-widest flex items-center gap-2">
                                <Shield size={12} className="text-primary" /> Account Status
                            </p>
                            <p className="text-sm font-bold text-emerald uppercase tracking-wider">Heritage Verified</p>
                        </div>
                    </div>

                    <button
                        onClick={handleDeleteAccount}
                        className="w-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white py-5 rounded-2xl font-black flex items-center justify-center gap-4 transition-all uppercase tracking-[0.3em] text-xs border border-red-500/20"
                    >
                        Depart the Guild (Delete Account) <LogOut size={20} />
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default Profile;
