import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const diagnoseWishlist = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({ wishlist: { $exists: true, $not: { $size: 0 } } });
        console.log(`Users with wishlist items: ${users.length}`);
        for (const user of users) {
            console.log(`User: ${user.email}, Wishlist Count: ${user.wishlist.length}`);
            console.log(`Product IDs:`, user.wishlist);
        }
        await mongoose.disconnect();
    } catch (error) {
        console.error('Diagnosis failed:', error);
    }
};

diagnoseWishlist();
