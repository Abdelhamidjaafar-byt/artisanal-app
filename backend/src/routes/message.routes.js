import express from "express";
import Message from "../models/Message.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// @desc    Get chat history between current user and another user
// @route   GET /api/messages/:otherUserId
// @access  Private
router.get("/:otherUserId", verifyToken, async (req, res, next) => {
    try {
        const { otherUserId } = req.params;
        const currentUserId = req.user.id;

        const messages = await Message.find({
            $or: [
                { sender: currentUserId, receiver: otherUserId },
                { sender: otherUserId, receiver: currentUserId }
            ]
        }).sort({ createdAt: 1 }); // Sort by time ascending

        res.status(200).json(messages);
    } catch (error) {
        next(error);
    }
});

export default router;
