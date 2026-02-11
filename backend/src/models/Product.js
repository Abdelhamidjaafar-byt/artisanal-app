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
        images: [String],
        stock: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },
        category: {
            type: String,
            required: true,
            enum: [
                "Tissage (زرابي)",
                "Poterie et Céramique",
                "Dinanderie (نحاس)",
                "Menuiserie Traditionnelle",
                "Broderie Artisanale",
                "Couture (Kaftan/Djellaba)",
                "Maroquinerie",
                "Zellige",
                "Ferronnerie",
                "Tannage"
            ],
        },
        isCustomizable: {
            type: Boolean,
            default: false, // For "Possibilité de personnalisation" 
        },
        productionTime: {
            type: Number, // In days - For "Délais variables" 
            default: 0,
        },
        averageRating: {
            type: Number,
            default: 0, // For "Avis et évaluations" 
        }
    },
    { timestamps: true }
);

export default mongoose.model("Product", productSchema);
