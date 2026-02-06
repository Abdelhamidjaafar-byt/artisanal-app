import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        username: {
            type: String,
            unique: true,
            sparse: true, // For social login users who might not have a username initially
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
        isApproved: {
            type: Boolean,
            default: function () {
                // If the user only has CLIENT role, approve by default
                if (this.role.length === 1 && this.role.includes("CLIENT")) {
                    return true;
                }
                // Admin is approved, Artisans are NOT by default
                if (this.role.includes("ADMIN")) return true;
                return false;
            }
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
