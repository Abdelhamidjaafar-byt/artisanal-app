import express from "express";
import { body, validationResult } from "express-validator";
import {
    createCustomRequest,
    getMyCustomRequests,
    updateCustomRequestStatus
} from "../controllers/customRequest.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Validation middleware
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

const customRequestValidation = [
    body("artisan").notEmpty().withMessage("Artisan ID is required"),
    body("description").trim().notEmpty().withMessage("Description is required"),
    validate
];

router.use(verifyToken);

router.post("/", customRequestValidation, createCustomRequest);
router.get("/", getMyCustomRequests);
router.patch("/:id/status", updateCustomRequestStatus);

export default router;
