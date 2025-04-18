const forgotPasswordTemplate = ({ username, otp}) => {
    return `
    <div style="background-color: #f5f5f5; padding: 20px; font-family: Arial, sans-serif; text-align: center;):</h1>
      <div style="background-color: #fff; padding: 20px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
        <h1 style="color: #007BFF; margin-bottom: 20px;">Hello ${username}</h1>
        <p>Thank You for Contacting Fresh Katale</p>
        <h2 style="color: #333; margin-bottom: 20px;">Verify Your Email Address</h2>
        <p style="background-color:rgb(7, 84, 31); color: #fff; padding: 12px 20px; text-decoration: none; border-radius: 4px; display: inline-block; text-align: center; font-size: 20px;">OTP: ${otp}</p>
      </div>
      <p style="margin-top: 20px;">Please use the OTP to reset your password in the freshKatale website.</p>
      <p style="margin-top: 20px;">This OTP is valid for 30 minutes.</p>
      <p style="margin-top: 20px;">If you did not request this email, please ignore it.</p>
    </div>
  `;
}

export default forgotPasswordTemplate