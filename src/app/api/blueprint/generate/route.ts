import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateWithGroq } from '@/lib/ai/groq'
import { BLUEPRINT_SYSTEM_PROMPT, buildBlueprintUserPrompt } from '@/lib/ai/prompts'
import { getTemplateBluprint } from '@/lib/ai/templates'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { university_campus_id, housing_type, budget_min, budget_max, arrival_date } = body

    // Validate inputs
    const validHousing = ['dormitory', 'shared_apartment', 'studio_apartment', 'homestay']
    if (!validHousing.includes(housing_type)) {
      return NextResponse.json({ error: 'Invalid housing type' }, { status: 400 })
    }
    if (!budget_min || !budget_max || budget_min < 0 || budget_max > 50000) {
      return NextResponse.json({ error: 'Budget must be between 0 and 50,000' }, { status: 400 })
    }
    if (!arrival_date || new Date(arrival_date) < new Date(new Date().toDateString())) {
      return NextResponse.json({ error: 'Arrival date cannot be in the past' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Get campus info for context
    let universityName = 'University'
    let country = 'Unknown'
    let climateZone = 'temperate'

    if (university_campus_id) {
      const { data: campus } = await supabase
        .from('campuses')
        .select('*, university_domains(*)')
        .eq('id', university_campus_id)
        .single()

      if (campus) {
        universityName = campus.university_domains?.university_name || 'University'
        country = campus.country_code || 'Unknown'
        climateZone = campus.climate_zone || 'temperate'
      }
    }

    const arrivalMonth = new Date(arrival_date).toLocaleDateString('en-US', { month: 'long' })

    let blueprintData
    let isFallback = false

    try {
      // Try AI generation
      const userPrompt = buildBlueprintUserPrompt({
        universityName,
        country,
        climateZone,
        housingType: housing_type.replace('_', ' '),
        budgetMin: budget_min,
        budgetMax: budget_max,
        arrivalMonth,
      })

      const aiResponse = await generateWithGroq(BLUEPRINT_SYSTEM_PROMPT, userPrompt, 15000)
      blueprintData = JSON.parse(aiResponse)
    } catch (error) {
      console.warn('AI generation failed, using template:', error)
      blueprintData = getTemplateBluprint(housing_type)
      isFallback = true
    }

    // Store blueprint in database
    const { data: blueprint, error: insertError } = await supabase
      .from('survival_blueprints')
      .insert({
        user_id: body.user_id || null,
        destination_campus_id: university_campus_id || null,
        housing_type,
        budget_min,
        budget_max,
        arrival_date,
        climate_info: blueprintData.climate_info || null,
        cultural_norms: blueprintData.cultural_norms || null,
        is_finalized: false,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Failed to store blueprint:', insertError)
      // Return data even if DB fails
      return NextResponse.json({
        id: null,
        categories: blueprintData.categories,
        climate_info: blueprintData.climate_info || null,
        cultural_norms: blueprintData.cultural_norms || null,
        is_finalized: false,
        fallback: isFallback,
      })
    }

    // Store individual items
    const items = blueprintData.categories.flatMap(
      (cat: { category: string; items: { name: string; description?: string }[] }, catIdx: number) =>
        cat.items.map((item: { name: string; description?: string }, itemIdx: number) => ({
          blueprint_id: blueprint.id,
          category: cat.category,
          name: item.name,
          description: item.description || null,
          is_obtained: false,
          sort_order: catIdx * 100 + itemIdx,
        }))
    )

    if (items.length > 0) {
      await supabase.from('blueprint_items').insert(items)
    }

    return NextResponse.json({
      id: blueprint.id,
      categories: blueprintData.categories,
      climate_info: blueprintData.climate_info || null,
      cultural_norms: blueprintData.cultural_norms || null,
      is_finalized: false,
      fallback: isFallback,
    })
  } catch (error) {
    console.error('Blueprint generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate blueprint. Please try again.' },
      { status: 500 }
    )
  }
}
