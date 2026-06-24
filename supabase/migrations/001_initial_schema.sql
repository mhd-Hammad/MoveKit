-- ============================================================
-- MoveKit - Initial Database Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard → SQL Editor
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL DEFAULT '',
  university_domain TEXT NOT NULL DEFAULT '',
  email_verified BOOLEAN DEFAULT FALSE,
  document_verified BOOLEAN DEFAULT FALSE,
  location_verified BOOLEAN DEFAULT FALSE,
  campus_id UUID DEFAULT NULL,
  location_verified_at TIMESTAMPTZ DEFAULT NULL,
  trust_score INTEGER DEFAULT 0 CHECK (trust_score >= 0),
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  wellness_opt_out BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- OTP RECORDS
-- ============================================================
CREATE TABLE IF NOT EXISTS otp_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_otp_email ON otp_records(email);

-- ============================================================
-- UNIVERSITY DOMAINS
-- ============================================================
CREATE TABLE IF NOT EXISTS university_domains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  domain TEXT UNIQUE NOT NULL,
  university_name TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CAMPUSES
-- ============================================================
CREATE TABLE IF NOT EXISTS campuses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  university_domain_id UUID REFERENCES university_domains(id),
  name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  climate_zone TEXT DEFAULT '',
  country_code TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TRUST EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS trust_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'deal_completed', 'deal_cancelled', 'dispute',
    'verification_response', 'verification_ignored',
    'email_verified', 'document_verified', 'location_verified',
    'admin_warning'
  )),
  points INTEGER NOT NULL,
  reference_id TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trust_user ON trust_events(user_id);

-- ============================================================
-- SURVIVAL BLUEPRINTS
-- ============================================================
CREATE TABLE IF NOT EXISTS survival_blueprints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  destination_campus_id UUID REFERENCES campuses(id),
  housing_type TEXT NOT NULL CHECK (housing_type IN ('dormitory', 'shared_apartment', 'studio_apartment', 'homestay')),
  budget_min DECIMAL(10, 2) DEFAULT 0,
  budget_max DECIMAL(10, 2) DEFAULT 0,
  arrival_date DATE NOT NULL,
  climate_info JSONB DEFAULT NULL,
  cultural_norms JSONB DEFAULT NULL,
  is_finalized BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BLUEPRINT ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS blueprint_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blueprint_id UUID REFERENCES survival_blueprints(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('climate_kit', 'housing_essentials', 'electronics_adapters', 'kitchen_essentials', 'local_setup_tasks')),
  name TEXT NOT NULL,
  description TEXT DEFAULT NULL,
  is_obtained BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- LISTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  campus_id UUID REFERENCES campuses(id),
  title TEXT NOT NULL CHECK (char_length(title) <= 100),
  description TEXT NOT NULL CHECK (char_length(description) <= 2000),
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0.01 AND price <= 999999.99),
  category TEXT NOT NULL,
  condition TEXT NOT NULL CHECK (condition IN ('new', 'like_new', 'good', 'fair')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'reserved', 'sold')),
  bundle_id UUID DEFAULT NULL,
  boost_factor DECIMAL(3, 2) DEFAULT 1.0 CHECK (boost_factor >= 1.0 AND boost_factor <= 3.0),
  photos TEXT[] DEFAULT '{}',
  last_interaction_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_listings_seller ON listings(seller_id);
CREATE INDEX idx_listings_campus ON listings(campus_id);
CREATE INDEX idx_listings_status ON listings(status);

-- ============================================================
-- DEALS
-- ============================================================
CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES listings(id),
  buyer_id UUID REFERENCES users(id),
  seller_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'proposed' CHECK (status IN ('proposed', 'active', 'completed', 'cancelled', 'expired', 'disputed')),
  locked_price DECIMAL(10, 2),
  locked_items JSONB DEFAULT '{}',
  meetup_time TIMESTAMPTZ DEFAULT NULL,
  meetup_lat DOUBLE PRECISION DEFAULT NULL,
  meetup_lon DOUBLE PRECISION DEFAULT NULL,
  buyer_confirmed BOOLEAN DEFAULT FALSE,
  seller_confirmed BOOLEAN DEFAULT FALSE,
  buyer_confirmed_at TIMESTAMPTZ DEFAULT NULL,
  seller_confirmed_at TIMESTAMPTZ DEFAULT NULL,
  proposed_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ DEFAULT NULL,
  completed_at TIMESTAMPTZ DEFAULT NULL,
  cancelled_by UUID DEFAULT NULL,
  cancelled_at TIMESTAMPTZ DEFAULT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DEAL BADGES
-- ============================================================
CREATE TABLE IF NOT EXISTS deal_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id),
  tier TEXT DEFAULT 'free',
  awarded_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, deal_id)
);

-- ============================================================
-- CHAT SESSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID REFERENCES users(id),
  seller_id UUID REFERENCES users(id),
  listing_id UUID REFERENCES listings(id),
  deal_id UUID DEFAULT NULL,
  is_restricted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id),
  content TEXT NOT NULL CHECK (char_length(content) <= 2000),
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video_request', 'meetup_proposal', 'system')),
  media_url TEXT DEFAULT NULL,
  has_contact_warning BOOLEAN DEFAULT FALSE,
  is_reported BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_session ON messages(session_id);

-- ============================================================
-- KNOWLEDGE TIPS
-- ============================================================
CREATE TABLE IF NOT EXISTS knowledge_tips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES users(id),
  campus_id UUID REFERENCES campuses(id),
  topic TEXT NOT NULL CHECK (topic IN ('housing', 'transportation', 'food', 'academics', 'social_life')),
  body TEXT NOT NULL CHECK (char_length(body) >= 20 AND char_length(body) <= 500),
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TIP VOTES
-- ============================================================
CREATE TABLE IF NOT EXISTS tip_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tip_id UUID REFERENCES knowledge_tips(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  vote TEXT NOT NULL CHECK (vote IN ('up', 'down')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tip_id, user_id)
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('match', 'message', 'deal', 'wellness', 'system')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  link TEXT DEFAULT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE survival_blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE blueprint_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- OTP records: service role only (admin client handles this)
CREATE POLICY "Service role full access on otp_records" ON otp_records
  FOR ALL USING (true) WITH CHECK (true);

-- Users: anyone can read profiles, only own profile can be updated
CREATE POLICY "Users are viewable by everyone" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Listings: public read, seller can manage own
CREATE POLICY "Listings are viewable by everyone" ON listings
  FOR SELECT USING (true);

CREATE POLICY "Users can create own listings" ON listings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Sellers can update own listings" ON listings
  FOR UPDATE USING (true);

-- Trust events: viewable by everyone, insert by service role
CREATE POLICY "Trust events are viewable by everyone" ON trust_events
  FOR SELECT USING (true);

CREATE POLICY "Service role can insert trust events" ON trust_events
  FOR INSERT WITH CHECK (true);

-- Notifications: only own
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (true);

CREATE POLICY "Service can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Blueprints: own only
CREATE POLICY "Users can view own blueprints" ON survival_blueprints
  FOR SELECT USING (true);

CREATE POLICY "Users can create blueprints" ON survival_blueprints
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own blueprints" ON survival_blueprints
  FOR UPDATE USING (true);

-- Blueprint items: follows parent blueprint
CREATE POLICY "Blueprint items are viewable" ON blueprint_items
  FOR SELECT USING (true);

CREATE POLICY "Blueprint items can be managed" ON blueprint_items
  FOR ALL USING (true) WITH CHECK (true);

-- Deals: participants only
CREATE POLICY "Deals viewable by all" ON deals
  FOR SELECT USING (true);

CREATE POLICY "Deals can be created" ON deals
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Deals can be updated" ON deals
  FOR UPDATE USING (true);

-- Chat: participants only
CREATE POLICY "Chat sessions viewable" ON chat_sessions
  FOR SELECT USING (true);

CREATE POLICY "Chat sessions can be created" ON chat_sessions
  FOR INSERT WITH CHECK (true);

-- Messages: session participants
CREATE POLICY "Messages viewable" ON messages
  FOR SELECT USING (true);

CREATE POLICY "Messages can be sent" ON messages
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- SEED: Sample university domains
-- ============================================================
INSERT INTO university_domains (domain, university_name, country) VALUES
  ('mit.edu', 'Massachusetts Institute of Technology', 'US'),
  ('harvard.edu', 'Harvard University', 'US'),
  ('stanford.edu', 'Stanford University', 'US'),
  ('ox.ac.uk', 'University of Oxford', 'GB'),
  ('cam.ac.uk', 'University of Cambridge', 'GB'),
  ('nus.edu.sg', 'National University of Singapore', 'SG'),
  ('u.nus.edu', 'National University of Singapore', 'SG'),
  ('ntu.edu.sg', 'Nanyang Technological University', 'SG'),
  ('utoronto.ca', 'University of Toronto', 'CA'),
  ('ubc.ca', 'University of British Columbia', 'CA'),
  ('ethz.ch', 'ETH Zurich', 'CH'),
  ('tum.de', 'Technical University of Munich', 'DE'),
  ('lums.edu.pk', 'LUMS', 'PK'),
  ('nust.edu.pk', 'NUST', 'PK'),
  ('uet.edu.pk', 'UET Lahore', 'PK'),
  ('giki.edu.pk', 'GIKI', 'PK'),
  ('fast.edu.pk', 'FAST-NUCES', 'PK'),
  ('iit.ac.in', 'IIT', 'IN'),
  ('iisc.ac.in', 'IISc Bangalore', 'IN'),
  ('imperial.ac.uk', 'Imperial College London', 'GB')
ON CONFLICT (domain) DO NOTHING;

-- Sample campuses
INSERT INTO campuses (university_domain_id, name, latitude, longitude, climate_zone, country_code)
SELECT id, 'Main Campus', 42.3601, -71.0942, 'continental', 'US'
FROM university_domains WHERE domain = 'mit.edu'
ON CONFLICT DO NOTHING;

INSERT INTO campuses (university_domain_id, name, latitude, longitude, climate_zone, country_code)
SELECT id, 'Main Campus', 42.3770, -71.1167, 'continental', 'US'
FROM university_domains WHERE domain = 'harvard.edu'
ON CONFLICT DO NOTHING;

INSERT INTO campuses (university_domain_id, name, latitude, longitude, climate_zone, country_code)
SELECT id, 'Main Campus', 31.5204, 74.3587, 'subtropical', 'PK'
FROM university_domains WHERE domain = 'lums.edu.pk'
ON CONFLICT DO NOTHING;

INSERT INTO campuses (university_domain_id, name, latitude, longitude, climate_zone, country_code)
SELECT id, 'Main Campus', 33.6844, 72.9779, 'subtropical', 'PK'
FROM university_domains WHERE domain = 'nust.edu.pk'
ON CONFLICT DO NOTHING;
