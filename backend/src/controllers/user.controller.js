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
// @desc    Get all artisans
// @route   GET /api/users/artisans
// @access  Public
export const getArtisans = async (req, res, next) => {
    try {
        const { keyword } = req.query;
        let query = { role: "ARTISAN" };

        if (keyword) {
            query.$or = [
                { name: { $regex: keyword, $options: "i" } },
                { "artisanProfile.bio": { $regex: keyword, $options: "i" } },
                { "artisanProfile.specialties": { $regex: keyword, $options: "i" } }
            ];
        }

        const artisans = await User.find(query).select("-password");
        res.json(artisans);
    } catch (error) {
        next(error);
    }
};

// @desc    Get artisan by ID (Public)
// @route   GET /api/users/artisan/:id
// @access  Public
export const getArtisanById = async (req, res, next) => {
    try {
        const artisan = await User.findOne({ _id: req.params.id, role: "ARTISAN" }).select("-password");
        if (!artisan) {
            res.status(404);
            throw new Error("Artisan not found");
        }
        res.json(artisan);
    } catch (error) {
        next(error);
    }
};

// @desc    Toggle product in wishlist
// @route   POST /api/users/wishlist/:productId
// @access  Private
export const toggleWishlist = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            res.status(404);
            throw new Error("User not found");
        }
        const productId = req.params.productId;

        // Use findIndex with string comparison to avoid ObjectId mismatch
        const index = user.wishlist.findIndex(id => id.toString() === productId);

        if (index === -1) {
            user.wishlist.push(productId);
            await user.save();
            res.json({ message: "Product added to wishlist", wishlist: user.wishlist });
        } else {
            user.wishlist.splice(index, 1);
            await user.save();
            res.json({ message: "Product removed from wishlist", wishlist: user.wishlist });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get user wishlist
// @route   GET /api/users/wishlist
// @access  Private
export const getWishlist = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).populate({
            path: 'wishlist',
            populate: { path: 'artisan', select: 'name' }
        });
        res.json(user.wishlist);
    } catch (error) {
        next(error);
    }
};
