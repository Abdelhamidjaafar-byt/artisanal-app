import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './src/models/Product.js';

dotenv.config();

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const products = await Product.find({}).lean();
        const stats = products.map(p => {
            const keys = Object.keys(p);
            const imageFields = keys.filter(k => k.toLowerCase().includes('image'));
            const data = {};
            imageFields.forEach(f => data[f] = p[f]);
            return { id: p._id, title: p.title, ...data };
        });
        console.log(JSON.stringify(stats, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
