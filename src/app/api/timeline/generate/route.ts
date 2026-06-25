import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateWithGroq } from '@/lib/ai/groq'
import { TIMELINE_SYSTEM_PROMPT, buildTimelineUserPrompt } from '@/lib/ai/prompts'

// POST /api/timeline/generate — generate arrival timeline from blueprint
export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminClient()
    const body = await req.json()
    const { blueprint_id, user_id } = body

    if (!blueprint_id) {
      return NextResponse.json({ error: 'Blueprint ID required' }, { status: 400 })
    }

    // Fetch blueprint with campus info
    const { data: blueprint, error: bpErr } = await supabase
      .from('survival_blueprints')
      .select('*, campuses(name, country_code, university_domains(university_name))')
      .eq('id', blueprint_id)
      .single()

    if (bpErr || !blueprint) {
      return NextResponse.json({ error: 'Blueprint not found' }, { status: 404 })
    }

    let timelineTasks
    let isFallback = false

    try {
      const userPrompt = buildTimelineUserPrompt({
        universityName: blueprint.campuses?.university_domains?.university_name || 'University',
        country: blueprint.campuses?.country_code || 'Unknown',
        arrivalDate: blueprint.arrival_date,
        housingType: blueprint.housing_type.replace('_', ' '),
      })

      const aiResponse = await generateWithGroq(TIMELINE_SYSTEM_PROMPT, userPrompt, 15000)
      const parsed = JSON.parse(aiResponse)
      timelineTasks = parsed.tasks
    } catch {
      // Fallback template timeline
      isFallback = true
      timelineTasks = [
        { title: 'Research local SIM providers', description: 'Compare prices online', day_offset: -7 },
        { title: 'Confirm housing details', description: 'Get move-in time and key info', day_offset: -5 },
        { title: 'Pack essentials in carry-on', description: 'Adapter, charger, docs, change of clothes', day_offset: -3 },
        { title: 'Download offline maps', description: 'Save campus area and airport route', day_offset: -1 },
        { title: 'Arrival — get SIM and transit', description: 'Buy SIM at airport, get to housing', day_offset: 0 },
        { title: 'Grocery run', description: 'Buy water, snacks, toiletries, cleaning basics', day_offset: 1 },
        { title: 'Campus orientation', description: 'Pick up student ID, library card, campus tour', day_offset: 2 },
        { title: 'Open bank account', description: 'Bring passport + student ID + enrollment proof', day_offset: 3 },
        { title: 'Get transit pass', description: 'Monthly student pass is usually cheapest', day_offset: 5 },
        { title: 'Register with local authorities', description: 'Some countries require this within 7 days', day_offset: 7 },
        { title: 'Join student clubs', description: 'Attend club fair or sign up online', day_offset: 10 },
        { title: 'Settle-in review', description: 'Check what is still missing from your blueprint', day_offset: 14 },
      ]
    }

    // Store timeline
    const { data: timeline, error: tlErr } = await supabase
      .from('arrival_timelines')
      .insert({ blueprint_id, user_id: user_id || null })
      .select()
      .single()

    if (tlErr || !timeline) {
      return NextResponse.json({
        tasks: timelineTasks,
        fallback: isFallback,
      })
    }

    // Store tasks
    const taskRows = timelineTasks.map((task: { title: string; description?: string; day_offset: number }, i: number) => ({
      timeline_id: timeline.id,
      title: task.title,
      description: task.description || null,
      day_offset: task.day_offset,
      is_completed: false,
      sort_order: i,
    }))

    await supabase.from('timeline_tasks').insert(taskRows)

    return NextResponse.json({
      id: timeline.id,
      tasks: timelineTasks,
      fallback: isFallback,
    })
  } catch (error) {
    console.error('Timeline generation error:', error)
    return NextResponse.json({ error: 'Failed to generate timeline' }, { status: 500 })
  }
}
