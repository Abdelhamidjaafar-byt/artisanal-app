import express from "express";
import Order from "../models/Order.js";
import auth from "../middlewares/auth.middleware.js";

const router = express.Router();

// Create Order
router.post("/", auth, async (req, res) => {
    try {
        const { artisan, product, customizationDetails, price } = req.body;
        const order = await Order.create({
            client: req.user.id,
            artisan,
            product,
            customizationDetails,
            price
        });
        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get My Orders (Client or Artisan)
router.get("/my-orders", auth, async (req, res) => {
    try {
        const orders = await Order.find({
            $or: [{ client: req.user.id }, { artisan: req.user.id }]
        }).populate("product").populate("client", "name email").populate("artisan", "name email");
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
const orderValidation = [
    body("items").isArray({ min: 1 }).withMessage("Items must be an array and not empty"),
    body("items.*.product").notEmpty().withMessage("Product ID is required"),
    body("items.*.quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
    body("shippingAddress").notEmpty().withMessage("Shipping address is required"),
    body("paymentInfo.method").notEmpty().withMessage("Payment method is required"),
    validate
];

// Update Order Status (Artisan only)
router.put("/:id/status", auth, async (req, res) => {
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
