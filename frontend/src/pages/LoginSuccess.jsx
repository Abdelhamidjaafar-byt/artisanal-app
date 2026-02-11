import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const LoginSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setAuthData } = useAuth();

    useEffect(() => {
        console.log("LoginSuccess: Component mounted");
        const token = searchParams.get("token");
        const userParam = searchParams.get("user");

        console.log("LoginSuccess: Params", { hasToken: !!token, hasUser: !!userParam });

        if (token && userParam) {
            try {
                // searchParams.get already decodes the URI component
                const userData = JSON.parse(userParam);
                console.log("LoginSuccess: Parsed userData", userData);

                // Normalize role (backend sends array, frontend expects string/UserRole)
                if (Array.isArray(userData.role) && userData.role.length > 0) {
                    userData.role = userData.role[0];
                }

                // Ensure id is present (backend might use _id)
                if (userData._id && !userData.id) {
                    userData.id = userData._id;
                }

                console.log("LoginSuccess: Final normalized userData", userData);

                // Set auth data in context for immediate state sync
                setAuthData(userData, token);
                console.log("LoginSuccess: authData set, navigating to dashboard...");

                // Small delay to ensure state propagates before navigation
                setTimeout(() => {
                    navigate("/dashboard");
                }, 100);
            } catch (error) {
                console.error("LoginSuccess error:", error);
                navigate("/login");
            }
        } else {
            console.warn("LoginSuccess: Missing token or userParam");
            navigate("/login");
        }
    }, [searchParams, navigate, setAuthData]);

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
