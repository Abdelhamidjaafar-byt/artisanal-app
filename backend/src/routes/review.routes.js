import express from "express";
import { createReview, getProductReviews, updateReview, deleteReview } from "../controllers/review.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

router.get("/product/:productId", getProductReviews);
router.post("/", verifyToken, upload.array("images", 5), createReview);
router.put("/:id", verifyToken, upload.array("images", 5), updateReview);
router.delete("/:id", verifyToken, deleteReview);

export default router;
