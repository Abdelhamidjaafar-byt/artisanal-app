import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        client: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },
                // Requirement: Tracking customized orders
                customizationDetails: {
                    type: String,
                },
            },
        ],
        totalAmount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: [
                "in_cart",        // en_panier
                "pending",        // en_attente
                "paid",           // payé
                "in_production",  // en_fabrication
                "completed",      // terminé
                "shipped",        // expédié / livré
                "cancelled",      // annulé
            ],
            default: "in_cart",
        },
        shippingAddress: {
            type: String,
            required: function () {
                return this.status !== 'in_cart';
            },
        },
        paymentInfo: {
            id: { type: String },
            status: {
                type: String,
                enum: ["pending", "completed", "failed"],
                default: "pending",
            },
            method: { type: String }, // Requirement: Payment management
        },
    },
    { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
