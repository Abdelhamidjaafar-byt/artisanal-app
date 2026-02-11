import express from "express";
import {
    getMyNotifications,
    markAsRead,
    markAllAsRead
} from "../controllers/notification.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", verifyToken, getMyNotifications);
router.put("/read-all", verifyToken, markAllAsRead);
router.put("/:id/read", verifyToken, markAsRead);

export default router;
