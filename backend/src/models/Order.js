import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        client: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        artisan: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        status: {
            type: String,
            enum: ["PENDING", "IN_FABRICATION", "FINISHED", "DELIVERED"],
            default: "PENDING",
        },
        customizationDetails: {
            type: String,
            trim: true,
        },
        price: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
