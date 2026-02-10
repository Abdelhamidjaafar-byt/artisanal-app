import fetch from 'node-fetch';
import Order from '../models/Order.js';
import { emitToUser } from '../socket.js';

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_API_URL } = process.env;

// Helper to get PayPal Access Token
const getAccessToken = async () => {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
        console.error("PayPal credentials missing in .env");
        throw new Error("MISSING_PAYPAL_CREDENTIALS");
    }

    const auth = Buffer.from(PAYPAL_CLIENT_ID + ":" + PAYPAL_CLIENT_SECRET).toString("base64");
    const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
        method: "POST",
        body: "grant_type=client_credentials",
        headers: {
            Authorization: `Basic ${auth}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.text();
        console.error("PayPal Auth Error:", errorData);
        throw new Error("PAYPAL_AUTH_FAILED");
    }

    const data = await response.json();
    return data.access_token;
};

// CREATE PAYPAL ORDER
export const createPayPalOrder = async (req, res, next) => {
    try {
        const { orderId } = req.body;
        const order = await Order.findById(orderId);

        if (!order) {
            res.status(404);
            throw new Error("Order not found");
        }

        const accessToken = await getAccessToken();
        const url = `${PAYPAL_API_URL}/v2/checkout/orders`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                intent: "CAPTURE",
                purchase_units: [
                    {
                        amount: {
                            currency_code: "USD", // PayPal support for MAD is limited, usually converted
                            value: order.totalAmount.toString(),
                        },
                        reference_id: order._id.toString(),
                    },
                ],
            }),
        });

        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        next(error);
    }
};

// CAPTURE PAYPAL ORDER
export const capturePayPalOrder = async (req, res, next) => {
    try {
        const { paypalOrderId, orderId } = req.body;
        const accessToken = await getAccessToken();
        const url = `${PAYPAL_API_URL}/v2/checkout/orders/${paypalOrderId}/capture`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const data = await response.json();

        if (data.status === "COMPLETED") {
            const order = await Order.findByIdAndUpdate(orderId, {
                status: 'paid',
                'paymentInfo.status': 'completed',
                'paymentInfo.id': data.id,
                'paymentInfo.method': 'paypal'
            }).populate('items.product');

            if (order) {
                // Notify Artisans
                const artisanIds = [...new Set(order.items.map(item => item.product?.artisan?.toString()).filter(id => id))];
                artisanIds.forEach(artisanId => {
                    emitToUser(artisanId, 'new_order', {
                        orderId: order._id,
                        message: 'You have a new order (PayPal)!',
                        totalAmount: order.totalAmount
                    });
                });
            }
        }

        res.status(response.status).json(data);
    } catch (error) {
        next(error);
    }
};
