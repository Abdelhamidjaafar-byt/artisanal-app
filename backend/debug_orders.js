
import "./src/config/env.js";
import mongoose from "mongoose";
import Product from "./src/models/Product.js";
import Order from "./src/models/Order.js";
import User from "./src/models/User.js";

const debugOrders = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const allOrders = await Order.find({})
            .populate("client", "name email")
            .populate("artisan", "name email")
            .populate("items.product", "title");

        console.log(`\nFound ${allOrders.length} total orders:`);
        allOrders.forEach(o => {
            console.log(`- Order: ${o._id} | Status: ${o.status}`);
            console.log(`  Client: ${o.client?.name} (${o.client?._id})`);
            console.log(`  Artisan: ${o.artisan?.name} (${o.artisan?._id})`);
        });

        console.log("\nSearching for user 'aziz'...");
        const users = await User.find({ name: { $regex: /aziz/i } });
        console.log(`Found ${users.length} users matching 'aziz':`);
        users.forEach(async u => {
            console.log(`- ${u.name} (Role: ${u.role}, ID: ${u._id})`);

            // Check products for this user (if artisan)
            const userProducts = await Product.find({ artisan: u._id });
            console.log(`  -> Associated Products: ${userProducts.length}`);
            userProducts.forEach(p => console.log(`     - ${p.title} (${p._id})`));

            // Check orders for this user
            const userOrders = allOrders.filter(o =>
                o.client?._id.toString() === u._id.toString() ||
                o.artisan?._id.toString() === u._id.toString()
            );
            console.log(`  -> Associated Orders: ${userOrders.length}`);
            userOrders.forEach(o => console.log(`     - OrderID: ${o._id}`));
        });

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

debugOrders();
