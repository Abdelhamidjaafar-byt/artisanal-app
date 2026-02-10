import express from "express";
import {
    getUserProfile,
    updateUserProfile,
    getUsers,
    deleteUser,
    getArtisans
} from "../controllers/user.controller.js";
import { verifyToken, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/artisans", getArtisans);

// Profile routes (Any authenticated user)
router.get("/profile", verifyToken, getUserProfile);
router.put("/profile", verifyToken, updateUserProfile);

// Auth & Admin routes
router.get("/", verifyToken, authorize("ADMIN"), getUsers);
router.delete("/:id", verifyToken, deleteUser); // Check for self or admin happens in controller

export default router;
