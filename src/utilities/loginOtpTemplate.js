const loginOtpTemplate = ({ name, otp }) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #0056b3;">Hello ${name},</h2>
      <p>A login attempt was made on your account. To complete your login, please use the following confirmation code:</p>
      <h3 style="background-color: #f0f0f0; padding: 10px; border-radius: 5px; text-align: center; color: #28a745;">${otp}</h3>
      <p>This code is valid for 5 minutes. If you did not attempt to log in, please secure your account immediately.</p>
      <p>Best regards,<br>The FreshKatale Team</p>
    </div>
  `;
};

export default loginOtpTemplate;