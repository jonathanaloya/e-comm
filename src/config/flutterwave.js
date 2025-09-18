// config/flutterwave.js
import Flutterwave from "flutterwave-node-v3";
import dotenv from 'dotenv';

dotenv.config();

const flw = new Flutterwave(
  process.env.FLUTTERWAVE_PUBLIC_KEY,
  process.env.FLUTTERWAVE_SECRET_KEY
);

// Log configuration status (without exposing sensitive data)
console.log('Flutterwave Config:', {
  hasPublicKey: !!process.env.FLUTTERWAVE_PUBLIC_KEY,
  hasSecretKey: !!process.env.FLUTTERWAVE_SECRET_KEY,
  publicKeyPrefix: process.env.FLUTTERWAVE_PUBLIC_KEY?.substring(0, 10) + '...'
});

export default flw;
