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
            required: function () {
                return !this.googleId && !this.facebookId;
            },
            unique: true,
            sparse: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: function () {
                return !this.googleId && !this.facebookId;
            },
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true
        },
        facebookId: {
            type: String,
            unique: true,
            sparse: true
        },
        phone: {
            type: String,
        },
        address: {
            type: String,
        },
        role: {
            type: [String],
            enum: ["ADMIN", "ARTISAN", "CLIENT"],
            default: ["CLIENT"],
        },
        provider: {
            type: String,
            default: "local"
        },
        // Specific fields for the Artisan profile
        artisanProfile: {
            bio: { type: String },          // Savoir-faire / Expertise 
            specialties: [{ type: String }], // Craft types (e.g., Pottery) 
            experience: { type: Number },    // Years of experience
            region: { type: String },       // Geographical area 
            isSubscribed: {
                type: Boolean,
                default: false
            }, // For "Gestion des abonnements" 
        },
    },
    { timestamps: true }
);

export default mongoose.model("User", userSchema);
