import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// PATCH /api/deals/:id/cancel — cancel a deal
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient()
    const body = await req.json()
    const { user_id } = body
    const dealId = params.id

    // Fetch deal
    const { data: deal, error: fetchErr } = await supabase
      .from('deals')
      .select('*')
      .eq('id', dealId)
      .single()

    if (fetchErr || !deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    if (!['proposed', 'active'].includes(deal.status)) {
      return NextResponse.json({ error: 'Deal cannot be cancelled in its current state' }, { status: 400 })
    }

    if (deal.buyer_id !== user_id && deal.seller_id !== user_id) {
      return NextResponse.json({ error: 'You are not a participant in this deal' }, { status: 403 })
    }

    const now = new Date().toISOString()

    // Cancel deal
    await supabase
      .from('deals')
      .update({ status: 'cancelled', cancelled_by: user_id, cancelled_at: now })
      .eq('id', dealId)

    // Return listing to active
    await supabase
      .from('listings')
      .update({ status: 'active' })
      .eq('id', deal.listing_id)

    // Record cancellation in behavior history (-3 trust)
    await supabase.from('trust_events').insert({
      user_id,
      event_type: 'deal_cancelled',
      points: -3,
      reference_id: dealId,
    })

    return NextResponse.json({ message: 'Deal cancelled. Listing returned to active.' })
  } catch (error) {
    console.error('Deal cancel error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
