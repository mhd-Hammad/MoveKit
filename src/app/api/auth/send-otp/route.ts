import { NextRequest, NextResponse } from 'next/server'
import { randomInt } from 'crypto'
import bcrypt from 'bcryptjs'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendOtpEmail } from '@/lib/email/nodemailer'
import { isValidUniversityDomain, extractDomain } from '@/lib/validation/domains'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email = body.email?.toLowerCase().trim()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Validate university domain
    const domain = extractDomain(email)
    if (!isValidUniversityDomain(domain)) {
      return NextResponse.json(
        { error: 'Please use a recognized university email address' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Check if locked (too many attempts)
    const { data: existingOtp } = await supabase
      .from('otp_records')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (existingOtp?.locked_until) {
      const lockExpiry = new Date(existingOtp.locked_until)
      if (lockExpiry > new Date()) {
        const minutesLeft = Math.ceil((lockExpiry.getTime() - Date.now()) / 60000)
        return NextResponse.json(
          { error: `Too many attempts. Try again in ${minutesLeft} minutes.` },
          { status: 429 }
        )
      }
    }

    // Generate 6-digit OTP
    const otp = randomInt(100000, 999999).toString()
    const otpHash = await bcrypt.hash(otp, 10)

    // Store OTP record (delete any previous for this email first)
    await supabase
      .from('otp_records')
      .delete()
      .eq('email', email)

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 min

    const { error: insertError } = await supabase
      .from('otp_records')
      .insert({
        email,
        otp_hash: otpHash,
        expires_at: expiresAt,
        attempts: 0,
        locked_until: null,
      })

    if (insertError) {
      console.error('Failed to store OTP:', insertError)
      return NextResponse.json(
        { error: 'Failed to generate verification code. Try again.' },
        { status: 500 }
      )
    }

    // Send email
    await sendOtpEmail(email, otp)

    return NextResponse.json(
      { message: 'Verification code sent to your email' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
