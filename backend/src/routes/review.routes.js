import express from "express";
import {
    createReview,
    getProductReviews,
    deleteReview,
    updateReview
} from "../controllers/review.controller.js";
import { verifyToken, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public: Get reviews for a product
router.get("/product/:productId", getProductReviews);

// Client: Create/Update review
router.post("/", verifyToken, createReview);
router.patch("/:id", verifyToken, updateReview);

// Admin/Client: Delete review
router.delete("/:id", verifyToken, deleteReview);

export default router;
