import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const AuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = searchParams.get("token");
        const userStr = searchParams.get("user");

        console.log("AuthCallback - Token:", token ? "Present" : "Missing");
        console.log("AuthCallback - User:", userStr ? "Present" : "Missing");

        if (token && userStr) {
            try {
                const user = JSON.parse(decodeURIComponent(userStr));
                console.log("AuthCallback - Parsed user:", user);

                // Store token and user in localStorage
                localStorage.setItem("token", token);
                localStorage.setItem("user", JSON.stringify(user));

                console.log("AuthCallback - Stored in localStorage");

                // Small delay to ensure storage completes
                setTimeout(() => {
                    // Redirect based on role (role is an array)
                    if (user.role && user.role.includes("ADMIN")) {
                        console.log("AuthCallback - Redirecting to admin dashboard");
                        navigate("/admin/dashboard", { replace: true });
                    } else if (user.role && user.role.includes("ARTISAN")) {
                        if (!user.isApproved) {
                            console.log("AuthCallback - Redirecting to waiting approval");
                            navigate("/waiting-approval", { replace: true });
                        } else {
                            console.log("AuthCallback - Redirecting to artisan dashboard");
                            navigate("/artisan/dashboard", { replace: true });
                        }
                    } else {
                        // Default for CLIENT or any other role
                        console.log("AuthCallback - Redirecting to home");
                        navigate("/", { replace: true });
                    }
                }, 100);
            } catch (error) {
                console.error("AuthCallback - Error parsing user data:", error);
                setError("Failed to process authentication data");
                setTimeout(() => navigate("/login", { replace: true }), 2000);
            }
        } else {
            console.error("AuthCallback - Missing token or user data");
            setError("Missing authentication data");
            setTimeout(() => navigate("/login", { replace: true }), 2000);
        }
    }, [searchParams, navigate]);

    if (error) {
        return (
            <div className="container min-h-[85vh] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error}</p>
                    <p className="text-text-muted">Redirecting to login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container min-h-[85vh] flex items-center justify-center">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="mt-4 text-text-muted">Completing authentication...</p>
            </div>
        </div>
    );
};

export default AuthCallback;
