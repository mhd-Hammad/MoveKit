import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { haversine } from '@/lib/matching/haversine'

const MAX_DISTANCE_KM = 10
const MAX_ACCURACY_M = 100

// POST /api/verification/location — verify GPS proximity to campus
export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminClient()
    const body = await req.json()
    const { latitude, longitude, accuracy, user_id } = body

    if (!latitude || !longitude || accuracy === undefined || !user_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (accuracy > MAX_ACCURACY_M) {
      return NextResponse.json({
        error: `GPS accuracy too low (${Math.round(accuracy)}m). Please try in an open area.`,
        verified: false,
      }, { status: 400 })
    }

    // Fetch all campuses
    const { data: campuses, error: campusErr } = await supabase
      .from('campuses')
      .select('*, university_domains(university_name)')

    if (campusErr || !campuses || campuses.length === 0) {
      return NextResponse.json({ error: 'No campuses available for verification' }, { status: 500 })
    }

    // Find nearest campus
    let nearestCampus = campuses[0]
    let nearestDistance = Infinity

    for (const campus of campuses) {
      const distance = haversine(latitude, longitude, campus.latitude, campus.longitude)
      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestCampus = campus
      }
    }

    if (nearestDistance > MAX_DISTANCE_KM) {
      return NextResponse.json({
        verified: false,
        distance_km: Math.round(nearestDistance * 10) / 10,
        nearest_campus: nearestCampus.university_domains?.university_name || nearestCampus.name,
        message: `You are ${Math.round(nearestDistance)}km from the nearest campus (${nearestCampus.name}). Must be within ${MAX_DISTANCE_KM}km.`,
      }, { status: 400 })
    }

    // Verification successful — store campus association (NOT raw GPS)
    const verifiedAt = new Date().toISOString()

    await supabase
      .from('users')
      .update({
        location_verified: true,
        campus_id: nearestCampus.id,
        location_verified_at: verifiedAt,
      })
      .eq('id', user_id)

    // Record trust event
    await supabase.from('trust_events').insert({
      user_id,
      event_type: 'location_verified',
      points: 10,
    })

    return NextResponse.json({
      verified: true,
      campus_name: nearestCampus.name,
      university: nearestCampus.university_domains?.university_name,
      distance_km: Math.round(nearestDistance * 10) / 10,
      message: `Location verified! You're ${Math.round(nearestDistance * 10) / 10}km from ${nearestCampus.name}.`,
    })
  } catch (error) {
    console.error('Location verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
