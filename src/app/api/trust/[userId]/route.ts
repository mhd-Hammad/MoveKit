import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { computeTrustScore, computeTrustBreakdown, isNewUser } from '@/lib/trust/calculator'
import type { TrustEvent } from '@/types'

// GET /api/trust/:userId — get trust score breakdown
export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const supabase = createAdminClient()
    const userId = params.userId

    const { data: events, error } = await supabase
      .from('trust_events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch trust events' }, { status: 500 })
    }

    const trustEvents = (events || []) as TrustEvent[]
    const total = computeTrustScore(trustEvents)
    const breakdown = computeTrustBreakdown(trustEvents)
    const newUser = isNewUser(trustEvents)
    const completedDeals = trustEvents.filter(e => e.event_type === 'deal_completed').length

    return NextResponse.json({
      total,
      breakdown,
      completed_deals: completedDeals,
      is_new_user: newUser,
    })
  } catch (error) {
    console.error('Trust score error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
