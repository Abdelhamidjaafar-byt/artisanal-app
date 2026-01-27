import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, AlertCircle, Compass } from "lucide-react";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);
        try {
            await login(email, password);
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.message || "Credentials not recognized in the guild.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container min-h-[85vh] flex items-center justify-center py-16">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-surface border border-primary/20 p-10 arch-frame shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
            >
                {/* Decorative Pattern Background for Form */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'var(--zellige-pattern)', backgroundSize: '40px 40px' }}></div>
                
                <div className="relative z-10">
                    <div className="text-center mb-10">
                        <div className="inline-flex p-3 bg-primary/10 rounded-2xl mb-4">
                            <Compass className="text-primary" size={32} />
                        </div>
                        <h2 className="text-4xl font-black heading golden-text mb-3">Riad Entrance</h2>
                        <p className="text-text-muted text-sm uppercase tracking-widest font-bold">Return to the Medina</p>
                    </div>

                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex items-center gap-3 mb-8 text-xs font-bold uppercase tracking-widest"
                        >
                            <AlertCircle size={18} />
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Merchant Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                                <input 
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-background/50 border border-border rounded-xl py-4 pl-12 pr-4 focus:border-primary outline-none transition-all text-sm font-medium"
                                    placeholder="your@medina.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Guild Secret</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                                <input 
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-background/50 border border-border rounded-xl py-4 pl-12 pr-4 focus:border-primary outline-none transition-all text-sm font-medium"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full bg-primary text-white py-5 rounded-xl font-black flex items-center justify-center gap-3 hover:shadow-[0_0_25px_rgba(230,126,34,0.3)] disabled:opacity-50 transition-all uppercase tracking-[0.2em] text-xs mt-4"
                        >
                            {isLoading ? "Consulting Masters..." : (
                                <>Enter the Guild <LogIn size={18} /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 text-center text-xs font-bold text-text-muted uppercase tracking-widest">
                        New to the Souk?{" "}
                        <Link to="/register" className="text-primary hover:text-primary-hover underline underline-offset-4">
                            Apply for Membership
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
