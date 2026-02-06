import express from "express";
import { approveArtisan, getPendingArtisans } from "../controllers/admin.controller.js";
import { verifyToken, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All admin routes are protected by verifyToken and require ADMIN role
router.use(verifyToken);
router.use(authorize("ADMIN"));

router.patch("/approve/:id", approveArtisan);
router.get("/pending-artisans", getPendingArtisans);

export default router;
