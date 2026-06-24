import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createAdminClient } from '@/lib/supabase/admin'
import { extractDomain } from '@/lib/validation/domains'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email = body.email?.toLowerCase().trim()
    const otp = body.otp?.trim()

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      )
    }

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { error: 'OTP must be exactly 6 digits' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Fetch OTP record
    const { data: otpRecord, error: fetchError } = await supabase
      .from('otp_records')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (fetchError || !otpRecord) {
      return NextResponse.json(
        { error: 'No verification code found. Please request a new one.' },
        { status: 404 }
      )
    }

    // Check if locked
    if (otpRecord.locked_until && new Date(otpRecord.locked_until) > new Date()) {
      return NextResponse.json(
        { error: 'Too many failed attempts. Please wait 15 minutes.' },
        { status: 429 }
      )
    }

    // Check expiry
    if (new Date(otpRecord.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Verification code has expired. Please request a new one.' },
        { status: 410 }
      )
    }

    // Verify OTP
    const isValid = await bcrypt.compare(otp, otpRecord.otp_hash)

    if (!isValid) {
      const newAttempts = otpRecord.attempts + 1

      // Lock after 3 failed attempts
      if (newAttempts >= 3) {
        const lockedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString()
        await supabase
          .from('otp_records')
          .update({ attempts: newAttempts, locked_until: lockedUntil })
          .eq('id', otpRecord.id)

        return NextResponse.json(
          { error: 'Too many failed attempts. Locked for 15 minutes.' },
          { status: 429 }
        )
      }

      await supabase
        .from('otp_records')
        .update({ attempts: newAttempts })
        .eq('id', otpRecord.id)

      return NextResponse.json(
        { error: `Invalid code. ${3 - newAttempts} attempts remaining.` },
        { status: 401 }
      )
    }

    // OTP is valid — create or update user
    const domain = extractDomain(email)

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    let user

    if (existingUser) {
      // Update existing user
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({ email_verified: true, university_domain: domain })
        .eq('id', existingUser.id)
        .select()
        .single()

      if (updateError) throw updateError
      user = updatedUser
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email,
          display_name: email.split('@')[0],
          university_domain: domain,
          email_verified: true,
          document_verified: false,
          location_verified: false,
          trust_score: 20, // +20 for email verification
          role: 'user',
          wellness_opt_out: false,
        })
        .select()
        .single()

      if (createError) throw createError
      user = newUser

      // Record trust event for email verification
      await supabase
        .from('trust_events')
        .insert({
          user_id: user.id,
          event_type: 'email_verified',
          points: 20,
        })
    }

    // Delete OTP record
    await supabase
      .from('otp_records')
      .delete()
      .eq('id', otpRecord.id)

    return NextResponse.json({
      message: 'Email verified successfully',
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        email_verified: user.email_verified,
        trust_score: user.trust_score,
      },
    })
  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
