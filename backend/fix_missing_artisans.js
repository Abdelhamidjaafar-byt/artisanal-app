
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './src/models/Product.js';
import User from './src/models/User.js';

dotenv.config();

const fixMissingArtisans = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Find a valid artisan
        const artisan = await User.findOne({ role: 'ARTISAN' });

        if (!artisan) {
            console.error('No artisan found in the database. Please create an artisan user first.');
            process.exit(1);
        }

        console.log(`Found artisan: ${artisan.name} (${artisan._id})`);

        // Find products with missing artisan
        const products = await Product.find({
            $or: [
                { artisan: null },
                { artisan: { $exists: false } }
            ]
        });

        console.log(`Found ${products.length} products with missing artisan.`);

        if (products.length > 0) {
            const result = await Product.updateMany(
                {
                    $or: [
                        { artisan: null },
                        { artisan: { $exists: false } }
                    ]
                },
                { $set: { artisan: artisan._id } }
            );

            console.log(`Updated ${result.modifiedCount} products.`);
        } else {
            console.log('No products needed fixing.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

fixMissingArtisans();
