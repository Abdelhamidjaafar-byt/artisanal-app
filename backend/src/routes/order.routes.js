import express from "express";
import { body, validationResult } from "express-validator";
import {
    createOrder,
    getMyOrders,
    getOrders,
    updateOrderStatus,
    updateOrder,
    deleteOrder
} from "../controllers/order.controller.js";
import { verifyToken, authorize, checkApproved } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Validation middleware
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

const orderValidation = [
    body("items").isArray({ min: 1 }).withMessage("Items must be an array and not empty"),
    body("items.*.product").notEmpty().withMessage("Product ID is required"),
    body("items.*.quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
    body("shippingAddress").notEmpty().withMessage("Shipping address is required"),
    body("paymentInfo.method").notEmpty().withMessage("Payment method is required"),
    validate
];

// Client: Create order, Get my orders, Update/Delete own order
router.post("/", verifyToken, orderValidation, createOrder);
router.get("/myorders", verifyToken, getMyOrders);
router.patch("/:id", verifyToken, updateOrder);
router.delete("/:id", verifyToken, deleteOrder);

// Admin/Artisan: Get all orders, Update status (Must be approved)
router.get("/", verifyToken, authorize("ADMIN", "ARTISAN"), checkApproved, getOrders);
router.put("/:id/status", verifyToken, authorize("ADMIN", "ARTISAN"), checkApproved, updateOrderStatus);

export default router;
