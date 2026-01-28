import express from "express";
import cors from "cors";
import session from 'express-session';
import flash from 'connect-flash';
import { passport } from "./auth.js"; // Import passport from your auth.js
import productRoutes from "./routes/product.routes.js";
import authRoutes from "./routes/auth.routes.js"; // New auth routes file

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

// Express Session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // For development. Use true in production with HTTPS
}));

// Connect Flash middleware
app.use(flash());

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

import orderRoutes from "./routes/order.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import adminRoutes from "./routes/admin.routes.js";

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);
app.get("/", (req, res) => {
  res.send("API is running...");
});

export default app;
