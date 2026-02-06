import CustomRequest from "../models/CustomRequest.js";
import Product from "../models/Product.js";

// @desc    Create a new custom request
// @route   POST /api/custom-requests
// @access  Private (Client)
export const createCustomRequest = async (req, res, next) => {
    try {
        const { artisan, product, description, attachments } = req.body;

        if (!artisan || !description) {
            res.status(400);
            throw new Error("Please provide artisan and description");
        }

        const customRequest = await CustomRequest.create({
            client: req.user.id,
            artisan,
            product,
            description,
            attachments
        });

        res.status(201).json({
            message: "Custom request sent successfully",
            customRequest
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get custom requests for a user (client or artisan)
// @route   GET /api/custom-requests
// @access  Private
export const getMyCustomRequests = async (req, res, next) => {
    try {
        let query;
        if (req.user.role.includes("ARTISAN")) {
            query = { artisan: req.user.id };
        } else {
            query = { client: req.user.id };
        }

        const requests = await CustomRequest.find(query)
            .populate("client", "name email")
            .populate("artisan", "name email")
            .populate("product", "title images");

        res.status(200).json(requests);
    } catch (error) {
        next(error);
    }
};

// @desc    Update custom request status
// @route   PATCH /api/custom-requests/:id/status
// @access  Private (Artisan or Client)
export const updateCustomRequestStatus = async (req, res, next) => {
    try {
        const { status, price, deliveryDate } = req.body;
        const request = await CustomRequest.findById(req.params.id);

        if (!request) {
            res.status(404);
            throw new Error("Request not found");
        }

        // Only artisan can accept/reject or set price
        if (req.user.role.includes("ARTISAN") && request.artisan.toString() === req.user.id) {
            request.status = status || request.status;
            request.price = price || request.price;
            request.deliveryDate = deliveryDate || request.deliveryDate;
        } else if (req.user.id === request.client.toString()) {
            // Client can cancel
            if (status === "CANCELLED") {
                request.status = status;
            } else {
                res.status(403);
                throw new Error("You can only cancel your request");
            }
        } else {
            res.status(403);
            throw new Error("Not authorized");
        }

        const updatedRequest = await request.save();
        res.status(200).json(updatedRequest);
    } catch (error) {
        next(error);
    }
};
