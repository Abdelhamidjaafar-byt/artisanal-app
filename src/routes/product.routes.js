import express from "express";
import {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
} from "../controllers/product.controller.js";

import auth from "../middlewares/auth.middleware.js";
import role from "../middlewares/role.middleware.js";

const router = express.Router();

// Public
router.get("/", getProducts);
router.get("/:id", getProductById);

// Artisan only
router.post("/", auth, role("ARTISAN"), createProduct);
router.put("/:id", auth, role("ARTISAN"), updateProduct);
router.delete("/:id", auth, role("ARTISAN"), deleteProduct);

export default router;
