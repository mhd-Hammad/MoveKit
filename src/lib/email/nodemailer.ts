import nodemailer from 'nodemailer'

/**
 * Creates a Nodemailer transporter using Gmail SMTP.
 * Uses App Password for authentication (requires 2FA enabled on Gmail).
 */
function createTransporter() {
  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_PASS

  if (!user || !pass) {
    throw new Error('Missing GMAIL_USER or GMAIL_PASS environment variables')
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  })
}

/**
 * Sends a 6-digit OTP verification email to the specified address.
 */
export async function sendOtpEmail(email: string, otp: string): Promise<void> {
  const transporter = createTransporter()

  await transporter.sendMail({
    from: `"MoveKit" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: `${otp} is your MoveKit verification code`,
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #3b82f6;">📦 MoveKit</h2>
        <p>Your verification code is:</p>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; text-align: center; margin: 16px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1f2937;">${otp}</span>
        </div>
        <p style="color: #6b7280; font-size: 14px;">This code expires in 10 minutes. Do not share it with anyone.</p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">If you didn't request this code, you can safely ignore this email.</p>
      </div>
    `,
  })
}
