import express from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Create Order from cart items
router.post("/", verifyToken, async (req, res) => {
    try {
        const { items, shippingAddress, paymentInfo, customizationDetails } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Items are required" });
        }

        // Group items by artisan
        const itemsByArtisan = {};
        for (const item of items) {
            const product = await Product.findById(item.product).populate('artisan');
            if (!product) {
                return res.status(404).json({ message: `Product ${item.product} not found` });
            }
            const artisanId = product.artisan._id.toString();
            if (!itemsByArtisan[artisanId]) {
                itemsByArtisan[artisanId] = {
                    artisan: product.artisan,
                    items: []
                };
            }
            itemsByArtisan[artisanId].items.push({
                product: item.product,
                quantity: item.quantity,
                customizationDetails: item.customizationDetails || customizationDetails,
                price: product.price
            });
        }

        // Create orders for each artisan
        const orders = [];
        for (const artisanId in itemsByArtisan) {
            const { artisan, items } = itemsByArtisan[artisanId];
            const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            const order = await Order.create({
                client: req.user.id,
                artisan: artisanId,
                items,
                totalAmount,
                shippingAddress,
                paymentInfo: {
                    method: paymentInfo?.method || 'stripe',
                    status: 'pending'
                }
            });
            orders.push(order);
        }

        res.status(201).json(orders.length === 1 ? orders[0] : orders);
    } catch (error) {
        console.error("Order creation error:", error);
        res.status(500).json({ message: error.message });
    }
});

// Get My Orders (Client or Artisan)
router.get("/my-orders", verifyToken, async (req, res) => {
    try {
        const orders = await Order.find({
            $or: [{ client: req.user.id }, { artisan: req.user.id }]
        }).populate("items.product").populate("client", "name email").populate("artisan", "name email");
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get Order by ID
router.get("/:id", verifyToken, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("items.product")
            .populate("client", "name email")
            .populate("artisan", "name email");

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Check if user is client or artisan
        if (order.client._id.toString() !== req.user.id && order.artisan._id.toString() !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update Order Status (Artisan only)
router.put("/:id/status", verifyToken, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });

        if (order.artisan.toString() !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        order.status = req.body.status;
        await order.save();
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
