import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// POST /api/deals/:id/confirm — submit completion confirmation
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient()
    const body = await req.json()
    const { user_id } = body
    const dealId = params.id

    if (!user_id) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Fetch deal
    const { data: deal, error: fetchErr } = await supabase
      .from('deals')
      .select('*')
      .eq('id', dealId)
      .single()

    if (fetchErr || !deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    if (deal.status !== 'active') {
      return NextResponse.json({ error: 'Deal is not in active state' }, { status: 400 })
    }

    // Determine role
    const isBuyer = deal.buyer_id === user_id
    const isSeller = deal.seller_id === user_id

    if (!isBuyer && !isSeller) {
      return NextResponse.json({ error: 'You are not a participant in this deal' }, { status: 403 })
    }

    // Check if already confirmed
    if (isBuyer && deal.buyer_confirmed) {
      return NextResponse.json({ error: 'You already confirmed this deal' }, { status: 400 })
    }
    if (isSeller && deal.seller_confirmed) {
      return NextResponse.json({ error: 'You already confirmed this deal' }, { status: 400 })
    }

    // Update confirmation
    const now = new Date().toISOString()
    const updates: Record<string, unknown> = {}

    if (isBuyer) {
      updates.buyer_confirmed = true
      updates.buyer_confirmed_at = now
    } else {
      updates.seller_confirmed = true
      updates.seller_confirmed_at = now
    }

    // Check if both confirmed now
    const bothConfirmed =
      (isBuyer && deal.seller_confirmed) || (isSeller && deal.buyer_confirmed)

    if (bothConfirmed) {
      updates.status = 'completed'
      updates.completed_at = now
    }

    const { error: updateErr } = await supabase
      .from('deals')
      .update(updates)
      .eq('id', dealId)

    if (updateErr) {
      return NextResponse.json({ error: 'Failed to confirm deal' }, { status: 500 })
    }

    // If completed, update listing + award trust + create badges
    if (bothConfirmed) {
      // Mark listing as sold
      await supabase
        .from('listings')
        .update({ status: 'sold' })
        .eq('id', deal.listing_id)

      // Award +5 trust to both
      await supabase.from('trust_events').insert([
        { user_id: deal.buyer_id, event_type: 'deal_completed', points: 5, reference_id: dealId },
        { user_id: deal.seller_id, event_type: 'deal_completed', points: 5, reference_id: dealId },
      ])

      // Update trust scores
      await supabase.rpc('increment_trust_score', { uid: deal.buyer_id, amount: 5 }).catch(() => {
        // Fallback: direct update
        supabase.from('users').update({ trust_score: deal.buyer_id }).eq('id', deal.buyer_id)
      })

      // Create deal badges
      await supabase.from('deal_badges').insert([
        { user_id: deal.buyer_id, deal_id: dealId, tier: 'free' },
        { user_id: deal.seller_id, deal_id: dealId, tier: 'free' },
      ]).catch(() => { /* unique constraint handles duplicates */ })
    }

    return NextResponse.json({
      message: bothConfirmed ? 'Deal completed! Both parties confirmed.' : 'Confirmation recorded. Waiting for other party.',
      deal_completed: bothConfirmed,
    })
  } catch (error) {
    console.error('Deal confirm error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
