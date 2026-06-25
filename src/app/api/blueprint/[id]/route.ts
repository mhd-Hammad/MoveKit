import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET /api/blueprint/:id — get a specific blueprint with items
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient()

    const { data: blueprint, error } = await supabase
      .from('survival_blueprints')
      .select('*, blueprint_items(*)')
      .eq('id', params.id)
      .single()

    if (error || !blueprint) {
      return NextResponse.json({ error: 'Blueprint not found' }, { status: 404 })
    }

    return NextResponse.json(blueprint)
  } catch (error) {
    console.error('Blueprint fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
