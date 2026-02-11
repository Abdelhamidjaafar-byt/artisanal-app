import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
    },
    customizationDetails: {
        type: String,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
    },
});

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
        items: [orderItemSchema],
        totalAmount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["IN_CART", "PENDING", "IN_FABRICATION", "FINISHED", "DELIVERED", "PAID", "SHIPPED", "CANCELLED", "REFUNDED"],
            default: "IN_CART",
        },
        shippingAddress: {
            type: String,
            trim: true,
        },
        paymentInfo: {
            id: String,
            status: String,
            method: String,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
