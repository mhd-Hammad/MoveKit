import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Regex patterns for contact info detection
const CONTACT_PATTERNS = [
  /\b\d{10,}\b/,                                    // phone numbers
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // emails
  /(?:instagram|ig|insta|snap|snapchat|whatsapp|telegram|signal|discord|twitter|x\.com)\s*[:\-@]?\s*\S+/i, // social handles
]

// Scam/spam patterns that should be BLOCKED (actually dangerous)
const SCAM_PATTERNS = [
  /western\s*union/i,
  /wire\s*transfer/i,
  /gift\s*card\s*(payment|code)/i,
  /send\s*(money|payment)\s*(first|before|upfront)/i,
  /bit\.ly|tinyurl|shorturl/i,
  /advance\s*(fee|payment)/i,
]

function detectContactInfo(content: string): boolean {
  return CONTACT_PATTERNS.some(pattern => pattern.test(content))
}

function detectScamContent(content: string): boolean {
  return SCAM_PATTERNS.some(pattern => pattern.test(content))
}

// GET /api/chat/sessions/:id/messages — get message history
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient()
    const sessionId = params.id
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const perPage = 50

    const from = (page - 1) * perPage
    const to = from + perPage - 1

    const { data: messages, error, count } = await supabase
      .from('messages')
      .select('*', { count: 'exact' })
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .range(from, to)

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    return NextResponse.json({
      data: messages || [],
      total: count || 0,
      page,
    })
  } catch (error) {
    console.error('Messages fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/chat/sessions/:id/messages — send a message
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient()
    const sessionId = params.id
    const body = await req.json()
    const { sender_id, content, message_type, media_url } = body

    if (!sender_id || !content) {
      return NextResponse.json({ error: 'Sender and content required' }, { status: 400 })
    }

    if (content.length > 2000) {
      return NextResponse.json({ error: 'Message too long (max 2000 chars)' }, { status: 400 })
    }

    const hasContactWarning = detectContactInfo(content)
    const hasScamFlag = detectScamContent(content)

    // Block scam messages entirely
    if (hasScamFlag) {
      return NextResponse.json({
        error: 'This message was flagged as potentially unsafe. Please keep all transactions within the app.',
        flagged: true,
      }, { status: 400 })
    }

    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        session_id: sessionId,
        sender_id,
        content,
        message_type: message_type || 'text',
        media_url: media_url || null,
        has_contact_warning: hasContactWarning,
        is_reported: false,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
