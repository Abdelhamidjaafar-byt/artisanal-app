import User from "../models/User.js";

// @desc    Approve or reject artisan
// @route   PATCH /api/admin/approve/:id
// @access  Private/Admin
export const approveArtisan = async (req, res, next) => {
    try {
        const { isApproved } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            res.status(404);
            throw new Error("User not found");
        }

        if (!user.role.includes("ARTISAN")) {
            res.status(400);
            throw new Error("User is not an artisan");
        }

        user.isApproved = isApproved !== undefined ? isApproved : true;
        await user.save();

        res.json({
            message: `Artisan ${user.isApproved ? "approved" : "unapproved"} successfully`,
            user: {
                id: user._id,
                name: user.name,
                isApproved: user.isApproved
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all pending artisans
// @route   GET /api/admin/pending-artisans
// @access  Private/Admin
export const getPendingArtisans = async (req, res, next) => {
    try {
        const pendingArtisans = await User.find({
            role: "ARTISAN",
            isApproved: false
        }).select("-password");

        res.json(pendingArtisans);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({}).select("-password").sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            res.status(404);
            throw new Error("User not found");
        }

        // Prevent admin from deleting themselves if needed, but for now let's keep it simple
        await user.deleteOne();
        res.json({ message: "User removed successfully" });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user role
// @route   PATCH /api/admin/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req, res, next) => {
    try {
        const { role } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            res.status(404);
            throw new Error("User not found");
        }

        user.role = Array.isArray(role) ? role : [role];

        // If becoming an ARTISAN, they might need approval if not already approved
        if (user.role.includes("ARTISAN") && user.isApproved === undefined) {
            user.isApproved = false;
        }

        await user.save();
        res.json({ message: "User role updated successfully", user });
    } catch (error) {
        next(error);
    }
};
