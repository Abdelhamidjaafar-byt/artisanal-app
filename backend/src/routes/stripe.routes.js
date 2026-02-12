import express from 'express';
import { createCheckoutSession, stripeWebhook, verifySession } from '../controllers/stripe.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/create-checkout-session', verifyToken, createCheckoutSession);
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);
router.get('/verify-session/:sessionId', verifySession);

export default router;
