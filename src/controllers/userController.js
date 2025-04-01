import { CommandSucceededEvent } from 'mongodb';
import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';
import sendEmail from '../config/sendEmail.js';
import verifyEmailTemplate from '../utilities/verifyEmailTemplate.js';
import jwt from 'jsonwebtoken';
// Login user
export async function loginUser(req, res) {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user) return res.status(400).send('User not found');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).send('Invalid password');

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
  res.json({ user, token });
};

// Register user
export async function registerUser(req, res) {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ 
        message: 'All fields are required',
        error: true,
        success: false 
      });
    }

    const existingUser = await User.findOne({ email });

    if(existingUser){
      return res.status(400).json({
        message: 'Email already exists',
        error: true,
        success: false
      })
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt); 

    const payload = {
      username,
      email,
      password: hashedPassword
    }

    const newUser = new User(payload);
    const save =await newUser.save();
    const verifyEmailUrl = `${process.env.FRONTEND_URL}/verify-email?code=${save?._id}`

    const verifyEmail = await sendEmail({
      sendTo: email,
      subject: 'Verify your email address',
      html: verifyEmailTemplate({ 
        name: username, 
        url: verifyEmailUrl
      })
    })

    return res.json({
      message: 'User registered successfully',
      error: false,
      success: true,
      data: save
    })
    
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error : true,
      success: false
    });
  }
}
