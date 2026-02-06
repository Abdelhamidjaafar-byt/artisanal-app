import mongoose from 'mongoose';
import User from './src/models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const updateSpecificUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const userId = '6981dd478bab6d364e168bee';
        const user = await User.findById(userId);

        if (user) {
            console.log('User found:', user.name);
            console.log('Current roles:', user.role);

            // Update to include ADMIN role
            user.role = ['ADMIN', 'ARTISAN', 'CLIENT'];
            user.provider = user.provider || 'local'; // Updated to local based on login context

            await user.save();
            console.log('User roles updated to:', user.role);
        } else {
            console.log('User not found with ID:', userId);
        }

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error updating user:', error);
    }
};

updateSpecificUser();
