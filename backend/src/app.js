import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import session from 'express-session';
import flash from 'connect-flash';
import { passport } from './auth.js';
import productRoutes from './routes/product.routes.js';
import authRoutes from './routes/auth.routes.js';
import orderRoutes from './routes/order.routes.js';
import reviewRoutes from './routes/review.routes.js';
import authApiRoutes from './routes/auth.api.routes.js';
import userRoutes from './routes/user.routes.js';
import adminRoutes from './routes/admin.routes.js';
import customRequestRoutes from './routes/customRequest.routes.js';
import messageRoutes from './routes/message.routes.js';
import stripeRoutes from './routes/stripe.routes.js';
import paypalRoutes from './routes/paypal.routes.js';
import morgan from 'morgan';
import { notFound, errorHandler } from './middlewares/error.middleware.js';

const app = express();

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.use(helmet());
app.use(cors());

// Special handling for Stripe Webhook to keep raw body
app.use((req, res, next) => {
  if (req.originalUrl === '/api/stripe/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

app.use((req, res, next) => {
  if (req.originalUrl === '/api/stripe/webhook') {
    next();
  } else {
    express.urlencoded({ extended: true })(req, res, next);
  }
});

app.use(mongoSanitize());
app.use(xss());

app.use(session({
  secret: process.env.SESSION_SECRET || 'heritage-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/stripe', stripeRoutes);
app.use('/api/paypal', paypalRoutes);
app.use('/api/auth', authApiRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/custom-requests', customRequestRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/', authRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

export default app;
