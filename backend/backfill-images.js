import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from './src/models/Product.js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, 'uploads');

async function backfill() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const files = fs.readdirSync(UPLOADS_DIR).filter(f => f.match(/\.(png|jpg|jpeg|webp)$/i));
        console.log(`Found ${files.length} images in uploads/`);

        const products = await Product.find({ $or: [{ images: { $exists: false } }, { images: { $size: 0 } }] });
        console.log(`Found ${products.length} products without images`);

        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            const imageFile = files[i % files.length]; // Cycle through files if more products than files

            if (imageFile) {
                product.images = [`/uploads/${imageFile}`];
                await product.save({ validateBeforeSave: false });
                console.log(`Assigned ${imageFile} to product: ${product.title}`);
            }
        }

        console.log('Backfill complete');
        process.exit(0);
    } catch (error) {
        console.error('Backfill failed:', error);
        process.exit(1);
    }
}

backfill();
