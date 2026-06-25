import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET /api/notifications — get user's notifications
export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient()
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
    }

    return NextResponse.json({ data: notifications || [] })
  } catch (error) {
    console.error('Notifications fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/notifications — mark as read
export async function PATCH(req: NextRequest) {
  try {
    const supabase = createAdminClient()
    const body = await req.json()
    const { notification_id, user_id, mark_all } = body

    if (!user_id) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    if (mark_all) {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user_id)
        .eq('is_read', false)
    } else if (notification_id) {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notification_id)
        .eq('user_id', user_id)
    }

    return NextResponse.json({ message: 'Updated' })
  } catch (error) {
    console.error('Notification update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
