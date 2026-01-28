import express from "express";
import {
    createOrder,
    getMyOrders,
    getOrders,
    updateOrderStatus
} from "../controllers/order.controller.js";
import { isAuthenticated, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Client: Create order (or add to cart), Get my orders
router.post("/", isAuthenticated, createOrder);
router.get("/myorders", isAuthenticated, getMyOrders);

// Admin/Artisan: Get all orders (filtered logic inside controller), Update status
router.get("/", isAuthenticated, authorize("ADMIN", "ARTISAN"), getOrders);
router.put("/:id/status", isAuthenticated, authorize("ADMIN", "ARTISAN"), updateOrderStatus);

export default router;
