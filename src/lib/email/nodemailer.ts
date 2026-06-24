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
    subject: `${otp} — Your MoveKit verification code`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #ffffff;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 12px 20px; border-radius: 12px;">
            <span style="font-size: 24px; color: white; font-weight: bold;">📦 MoveKit</span>
          </div>
        </div>

        <!-- Body -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; text-align: center;">
          <p style="color: #475569; font-size: 15px; margin: 0 0 8px;">Your verification code is:</p>
          <div style="background: linear-gradient(135deg, #eff6ff, #dbeafe); padding: 20px; border-radius: 8px; margin: 16px 0;">
            <span style="font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #1e40af; font-family: 'Courier New', monospace;">${otp}</span>
          </div>
          <p style="color: #64748b; font-size: 13px; margin: 16px 0 0;">This code expires in <strong>5 minutes</strong></p>
        </div>

        <!-- Security Notice -->
        <div style="margin-top: 24px; padding: 16px; background: #fefce8; border: 1px solid #fef08a; border-radius: 8px;">
          <p style="color: #854d0e; font-size: 12px; margin: 0;">
            🔒 <strong>Security tip:</strong> Never share this code with anyone. MoveKit will never ask for it outside the app.
          </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
          <p style="color: #94a3b8; font-size: 11px; margin: 0;">
            Campus Relocation Network — Helping students move smarter
          </p>
          <p style="color: #cbd5e1; font-size: 11px; margin: 4px 0 0;">
            If you didn't request this code, you can safely ignore this email.
          </p>
        </div>
      </div>
    `,
  })
}
