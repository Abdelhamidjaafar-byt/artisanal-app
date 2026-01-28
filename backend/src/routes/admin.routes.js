import express from "express";
import User from "../models/User.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { isAuthenticated as auth, authorize as role } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Get Platform Stats
router.get("/stats", auth, role("ADMIN"), async (req, res) => {
    try {
        const artisanCount = await User.countDocuments({ role: "ARTISAN" });
        const clientCount = await User.countDocuments({ role: "CLIENT" });
        const productCount = await Product.countDocuments();
        const orderCount = await Order.countDocuments();

        res.json({
            artisans: artisanCount,
            clients: clientCount,
            products: productCount,
            orders: orderCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get All Artisans
router.get("/artisans", auth, role("ADMIN"), async (req, res) => {
    try {
        const artisans = await User.find({ role: "ARTISAN" }).select("-password");
        res.json(artisans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
