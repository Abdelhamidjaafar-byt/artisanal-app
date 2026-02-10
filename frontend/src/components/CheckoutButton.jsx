import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import api from "../lib/api";

const CheckoutButton = ({ productId, quantity = 1, customizationDetails = "", price }) => {
    const [loading, setLoading] = useState(false);

    const handleCheckout = async () => {
        setLoading(true);
        try {
            // 1. Create a pending order first
            const orderRes = await api.post("/orders", {
                items: [{
                    product: productId,
                    quantity,
                    customizationDetails
                }],
                shippingAddress: "To be confirmed", // For now, could be passed or collected later
                paymentInfo: {
                    method: "stripe",
                    status: "pending"
                }
            });

            const orderId = orderRes.data._id;

            // 2. Create Stripe Checkout Session
            const stripeRes = await api.post("/stripe/create-checkout-session", {
                orderId
            });

            // 3. Redirect to Stripe Checkout
            if (stripeRes.data.url) {
                window.location.href = stripeRes.data.url;
            }
        } catch (error) {
            console.error("Payment initialization failed:", error);
            const errorMessage = error.response?.data?.message || error.message || "Unknown error";
            alert(`Payment failed to start: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-primary text-white py-6 rounded-2xl font-black flex items-center justify-center gap-4 hover:shadow-[0_0_40px_rgba(230,126,34,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-[0.3em] text-sm mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {loading ? "Preparing..." : (
                <>
                    Acquire Masterpiece <ShoppingCart size={20} />
                </>
            )}
        </button>
    );
};

export default CheckoutButton;
