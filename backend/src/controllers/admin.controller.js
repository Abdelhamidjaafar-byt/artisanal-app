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
