import Notification from "../models/Notification.js";

// @desc    Get all notifications for a user
// @route   GET /api/notifications
// @access  Private
export const getMyNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(notifications);
    } catch (error) {
        next(error);
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res, next) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            res.status(404);
            throw new Error("Notification not found");
        }

        if (notification.user.toString() !== req.user.id) {
            res.status(403);
            throw new Error("Not authorized");
        }

        notification.isRead = true;
        await notification.save();
        res.json(notification);
    } catch (error) {
        next(error);
    }
};

// @desc    Mark all as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req, res, next) => {
    try {
        await Notification.updateMany(
            { user: req.user.id, isRead: false },
            { isRead: true }
        );
        res.json({ message: "All notifications marked as read" });
    } catch (error) {
        next(error);
    }
};

// Helper for other controllers to create notifications
export const createNotification = async (userData) => {
    try {
        const notification = await Notification.create(userData);
        return notification;
    } catch (error) {
        console.error("Error creating notification:", error);
    }
};
