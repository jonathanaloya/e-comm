import jwt from 'jsonwebtoken'
import crypto from 'crypto'

const authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies.accessToken || req?.headers?.authorization?.split(' ')[1]
    
    if(!token){
      return res.status(401).json({
        message : 'Unauthorized. Please login',
        error: true,
        success: false
      })
    }

    // Constant-time comparison to prevent timing attacks
    const decoded = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN)

    if(!decoded){ 
      return res.status(401).json({
        message : 'Unauthorized. Invalid access token',
        error : true,
        success: false
      })
    }

    // Validate token structure
    if (!decoded.id || typeof decoded.id !== 'string') {
      return res.status(401).json({
        message: 'Invalid token structure',
        error: true,
        success: false
      })
    }

    req.userId = decoded.id
    next()

  } catch (error) {
    // Don't expose internal error details
    return res.status(401).json({
      message: 'Authentication failed',
      error: true,
      success: false
    })
  }
};

// Secure comparison function to prevent timing attacks
export const secureCompare = (a, b) => {
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

export default authMiddleware