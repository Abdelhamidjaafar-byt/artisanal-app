import mongoose from "mongoose";

const customRequestSchema = new mongoose.Schema(
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
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        attachments: [
            {
                type: String, // URLs to images/files
            }
        ],
        status: {
            type: String,
            enum: ["PENDING", "ACCEPTED", "REJECTED", "COMPLETED", "CANCELLED"],
            default: "PENDING",
        },
        price: {
            type: Number,
        },
        deliveryDate: {
            type: Date,
        }
    },
    { timestamps: true }
);

export default mongoose.model("CustomRequest", customRequestSchema);
