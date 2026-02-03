import express from "express";
import {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
} from "../controllers/product.controller.js";

import { verifyToken, authorize, checkApproved } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public: Get all products, Get single product
router.get("/", getProducts);
router.get("/:id", getProductById);

// Artisan: Create product (MUST be approved)
router.post("/", verifyToken, authorize("ARTISAN", "ADMIN"), checkApproved, createProduct);

// Owner: Update/Delete
router.put("/:id", verifyToken, authorize("ARTISAN", "ADMIN"), updateProduct);
router.delete("/:id", verifyToken, authorize("ARTISAN"), deleteProduct);

export default router;
