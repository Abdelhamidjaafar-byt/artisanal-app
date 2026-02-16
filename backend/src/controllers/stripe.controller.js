import Stripe from 'stripe';
import Order from '../models/Order.js';
import { emitToUser } from '../socket.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
    console.log("Stripe: Creating session for order ID:", req.body.orderId);
    try {
        const { orderId } = req.body;
        const order = await Order.findById(orderId).populate('items.product');

        if (!order) {
            console.warn("Stripe: Order not found!", orderId);
            return res.status(404).json({ message: 'Commande introuvable' });
        }

        const baseUrl = process.env.BACKEND_URL || 'http://localhost:3000';

        const line_items = order.items.map((item) => {
            const images = (item.product?.images || [])
                .map(img => img.startsWith('http') ? img : `${baseUrl}/${img.startsWith('/') ? img.slice(1) : img}`)
                .filter(img => {
                    try { new URL(img); return true; } catch { return false; }
                });

            return {
                price_data: {
                    currency: 'mad',
                    product_data: {
                        name: item.product?.title || 'Produit Artisanal',
                        images: images.length > 0 ? images : [],
                    },
                    unit_amount: Math.round((item.price || item.product?.price || 0) * 100),
                },
                quantity: item.quantity || 1,
            };
        });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/#/order-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/#/order-cancel`,
            metadata: {
                orderId: order._id.toString(),
            },
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Stripe Session Error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const stripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body, sig, process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook Error:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const orderId = session.metadata.orderId;

        try {
            const order = await Order.findByIdAndUpdate(orderId, {
                status: 'paid',
                'paymentInfo.status': 'completed',
                'paymentInfo.id': session.id,
                'paymentInfo.method': 'stripe'
            }).populate('items.product');

            if (order) {
                // Get unique artisans for this order
                const artisanIds = [...new Set(order.items.map(item => item.product?.artisan?.toString()).filter(id => id))];

                artisanIds.forEach(artisanId => {
                    emitToUser(artisanId, 'new_order', {
                        orderId: order._id,
                        message: 'You have a new order!',
                        totalAmount: order.totalAmount
                    });
                });
            }

            console.log(`Order ${orderId} marked as paid and artisans notified`);
        } catch (error) {
            console.error('Order Update Error:', error);
        }
    }

    res.json({ received: true });
};

export const verifySession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            res.json({ paymentStatus: 'paid' });
        } else {
            res.json({ paymentStatus: session.payment_status });
        }
    } catch (error) {
        console.error('Verify Session Error:', error);
        res.status(500).json({ message: error.message });
    }
};
