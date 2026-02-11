
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../src/models/Order.js';
import Product from '../src/models/Product.js';

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

const fixOrderPrices = async () => {
    await connectDB();

    console.log('Scanning for orders with missing item prices...');

    // Find orders where any item is missing price
    // Note: This query might not be perfect for array subdocuments, but we'll iterate all.
    const orders = await Order.find({});

    let updatedCount = 0;

    for (const order of orders) {
        let orderChanged = false;

        if (order.items && order.items.length > 0) {
            for (const item of order.items) {
                if (!item.price) {
                    // Fetch product to get current price
                    const product = await Product.findById(item.product);
                    if (product) {
                        item.price = product.price;
                        console.log(`Updated price for item ${item.product} in order ${order._id} to ${product.price}`);
                        orderChanged = true;
                    } else {
                        // Fallback if product deleted? Use 0 or try to calc from total?
                        // For now let's set to 0 to pass validation if product is missing
                        item.price = 0;
                        console.log(`Product not found for item ${item.product} in order ${order._id}. Set price to 0.`);
                        orderChanged = true;
                    }
                }
            }
        }

        // Fix status casing if invalid
        if (order.status && typeof order.status === 'string') {
            const upperStatus = order.status.toUpperCase();
            if (upperStatus !== order.status) {
                // Verify if upperStatus is valid enum? 
                // Enum: ["IN_CART", "PENDING", "IN_FABRICATION", "FINISHED", "DELIVERED", "PAID"]
                const validStatuses = ["IN_CART", "PENDING", "IN_FABRICATION", "FINISHED", "DELIVERED", "PAID"];
                if (validStatuses.includes(upperStatus)) {
                    order.status = upperStatus;
                    console.log(`Fixed status casing for order ${order._id}: ${upperStatus}`);
                    orderChanged = true;
                }
            }
        }

        if (orderChanged) {
            try {
                await order.save();
                updatedCount++;
            } catch (err) {
                console.error(`Failed to save order ${order._id}:`, err.message);
            }
        }
    }

    console.log(`Fixed ${updatedCount} orders.`);
    process.exit();
};

fixOrderPrices();
