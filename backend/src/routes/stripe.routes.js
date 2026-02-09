import express from "express";
import { createCheckoutSession, stripeWebhook } from "../controllers/stripe.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Checkout Session creation (Private)
router.post("/create-checkout-session", verifyToken, createCheckoutSession);

// Webhook (Public) - Note: This needs raw body in app.js
router.post("/webhook", express.raw({ type: "application/json" }), stripeWebhook);

export default router;
