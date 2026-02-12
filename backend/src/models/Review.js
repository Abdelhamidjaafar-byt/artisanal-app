import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            required: true,
            trim: true,
        },
        images: [
            {
                type: String,
            },
        ],
    },
    { timestamps: true }
);

// Update product's average rating after saving a review
reviewSchema.post("save", async function () {
    const Product = mongoose.model("Product");
    const Review = mongoose.model("Review");
    const reviews = await Review.find({ product: this.product });
    const averageRating = reviews.length > 0
        ? reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length
        : 0;

    await Product.findByIdAndUpdate(this.product, { averageRating: parseFloat(averageRating.toFixed(1)) });
});

// Update product's average rating after deleting a review
reviewSchema.post("findOneAndDelete", async function (doc) {
    if (doc) {
        const Product = mongoose.model("Product");
        const Review = mongoose.model("Review");
        const reviews = await Review.find({ product: doc.product });
        const averageRating = reviews.length > 0
            ? reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length
            : 0;

        await Product.findByIdAndUpdate(doc.product, { averageRating: parseFloat(averageRating.toFixed(1)) });
    }
});

export default mongoose.model("Review", reviewSchema);
