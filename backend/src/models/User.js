import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ["ADMIN", "ARTISAN", "CLIENT"],
            default: "CLIENT",
        },
        provider: {
            type: String,
            enum: ["local", "google", "facebook"],
            default: "local",
        },
        providerId: {
            type: String,
            unique: true,
            sparse: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        region: {
            type: String,
            trim: true,
        },
        bio: {
            type: String,
            trim: true,
        },
        avatar: {
            type: String,
        },
    },
    { timestamps: true }
);

export default mongoose.model("User", userSchema);
