const verifyRegistrationEmailTemplate = ({ name, otp }) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #0056b3;">Hello ${name},</h2>
      <p>Thank you for registering with our service!</p>
      <p>To complete your registration, please use the following confirmation code:</p>
      <h3 style="background-color: #f0f0f0; padding: 10px; border-radius: 5px; text-align: center; color: #d9534f;">${otp}</h3>
      <p>This code is valid for 10 minutes. If you did not request this, please ignore this email.</p>
      <p>Best regards,<br>Your Team</p>
    </div>
  `;
};

export default verifyRegistrationEmailTemplate;