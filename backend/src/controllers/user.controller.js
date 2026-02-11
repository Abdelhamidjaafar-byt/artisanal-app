import User from "../models/User.js";

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            res.status(404);
            throw new Error("User not found");
        }
        res.json(user);
    } catch (error) {
        next(error);
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            res.status(404);
            throw new Error("User not found");
        }

        user.name = req.body.name || user.name;
        user.phone = req.body.phone || user.phone;
        user.address = req.body.address || user.address;
        user.city = req.body.city || user.city;
        user.postalCode = req.body.postalCode || user.postalCode;
        user.region = req.body.region || user.region;
        user.email = req.body.email || user.email;

        // Artisan profile updates
        if (user.role.includes("ARTISAN") && req.body.artisanProfile) {
            user.artisanProfile = {
                ...user.artisanProfile,
                ...req.body.artisanProfile
            };
        }

        const updatedUser = await user.save();

        res.json({
            id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            phone: updatedUser.phone,
            address: updatedUser.address,
            city: updatedUser.city,
            postalCode: updatedUser.postalCode,
            region: updatedUser.region,
            artisanProfile: updatedUser.artisanProfile
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res, next) => {
    try {
        const users = await User.find({}).select("-password");
        res.json(users);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Self or Admin)
export const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            res.status(404);
            throw new Error("User not found");
        }

        // Check if user is deleting themselves or is an admin
        if (req.user.id !== user._id.toString() && !req.user.role.includes("ADMIN")) {
            res.status(403);
            throw new Error("Not authorized to delete this user");
        }

        await user.deleteOne();
        res.json({ message: "User removed" });
    } catch (error) {
        next(error);
    }
};
// @desc    Update user avatar
// @route   PUT /api/users/avatar
// @access  Private
export const updateUserAvatar = async (req, res, next) => {
    try {
        if (!req.file) {
            res.status(400);
            throw new Error("Please upload an image");
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            res.status(404);
            throw new Error("User not found");
        }

        user.avatar = `/uploads/${req.file.filename}`;
        await user.save();

        res.json({
            avatar: user.avatar
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all artisans
// @route   GET /api/users/artisans
// @access  Public
export const getArtisans = async (req, res, next) => {
    try {
        const artisans = await User.find({ role: "ARTISAN" }).select("-password");
        res.json(artisans);
    } catch (error) {
        next(error);
    }
};
