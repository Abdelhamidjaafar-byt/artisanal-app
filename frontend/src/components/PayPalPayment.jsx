import { PayPalButtons } from "@paypal/react-paypal-js";
import api from "../lib/api";

const PayPalPayment = ({ createOrderInDB, onSuccess, onError }) => {
    return (
        <PayPalButtons
            createOrder={async () => {
                try {
                    // 1. Create our internal order first
                    const internalOrderId = await createOrderInDB();

                    // 2. Create PayPal order using our internal order ID
                    const response = await api.post("/paypal/create-order", { orderId: internalOrderId });

                    // Store internal order ID for capture step
                    window.currentOrderBeingPaid = internalOrderId;

                    return response.data.id;
                } catch (err) {
                    console.error("PayPal Create Order Error:", err);
                    onError(err);
                    throw err;
                }
            }}
            onApprove={async (data) => {
                try {
                    const orderId = window.currentOrderBeingPaid;
                    const response = await api.post("/paypal/capture-order", {
                        paypalOrderId: data.orderID,
                        orderId: orderId
                    });
                    if (response.data.status === "COMPLETED") {
                        onSuccess(response.data);
                    }
                } catch (err) {
                    console.error("PayPal Capture Error:", err);
                    onError(err);
                }
            }}
            onError={(err) => {
                console.error("PayPal UI Error:", err);
                onError(err);
            }}
            style={{ layout: "vertical", shape: "pill", label: "pay" }}
        />
    );
};

export default PayPalPayment;
