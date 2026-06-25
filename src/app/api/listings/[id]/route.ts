import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET /api/listings/:id — get single listing detail
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient()

    const { data: listing, error } = await supabase
      .from('listings')
      .select('*, users!seller_id(id, display_name, trust_score, email_verified, location_verified)')
      .eq('id', params.id)
      .single()

    if (error || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    return NextResponse.json(listing)
  } catch (error) {
    console.error('Listing detail error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
