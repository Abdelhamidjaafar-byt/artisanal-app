import express from "express";
import {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
} from "../controllers/product.controller.js";

import { isAuthenticated, authorize } from "../middlewares/auth.middleware.js";

import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

// Public
router.get("/", getProducts);
router.get("/:id", getProductById);

// Artisan only
router.post("/", isAuthenticated, authorize("ARTISAN"), createProduct);
router.put("/:id", isAuthenticated, authorize("ARTISAN"), updateProduct);
router.delete("/:id", isAuthenticated, authorize("ARTISAN"), deleteProduct);

export default router;
