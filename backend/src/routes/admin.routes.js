import express from "express";
import User from "../models/User.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import role from "../middlewares/role.middleware.js";

import { approveArtisan, getPendingArtisans, getAllUsers, deleteUser, updateUserRole } from "../controllers/admin.controller.js";

const router = express.Router();

// Get Platform Stats
router.get("/stats", verifyToken, role("ADMIN"), async (req, res) => {
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
router.get("/artisans", verifyToken, role("ADMIN"), async (req, res) => {
    try {
        const artisans = await User.find({ role: "ARTISAN" }).select("-password");
        res.json(artisans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get Pending Artisans
router.get("/pending-artisans", verifyToken, role("ADMIN"), getPendingArtisans);

// Approve Artisan
router.patch("/approve/:id", verifyToken, role("ADMIN"), approveArtisan);

// -- User Management Routes --


// Get All Users
router.get("/users", verifyToken, role("ADMIN"), getAllUsers);

// Update User Role
router.patch("/users/:id/role", verifyToken, role("ADMIN"), updateUserRole);

// Delete User
router.delete("/users/:id", verifyToken, role("ADMIN"), deleteUser);

export default router;
