import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import session from 'express-session';
import flash from 'connect-flash';
import { passport } from "./auth.js"; // Import passport from your auth.js
import productRoutes from "./routes/product.routes.js";
import authRoutes from "./routes/auth.routes.js"; // New auth routes file

import morgan from "morgan";
import { notFound, errorHandler } from "./middlewares/error.middleware.js";

const app = express();

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

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

import authApiRoutes from "./routes/auth.api.routes.js"; // New auth API routes
import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import customRequestRoutes from "./routes/customRequest.routes.js";
import messageRoutes from "./routes/message.routes.js";

app.use("/api/auth", authApiRoutes); // Mount new API auth routes
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/custom-requests", customRequestRoutes);
app.use("/api/messages", messageRoutes);
app.use("/", authRoutes); // Keep legacy auth routes for now
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

export default app;
