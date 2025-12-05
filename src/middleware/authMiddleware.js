import jwt from 'jsonwebtoken'
import crypto from 'crypto'

const authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies.accessToken || req?.headers?.authorization?.split(' ')[1]
    console.log('Auth middleware - Token check:', { 
      hasToken: !!token, 
      tokenSource: req.cookies.accessToken ? 'cookie' : 'header',
      url: req.url 
    })
    
    if(!token){
      console.log('Auth middleware - No token found')
      return res.status(401).json({
        message : 'Unauthorized. Please login',
        error: true,
        success: false
      })
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN)
    console.log('Auth middleware - Token decoded:', { id: decoded.id, role: decoded.role })

    if(!decoded){ 
      console.log('Auth middleware - Token decode failed')
      return res.status(401).json({
        message : 'Unauthorized. Invalid access token',
        error : true,
        success: false
      })
    }

    // Validate token structure
    if (!decoded.id || typeof decoded.id !== 'string') {
      console.log('Auth middleware - Invalid token structure:', decoded)
      return res.status(401).json({
        message: 'Invalid token structure',
        error: true,
        success: false
      })
    }

    req.userId = decoded.id
    console.log('Auth middleware - Success, userId set:', req.userId)
    next()

  } catch (error) {
    console.log('Auth middleware - Error:', error.message)
    const isTokenExpired = error.name === 'TokenExpiredError' ||
                          error.message?.includes('expired') ||
                          error.message?.includes('jwt expired');

    return res.status(401).json({
      message: isTokenExpired ? 'Session expired. Please login again.' : 'Authentication failed',
      error: true,
      success: false,
      sessionExpired: isTokenExpired
    })
  }
};

// Secure comparison function to prevent timing attacks
export const secureCompare = (a, b) => {
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

export default authMiddleware