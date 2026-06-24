// ============================================================
// API REQUEST/RESPONSE TYPES
// ============================================================

import type {
  HousingType,
  ListingCondition,
  DealStatus,
  TipTopic,
  NotificationCategory,
} from './database'

// --- AUTH ---

export interface SendOtpRequest {
  email: string
}

export interface SendOtpResponse {
  message: string
}

export interface VerifyOtpRequest {
  email: string
  otp: string
}

export interface VerifyOtpResponse {
  token: string
  user: {
    id: string
    email: string
    display_name: string
    email_verified: boolean
  }
}

// --- LOCATION VERIFICATION ---

export interface LocationVerifyRequest {
  latitude: number
  longitude: number
  accuracy: number
}

export interface LocationVerifyResponse {
  verified: boolean
  campus_name?: string
  distance_km?: number
  message: string
}

// --- BLUEPRINT ---

export interface GenerateBlueprintRequest {
  university_campus_id: string
  housing_type: HousingType
  budget_min: number
  budget_max: number
  arrival_date: string
}

export interface BlueprintResponse {
  id: string
  categories: {
    category: string
    items: {
      name: string
      description: string | null
      is_obtained: boolean
    }[]
  }[]
  climate_info: {
    avg_high: number
    avg_low: number
    precipitation_mm: number
    season: string
  } | null
  cultural_norms: string[] | null
  is_finalized: boolean
  fallback: boolean
}

export interface UpdateBlueprintItemRequest {
  item_id: string
  action: 'mark_obtained' | 'mark_needed' | 'remove'
}

export interface AddBlueprintItemRequest {
  category: string
  name: string
  description?: string
}

// --- TIMELINE ---

export interface GenerateTimelineRequest {
  blueprint_id: string
}

export interface TimelineResponse {
  id: string
  tasks: {
    id: string
    title: string
    description: string | null
    day_offset: number
    depends_on: string | null
    is_completed: boolean
  }[]
}

// --- LISTINGS ---

export interface CreateListingRequest {
  title: string
  description: string
  price: number
  category: string
  condition: ListingCondition
  photos: File[] | string[]
}

export interface ListingSearchParams {
  query?: string
  category?: string
  condition?: ListingCondition
  min_price?: number
  max_price?: number
  max_distance_km?: number
  page?: number
  per_page?: number
}

export interface ListingResponse {
  id: string
  title: string
  description: string
  price: number
  category: string
  condition: ListingCondition
  status: string
  photos: string[]
  seller: {
    id: string
    display_name: string
    trust_score: number
    email_verified: boolean
    location_verified: boolean
  }
  campus_name: string
  created_at: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

// --- MATCHING ---

export interface MatchWeights {
  distance: number
  price: number
  trust: number
  completeness: number
}

export interface MatchResult {
  listing: ListingResponse
  score: number
  breakdown: {
    distance_score: number
    price_score: number
    trust_score: number
    completeness_score: number
  }
}

export interface CustomizeWeightsRequest {
  weights: MatchWeights
}

// --- DEALS ---

export interface CreateDealRequest {
  listing_id: string
  price: number
  items: Record<string, unknown>
}

export interface DealResponse {
  id: string
  listing_id: string
  buyer_id: string
  seller_id: string
  status: DealStatus
  locked_price: number
  locked_items: Record<string, unknown>
  meetup_time: string | null
  buyer_confirmed: boolean
  seller_confirmed: boolean
  created_at: string
}

// --- CHAT ---

export interface CreateChatSessionRequest {
  listing_id: string
  seller_id: string
}

export interface SendMessageRequest {
  content: string
  message_type: 'text' | 'image' | 'video_request' | 'meetup_proposal'
  media_url?: string
}

export interface ChatSessionResponse {
  id: string
  other_user: {
    id: string
    display_name: string
    trust_score: number
  }
  listing: {
    id: string
    title: string
    price: number
  }
  is_restricted: boolean
  last_message: string | null
  unread_count: number
}

// --- TRUST ---

export interface TrustScoreResponse {
  total: number
  breakdown: {
    identity_trust: number
    location_trust: number
    behavior_trust: number
    interaction_trust: number
  }
  completed_deals: number
  is_new_user: boolean
}

// --- KNOWLEDGE TIPS ---

export interface CreateTipRequest {
  topic: TipTopic
  body: string
}

export interface TipResponse {
  id: string
  author: {
    id: string
    display_name: string
    trust_score: number
  }
  topic: TipTopic
  body: string
  score: number
  user_vote: 'up' | 'down' | null
  created_at: string
}

// --- NOTIFICATIONS ---

export interface NotificationResponse {
  id: string
  category: NotificationCategory
  title: string
  body: string
  link: string | null
  is_read: boolean
  created_at: string
}

// --- GENERIC ---

export interface ApiError {
  error: string
  details?: Record<string, string[]>
}

export interface ApiSuccess {
  message: string
}
