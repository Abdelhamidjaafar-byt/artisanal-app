import Review from "../models/Review.js";
import Product from "../models/Product.js";

// CREATE REVIEW (Client)
export const createReview = async (req, res) => {
    try {
        const { rating, comment, productId } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Check if user already reviewed this product? (Optional)
        const existingReview = await Review.findOne({
            product: productId,
            client: req.user.id
        });

        if (existingReview) {
            return res.status(400).json({ message: "Product already reviewed" });
        }

        const review = await Review.create({
            client: req.user.id,
            product: productId,
            rating,
            comment
        });

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET PRODUCT REVIEWS (Public)
export const getProductReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ product: req.params.productId })
            .populate("client", "name")
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE REVIEW (Admin/Client)
export const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        // Check ownership or admin
        if (review.client.toString() !== req.user.id && req.user.role !== "ADMIN") {
            return res.status(403).json({ message: "Not authorized" });
        }

        await review.deleteOne();
        res.json({ message: "Review removed" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
