import express from "express";
import {
    getUserProfile,
    updateUserProfile,
    getUsers,
    deleteUser,
    getArtisans,
    getArtisanById,
    toggleWishlist,
    getWishlist,
    updateUserAvatar
} from "../controllers/user.controller.js";
import { verifyToken, authorize } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

// Public routes
router.get("/artisans", getArtisans);
router.get("/artisan/:id", getArtisanById);

// Profile routes (Any authenticated user)
router.get("/profile", verifyToken, getUserProfile);
router.patch("/profile", verifyToken, updateUserProfile);
router.patch("/avatar", verifyToken, upload.single("avatar"), updateUserAvatar);

// Wishlist routes
router.get("/wishlist", verifyToken, getWishlist);
router.post("/wishlist/:productId", verifyToken, toggleWishlist);

// Auth & Admin routes
router.get("/", verifyToken, authorize("ADMIN"), getUsers);
router.delete("/:id", verifyToken, deleteUser); // Check for self or admin happens in controller

export default router; 
