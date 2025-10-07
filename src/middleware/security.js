import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
// Note: csurf is deprecated, using alternative CSRF protection
import cookieParser from 'cookie-parser'

// Rate limiting
export const loginLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 10, // 10 attempts per window
  message: {
    message: 'Too many login attempts, please try again in 30 minutes',
    error: true,
    success: false
  },
  standardHeaders: true,
  legacyHeaders: false
})

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // 500 requests per window (increased for search)
  message: {
    message: 'Too many requests, please try again later',
    error: true,
    success: false
  },
  skip: (req) => {
    // Skip rate limiting for search requests
    return req.path.includes('/search') || req.path.includes('/get-product')
  }
})

// CSRF Protection (alternative implementation)
export const csrfProtection = (req, res, next) => {
  // Skip CSRF for GET requests
  if (req.method === 'GET') {
    return next()
  }
  
  const token = req.headers['x-csrf-token'] || req.body._csrf
  const sessionToken = req.session?.csrfToken
  
  if (!token || !sessionToken || token !== sessionToken) {
    return res.status(403).json({
      message: 'Invalid CSRF token',
      error: true,
      success: false
    })
  }
  
  next()
}

// Security headers
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.flutterwave.com"]
    }
  },
  crossOriginEmbedderPolicy: false
})

// Input sanitization
export const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = obj[key].trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key])
      }
    }
  }
  
  if (req.body) sanitize(req.body)
  if (req.query) sanitize(req.query)
  if (req.params) sanitize(req.params)
  
  next()
}