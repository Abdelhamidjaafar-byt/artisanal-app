import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
    createOrder,
    getMyOrders,
    getOrders,
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
router.get("/:id", getOrders); // Reuse or need separate GetOrderById? Controller has getOrders but it finds all.
router.patch("/:id", updateOrder);
router.put("/:id/status", updateOrderStatus);
router.delete("/:id", deleteOrder);

export default router;
