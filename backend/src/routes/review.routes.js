import express from "express";
import {
    createReview,
    getProductReviews,
    deleteReview
} from "../controllers/review.controller.js";
import { isAuthenticated, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public: Get reviews for a product
router.get("/product/:productId", getProductReviews);

// Client: Create review
router.post("/", isAuthenticated, createReview);

// Admin/Client: Delete review
router.delete("/:id", isAuthenticated, deleteReview);

export default router;
