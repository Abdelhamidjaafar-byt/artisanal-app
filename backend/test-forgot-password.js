import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

dotenv.config();

const testForgotPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const testEmail = 'test@example.com';

        // 1. Create a test user if not exists
        let user = await User.findOne({ email: testEmail });
        if (!user) {
            console.log('Creating test user...');
            user = await User.create({
                name: 'Test User',
                username: 'testuser',
                email: testEmail,
                password: await bcrypt.hash('password123', 10),
                role: ['CLIENT']
            });
        }

        console.log('Test User:', user.email);

        // 2. Simulate Forgot Password
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
        user.resetPasswordExpires = Date.now() + 3600000;
        await user.save();
        console.log('Reset token generated and saved.');

        // 3. Simulate Reset Password
        const hashedToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        const userToReset = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (userToReset) {
            console.log('User found with token. Resetting password...');
            userToReset.password = await bcrypt.hash('newpassword123', 10);
            userToReset.resetPasswordToken = undefined;
            userToReset.resetPasswordExpires = undefined;
            await userToReset.save();
            console.log('Password reset successful!');
        } else {
            console.error('User NOT found with token or token expired.');
        }

        await mongoose.connection.close();
        console.log('Disconnected from DB');
    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
};

testForgotPassword();
