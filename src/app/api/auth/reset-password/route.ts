import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createAdminClient } from '@/lib/supabase/admin'

// POST /api/auth/reset-password — verify OTP and set new password
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email = body.email?.toLowerCase().trim()
    const otp = body.otp?.trim()
    const newPassword = body.new_password

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: 'Email, OTP, and new password are required' }, { status: 400 })
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Check user exists
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'No account found with this email' }, { status: 404 })
    }

    // Verify OTP
    const { data: otpRecord } = await supabase
      .from('otp_records')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!otpRecord) {
      return NextResponse.json({ error: 'No verification code found. Request a new one.' }, { status: 404 })
    }

    if (new Date(otpRecord.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Code expired. Request a new one.' }, { status: 410 })
    }

    const isValid = await bcrypt.compare(otp, otpRecord.otp_hash)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid code.' }, { status: 401 })
    }

    // Hash new password and update
    const passwordHash = await bcrypt.hash(newPassword, 10)

    // Check user exists
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'No account found with this email' }, { status: 404 })
    }

    const { error: updateErr } = await supabase
      .from('users')
      .update({ password_hash: passwordHash })
      .eq('email', email)

    if (updateErr) {
      return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 })
    }

    // Delete OTP record
    await supabase.from('otp_records').delete().eq('id', otpRecord.id)

    return NextResponse.json({ message: 'Password reset successful. You can now sign in.' })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
