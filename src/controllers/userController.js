import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import User from '../models/userModel.js'
import sendEmail from '../config/sendEmail.js'
import verifyEmailTemplate from '../utilities/verifyEmailTemplate.js'
import jwt from 'jsonwebtoken'
import generateAccessToken from '../utilities/generateAccessToken.js'
import generateRefreshToken from '../utilities/generateRefreshToken.js'
import uploadImageCloudinary from '../utilities/updateImageCloudinary.js'
import generateOtp from '../utilities/generateOtp.js'
import forgotPasswordTemplate from '../utilities/forgotPasswordTemplate.js'
import verifyRecaptcha from '../utilities/verifyRecaptcha.js'
import loginOtpTemplate from '../utilities/loginOtpTemplate.js'

// Register user
export async function registerUser(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'All fields are required',
        error: true,
        success: false
      });
    }

    const existingUser = await User.findOne({ email });

    if(existingUser){
      return res.status(400).json({
        message: 'Email already registered',
        error: true,
        success: false
      })
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const payload = {
      name,
      email,
      password: hashedPassword,
      verify_email: true // Auto-verify email on registration
    }
    const newUser = new User(payload);
    const save =await newUser.save();

    return res.json({
      message: 'User registered successfully. You can now login with your credentials.',
      error: false,
      success: true,
      data: { userId: save?._id, email: save?.email }
    })

  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error : true,
      success: false
    });
  }
}

// New endpoint to verify registration OTP (replaces existing verifyEmail for new flow)
export async function verifyRegistrationOtp(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: 'Email and OTP are required',
        error: true,
        success: false
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: 'User not found',
        error: true,
        success: false
      });
    }

    // Use secure comparison for OTP
    if (!otp || !user.login_otp || 
        !crypto.timingSafeEqual(Buffer.from(user.login_otp), Buffer.from(otp))) {
      return res.status(400).json({
        message: 'Invalid OTP',
        error: true,
        success: false
      })
    }

    if (new Date() > user.login_otp_expiry) {
      return res.status(400).json({
        message: 'OTP expired. Please register again to get a new code.',
        error: true,
        success: false
      });
    }

    // Mark email as verified and clear OTP fields
    user.verify_email = true;
    user.login_otp = '';
    user.login_otp_expiry = null;
    await user.save();

    return res.json({
      message: 'Email verified successfully. You can now log in.',
      error: false,
      success: true
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
}


// Login user
export async function loginUser(req, res) {
  try {
    const { email, password, recaptchaToken, otp } = req.body

    // Input validation - email is always required
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        message: 'Valid email is required',
        error: true,
        success: false
      })
    }

    // --- Phase 1: Initial Login Request (without OTP, but with reCAPTCHA) ---
    if (!otp) { // If OTP is not provided, this is the first step of login
      if (!password) {
        return res.status(400).json({
          message: 'Password is required',
          error: true,
          success: false
        })
      }

      if (!recaptchaToken){
        return res.status(400).json({
          message : "reCAPTCHA verification is required",
          error : true,
          success : false
        })
      }

      // Verify reCAPTCHA
      const recaptchaResult = await verifyRecaptcha(recaptchaToken);
      if (!recaptchaResult.success) {
        return res.status(400).json({
          message: 'reCAPTCHA verification failed. Please try again.',
          error: true,
          success: false,
          recaptchaErrors: recaptchaResult['error-codes']
        });
      }

      const user = await User.findOne({ email });

      if(!user){
        return res.status(400).json({
          message: 'User not registered',
          error: true,
          success: false
        })
      }

      if(user.status !== 'Active'){
        return res.status(400).json({
          message: 'User is not active. Contact Admin',
          error: true,
          success: false
        })
      }

      const checkPassword = await bcrypt.compare(password, user.password);

      if(!checkPassword){
        return res.status(400).json({
          message: 'Invalid password',
          error: true,
          success: false
        })
      }

      // Generate and send OTP immediately
      const loginOtp = generateOtp();
      const loginOtpExpiry = new Date(Date.now() + 5 * 60 * 1000);

      user.login_otp = loginOtp;
      user.login_otp_expiry = loginOtpExpiry;
      await user.save();

      // Send email immediately without await to avoid delay
      sendEmail({
        sendTo: email,
        subject: 'Your Login Confirmation Code',
        html: loginOtpTemplate({
          name: user.name,
          otp: loginOtp
        })
      }).catch(err => console.error('Email send error:', err));

      return res.json({
        message: 'Authentication successful. A confirmation code has been sent to your email.',
        error: false,
        success: true,
        requiresTwoFactor: true,
        email: email
      });

    } else {
      // --- Phase 2: OTP Verification ---
      if (!otp){
        return res.status(400).json({
          message : "OTP is required",
          error : true,
          success : false
        })
      }

      // Validate OTP format (should be numeric)
      if (!/^\d{6}$/.test(otp)) {
        return res.status(400).json({
          message: 'OTP must be a 6-digit number',
          error: true,
          success: false
        })
      }

      const user = await User.findOne({ email });

      if(!user){
        return res.status(400).json({
          message: 'User not found or OTP session expired',
          error: true,
          success: false
        })
      }

      // Use secure comparison to prevent timing attacks
      if (!otp || !user.login_otp || user.login_otp.length !== otp.length || 
          !crypto.timingSafeEqual(Buffer.from(user.login_otp), Buffer.from(otp))) {
        return res.status(400).json({
          message: 'Invalid confirmation code',
          error: true,
          success: false
        })
      }

      if (new Date() > user.login_otp_expiry) {
        // Clear OTP if expired
        user.login_otp = '';
        user.login_otp_expiry = null;
        await user.save();
        return res.status(400).json({
          message: 'Confirmation code expired. Please initiate login again.',
          error: true,
          success: false
        });
      }

      // OTP is valid, proceed with login
      // Clear OTP fields after successful verification
      user.login_otp = '';
      user.login_otp_expiry = null;
      await user.save();


      const accesstoken = await generateAccessToken(user._id)
      const refreshToken = await generateRefreshToken(user._id)

      const updateUserDetails = await User.findByIdAndUpdate(user?._id , {
        last_login_date : Date.now(),
        refresh_token: refreshToken // Store refresh token in user model
      })

      const cookiesOption = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours (reduced from 30 days)
      }

      res.cookie('accessToken', accesstoken, cookiesOption)
      res.cookie('refreshToken', refreshToken, cookiesOption)

      return res.json({
        message : "Login Successfully",
        error : false,
        success : true,
        data : {
          accesstoken,
          refreshToken,
          user: { // You might want to send back some user details
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            // ... other public user data
          }
        }
      })
    }

  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error : true,
      success: false
    })
  }
};

// Verify Email
export async function verifyEmail(req, res) {
  try {
    const { code } = req.body

    const user = await User.findOneAndUpdate({ _id: code})

    if(!user){
      return res.status(400).json({
        message: 'Invalid verification code',
        error: true,
        success: false
      })
    }

    const updateUser = await User.findOne({
      _id: code
    },{
      verify_email: true
    })

    return res.json({
      message: 'Email verified successfully',
      error: false,
      success: true 
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error : true,
      success: true
    })
  }
}

// Logout user

export async function logoutUser(req, res){
  try {
    const userid = req.userId //Middleware

    const cookiesOption = {
      httpOnly : true,
      secure : true,
      sameSite : "None"
    }
    res.clearCookie("accessToken", cookiesOption)
    res.clearCookie("refreshToken", cookiesOption)

    const removeRefreshToken = await User.findOneAndUpdate(
      { _id: userid }, // wrap the ID in an object
      { refresh_token: "" }
    );
    

    return res.json({
      message : "Logout Successfully",
      error: false,
      success : true
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}

// upload avatar
export async function uploadAvatar(req, res){
  try {
    const userId = req.userId // auth middleware
    const image = req.file // multer middleware
    const upload = await uploadImageCloudinary(image)

    const updateUser = await User.findByIdAndUpdate(userId, {
      avatar : upload.url
    })

    return res.json({
      message : "Image uploaded successfully",
      error : false,
      success : true,
      data : {
        _id : userId,
        avatar : upload.url
      }
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}

// update user
export async function updateUserDetails(req, res){
  try {
    const userId = req.userId //auth middleware
    const { name, email, mobile, password } = req.body

    let hashedPassword = ""

    if(password){
      const salt = await bcrypt.genSalt(10)
      hashedPassword = await bcrypt.hash(password, salt) 
    }

    const updateUser = await User.updateOne({ _id : userId}, {
      ...(name && { name : name }),
      ...(email && { email : email }),
      ...(mobile && { mobile : mobile }),
      ...(password && { password : password })
    })

    return res.json({
      message : "User details updated successfully",
      error : false,
      success : true,
      data : updateUser
    })

  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}

// forgot password when user not loged in
export async function forgotPassword(req, res){
  try {
    const { email, recaptchaToken } = req.body

    if (!email || !recaptchaToken) {
      return res.status(400).json({
        message: 'Email and reCAPTCHA verification are required',
        error: true,
        success: false
      })
    }

    // Verify reCAPTCHA
    const recaptchaResult = await verifyRecaptcha(recaptchaToken);
    if (!recaptchaResult.success) {
      return res.status(400).json({
        message: 'reCAPTCHA verification failed. Please try again.',
        error: true,
        success: false,
        recaptchaErrors: recaptchaResult['error-codes']
      });
    }

    const user = await User.findOne({ email })

    if(!user){
      return res.status(400).json({
        message : "User not registered",
        error : true,
        success : false
      })
    }

    const otp = generateOtp()
    const expireTime = new Date() + 30 * 60 * 1000 // 30 minutes

    const update = await User.findByIdAndUpdate(user._id, {
      forgot_password_otp : otp,
      forgot_password_expiry : new Date(expireTime).toISOString()
    })

    await sendEmail({
      sendTo : email,
      subject : "Forgot password from freshkatale",
      html : forgotPasswordTemplate({
        name : user.name, 
        otp : otp
      })
    })

    return res.json({
      message : "OTP sent to your email",
      error : false,
      success : true
    })

  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}

// verify forgot password otp
export async function verifyForgotPasswordOtp(req, res){
  try {
    const { email, otp } = req.body

    if(!email || !otp){
      return res.status(400).json({
        message : "Email and otp are required",
        error : true,
        success : false
      })
    }

    const user = await User.findOne({ email })

    if(!user){
      return res.status(400).json({
        message : "User not registered",
        error : true,
        success : false
      })
    }

    const currentTime = new Date().toISOString()

    if(user.forgot_password_expiry < currentTime){
      return res.status(400).json({
        message : "OTP expired",
        error : true,
        success : false
      })
    }

    // Use secure comparison for OTP
    if (!otp || !user.forgot_password_otp || 
        !crypto.timingSafeEqual(Buffer.from(user.forgot_password_otp), Buffer.from(otp))) {
      return res.status(400).json({
        message: 'Invalid OTP',
        error: true,
        success: false
      })
    }

    const updateUserDetails = await User.findByIdAndUpdate(user._id, {
      forgot_password_otp : "",
      forgot_password_expiry : ""
    })

    return res.json({
      message : "OTP verified successfully",
      error : false,
      success : true
    })

  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}

// reset password
export async function resetPassword(req, res){
  try {
    
    const { email, newPassword, confirmPassword, recaptchaToken } = req.body

    if(!email || !newPassword || !confirmPassword || !recaptchaToken){
      return res.status(400).json({
        message : "Email, new password, confirm password, and reCAPTCHA verification are required",
        error : true,
        success : false
      })
    }

    // Verify reCAPTCHA
    const recaptchaResult = await verifyRecaptcha(recaptchaToken);
    if (!recaptchaResult.success) {
      return res.status(400).json({
        message: 'reCAPTCHA verification failed. Please try again.',
        error: true,
        success: false,
        recaptchaErrors: recaptchaResult['error-codes']
      });
    }

    const user = await User.findOne({ email })

    if(!user){
      return res.status(400).json({
        message : "User not registered",
        error : true,
        success : false
      })
    }

    if(newPassword !== confirmPassword){
      return res.status(400).json({
        message : "New password and confirmation password do not match",
        error : true,
        success : false
      })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    const update = await User.findOneAndUpdate(user._id, {
      password : hashedPassword
    })

    return res.json({
      message : "Password reset successfully",
      error : false,
      success : true
    })

  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}

// refresh token
export async function refreshToken(req, res){
  try {
    const refreshToken = req.cookies.refreshToken || req?.headers?.authorization?.split(' ')[1]

    if(!refreshToken){
      return res.status(401).json({
        message : "Unauthorized. Provide refresh token",
        error : true,
        success : false
      })
    }

    const verifyToken = await jwt.verify(refreshToken, process.env.SECRET_KEY_REFRESH_TOKEN)

    if(!verifyToken){
      return res.status(401).json({
        message : "Unauthorized. Invalid refresh token",
        error : true,
        success : false
      })
    }

    const userId = verifyToken?._id

    const newAccessToken = await generateAccessToken(userId)

    const cookiesOption = {
      httpOnly : true,
      secure : true,
      sameSite : "None",
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    }

    res.cookie('accessToken', newAccessToken, cookiesOption)

    return res.json({
      message : "Token refreshed successfully",
      error : false,
      success : true,
      data : {
        accessToken : newAccessToken}
    })

  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}

// get user login details
export async function getUserLoginDetails(req, res){
  try {
    const userId = req.userId //Middleware

    const user = await User.findById(userId).select('-password -refresh_token')

    return res.json({
      message : "User details",
      error : false,
      success : true,
      data : user
    })

  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: true,
      success: false
    })
  }
}