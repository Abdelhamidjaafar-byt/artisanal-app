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

async function repair() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const products = await Product.find({});
        console.log(`Found ${products.length} products`);

        for (const product of products) {
            let updated = false;
            const newImages = [];

            for (const imagePath of product.images) {
                if (!imagePath.startsWith('/uploads/')) {
                    newImages.push(imagePath); // Keep external URLs as is
                    continue;
                }

                const filename = path.basename(imagePath);
                const oldFullPath = path.join(UPLOADS_DIR, filename);

                // Sanitize filename
                const sanitizedFilename = filename
                    .replace(/\s+/g, "_")
                    .replace(/[\n\r]/g, "")
                    .replace(/[^\x00-\x7F]/g, "");

                const newPath = `/uploads/${sanitizedFilename}`;
                const newFullPath = path.join(UPLOADS_DIR, sanitizedFilename);

                if (filename !== sanitizedFilename) {
                    if (fs.existsSync(oldFullPath)) {
                        fs.renameSync(oldFullPath, newFullPath);
                        console.log(`Renamed: ${filename} -> ${sanitizedFilename}`);
                    } else {
                        console.warn(`File not found on disk: ${filename}`);
                    }
                    newImages.push(newPath);
                    updated = true;
                } else {
                    newImages.push(imagePath);
                }
            }

            if (updated) {
                product.images = newImages;
                await product.save();
                console.log(`Updated product ${product._id}: ${product.title}`);
            }
        }

        console.log('Repair complete');
        process.exit(0);
    } catch (error) {
        console.error('Repair failed:', error);
        process.exit(1);
    }
}

repair();
