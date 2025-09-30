import express from 'express'
import { Router } from 'express'
import { uploadAvatar, loginUser, logoutUser, registerUser, verifyEmail, verifyRegistrationOtp, updateUserDetails, forgotPassword, verifyForgotPasswordOtp, resetPassword, refreshToken, getUserLoginDetails } from '../controllers/userController.js'
import authMiddleware from '../middleware/authMiddleware.js'
import upload from '../middleware/multer.js'
import { loginLimiter } from '../middleware/security.js'
import { validateRegistration, validateLogin, validatePasswordReset } from '../middleware/validation.js'
import { csrfProtection, getCSRFToken } from '../middleware/csrfProtection.js'

const userRouter = Router()

// CSRF token endpoint
userRouter.get('/csrf-token', getCSRFToken)

userRouter.post('/register', validateRegistration, registerUser)

userRouter.post('/verify-registration-otp', verifyRegistrationOtp);

userRouter.post('/verify-email', verifyEmail);

userRouter.post('/login', loginLimiter, loginUser)

userRouter.get('/logout', authMiddleware, logoutUser);

userRouter.put('/upload-avatar', authMiddleware, csrfProtection, upload.single('avatar'), uploadAvatar)

userRouter.put('/update-user', authMiddleware, csrfProtection, updateUserDetails)

userRouter.put('/forgot-password', loginLimiter, forgotPassword)

userRouter.put('/verify-forgot-password-otp', verifyForgotPasswordOtp);

userRouter.put('/reset-password', loginLimiter, validatePasswordReset, resetPassword)

userRouter.post('/refresh-token', refreshToken);

userRouter.get('/user-details', authMiddleware, getUserLoginDetails);

export default userRouter