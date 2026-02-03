import Order from "../models/Order.js";
import Product from "../models/Product.js";

// CREATE ORDER (Client)
export const createOrder = async (req, res, next) => {
    try {
        const { items, shippingAddress, paymentInfo } = req.body;

        if (!items || items.length === 0) {
            res.status(400);
            throw new Error("No items in order");
        }

        let totalAmount = 0;
        const orderItems = [];

        // Validate products and calculate total
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                res.status(404);
                throw new Error(`Product not found: ${item.product}`);
            }
            if (product.stock < item.quantity) {
                res.status(400);
                throw new Error(`Insufficient stock for product: ${product.title}`);
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
        next(error);
    }
};

// GET MY ORDERS (Client)
export const getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ client: req.user.id })
            .populate("items.product", "title price images")
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        next(error);
    }
};

// GET ALL ORDERS (Artisan/Admin - filtered)
export const getOrders = async (req, res, next) => {
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
        next(error);
    }
};

// UPDATE ORDER STATUS (Artisan/Admin)
export const updateOrderStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            res.status(404);
            throw new Error("Order not found");
        }

        order.status = status;
        await order.save();

        res.json(order);
    } catch (error) {
        next(error);
    }
};

// @desc    Update order (Client/Admin)
// @route   PATCH /api/orders/:id
// @access  Private
export const updateOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            res.status(404);
            throw new Error("Order not found");
        }

        if (order.client.toString() !== req.user.id && !req.user.role.includes("ADMIN")) {
            res.status(403);
            throw new Error("Not authorized");
        }

        if (order.status !== "in_cart" && order.status !== "pending" && !req.user.role.includes("ADMIN")) {
            res.status(400);
            throw new Error("Cannot update order after it is processing");
        }

        const { items, shippingAddress } = req.body;

        if (shippingAddress) order.shippingAddress = shippingAddress;

        if (items && items.length > 0) {
            let totalAmount = 0;
            const orderItems = [];

            for (const item of items) {
                const product = await Product.findById(item.product);
                if (!product) {
                    res.status(404);
                    throw new Error(`Product not found: ${item.product}`);
                }
                totalAmount += product.price * item.quantity;
                orderItems.push({
                    product: product._id,
                    quantity: item.quantity,
                    customizationDetails: item.customizationDetails
                });
            }
            order.items = orderItems;
            order.totalAmount = totalAmount;
        }

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete order (Client/Admin)
// @route   DELETE /api/orders/:id
// @access  Private
export const deleteOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            res.status(404);
            throw new Error("Order not found");
        }

        if (order.client.toString() !== req.user.id && !req.user.role.includes("ADMIN")) {
            res.status(403);
            throw new Error("Not authorized");
        }

        if (order.status !== "in_cart" && order.status !== "pending" && !req.user.role.includes("ADMIN")) {
            res.status(400);
            throw new Error("Cannot delete order after it is processing");
        }

        await order.deleteOne();
        res.json({ message: "Order removed" });
    } catch (error) {
        next(error);
    }
};
