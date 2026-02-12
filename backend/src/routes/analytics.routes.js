import express from "express";
import { getArtisanAnalytics } from "../controllers/analytics.controller.js";
import { verifyToken, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/artisan", verifyToken, authorize("ARTISAN"), getArtisanAnalytics);

export default router;
