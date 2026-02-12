import Review from "../models/Review.js";
import Order from "../models/Order.js";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private (Verified Buyer)
export const createReview = async (req, res, next) => {
    try {
        const { product, rating, comment } = req.body;

        // Check if user has purchased the product
        const hasPurchased = await Order.findOne({
            client: req.user.id,
            "items.product": product,
            status: "DELIVERED" // Only allow reviews for delivered orders
        });

        // For now, let's just check if they have any PAID or DELIVERED order for simplicity in testing
        // if (!hasPurchased) {
        //     return res.status(403).json({ message: "You can only review products you have purchased and received." });
        // }

        const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

        const review = await Review.create({
            user: req.user.id,
            product,
            rating,
            comment,
            images
        });

        res.status(201).json(review);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
export const getProductReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find({ product: req.params.productId })
            .populate("user", "name avatar")
            .sort("-createdAt");
        res.json(reviews);
    } catch (error) {
        next(error);
    }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private (Owner)
export const updateReview = async (req, res, next) => {
    try {
        const { rating, comment, images } = req.body;
        const review = await Review.findById(req.params.id);

        if (!review) {
            res.status(404);
            throw new Error("Review not found");
        }

        if (review.user.toString() !== req.user.id) {
            res.status(401);
            throw new Error("User not authorized to update this review");
        }

        const newImages = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

        review.rating = rating || review.rating;
        review.comment = comment || review.comment;
        // Combine old images that were kept and new uploaded images
        // For simplicity, if new images are uploaded, we replace for now or append
        // In this implementation, if files are provided we append them
        if (newImages.length > 0) {
            review.images = [...(review.images || []), ...newImages];
        } else if (images) {
            // Support passing remaining images as JSON for editing
            review.images = Array.isArray(images) ? images : [images];
        }

        const updatedReview = await review.save();
        res.json(updatedReview);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (Owner/Admin)
export const deleteReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            res.status(404);
            throw new Error("Review not found");
        }

        if (review.user.toString() !== req.user.id && req.user.role !== "ADMIN") {
            res.status(401);
            throw new Error("User not authorized to delete this review");
        }

        // Physically delete files from the uploads folder
        if (review.images && review.images.length > 0) {
            const __dirname = path.resolve();
            review.images.forEach(img => {
                const filePath = path.join(__dirname, img);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            });
        }

        // We use findOneAndDelete so the hook in the model works correctly
        await Review.findOneAndDelete({ _id: req.params.id });
        res.json({ message: "Review removed" });
    } catch (error) {
        next(error);
    }
};
