import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { computeMatchScore, normalizeWeights } from '@/lib/matching/algorithm'
import type { MatchWeights } from '@/types/api'

// GET /api/matching — get matched listings for a user's blueprint
export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient()
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('user_id')
    const wDistance = parseFloat(searchParams.get('w_distance') || '0.25')
    const wPrice = parseFloat(searchParams.get('w_price') || '0.25')
    const wTrust = parseFloat(searchParams.get('w_trust') || '0.30')
    const wCompleteness = parseFloat(searchParams.get('w_completeness') || '0.20')

    // Get user's active blueprint
    let blueprint = null
    if (userId) {
      const { data } = await supabase
        .from('survival_blueprints')
        .select('*, blueprint_items(*), campuses(latitude, longitude)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      blueprint = data
    }

    // Get all active listings
    const { data: listings, error } = await supabase
      .from('listings')
      .select('*, users!seller_id(trust_score), campuses(latitude, longitude)')
      .eq('status', 'active')
      .limit(50)

    if (error || !listings) {
      return NextResponse.json({ data: [], message: 'No listings available' })
    }

    // If no blueprint, return listings sorted by trust
    if (!blueprint) {
      const results = listings.map(listing => ({
        listing,
        score: 0.5,
        breakdown: { distance_score: 0.5, price_score: 0.5, trust_score: (listing.users?.trust_score || 0) / 100, completeness_score: 0 },
      }))
      return NextResponse.json({ data: results })
    }

    // Compute match scores
    const weights: MatchWeights = normalizeWeights({
      distance: wDistance,
      price: wPrice,
      trust: wTrust,
      completeness: wCompleteness,
    })

    const blueprintCategories = (blueprint.blueprint_items || []).map((item: { category: string }) => item.category)
    const destLat = blueprint.campuses?.latitude || 0
    const destLon = blueprint.campuses?.longitude || 0

    const results = listings
      .map(listing => {
        const { score, breakdown } = computeMatchScore(
          {
            listing: {
              id: listing.id,
              price: listing.price,
              seller_trust_score: listing.users?.trust_score || 0,
              campus_lat: listing.campuses?.latitude || 0,
              campus_lon: listing.campuses?.longitude || 0,
              boost_factor: listing.boost_factor || 1.0,
              matching_categories: [listing.category?.toLowerCase()],
            },
            buyer: {
              destination_lat: destLat,
              destination_lon: destLon,
              budget_min: blueprint.budget_min || 0,
              budget_max: blueprint.budget_max || 1000,
              blueprint_categories: blueprintCategories,
            },
          },
          weights
        )
        return { listing, score, breakdown }
      })
      .filter(result => result.breakdown.distance_score > 0) // 25km radius filter
      .sort((a, b) => b.score - a.score)

    return NextResponse.json({ data: results })
  } catch (error) {
    console.error('Matching error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
