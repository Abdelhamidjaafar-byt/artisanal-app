import express from "express";
import {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
} from "../controllers/product.controller.js";

import { verifyToken, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public
router.get("/", getProducts);
router.get("/:id", getProductById);

// Artisan only
router.post("/", verifyToken, authorize("ARTISAN"), createProduct);
router.put("/:id", verifyToken, authorize("ARTISAN"), updateProduct);
router.delete("/:id", verifyToken, authorize("ARTISAN"), deleteProduct);

export default router;
