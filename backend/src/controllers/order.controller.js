import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { emitToUser } from "../socket.js";
import { createNotification } from "./notification.controller.js";
import { sendOrderStatusEmail } from "../utils/email.service.js";

// CREATE ORDER (Client)
export const createOrder = async (req, res, next) => {
    console.log("Order creation initiated with body:", JSON.stringify(req.body, null, 2));
    try {
        const { items, shippingAddress, paymentInfo } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "No items in order" });
        }

        // Group items by artisan
        const itemsByArtisan = {};
        for (const item of items) {
            const product = await Product.findById(item.product).populate('artisan');
            if (!product) {
                return res.status(404).json({ message: `Product ${item.product} not found` });
            }

            const artisanId = product.artisan?._id?.toString() || product.artisan?.toString();
            if (!artisanId) {
                return res.status(400).json({ message: `Product ${product.title} has no associated artisan` });
            }

            if (!itemsByArtisan[artisanId]) {
                itemsByArtisan[artisanId] = [];
            }

            itemsByArtisan[artisanId].push({
                product: product._id,
                quantity: item.quantity,
                customizationDetails: item.customizationDetails || "",
                price: product.price
            });
        }

        const orders = [];
        for (const artisanId in itemsByArtisan) {
            const artisanItems = itemsByArtisan[artisanId];
            const totalAmount = artisanItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);

            const order = await Order.create({
                client: req.user.id,
                artisan: artisanId,
                items: artisanItems,
                totalAmount,
                shippingAddress,
                paymentInfo: {
                    method: paymentInfo?.method || 'stripe',
                    status: 'pending'
                },
                status: "IN_CART"
            });
            orders.push(order);
        }

        // Return the first order (or all if frontend can handle it)
        // For now, return the first one so Stripe Checkout works for at least one artisan
        res.status(201).json(orders.length === 1 ? orders[0] : { orders, _id: orders[0]._id });
    } catch (error) {
        console.error("Order completion error:", error);
        next(error);
    }
};

// GET MY ORDERS (Client)
export const getMyOrders = async (req, res, next) => {
    try {
        let query = {};
        if (req.user.role === 'ARTISAN') {
            query = { artisan: req.user.id };
        } else {
            query = { client: req.user.id };
        }

        const orders = await Order.find(query)
            .populate("items.product", "title price images")
            .populate("client", "name email")
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
    console.log(`Update order status initiated for order ID: ${req.params.id} with status: ${req.body.status}`);
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            res.status(404);
            throw new Error("Order not found");
        }



        order.status = status;
        await order.save();

        // Create in-app notification
        await createNotification({
            user: order.client,
            message: `Votre commande #${order._id.toString().slice(-6)} est maintenant: ${status}`,
            type: "ORDER_STATUS",
            orderId: order._id
        });

        // Notify the client about status update via Socket
        emitToUser(order.client, 'order_status_updated', {
            orderId: order._id,
            status: order.status,
            message: `Your order status has been updated to ${status}`
        });

        // Send Email Notification
        // Need to populate client to get email if not already populated
        const fullOrder = await order.populate('client', 'email name');
        if (fullOrder.client && fullOrder.client.email) {
            await sendOrderStatusEmail(fullOrder.client.email, order._id, status);
        }

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
                    // Note: price is not stored in item schema, but totalAmount is updated
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
