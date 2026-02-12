import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const products = await mongoose.connection.db.collection('products').find({}).toArray();
        console.log(`Found ${products.length} products`);

        const productsMissingArtisan = products.filter(p => !p.artisan);
        if (productsMissingArtisan.length > 0) {
            console.error(`ERROR: ${productsMissingArtisan.length} products are missing the 'artisan' field!`);
            console.log('IDs of problematic products:', productsMissingArtisan.map(p => p._id));
        } else {
            console.log('All products have an artisan field.');
        }

        const productsMissingPrice = products.filter(p => p.price === undefined || p.price === null);
        if (productsMissingPrice.length > 0) {
            console.error(`ERROR: ${productsMissingPrice.length} products are missing a price!`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Diagnostic failed:', error);
        process.exit(1);
    }
};

checkData();
