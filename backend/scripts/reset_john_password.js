
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../src/models/User.js';

dotenv.config();

const resetPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const email = 'john@client.com';
        const newPassword = '123456';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        let user = await User.findOne({ email });

        if (user) {
            user.password = hashedPassword;
            await user.save();
            console.log(`Password for ${email} has been reset to: ${newPassword}`);
        } else {
            console.log(`User ${email} not found. Creating new user...`);
            user = await User.create({
                name: 'John Client',
                email: email,
                password: hashedPassword,
                role: ['CLIENT'],
                isApproved: true
            });
            console.log(`Created user ${email} with password: ${newPassword}`);
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

resetPassword();
