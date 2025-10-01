import rateLimit from 'express-rate-limit';

// General rate limiter - very lenient for normal browsing
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // limit each IP to 5000 requests per windowMs
  message: {
    error: true,
    message: 'Too many requests, please try again in 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth rate limiter - more reasonable limits
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: {
    error: true,
    message: 'Too many authentication attempts, please try again in 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Payment rate limiter
export const paymentLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // limit each IP to 10 payment requests per 5 minutes
  message: {
    error: true,
    message: 'Too many payment attempts, please try again in 5 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});