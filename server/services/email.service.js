const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('Email Config:', {
  user: process.env.EMAIL_USER,
  passLength: process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 0
});

// Create Gmail transporter if email config is present
let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    debug: true,
    logger: true // Log to console
  });

  // Verify transporter configuration
  transporter.verify(function(error, success) {
    if (error) {
      console.error('Email transporter error:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        code: error.code,
        command: error.command
      });
    } else {
      console.log('Email server is ready to send messages');
    }
  });
} else {
  console.log('Email configuration not found - email service will be disabled');
}

// Send verification email
const sendVerificationEmail = async (to, token) => {
  if (!transporter) {
    console.log('Email service is disabled - skipping verification email');
    return true; // Return true to allow the flow to continue
  }

  console.log('Attempting to send verification email...');
  console.log('To:', to);
  console.log('Token:', token);
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: 'Verify your Votipian account',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Welcome to Votipian!</h2>
        <p>Please verify your email address by clicking the button below:</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Verify Email</a>
        <p>If the button doesn't work, you can also click this link:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account on Votipian, please ignore this email.</p>
      </div>
    `
  };

  try {
    console.log('Email configuration:', {
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD ? '***' : undefined
      }
    });

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    return true;
  } catch (error) {
    console.error('Error sending verification email:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.code) console.error('Error code:', error.code);
    return false;
  }
};

// Send password reset email
const sendPasswordResetEmail = async (to, token) => {
  if (!transporter) {
    console.log('Email service is disabled - skipping password reset email');
    return true;
  }

  console.log('Attempting to send password reset email...');
  console.log('To:', to);
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: 'Reset your Votipian password',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Reset Your Password</h2>
        <p>You have requested to reset your password. Click the button below to set a new password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
        <p>If the button doesn't work, you can also click this link:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request a password reset, please ignore this email.</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully!');
    console.log('Message ID:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
};
