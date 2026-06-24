import { z } from 'zod'

// ============================================================
// AUTH SCHEMAS
// ============================================================

export const sendOtpSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .transform((e) => e.toLowerCase().trim()),
})

export const verifyOtpSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .transform((e) => e.toLowerCase().trim()),
  otp: z
    .string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only digits'),
})

// ============================================================
// LOCATION VERIFICATION SCHEMAS
// ============================================================

export const locationVerifySchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().min(0).max(100, 'GPS accuracy too low (must be ≤100m)'),
})

// ============================================================
// BLUEPRINT SCHEMAS
// ============================================================

export const housingTypes = [
  'dormitory',
  'shared_apartment',
  'studio_apartment',
  'homestay',
] as const

export const generateBlueprintSchema = z.object({
  university_campus_id: z.string().uuid('Invalid campus ID'),
  housing_type: z.enum(housingTypes),
  budget_min: z.number().min(0).max(50000),
  budget_max: z.number().min(0).max(50000),
  arrival_date: z.string().refine(
    (date) => {
      const arrival = new Date(date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return arrival >= today
    },
    { message: 'Arrival date cannot be in the past' }
  ),
}).refine(
  (data) => data.budget_max >= data.budget_min,
  { message: 'Max budget must be greater than or equal to min budget', path: ['budget_max'] }
)

export const blueprintCategories = [
  'climate_kit',
  'housing_essentials',
  'electronics_adapters',
  'kitchen_essentials',
  'local_setup_tasks',
] as const

export const addBlueprintItemSchema = z.object({
  category: z.enum(blueprintCategories),
  name: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
})

export const updateBlueprintItemSchema = z.object({
  item_id: z.string().uuid(),
  action: z.enum(['mark_obtained', 'mark_needed', 'remove']),
})

// ============================================================
// LISTING SCHEMAS
// ============================================================

export const listingConditions = ['new', 'like_new', 'good', 'fair'] as const

export const createListingSchema = z.object({
  title: z.string().min(1).max(100, 'Title must be 100 characters or less'),
  description: z.string().min(1).max(2000, 'Description must be 2000 characters or less'),
  price: z.number().min(0.01, 'Price must be at least 0.01').max(999999.99),
  category: z.string().min(1),
  condition: z.enum(listingConditions),
})

export const listingSearchSchema = z.object({
  query: z.string().min(2).max(100).optional(),
  category: z.string().optional(),
  condition: z.enum(listingConditions).optional(),
  min_price: z.number().min(0).optional(),
  max_price: z.number().max(999999.99).optional(),
  max_distance_km: z.number().min(1).max(50).optional(),
  page: z.number().int().min(1).default(1),
  per_page: z.number().int().min(1).max(50).default(20),
})

// ============================================================
// DEAL SCHEMAS
// ============================================================

export const createDealSchema = z.object({
  listing_id: z.string().uuid(),
  price: z.number().min(0.01).max(999999.99),
  items: z.record(z.string(), z.unknown()),
})

// ============================================================
// MATCHING SCHEMAS
// ============================================================

export const matchWeightsSchema = z.object({
  distance: z.number().min(0.05).max(0.95),
  price: z.number().min(0.05).max(0.95),
  trust: z.number().min(0.05).max(0.95),
  completeness: z.number().min(0.05).max(0.95),
}).refine(
  (weights) => {
    const sum = weights.distance + weights.price + weights.trust + weights.completeness
    return Math.abs(sum - 1.0) < 0.01
  },
  { message: 'Weights must sum to 1.0' }
)

// ============================================================
// CHAT SCHEMAS
// ============================================================

export const sendMessageSchema = z.object({
  content: z.string().min(1).max(2000),
  message_type: z.enum(['text', 'image', 'video_request', 'meetup_proposal']),
  media_url: z.string().url().optional(),
})

export const createChatSessionSchema = z.object({
  listing_id: z.string().uuid(),
  seller_id: z.string().uuid(),
})

// ============================================================
// KNOWLEDGE TIPS SCHEMAS
// ============================================================

export const tipTopics = [
  'housing',
  'transportation',
  'food',
  'academics',
  'social_life',
] as const

export const createTipSchema = z.object({
  topic: z.enum(tipTopics),
  body: z.string().min(20, 'Tip must be at least 20 characters').max(500, 'Tip must be 500 characters or less'),
})

export const tipVoteSchema = z.object({
  vote: z.enum(['up', 'down']),
})

// ============================================================
// PROFILE SCHEMAS
// ============================================================

export const updateProfileSchema = z.object({
  display_name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be 50 characters or less')
    .regex(/^[a-zA-Z0-9 _-]+$/, 'Name can only contain letters, numbers, spaces, hyphens, and underscores'),
})

// ============================================================
// AI RESPONSE SCHEMAS (for parsing Groq output)
// ============================================================

export const aiBlueprintItemSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
})

export const aiBlueprintCategorySchema = z.object({
  category: z.enum(blueprintCategories),
  items: z.array(aiBlueprintItemSchema).min(3),
})

export const aiBlueprintResponseSchema = z.object({
  categories: z.array(aiBlueprintCategorySchema).min(5),
  climate_info: z.object({
    avg_high: z.number(),
    avg_low: z.number(),
    precipitation_mm: z.number(),
    season: z.string(),
  }).optional(),
  cultural_norms: z.array(z.string()).min(3).optional(),
})

export const aiTimelineTaskSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  day_offset: z.number().min(-7).max(14),
  depends_on_index: z.number().optional(),
})

export const aiTimelineResponseSchema = z.object({
  tasks: z.array(aiTimelineTaskSchema).min(5).max(20),
})
