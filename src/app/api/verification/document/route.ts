import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// POST /api/verification/document — upload document for verification
export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminClient()
    const body = await req.json()
    const { user_id, document_type, document_data } = body

    if (!user_id || !document_type) {
      return NextResponse.json({ error: 'User ID and document type required' }, { status: 400 })
    }

    const validTypes = ['student_card', 'offer_letter', 'enrollment_letter']
    if (!validTypes.includes(document_type)) {
      return NextResponse.json({ error: 'Invalid document type' }, { status: 400 })
    }

    // Check if user already has a pending document
    const { data: existing } = await supabase
      .from('document_uploads')
      .select('id')
      .eq('user_id', user_id)
      .eq('status', 'pending')
      .single()

    if (existing) {
      return NextResponse.json({
        error: 'You already have a pending document review. Please wait for it to be processed.',
      }, { status: 409 })
    }

    // Store document record (in production, would upload to Supabase Storage)
    const { data: doc, error } = await supabase
      .from('document_uploads')
      .insert({
        user_id,
        storage_path: `documents/${user_id}/${Date.now()}_${document_type}`,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to submit document' }, { status: 500 })
    }

    // For hackathon demo: auto-approve after 5 seconds (simulates admin review)
    // In production, this would go to an admin review queue
    setTimeout(async () => {
      await supabase
        .from('document_uploads')
        .update({ status: 'approved', reviewed_at: new Date().toISOString() })
        .eq('id', doc.id)

      // Update user verification status
      await supabase
        .from('users')
        .update({
          document_verified: true,
          verification_tier: 'document',
        })
        .eq('id', user_id)

      // Award trust points
      await supabase.from('trust_events').insert({
        user_id,
        event_type: 'document_verified',
        points: 10,
      })
    }, 5000)

    return NextResponse.json({
      message: 'Document submitted for verification. You\'ll be notified once reviewed.',
      document_id: doc.id,
    })
  } catch (error) {
    console.error('Document upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/verification/document — check document status
export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient()
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const { data: docs } = await supabase
      .from('document_uploads')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)

    return NextResponse.json({ document: docs?.[0] || null })
  } catch (error) {
    console.error('Document status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
