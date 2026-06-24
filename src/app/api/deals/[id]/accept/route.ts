import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// PATCH /api/deals/:id/accept — accept a deal proposal
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

    if (deal.status !== 'proposed') {
      return NextResponse.json({ error: 'Deal is not in proposed state' }, { status: 400 })
    }

    if (deal.seller_id !== user_id) {
      return NextResponse.json({ error: 'Only the seller can accept this deal' }, { status: 403 })
    }

    // Accept deal
    const now = new Date().toISOString()
    const completionExpiry = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()

    await supabase
      .from('deals')
      .update({ status: 'active', accepted_at: now, expires_at: completionExpiry })
      .eq('id', dealId)

    // Reserve listing
    await supabase
      .from('listings')
      .update({ status: 'reserved' })
      .eq('id', deal.listing_id)

    return NextResponse.json({ message: 'Deal accepted. Listing reserved.' })
  } catch (error) {
    console.error('Deal accept error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
