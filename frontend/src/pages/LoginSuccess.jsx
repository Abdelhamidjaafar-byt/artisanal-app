import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const LoginSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { } = useAuth();

    useEffect(() => {
        const token = searchParams.get("token");
        const encodedUser = searchParams.get("user");

        if (token && encodedUser) {
            try {
                // Decode user data
                const userData = JSON.parse(atob(encodedUser));

                // Save to localStorage (matching AuthContext keys)
                localStorage.setItem("artisan_token", token);
                localStorage.setItem("artisan_auth", JSON.stringify(userData));

                // Force a page reload to trigger the AuthProvider re-sync
                window.location.href = userData.role.includes("ARTISAN")
                    ? "/dashboard"
                    : "/dashboard";
            } catch (error) {
                console.error("Failed to process social login:", error);
                navigate("/login");
            }
        } else {
            navigate("/login");
        }
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-700 mx-auto mb-4"></div>
                <h2 className="text-2xl font-heritage font-bold text-orange-950 mb-2">Authentification en cours...</h2>
                <p className="text-gray-500">Complétion de votre connexion...</p>
            </div>
        </div>
    );
};

export default LoginSuccess;
