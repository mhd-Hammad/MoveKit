import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET /api/chat/sessions — list user's chat sessions
export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient()
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const { data: sessions, error } = await supabase
      .from('chat_sessions')
      .select('*, listings(id, title, price), messages(content, created_at)')
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
    }

    return NextResponse.json({ data: sessions || [] })
  } catch (error) {
    console.error('Chat sessions error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/chat/sessions — create a new chat session
export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminClient()
    const body = await req.json()
    const { buyer_id, seller_id, listing_id } = body

    if (!buyer_id || !seller_id || !listing_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if session already exists
    const { data: existing } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('buyer_id', buyer_id)
      .eq('seller_id', seller_id)
      .eq('listing_id', listing_id)
      .single()

    if (existing) {
      return NextResponse.json(existing)
    }

    const { data: session, error } = await supabase
      .from('chat_sessions')
      .insert({ buyer_id, seller_id, listing_id, is_restricted: false })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to create chat session' }, { status: 500 })
    }

    return NextResponse.json(session, { status: 201 })
  } catch (error) {
    console.error('Create chat session error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
