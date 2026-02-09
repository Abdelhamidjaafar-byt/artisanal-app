import mongoose from 'mongoose';
import Product from './src/models/Product.js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

async function debug() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const products = await Product.find({});
        console.log(`Found ${products.length} products`);
        fs.writeFileSync('debug_products.json', JSON.stringify(products, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debug();
