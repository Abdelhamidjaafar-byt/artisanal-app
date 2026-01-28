import "./config/env.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import Product from "./models/Product.js";
import Order from "./models/Order.js";
import Review from "./models/Review.js";

const seedDB = async () => {
    try {
        console.log("Connecting to Database...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB!");

        // Clear existing data
        console.log("Clearing existing data...");
        await User.deleteMany({});
        await Product.deleteMany({});
        await Order.deleteMany({});
        await Review.deleteMany({});

        // Create Admin
        const adminPassword = await bcrypt.hash("admin123", 10);
        const admin = await User.create({
            name: "Admin User",
            email: "admin@artisan.com",
            password: adminPassword,
            role: "ADMIN",
        });

        // Create Artisans
        const artisanPassword = await bcrypt.hash("artisan123", 10);
        const artisan1 = await User.create({
            name: "Ahmed Morocco",
            email: "ahmed@artisan.com",
            password: artisanPassword,
            role: "ARTISAN",
            artisanProfile: {
                bio: "Master weaver with 20 years of experience in Berber rugs.",
                specialties: ["Weaving"],
                experience: 20,
                region: "Marrakech",
                isSubscribed: true,
            },
        });

        const artisan2 = await User.create({
            name: "Fatima Pottery",
            email: "fatima@artisan.com",
            password: artisanPassword,
            role: "ARTISAN",
            artisanProfile: {
                bio: "Expert in traditional Fes pottery and ceramics.",
                specialties: ["Pottery"],
                experience: 15,
                region: "Fes",
                isSubscribed: true,
            },
        });

        // Create Clients
        const clientPassword = await bcrypt.hash("client123", 10);
        const client1 = await User.create({
            name: "John Client",
            email: "john@client.com",
            password: clientPassword,
            role: "CLIENT",
        });

        const client2 = await User.create({
            name: "Sara Client",
            email: "sara@client.com",
            password: clientPassword,
            role: "CLIENT",
        });

        // Create Products
        const products = await Product.insertMany([
            {
                artisan: artisan1._id,
                title: "Traditional Berber Rug",
                description: "A hand-woven wool rug with traditional geometric patterns.",
                price: 250,
                stock: 5,
                category: "Weaving",
                isCustomizable: true,
                productionTime: 14,
            },
            {
                artisan: artisan1._id,
                title: "Kilim Wall Hanging",
                description: "Decorative hand-woven wall tapestry.",
                price: 80,
                stock: 12,
                category: "Weaving",
                isCustomizable: false,
                productionTime: 5,
            },
            {
                artisan: artisan2._id,
                title: "Blue Fes Vase",
                description: "Classic hand-painted ceramic vase from Fes.",
                price: 45,
                stock: 20,
                category: "Pottery",
                isCustomizable: false,
                productionTime: 2,
            },
            {
                artisan: artisan2._id,
                title: "Terra Cotta Tagine",
                description: "Functional cooking tagine made from natural clay.",
                price: 35,
                stock: 15,
                category: "Pottery",
                isCustomizable: true,
                productionTime: 7,
            },
        ]);

        // Create initial Orders
        await Order.create({
            client: client1._id,
            items: [
                {
                    product: products[0]._id,
                    quantity: 1,
                    customizationDetails: "Slightly darker blue borders",
                },
            ],
            totalAmount: 250,
            status: "pending",
            shippingAddress: "123 Client St, Casablanca",
        });

        console.log("Database Seeded Successfully!");
        process.exit();
    } catch (error) {
        console.error("Error Seeding Database:", error);
        process.exit(1);
    }
};

seedDB();
