import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { User, Mail, Lock, UserPlus, AlertCircle, Sparkles } from "lucide-react";

const Register = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "CLIENT"
    });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);
        try {
            await register(formData.name, formData.email, formData.password, formData.role);
            navigate("/login");
        } catch (err) {
            setError(err.response?.data?.message || "Registration denied by the guild elders.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container min-h-[85vh] flex items-center justify-center py-16">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-xl bg-surface border border-primary/20 p-10 arch-frame shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
            >
                {/* Decorative Pattern Background for Form */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'var(--zellige-pattern)', backgroundSize: '40px 40px' }}></div>
                
                <div className="relative z-10">
                    <div className="text-center mb-10">
                        <div className="inline-flex p-3 bg-primary/10 rounded-2xl mb-4">
                            <Sparkles className="text-primary" size={32} />
                        </div>
                        <h2 className="text-4xl font-black heading golden-text mb-3">Join the Guild</h2>
                        <p className="text-text-muted text-sm uppercase tracking-widest font-bold">Begin your Journey of Heritage</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex items-center gap-3 mb-8 text-xs font-bold uppercase tracking-widest">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setFormData({...formData, role: "CLIENT"})}
                                className={`py-4 rounded-xl border text-[10px] font-black uppercase tracking-[0.2em] transition-all ${formData.role === "CLIENT" ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-background/50 border-border text-text-muted hover:border-primary/50"}`}
                            >
                                Seeker of Art
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({...formData, role: "ARTISAN"})}
                                className={`py-4 rounded-xl border text-[10px] font-black uppercase tracking-[0.2em] transition-all ${formData.role === "ARTISAN" ? "bg-majorelle text-white border-majorelle shadow-lg shadow-majorelle/20" : "bg-background/50 border-border text-text-muted hover:border-majorelle/50"}`}
                            >
                                Master Artisan
                            </button>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Noble Name</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                                <input 
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full bg-background/50 border border-border rounded-xl py-4 pl-12 pr-4 focus:border-primary outline-none transition-all text-sm font-medium"
                                    placeholder="your name"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Medina Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                                <input 
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="w-full bg-background/50 border border-border rounded-xl py-4 pl-12 pr-4 focus:border-primary outline-none transition-all text-sm font-medium"
                                    placeholder="your@medina.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Secret Key</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                                <input 
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    className="w-full bg-background/50 border border-border rounded-xl py-4 pl-12 pr-4 focus:border-primary outline-none transition-all text-sm font-medium"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className={`w-full ${formData.role === "ARTISAN" ? "bg-majorelle" : "bg-primary"} text-white py-5 rounded-xl font-black flex items-center justify-center gap-3 hover:brightness-110 disabled:opacity-50 transition-all uppercase tracking-[0.2em] text-xs mt-4 shadow-xl`}
                        >
                            {isLoading ? "Consulting Elders..." : (
                                <>Inscribe into History <UserPlus size={18} /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 text-center text-xs font-bold text-text-muted uppercase tracking-widest">
                        Already part of the circle?{" "}
                        <Link to="/login" className="text-primary hover:text-primary-hover underline underline-offset-4">
                            Log in
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
