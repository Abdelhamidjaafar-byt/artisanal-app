import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './src/models/User.js';

dotenv.config();

const users = [
    {
        name: 'Admin User',
        username: 'admin',
        email: 'admin@artisanat.ma',
        password: 'password123',
        role: 'ADMIN',
    },
    {
        name: 'Artisan User',
        username: 'artisan',
        email: 'artisan@artisanat.ma',
        password: 'password123',
        role: 'ARTISAN',
        artisanProfile: {
            bio: 'Maître artisan avec 20 ans d\'expérience.',
            specialties: ['Poterie', 'Zellige'],
            region: 'Fès-Meknès'
        }
    },
    {
        name: 'Client User',
        username: 'client',
        email: 'client@artisanat.ma',
        password: 'password123',
        role: 'CLIENT',
    }
];

const seedUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Clear existing users with these emails to avoid duplicates
        await User.deleteMany({ email: { $in: users.map(u => u.email) } });
        console.log('Cleared existing seed users');

        for (const user of users) {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            await User.create({
                ...user,
                password: hashedPassword,
                // Ensure role is an array as per schema
                role: [user.role]
            });
        }

        console.log('Users seeded successfully');
        console.log('-----------------------------------');
        users.forEach(u => {
            console.log(`Role: ${u.role} | Email: ${u.email} | Password: ${u.password}`);
        });
        console.log('-----------------------------------');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding users:', error);
        process.exit(1);
    }
};

seedUsers();
