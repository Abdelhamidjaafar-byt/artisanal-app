import mongoose from 'mongoose';
import Product from './src/models/Product.js';
import dotenv from 'dotenv';

dotenv.config();

async function migrate() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const products = await Product.find({ title: { $exists: false } });

        console.log(`Found ${products.length} products to migrate...`);

        for (let product of products) {
            product.title = product.title || product.name || "Untitled Masterpiece";
            product.description = product.description || "Authentic handcrafted masterpiece from the heart of the Medina.";
            product.category = product.category || "Pottery";
            product.stock = product.stock || 0;
            product.artisan = product.artisan || "6981dd478bab6d364e168bee"; // Using an existing artisan ID

            await product.save();
            console.log(`Migrated: ${product.title}`);
        }

        console.log("Migration complete!");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

migrate();
