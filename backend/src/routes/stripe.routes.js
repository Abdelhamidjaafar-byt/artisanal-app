import express from "express";
import { createCheckoutSession, stripeWebhook, verifySession } from "../controllers/stripe.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Verify session (Private)
router.get("/verify-session/:sessionId", verifyToken, verifySession);

// Checkout Session creation (Private)
router.post("/create-checkout-session", verifyToken, createCheckoutSession);

// Webhook (Public) - Note: This needs raw body in app.js
router.post("/webhook", express.raw({ type: "application/json" }), stripeWebhook);

export default router;
