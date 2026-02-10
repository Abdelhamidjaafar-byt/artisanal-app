import Stripe from "stripe";
import Order from "../models/Order.js";
import dotenv from "dotenv";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-01-27.acacia",
});

/**
 * @desc    Verify Stripe Session and get payment status
 * @route   GET /api/stripe/verify-session/:sessionId
 * @access  Private
 */
export const verifySession = async (req, res, next) => {
    try {
        const { sessionId } = req.params;

        const session = await stripe.checkout.sessions.retrieve(sessionId);

        res.status(200).json({
            paymentStatus: session.payment_status,
            customerEmail: session.customer_details?.email,
            amountTotal: session.amount_total / 100,
            orderId: session.metadata?.orderId
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create Stripe Checkout Session
 * @route   POST /api/stripe/create-checkout-session
 * @access  Private
 */
export const createCheckoutSession = async (req, res, next) => {
    console.log("--- DEBUG: createCheckoutSession Called ---");
    console.log("Stripe API Version:", stripe.apiVersion);
    console.log("OrderId:", req.body.orderId);
    try {
        const { orderId } = req.body;
        const order = await Order.findById(orderId).populate("items.product");

        if (!order) {
            res.status(404);
            throw new Error("Order not found");
        }

        // Handle both ObjectId and populated user objects
        const clientId = order.client._id ? order.client._id.toString() : order.client.toString();
        if (clientId !== req.user.id) {
            res.status(403);
            throw new Error("Not authorized to pay for this order");
        }

        const lineItems = order.items.map((item) => {
            const lineItem = {
                price_data: {
                    currency: "mad",
                    product_data: {
                        name: item.product.title,
                    },
                    unit_amount: Math.round(item.product.price * 100),
                },
                quantity: item.quantity,
            };

            if (item.customizationDetails && item.customizationDetails.trim() !== "") {
                lineItem.price_data.product_data.description = item.customizationDetails;
            }

            return lineItem;
        });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card", "paypal"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${process.env.FRONTEND_URL}/order-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/order-cancel`,
            metadata: {
                orderId: order._id.toString(),
            },
        });

        res.status(200).json({ url: session.url });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Stripe Webhook Handler
 * @route   POST /api/stripe/webhook
 * @access  Public
 */
export const stripeWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const orderId = session.metadata.orderId;

        try {
            const order = await Order.findById(orderId);
            if (order) {
                order.status = "paid";
                order.paymentInfo = {
                    id: session.payment_intent,
                    status: "completed",
                    method: "stripe",
                };
                await order.save();
                console.log(`Order ${orderId} marked as paid.`);
            }
        } catch (error) {
            console.error(`Error updating order ${orderId}: ${error.message}`);
            return res.status(500).send("Error updating order");
        }
    }

    res.json({ received: true });
};
