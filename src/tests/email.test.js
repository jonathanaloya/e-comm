import sendEmail from '../config/sendEmail.js';

describe('Email Service Tests', () => {
  it('should send email successfully', async () => {
    const result = await sendEmail({
      sendTo: 'info@freshkatale.com',
      subject: 'Test Email',
      html: '<p>This is a test email</p>'
    });

    console.log('Email send result:', result);
    expect(result).toBeDefined();
  });
});