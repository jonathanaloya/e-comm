import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import connectDB from './src/config/database.js';
import userRouter from './src/routes/userRoutes.js';
import cookieParser from 'cookie-parser';
import categoryRouter from './src/routes/category.js';
import uploadRouter from './src/routes/upload.js';
import subCategoryRouter from './src/routes/subCategory.js';
import productRouter from './src/routes/productRoutes.js';
import cartRouter from './src/routes/cartRoutes.js';
import orderRouter from './src/routes/orderRoutes.js';
import addressRouter from './src/routes/addressRoutes.js';
import adminRouter from './src/routes/adminRoutes.js';
import newsletterRouter from './src/routes/newsletterRoutes.js';
import supportRouter from './src/routes/supportRoutes.js';
import { generalLimiter, authLimiter, paymentLimiter } from './src/middleware/rateLimiter.js';
import { sanitizeInput } from './src/middleware/inputValidation.js';

import mongoSanitize from 'express-mongo-sanitize';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const allowedOrigins = [
  'https://e-comm-rho-five.vercel.app',
  'http://localhost:5173'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like curl or mobile apps)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS error: Origin ${origin} not allowed`));
    }
  },
  credentials: true,
}));

app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(morgan('combined'));
app.use(sanitizeInput);
app.use(mongoSanitize());
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", 'https://api.flutterwave.com']
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Cache control for static assets
app.use((req, res, next) => {
  if (req.url.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000');
  }
  next();
});

// Define routes
const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Hello World!');
})


app.use('/api/user', authLimiter, userRouter);
app.use('/api/category', categoryRouter);
app.use('/api/file', generalLimiter, uploadRouter)
app.use('/api/subcategory', subCategoryRouter)

app.use('/api/product', productRouter)
app.use('/api/cart', cartRouter)
app.use('/api/order', paymentLimiter, orderRouter)
app.use('/api/address', addressRouter)
app.use('/api/admin', generalLimiter, adminRouter)
app.use('/api/newsletter', generalLimiter, newsletterRouter)
app.use('/api/support', generalLimiter, supportRouter)


connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
