import Review from "../models/Review.js";
import Product from "../models/Product.js";

// Helper to update product average rating
const updateProductRating = async (productId) => {
    const reviews = await Review.find({ product: productId });
    const averageRating = reviews.length > 0
        ? reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length
        : 0;

    await Product.findByIdAndUpdate(productId, { averageRating: averageRating.toFixed(1) });
};

// CREATE REVIEW (Client)
export const createReview = async (req, res, next) => {
    try {
        const { rating, comment, productId } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            res.status(404);
            throw new Error("Product not found");
        }

        const existingReview = await Review.findOne({
            product: productId,
            client: req.user.id
        });

        if (existingReview) {
            res.status(400);
            throw new Error("Product already reviewed");
        }

        const review = await Review.create({
            client: req.user.id,
            product: productId,
            rating,
            comment
        });

        await updateProductRating(productId);

        res.status(201).json(review);
    } catch (error) {
        next(error);
    }
};

// GET PRODUCT REVIEWS (Public)
export const getProductReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find({ product: req.params.productId })
            .populate("client", "name")
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (error) {
        next(error);
    }
};

// DELETE REVIEW (Admin/Client)
export const deleteReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            res.status(404);
            throw new Error("Review not found");
        }

        const productId = review.product;

        if (review.client.toString() !== req.user.id && !req.user.role.includes("ADMIN")) {
            res.status(403);
            throw new Error("Not authorized");
        }

        await review.deleteOne();
        await updateProductRating(productId);

        res.json({ message: "Review removed" });
    } catch (error) {
        next(error);
    }
};

// UPDATE REVIEW (Client)
export const updateReview = async (req, res, next) => {
    try {
        const { rating, comment } = req.body;
        const review = await Review.findById(req.params.id);

        if (!review) {
            res.status(404);
            throw new Error("Review not found");
        }

        if (review.client.toString() !== req.user.id) {
            res.status(403);
            throw new Error("Not authorized to update this review");
        }

        review.rating = rating || review.rating;
        review.comment = comment || review.comment;

        const updatedReview = await review.save();
        await updateProductRating(review.product);

        res.json(updatedReview);
    } catch (error) {
        next(error);
    }
};
