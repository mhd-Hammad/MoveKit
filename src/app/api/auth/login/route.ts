import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createAdminClient } from '@/lib/supabase/admin'

// POST /api/auth/login — standard email + password login
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email = body.email?.toLowerCase().trim()
    const password = body.password

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Find user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Check password
    if (!user.password_hash) {
      return NextResponse.json({ error: 'Please reset your password or register again' }, { status: 401 })
    }

    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Don't send password_hash to client
    const { password_hash: _, ...safeUser } = user

    return NextResponse.json({
      message: 'Login successful',
      user: safeUser,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
