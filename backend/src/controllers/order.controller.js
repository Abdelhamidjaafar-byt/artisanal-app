import Order from "../models/Order.js";
import Product from "../models/Product.js";

// CREATE ORDER (Client)
export const createOrder = async (req, res) => {
    try {
        const { items, shippingAddress, paymentInfo } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: "No items in order" });
        }

        let totalAmount = 0;
        const orderItems = [];

        // Validate products and calculate total
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ message: `Product not found: ${item.product}` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for product: ${product.title}` });
            }

            totalAmount += product.price * item.quantity;
            orderItems.push({
                product: product._id,
                quantity: item.quantity,
                customizationDetails: item.customizationDetails
            });
        }

        const order = await Order.create({
            client: req.user.id,
            items: orderItems,
            totalAmount,
            shippingAddress,
            paymentInfo,
            status: "in_cart" // Default to cart, or "pending" if immediate order
        });

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET MY ORDERS (Client)
export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ client: req.user.id })
            .populate("items.product", "title price images")
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET ALL ORDERS (Artisan/Admin - filtered)
export const getOrders = async (req, res) => {
    try {
        let query = {};
        // If Artisan, only show orders containing their products? 
        // For simplicity, let's assume Admin sees all, Artisan might need specific logic (complex join).
        // For now, implementing Admin view or general view.

        const orders = await Order.find(query)
            .populate("client", "name email")
            .populate("items.product", "title price")
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE ORDER STATUS (Artisan/Admin)
export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        order.status = status;
        await order.save();

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
