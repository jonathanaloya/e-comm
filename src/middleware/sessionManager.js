import jwt from 'jsonwebtoken';

// Session timeout configuration (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry

export const sessionManager = (req, res, next) => {
  try {
    const token = req.cookies.accessToken || req?.headers?.authorization?.split(' ')[1];
    
    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);
    const now = Date.now();
    const tokenAge = now - (decoded.iat * 1000);
    
    // Check if token is older than session timeout
    if (tokenAge > SESSION_TIMEOUT) {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      return res.status(401).json({
        message: 'Session expired due to inactivity',
        error: true,
        success: false,
        sessionExpired: true
      });
    }

    // Auto-refresh token if close to expiry
    if (tokenAge > (SESSION_TIMEOUT - TOKEN_REFRESH_THRESHOLD)) {
      const newToken = jwt.sign(
        { id: decoded.id, email: decoded.email },
        process.env.SECRET_KEY_ACCESS_TOKEN,
        { expiresIn: '30m' }
      );
      
      res.cookie('accessToken', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: SESSION_TIMEOUT
      });
    }

    req.userId = decoded.id;
    next();
  } catch (error) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return res.status(401).json({
      message: 'Invalid or expired session',
      error: true,
      success: false,
      sessionExpired: true
    });
  }
};