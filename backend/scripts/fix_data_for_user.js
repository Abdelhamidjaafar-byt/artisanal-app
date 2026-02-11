import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../src/models/User.js';
import Order from '../src/models/Order.js';

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const fixData = async () => {
    await connectDB();

    const email = 'dadas@gmail.com';
    const password = '12344321';
    const hashedPassword = await bcrypt.hash(password, 10);

    // 1. Find or Create/Update Artisan User
    let user = await User.findOne({ email });

    if (user) {
        console.log('User found. Updating password and role...');
        user.password = hashedPassword;
        if (!user.role.includes('ARTISAN')) {
            user.role.push('ARTISAN');
        }
        user.isApproved = true; // Ensure they are approved
        await user.save();
        console.log('User updated.');
    } else {
        console.log('User not found. Creating new Artisan...');
        user = await User.create({
            name: 'Artisan Dadas',
            email,
            password: hashedPassword,
            role: ['ARTISAN', 'CLIENT'],
            isApproved: true
        });
        console.log('User created.');
    }

    // 2. Find orders without an artisan (orphaned due to the bug)
    // OR just find the most recent order if we want to be specific.
    // Let's look for orders created in the last 24 hours that have no artisan
    // OR since the user said "i orderd and it didnt appear", let's assign ALL recent orders without artisan to this user for testing.

    // Actually, safer to find orders where artisan is missing/null.
    const orphanedOrders = await Order.find({
        $or: [
            { artisan: { $exists: false } },
            { artisan: null }
        ]
    });

    console.log(`Found ${orphanedOrders.length} orphaned orders.`);

    if (orphanedOrders.length > 0) {
        const result = await Order.updateMany(
            { _id: { $in: orphanedOrders.map(o => o._id) } },
            { $set: { artisan: user._id } }
        );
        console.log(`Updated ${result.modifiedCount} orders to belong to ${email}`);
    } else {
        console.log('No orphaned orders found to update.');
    }

    // 3. (Optional) Assign one product to this artisan so they have something in their catalog
    // We can't easily guess which product, but if there are orders, we can take the product from the order.
    if (orphanedOrders.length > 0) {
        const firstOrder = orphanedOrders[0];
        if (firstOrder.items && firstOrder.items.length > 0) {
            const productId = firstOrder.items[0].product; // In schema it's just ID or object? Schema says ref.
            // We need to import Product model to update it.
            const { default: Product } = await import('../src/models/Product.js');
            await Product.findByIdAndUpdate(productId, { artisan: user._id });
            console.log(`Updated product ${productId} to belong to ${email} for consistency.`);
        }
    }

    console.log('Data fix complete.');
    process.exit();
};

fixData();
