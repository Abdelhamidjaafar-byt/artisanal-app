import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
    createOrder,
    getMyOrders,
    getOrders,
    getOrderById,
    updateOrderStatus,
    updateOrder,
    deleteOrder
} from "../controllers/order.controller.js";

const router = express.Router();

// All order routes require authentication
router.use(verifyToken);

router.post("/", createOrder);
router.get("/my-orders", getMyOrders);
router.get("/", getOrders); // For Admin
router.get("/:id", getOrderById);
router.patch("/:id", updateOrder);
router.patch("/:id/status", updateOrderStatus);
router.delete("/:id", deleteOrder);

export default router;
