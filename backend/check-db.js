import mongoose from 'mongoose';
import Product from './src/models/Product.js';
import dotenv from 'dotenv';
dotenv.config();

const checkProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const products = await Product.find({});
        console.log(`Found ${products.length} products:`);
        products.forEach(p => {
            console.log(`ID: ${p._id}, Title: ${p.title}, Stock: ${p.stock}`);
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

checkProducts();
