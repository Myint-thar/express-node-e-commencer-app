const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

const sendOTPEmail = async (toEmail, otp) => {
  const mailOptions = {
    from: `"Stuffsus Tech" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Your OTP Verification Code - Stuffsus',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #000;">Verification Code</h2>
        <p>Your 6-digit OTP verification code is:</p>
        <div style="font-size: 28px; font-weight: bold; letter-spacing: 4px; padding: 12px 0; color: #000;">
          ${otp}
        </div>
        <p style="font-size: 12px; color: #666;">This code is valid for <strong>5 minutes</strong>. Do not share this code with anyone.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOTPEmail };