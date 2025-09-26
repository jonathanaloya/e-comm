import validator from 'validator'
import crypto from 'crypto'

// Input validation middleware
export const validateRegistration = (req, res, next) => {
  const { name, email, password } = req.body
  const errors = []

  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long')
  }

  if (!email || !validator.isEmail(email)) {
    errors.push('Valid email is required')
  }

  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }

  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one uppercase letter, one lowercase letter, and one number')
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      errors,
      error: true,
      success: false
    })
  }

  next()
}

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body
  const errors = []

  if (!email || !validator.isEmail(email)) {
    errors.push('Valid email is required')
  }

  if (!password) {
    errors.push('Password is required')
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      errors,
      error: true,
      success: false
    })
  }

  next()
}

export const validatePasswordReset = (req, res, next) => {
  const { newPassword, confirmPassword } = req.body
  const errors = []

  if (!newPassword || newPassword.length < 8) {
    errors.push('New password must be at least 8 characters long')
  }

  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
    errors.push('Password must contain at least one uppercase letter, one lowercase letter, and one number')
  }

  // Use secure comparison for password matching
  if (!newPassword || !confirmPassword || 
      !crypto.timingSafeEqual(Buffer.from(newPassword), Buffer.from(confirmPassword))) {
    errors.push('Passwords do not match')
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      errors,
      error: true,
      success: false
    })
  }

  next()
}