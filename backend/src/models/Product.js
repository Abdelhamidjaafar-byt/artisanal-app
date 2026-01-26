import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        artisan: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        images: [
            {
                type: String,
            },
        ],
        category: {
            type: String,
            required: true,
        },
        customizable: {
            type: Boolean,
            default: false,
        },
        fabricationDelay: {
            type: Number, // days
            default: 0,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Product", productSchema);
