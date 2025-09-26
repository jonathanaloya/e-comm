import crypto from 'crypto'

// Generate CSRF token
export const generateCSRFToken = () => {
  return crypto.randomBytes(32).toString('hex')
}

// CSRF Protection middleware
export const csrfProtection = (req, res, next) => {
  // Skip CSRF for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next()
  }

  // Skip CSRF for webhook endpoints
  if (req.path.includes('/webhook')) {
    return next()
  }

  const token = req.headers['x-csrf-token'] || req.body._csrf
  const sessionToken = req.session?.csrfToken

  if (!token || !sessionToken || 
      !crypto.timingSafeEqual(Buffer.from(token), Buffer.from(sessionToken))) {
    return res.status(403).json({
      message: 'Invalid CSRF token',
      error: true,
      success: false
    })
  }

  next()
}

// Endpoint to get CSRF token
export const getCSRFToken = (req, res) => {
  const token = generateCSRFToken()
  req.session = req.session || {}
  req.session.csrfToken = token
  
  res.json({
    csrfToken: token,
    success: true,
    error: false
  })
}