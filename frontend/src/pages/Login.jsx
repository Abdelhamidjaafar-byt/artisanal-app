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

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                            <span className="bg-surface px-4 text-text-muted">Or continue with</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <a
                            href="http://localhost:3000/auth/google"
                            className="flex items-center justify-center gap-3 py-4 rounded-xl border border-border bg-background/50 hover:bg-background hover:border-text-muted transition-all"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            <span className="text-xs font-bold text-text">Google</span>
                        </a>
                        <a
                            href="http://localhost:3000/auth/facebook"
                            className="flex items-center justify-center gap-3 py-4 rounded-xl border border-border bg-background/50 hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] transition-all group"
                        >
                            <svg className="w-5 h-5 fill-[#1877F2] group-hover:fill-white transition-colors" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                            <span className="text-xs font-bold text-text group-hover:text-white transition-colors">Facebook</span>
                        </a>
                    </div>

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
