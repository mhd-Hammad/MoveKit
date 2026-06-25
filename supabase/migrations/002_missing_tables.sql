-- ============================================================
-- MoveKit - Missing Tables (fixes runtime crashes)
-- Run this in Supabase SQL Editor after 001_initial_schema.sql
-- ============================================================

-- ARRIVAL TIMELINES (Required by /api/timeline/generate)
CREATE TABLE IF NOT EXISTS arrival_timelines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blueprint_id UUID REFERENCES survival_blueprints(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TIMELINE TASKS (Required by /api/timeline/generate)
CREATE TABLE IF NOT EXISTS timeline_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timeline_id UUID REFERENCES arrival_timelines(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT NULL,
  day_offset INTEGER NOT NULL,
  depends_on UUID DEFAULT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ DEFAULT NULL,
  sort_order INTEGER DEFAULT 0
);

-- BUNDLES (Referenced by listings.bundle_id)
CREATE TABLE IF NOT EXISTS bundles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  total_price DECIMAL(10, 2) DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'reserved', 'sold')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- EXIT FLOW DRAFTS
CREATE TABLE IF NOT EXISTS exit_flow_drafts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  draft_data JSONB DEFAULT '{}',
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DOCUMENT UPLOADS
CREATE TABLE IF NOT EXISTS document_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID DEFAULT NULL,
  reviewed_at TIMESTAMPTZ DEFAULT NULL,
  rejection_reason TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MESSAGE REPORTS
CREATE TABLE IF NOT EXISTS message_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES users(id),
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'dismissed', 'warned')),
  reviewed_by UUID DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATION PREFERENCES
CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  matches_enabled BOOLEAN DEFAULT TRUE,
  messages_enabled BOOLEAN DEFAULT TRUE,
  deals_enabled BOOLEAN DEFAULT TRUE,
  wellness_enabled BOOLEAN DEFAULT TRUE
);

-- Add foreign key for listings.bundle_id
ALTER TABLE listings
  ADD CONSTRAINT fk_listings_bundle
  FOREIGN KEY (bundle_id) REFERENCES bundles(id)
  ON DELETE SET NULL;

-- RLS policies for new tables (permissive for now)
ALTER TABLE arrival_timelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Timelines accessible" ON arrival_timelines FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Timeline tasks accessible" ON timeline_tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Bundles accessible" ON bundles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Documents accessible" ON document_uploads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Reports accessible" ON message_reports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Prefs accessible" ON notification_preferences FOR ALL USING (true) WITH CHECK (true);
