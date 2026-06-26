// ============================================================
// CORE DATABASE TYPES
// Maps directly to Supabase PostgreSQL schema
// ============================================================

// --- USERS & AUTH ---

export type UserRole = 'user' | 'admin'
export type UserRoleType = 'incoming' | 'outgoing'

export interface User {
  id: string
  email: string
  display_name: string
  first_name: string
  last_name: string
  university_domain: string
  email_verified: boolean
  document_verified: boolean
  location_verified: boolean
  campus_id: string | null
  location_verified_at: string | null
  trust_score: number
  role: UserRole
  role_type: UserRoleType
  current_country: string
  profile_completed: boolean
  password_hash: string
  created_at: string
  updated_at: string
  wellness_opt_out: boolean
}

export interface OtpRecord {
  id: string
  email: string
  otp_hash: string
  expires_at: string
  attempts: number
  locked_until: string | null
  created_at: string
}

// --- UNIVERSITIES & CAMPUSES ---

export interface UniversityDomain {
  id: string
  domain: string
  university_name: string
  country: string
  is_active: boolean
  created_at: string
}

export interface Campus {
  id: string
  university_domain_id: string
  name: string
  latitude: number
  longitude: number
  climate_zone: string
  country_code: string
  created_at: string
}

// --- DOCUMENT VERIFICATION ---

export type DocumentStatus = 'pending' | 'approved' | 'rejected'

export interface DocumentUpload {
  id: string
  user_id: string
  storage_path: string
  status: DocumentStatus
  reviewed_by: string | null
  reviewed_at: string | null
  rejection_reason: string | null
  created_at: string
}

// --- BLUEPRINTS & TIMELINES ---

export type HousingType = 'dormitory' | 'shared_apartment' | 'studio_apartment' | 'homestay'

export type BlueprintCategory =
  | 'climate_kit'
  | 'housing_essentials'
  | 'electronics_adapters'
  | 'kitchen_essentials'
  | 'local_setup_tasks'

export interface ClimateInfo {
  avg_high: number
  avg_low: number
  precipitation_mm: number
  season: string
}

export interface SurvivalBlueprint {
  id: string
  user_id: string
  destination_campus_id: string
  housing_type: HousingType
  budget_min: number
  budget_max: number
  arrival_date: string
  climate_info: ClimateInfo | null
  cultural_norms: string[] | null
  is_finalized: boolean
  created_at: string
  updated_at: string
}

export interface BlueprintItem {
  id: string
  blueprint_id: string
  category: BlueprintCategory
  name: string
  description: string | null
  is_obtained: boolean
  sort_order: number
  created_at: string
}

export interface ArrivalTimeline {
  id: string
  blueprint_id: string
  user_id: string
  created_at: string
}

export interface TimelineTask {
  id: string
  timeline_id: string
  title: string
  description: string | null
  day_offset: number
  depends_on: string | null
  is_completed: boolean
  completed_at: string | null
  sort_order: number
}

// --- LISTINGS & BUNDLES ---

export type ListingCondition = 'new' | 'like_new' | 'good' | 'fair'
export type ListingStatus = 'active' | 'reserved' | 'sold'
export type BundleStatus = 'draft' | 'active' | 'reserved' | 'sold'

export interface Listing {
  id: string
  seller_id: string
  campus_id: string
  title: string
  description: string
  price: number
  category: string
  condition: ListingCondition
  status: ListingStatus
  bundle_id: string | null
  boost_factor: number
  photos: string[]
  last_interaction_at: string | null
  created_at: string
  updated_at: string
}

export interface Bundle {
  id: string
  seller_id: string
  title: string
  description: string
  total_price: number
  status: BundleStatus
  created_at: string
}

export interface ExitFlowDraft {
  id: string
  user_id: string
  draft_data: Record<string, unknown>
  expires_at: string
  created_at: string
}

// --- DEALS ---

export type DealStatus = 'proposed' | 'active' | 'completed' | 'cancelled' | 'expired' | 'disputed'

export interface Deal {
  id: string
  listing_id: string
  buyer_id: string
  seller_id: string
  status: DealStatus
  locked_price: number
  locked_items: Record<string, unknown>
  meetup_time: string | null
  meetup_lat: number | null
  meetup_lon: number | null
  buyer_confirmed: boolean
  seller_confirmed: boolean
  buyer_confirmed_at: string | null
  seller_confirmed_at: string | null
  proposed_at: string
  accepted_at: string | null
  completed_at: string | null
  cancelled_by: string | null
  cancelled_at: string | null
  expires_at: string
  created_at: string
}

export type BadgeTier = 'free' | string

export interface DealBadge {
  id: string
  user_id: string
  deal_id: string
  tier: BadgeTier
  awarded_at: string
}

// --- CHAT ---

export type MessageType = 'text' | 'image' | 'video_request' | 'meetup_proposal' | 'system'
export type ReportStatus = 'pending' | 'dismissed' | 'warned'

export interface ChatSession {
  id: string
  buyer_id: string
  seller_id: string
  listing_id: string
  deal_id: string | null
  is_restricted: boolean
  created_at: string
}

export interface Message {
  id: string
  session_id: string
  sender_id: string
  content: string
  message_type: MessageType
  media_url: string | null
  has_contact_warning: boolean
  is_reported: boolean
  created_at: string
}

export interface MessageReport {
  id: string
  message_id: string
  reporter_id: string
  reason: string
  status: ReportStatus
  reviewed_by: string | null
  created_at: string
}

// --- KNOWLEDGE GRAPH ---

export type TipTopic = 'housing' | 'transportation' | 'food' | 'academics' | 'social_life'

export interface KnowledgeTip {
  id: string
  author_id: string
  campus_id: string
  topic: TipTopic
  body: string
  upvotes: number
  downvotes: number
  created_at: string
}

export type VoteType = 'up' | 'down'

export interface TipVote {
  id: string
  tip_id: string
  user_id: string
  vote: VoteType
  created_at: string
}

// --- TRUST & BEHAVIOR ---

export type TrustEventType =
  | 'deal_completed'
  | 'deal_cancelled'
  | 'dispute'
  | 'verification_response'
  | 'verification_ignored'
  | 'email_verified'
  | 'document_verified'
  | 'location_verified'
  | 'admin_warning'

export interface TrustEvent {
  id: string
  user_id: string
  event_type: TrustEventType
  points: number
  reference_id: string | null
  created_at: string
}

// --- NOTIFICATIONS ---

export type NotificationCategory = 'match' | 'message' | 'deal' | 'wellness' | 'system'

export interface Notification {
  id: string
  user_id: string
  category: NotificationCategory
  title: string
  body: string
  link: string | null
  is_read: boolean
  created_at: string
}

export interface NotificationPreferences {
  user_id: string
  matches_enabled: boolean
  messages_enabled: boolean
  deals_enabled: boolean
  wellness_enabled: boolean
}

// --- PARTNERSHIPS ---

export interface UniversityPartnership {
  id: string
  university_domain_id: string
  admin_email: string
  api_key_hash: string
  is_active: boolean
  created_at: string
}

// --- ADMIN ---

export interface AdminAuditLog {
  id: string
  admin_id: string
  action: string
  target_type: string
  target_id: string
  details: Record<string, unknown>
  created_at: string
}
