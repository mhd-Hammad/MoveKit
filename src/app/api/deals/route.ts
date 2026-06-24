import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET /api/deals — list user's deals
export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient()
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const { data: deals, error } = await supabase
      .from('deals')
      .select('*, listings(id, title, price, photos)')
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 })
    }

    return NextResponse.json({ data: deals || [] })
  } catch (error) {
    console.error('Deals fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/deals — create a deal proposal
export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminClient()
    const body = await req.json()

    const { listing_id, buyer_id, price, items } = body

    if (!listing_id || !buyer_id || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get listing to find seller
    const { data: listing, error: listingErr } = await supabase
      .from('listings')
      .select('*')
      .eq('id', listing_id)
      .single()

    if (listingErr || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    if (listing.status !== 'active') {
      return NextResponse.json({ error: 'Listing is no longer available' }, { status: 409 })
    }

    if (listing.seller_id === buyer_id) {
      return NextResponse.json({ error: 'Cannot buy your own listing' }, { status: 400 })
    }

    // Check no existing active deal for this listing
    const { data: existingDeal } = await supabase
      .from('deals')
      .select('id')
      .eq('listing_id', listing_id)
      .in('status', ['proposed', 'active'])
      .limit(1)
      .single()

    if (existingDeal) {
      return NextResponse.json({ error: 'A deal already exists for this listing' }, { status: 409 })
    }

    // Create deal
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() // 48 hours

    const { data: deal, error: dealErr } = await supabase
      .from('deals')
      .insert({
        listing_id,
        buyer_id,
        seller_id: listing.seller_id,
        status: 'proposed',
        locked_price: price,
        locked_items: items || {},
        expires_at: expiresAt,
      })
      .select()
      .single()

    if (dealErr) {
      console.error('Create deal error:', dealErr)
      return NextResponse.json({ error: 'Failed to create deal' }, { status: 500 })
    }

    return NextResponse.json(deal, { status: 201 })
  } catch (error) {
    console.error('Deal creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
