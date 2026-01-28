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
        phone: {
            type: String,
        },
        address: {
            type: String,
        },
        role: {
            type: String,
            enum: ["ADMIN", "ARTISAN", "CLIENT"], // Primary actors [cite: 44]
            default: "CLIENT",
        },
        // Specific fields for the Artisan profile [cite: 27, 51]
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
