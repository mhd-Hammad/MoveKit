import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET /api/listings — search and browse listings
export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient()
    const { searchParams } = new URL(req.url)

    const query = searchParams.get('query')
    const category = searchParams.get('category')
    const condition = searchParams.get('condition')
    const minPrice = searchParams.get('min_price')
    const maxPrice = searchParams.get('max_price')
    const page = parseInt(searchParams.get('page') || '1')
    const perPage = parseInt(searchParams.get('per_page') || '20')

    let dbQuery = supabase
      .from('listings')
      .select('*, users!seller_id(id, display_name, trust_score, email_verified, location_verified)', { count: 'exact' })
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (query && query.length >= 2) {
      dbQuery = dbQuery.ilike('title', `%${query}%`)
    }
    if (category) {
      dbQuery = dbQuery.eq('category', category)
    }
    if (condition) {
      dbQuery = dbQuery.eq('condition', condition)
    }
    if (minPrice) {
      dbQuery = dbQuery.gte('price', parseFloat(minPrice))
    }
    if (maxPrice) {
      dbQuery = dbQuery.lte('price', parseFloat(maxPrice))
    }

    // Pagination
    const from = (page - 1) * perPage
    const to = from + perPage - 1
    dbQuery = dbQuery.range(from, to)

    const { data: listings, error, count } = await dbQuery

    if (error) {
      console.error('Listings fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 })
    }

    return NextResponse.json({
      data: listings || [],
      total: count || 0,
      page,
      per_page: perPage,
      total_pages: Math.ceil((count || 0) / perPage),
    })
  } catch (error) {
    console.error('Listings error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/listings — create a new listing
export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminClient()
    const body = await req.json()

    const { title, description, price, category, condition, user_id, campus_id, photos } = body

    // Validate
    if (!title || title.length > 100) {
      return NextResponse.json({ error: 'Title is required (max 100 chars)' }, { status: 400 })
    }
    if (!description || description.length > 2000) {
      return NextResponse.json({ error: 'Description is required (max 2000 chars)' }, { status: 400 })
    }
    if (!price || price < 0.01 || price > 999999.99) {
      return NextResponse.json({ error: 'Price must be between 0.01 and 999,999.99' }, { status: 400 })
    }
    if (!category) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 })
    }
    const validConditions = ['new', 'like_new', 'good', 'fair']
    if (!validConditions.includes(condition)) {
      return NextResponse.json({ error: 'Invalid condition' }, { status: 400 })
    }
    if (!user_id) {
      return NextResponse.json({ error: 'User authentication required' }, { status: 401 })
    }

    const { data: listing, error } = await supabase
      .from('listings')
      .insert({
        seller_id: user_id,
        campus_id: campus_id || null,
        title,
        description,
        price,
        category,
        condition,
        status: 'active',
        boost_factor: 1.0,
        photos: photos || [],
      })
      .select()
      .single()

    if (error) {
      console.error('Create listing error:', error)
      return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 })
    }

    return NextResponse.json(listing, { status: 201 })
  } catch (error) {
    console.error('Create listing error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
