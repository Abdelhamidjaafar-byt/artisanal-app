import express from "express";
import { login, register } from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/test", verifyToken, (req, res) => {
    res.json({ message: "JWT is working!", user: req.user });
});

export default router;
