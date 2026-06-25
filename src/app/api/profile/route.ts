import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET /api/profile?user_id=xxx — get user profile
export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient()
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*, campuses(name, university_domains(university_name, domain))')
      .eq('id', userId)
      .single()

    if (error || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get deal count
    const { count: dealCount } = await supabase
      .from('deals')
      .select('*', { count: 'exact', head: true })
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .eq('status', 'completed')

    // Get badge count
    const { count: badgeCount } = await supabase
      .from('deal_badges')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    return NextResponse.json({
      ...user,
      completed_deals: dealCount || 0,
      badge_count: badgeCount || 0,
    })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/profile — update profile
export async function PATCH(req: NextRequest) {
  try {
    const supabase = createAdminClient()
    const body = await req.json()
    const { user_id, display_name } = body

    if (!user_id) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    if (display_name) {
      if (display_name.length < 2 || display_name.length > 50) {
        return NextResponse.json({ error: 'Name must be 2-50 characters' }, { status: 400 })
      }
      if (!/^[a-zA-Z0-9 _-]+$/.test(display_name)) {
        return NextResponse.json({ error: 'Name can only contain letters, numbers, spaces, hyphens, and underscores' }, { status: 400 })
      }
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (display_name) updates.display_name = display_name

    const { data: user, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user_id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/profile — delete account
export async function DELETE(req: NextRequest) {
  try {
    const supabase = createAdminClient()
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('user_id')
    const confirm = searchParams.get('confirm')

    if (!userId || confirm !== 'true') {
      return NextResponse.json({ error: 'User ID and confirmation required' }, { status: 400 })
    }

    // Anonymize user data instead of hard delete
    await supabase
      .from('users')
      .update({
        email: `deleted_${userId}@movekit.app`,
        display_name: 'Deleted User',
        university_domain: '',
        email_verified: false,
        document_verified: false,
        location_verified: false,
        campus_id: null,
        wellness_opt_out: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    return NextResponse.json({ message: 'Account deleted and data anonymized.' })
  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
