import express from "express";
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

// Client: Create order, Get my orders, Update/Delete own order
router.post("/", verifyToken, createOrder);
router.get("/myorders", verifyToken, getMyOrders);
router.patch("/:id", verifyToken, updateOrder);
router.delete("/:id", verifyToken, deleteOrder);

// Admin/Artisan: Get all orders, Update status (Must be approved)
router.get("/", verifyToken, authorize("ADMIN", "ARTISAN"), checkApproved, getOrders);
router.put("/:id/status", verifyToken, authorize("ADMIN", "ARTISAN"), checkApproved, updateOrderStatus);

export default router;
