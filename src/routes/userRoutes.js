import express from 'express';
import { Router } from 'express';
import { uploadAvatar, loginUser, logoutUser, registerUser, verifyEmail, updateUserDetails, forgotPassword, verifyForgotPasswordOtp, resetPassword, refreshToken } from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import upload from '../middleware/multer.js';

const userRouter = Router()

userRouter.post('/register', registerUser);

userRouter.post('/verify-email', verifyEmail);

userRouter.post('/login', loginUser);

userRouter.get('/logout', authMiddleware, logoutUser);

userRouter.put('/upload-avatar', authMiddleware, upload.single('avatar'), uploadAvatar);

userRouter.put('/update-user', authMiddleware, updateUserDetails);

userRouter.put('/forgot-password', forgotPassword);

userRouter.put('/verify-forgot-password-otp', verifyForgotPasswordOtp);

userRouter.put('/reset-password',resetPassword);

userRouter.post('/refresh-token', refreshToken);

export default userRouter