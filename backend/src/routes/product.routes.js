import express from "express";
import { body, validationResult } from "express-validator";
import {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getProductFilters
} from "../controllers/product.controller.js";

import { verifyToken, authorize, checkApproved } from "../middlewares/auth.middleware.js";

import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

// Validation middleware
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

const productValidation = [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("description").trim().notEmpty().withMessage("Description is required"),
    body("price").isNumeric().withMessage("Price must be a number").toFloat(),
    body("category").trim().notEmpty().withMessage("Category is required"),
    body("stock").isNumeric().withMessage("Stock must be a number").toInt(),
    validate
];

// Public: Get all products, Get single product, Get filters
router.get("/", getProducts);
router.get("/filters", getProductFilters);
router.get("/:id", getProductById);

// Artisan: Create product (MUST be approved)
router.post("/", verifyToken, authorize("ARTISAN", "ADMIN"), checkApproved, upload.array("images", 5), productValidation, createProduct);

// Owner: Update/Delete
router.put("/:id", verifyToken, authorize("ARTISAN", "ADMIN"), upload.array("images", 5), productValidation, updateProduct);
router.delete("/:id", verifyToken, authorize("ARTISAN"), deleteProduct);

export default router;
