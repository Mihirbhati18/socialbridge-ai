import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOTPEmail(email: string, code: string) {
  if (process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_HOST) {
    await transporter.sendMail({
      from: `"Concord" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Your Verification Code - Concord',
      text: `Your verification code is: ${code}. It will expire in 10 minutes.`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #0f172a;">Verification Code</h2>
          <p style="color: #475569;">Use the following code to sign in to Concord:</p>
          <div style="background-color: #f1f5f9; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #020617;">${code}</span>
          </div>
          <p style="color: #64748b; font-size: 14px;">This code will expire in 10 minutes.</p>
        </div>
      `,
    });
    return { success: true };
  } else {
    console.log(`\n--- [DEVELOPMENT MODE] ---`);
    console.log(`OTP for ${email}: ${code}`);
    console.log(`--------------------------\n`);
    return { success: false, devCode: code };
  }
}
