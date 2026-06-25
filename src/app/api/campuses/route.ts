import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET /api/campuses — list all campuses for selection
export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient()
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q')

    let dbQuery = supabase
      .from('campuses')
      .select('*, university_domains(university_name, domain, country)')
      .order('name')

    if (query && query.length >= 2) {
      // Search by university name
      dbQuery = supabase
        .from('campuses')
        .select('*, university_domains!inner(university_name, domain, country)')
        .ilike('university_domains.university_name', `%${query}%`)
        .order('name')
    }

    const { data: campuses, error } = await dbQuery

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch campuses' }, { status: 500 })
    }

    return NextResponse.json({ data: campuses || [] })
  } catch (error) {
    console.error('Campuses fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
