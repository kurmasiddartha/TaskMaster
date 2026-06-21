const { Resend } = require('resend');

/**
 * Send an OTP code to a user's email using Resend HTTP API.
 * Resend works over HTTPS so it bypasses Render's SMTP port blocking.
 *
 * Required env var: RESEND_API_KEY
 * Optional env var: EMAIL_FROM (defaults to Resend's test address)
 */
const sendOTPEmail = async (to, name, otp, purpose = 'signup') => {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const isSignup = purpose === 'signup';
  const subject = isSignup
    ? '✨ TaskMaster: Verify your email address'
    : '🛡️ TaskMaster: Your login verification code';

  const title = isSignup ? 'Welcome to TaskMaster!' : 'Security Verification';
  const actionText = isSignup
    ? 'To complete your registration, please use the following verification code:'
    : 'A login attempt was made using your credentials. Please enter the following code to continue:';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        .container { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; color: #1a2238; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #7c5cff, #9e85ff); padding: 32px; text-align: center; color: white; }
        .content { padding: 40px; text-align: center; background: #ffffff; }
        .footer { background: #f8fafc; padding: 24px; text-align: center; font-size: 12px; color: #64748b; }
        .otp-box { background: #f1f5f9; border-radius: 12px; padding: 24px; margin: 32px 0; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #7c5cff; border: 2px dashed #cbd5e1; }
        .welcome { font-size: 24px; font-weight: 700; margin-bottom: 8px; }
        .description { font-size: 16px; line-height: 1.6; color: #475569; }
        .warning { font-size: 13px; color: #94a3b8; margin-top: 32px; font-style: italic; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin:0; font-size: 28px;">TaskMaster</h1>
        </div>
        <div class="content">
          <div class="welcome">${title}</div>
          <p class="description">Hi ${name},</p>
          <p class="description">${actionText}</p>
          
          <div class="otp-box">${otp}</div>
          
          <p class="description">This code is valid for <strong>5 minutes</strong>. If you did not request this, please ignore this email.</p>
          
          <div class="warning">
            Note: For your security, never share this code with anyone. TaskMaster support will never ask for your OTP.
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} TaskMaster. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  // Resend's test domain lets you send to your own email without domain verification
  const from = process.env.EMAIL_FROM || 'TaskMaster <onboarding@resend.dev>';

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error(`❌ Resend API error for ${to}:`, error);
      throw new Error(error.message);
    }

    console.log(`✅ Email sent successfully to ${to}. Resend ID: ${data.id}`);
  } catch (err) {
    console.error(`❌ Failed to send email to ${to}:`, err);
    throw err;
  }
};

module.exports = {
  sendOTPEmail,
};
