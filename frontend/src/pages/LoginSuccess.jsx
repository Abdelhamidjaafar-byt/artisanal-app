import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

const LoginSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user: authUser } = useAuth();

    useEffect(() => {
        const token = searchParams.get("token");
        const encodedUser = searchParams.get("user");

        if (token && encodedUser) {
            try {
                // Decode user data
                const userData = JSON.parse(atob(encodedUser));

                // Save to localStorage
                localStorage.setItem("token", token);
                localStorage.setItem("user", JSON.stringify(userData));

                // We can't directly call a 'login' like function here if it's not exposed,
                // but since useAuth loads from localStorage on mount, a simple refresh or 
                // redirect might work if AuthProvider handles it.
                // However, standard useAuth doesn't auto-update if localStorage changes manually.
                // We'll force a page reload to trigger the AuthProvider re-sync.
                window.location.href = userData.role.includes("ARTISAN")
                    ? "/artisan/dashboard"
                    : "/marketplace";
            } catch (error) {
                console.error("Failed to process social login:", error);
                navigate("/login");
            }
        } else {
            navigate("/login");
        }
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
            <div className="bg-surface p-12 rounded-[2rem] glass border border-white/5 flex flex-col items-center gap-6 shadow-2xl">
                <Loader2 className="text-primary animate-spin" size={48} />
                <div className="text-center">
                    <h2 className="text-2xl font-black heading uppercase tracing-widest mb-2">Authenticating</h2>
                    <p className="text-text-muted text-sm font-medium tracking-wide uppercase">Completing your Guild registration...</p>
                </div>
            </div>
        </div>
    );
};

export default LoginSuccess;
