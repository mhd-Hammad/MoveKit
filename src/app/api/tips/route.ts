import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET /api/tips — get tips for a campus
export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient()
    const { searchParams } = new URL(req.url)
    const campusId = searchParams.get('campus_id')
    const topic = searchParams.get('topic')
    const page = parseInt(searchParams.get('page') || '1')
    const perPage = 20

    let query = supabase
      .from('knowledge_tips')
      .select('*, users!author_id(display_name, trust_score)', { count: 'exact' })
      .order('upvotes', { ascending: false })
      .order('created_at', { ascending: false })

    if (campusId) query = query.eq('campus_id', campusId)
    if (topic) query = query.eq('topic', topic)

    const from = (page - 1) * perPage
    query = query.range(from, from + perPage - 1)

    const { data: tips, error, count } = await query

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch tips' }, { status: 500 })
    }

    return NextResponse.json({
      data: tips || [],
      total: count || 0,
      page,
      total_pages: Math.ceil((count || 0) / perPage),
    })
  } catch (error) {
    console.error('Tips fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/tips — submit a new tip
export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminClient()
    const body = await req.json()
    const { author_id, campus_id, topic, body: tipBody } = body

    if (!author_id || !topic || !tipBody) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (tipBody.length < 20) {
      return NextResponse.json({ error: 'Tip must be at least 20 characters' }, { status: 400 })
    }
    if (tipBody.length > 500) {
      return NextResponse.json({ error: 'Tip must be 500 characters or less' }, { status: 400 })
    }

    const validTopics = ['housing', 'transportation', 'food', 'academics', 'social_life']
    if (!validTopics.includes(topic)) {
      return NextResponse.json({ error: 'Invalid topic' }, { status: 400 })
    }

    const { data: tip, error } = await supabase
      .from('knowledge_tips')
      .insert({ author_id, campus_id: campus_id || null, topic, body: tipBody })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to submit tip' }, { status: 500 })
    }

    return NextResponse.json(tip, { status: 201 })
  } catch (error) {
    console.error('Submit tip error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
