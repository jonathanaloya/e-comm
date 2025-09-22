import axios from 'axios';

async function verifyRecaptcha(recaptchaToken) {
  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`
    );
    return response.data; // This object will contain 'success' (boolean) and other info
  } catch (error) {
    console.error('reCAPTCHA verification error:', error.message);
    return { success: false, 'error-codes': ['internal-error'] };
  }
}

export default verifyRecaptcha;