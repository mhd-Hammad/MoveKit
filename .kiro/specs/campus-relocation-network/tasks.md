# Implementation Plan: Campus Relocation Network

## Overview

This implementation plan builds the Campus Relocation Network — an AI-powered, verified peer-to-peer platform for university student relocation. Tasks are ordered by dependency and priority tier (P0 first, then P1, then P2). The stack is Next.js 14 App Router, Supabase, Socket.io, Groq AI, shadcn/ui, Zustand, and Vitest + fast-check for testing.

## Tasks

- [ ] 1. Project scaffolding and core infrastructure
  - [ ] 1.1 Initialize Next.js 14 project with TypeScript, Tailwind CSS, and configure `tsconfig.json`, `next.config.js`, `tailwind.config.ts`, and `.env.example` with all required environment variable placeholders (SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, GROQ_API_KEY, GMAIL_USER, GMAIL_PASS, NEXT_PUBLIC_SOCKET_URL)
    - Create project root structure matching the design's file/folder layout
    - Install core dependencies: next@14, @supabase/supabase-js, socket.io, socket.io-client, nodemailer, groq-sdk, leaflet, react-leaflet, zustand, react-hook-form, zod, framer-motion, bcryptjs
    - Install dev dependencies: vitest, fast-check, @types/node, @types/bcryptjs, @types/nodemailer
    - _Requirements: All_

  - [ ] 1.2 Set up shadcn/ui component library with base components (Button, Card, Dialog, Input, Form, Toast, Badge, Tabs, Sheet, Avatar, DropdownMenu, Skeleton)
    - Configure shadcn/ui with Tailwind CSS
    - Add shared layout components: AppShell, Navbar, LoadingSkeleton, ErrorBoundary, AnimatedPage (Framer Motion page transitions)
    - _Requirements: All (UI foundation)_

  - [ ] 1.3 Create Supabase client configuration files (`src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/admin.ts`)
    - Browser client for client components
    - Server-side client for API routes and server components
    - Service-role admin client for privileged operations (OTP, admin actions)
    - _Requirements: All_

  - [ ] 1.4 Write Supabase database migration files for all core tables: `users`, `otp_records`, `university_domains`, `campuses`, `document_uploads`, `survival_blueprints`, `blueprint_items`, `arrival_timelines`, `timeline_tasks`, `listings`, `bundles`, `exit_flow_drafts`, `deals`, `deal_badges`, `chat_sessions`, `messages`, `message_reports`, `knowledge_tips`, `tip_votes`, `trust_events`, `notifications`, `notification_preferences`, `university_partnerships`, `admin_audit_log`
    - Write Row-Level Security (RLS) policies as specified in the design
    - Create indexes for performance (GIN index on listings title/description for FTS, spatial queries)
    - _Requirements: All_

  - [ ] 1.5 Create seed SQL file (`supabase/seed.sql`) with initial admin user (credentials from env vars), sample university domains (from open dataset), sample campus entries with coordinates and climate zones, and template blueprint data
    - _Requirements: 1.6, 1.8, 4.5, 26.3_

  - [ ] 1.6 Define TypeScript types and Zod validation schemas in `src/types/database.ts`, `src/types/api.ts`, `src/types/socket.ts`, and `src/lib/validation/schemas.ts`
    - All database table interfaces matching the design schema
    - All API request/response types
    - Socket.io event types
    - Zod schemas for every API input (reusable across routes)
    - _Requirements: All, 24.1, 24.4, 24.5_

  - [ ] 1.7 Set up Zustand stores (`src/stores/auth.ts`, `src/stores/blueprint.ts`, `src/stores/marketplace.ts`, `src/stores/chat.ts`, `src/stores/matching.ts`, `src/stores/notifications.ts`) with interfaces from design
    - _Requirements: All_

  - [ ] 1.8 Create Next.js middleware (`src/middleware.ts`) for route protection, JWT validation, role-based access (user vs admin), and rate limiting utility (`src/lib/utils/rate-limit.ts`)
    - Public routes: /login, /api/auth/*
    - Authenticated routes: all /api/* (except auth), all app pages
    - Admin routes: /admin/*, /api/admin/*
    - Rate limiting: OTP send 5/15min, OTP verify 3 attempts, general 100/min, location 5/24hr
    - _Requirements: 1.5, 3.3, 26.1, 26.2_

- [ ] 2. Checkpoint - Ensure project builds and types compile
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 3. University email OTP verification (P0)
  - [ ] 3.1 Implement university domain validation in `src/lib/validation/domains.ts` — load recognized university domains from database, expose `isValidUniversityDomain(domain: string): Promise<boolean>` function
    - _Requirements: 1.6, 1.7_

  - [ ] 3.2 Implement Nodemailer + Gmail SMTP email service in `src/lib/email/nodemailer.ts` — configure transporter, create `sendOtpEmail(email: string, otp: string): Promise<void>` function with HTML template
    - _Requirements: 1.1_

  - [ ] 3.3 Implement `POST /api/auth/send-otp` route — validate email domain, check rate limits, check lockout, generate 6-digit OTP via `crypto.randomInt`, hash with bcrypt, store in `otp_records` with 10-min expiry, send via Nodemailer
    - _Requirements: 1.1, 1.5, 1.6, 1.7_

  - [ ] 3.4 Implement `POST /api/auth/verify-otp` route — validate OTP against hash, check expiry (10 min), enforce 3-attempt limit with 15-min lockout, on success mark user as email_verified, store university domain, create session
    - _Requirements: 1.2, 1.3, 1.4, 1.5_

  - [ ] 3.5 Build login page UI at `src/app/(auth)/login/page.tsx` with `EmailForm` and `OtpInput` components — email input with domain validation feedback, 6-digit OTP entry with countdown timer, error/success states
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.7_

  - [ ]* 3.6 Write unit tests for OTP generation, domain validation, expiry logic, and attempt counting
    - Test OTP hash/verify cycle
    - Test domain validation against known/unknown domains
    - Test 10-min expiry detection
    - Test 3-attempt lockout logic
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 4. GPS Location Verification (P0)
  - [ ] 4.1 Implement haversine distance calculation in `src/lib/matching/haversine.ts` — `haversine(lat1, lon1, lat2, lon2): number` returning distance in km
    - _Requirements: 3.2, 9.3, 25.1_

  - [ ] 4.2 Implement `POST /api/verification/location` route — receive GPS coordinates, validate against campus locations using haversine (10km threshold), check accuracy metadata (reject if >100m), enforce 5 attempts/24hr rate limit, store only campus association + timestamp (never raw GPS), set 90-day expiry
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ] 4.3 Build location verification page at `src/app/(auth)/verify-location/page.tsx` with `LocationVerifier` component — request browser Geolocation API, show progress, handle permission denial with instructions, display distance feedback on failure
    - _Requirements: 3.1, 3.3, 3.6_

  - [ ] 4.4 Create `useGeolocation` hook in `src/hooks/useGeolocation.ts` — wraps Browser Geolocation API with 30-second timeout, error handling, and accuracy reporting
    - _Requirements: 3.1, 3.6_

  - [ ]* 4.5 Write unit tests for haversine distance calculation with known coordinate pairs
    - _Requirements: 3.2_

- [ ] 5. AI Survival Blueprint generation (P0)
  - [ ] 5.1 Implement Groq API client in `src/lib/ai/groq.ts` — configure with API key, model `llama-3.1-70b-versatile`, 15-second timeout, temperature 0.7, max tokens 4096
    - _Requirements: 4.1, 4.6_

  - [ ] 5.2 Create system prompts in `src/lib/ai/prompts.ts` — blueprint generation prompt with climate zone, housing type, budget, country context placeholders; timeline generation prompt; define Zod response schemas for parsing AI output
    - _Requirements: 4.2, 4.4, 5.1, 5.2, 6.1, 6.2_

  - [ ] 5.3 Implement fallback template system in `src/lib/ai/templates.ts` and `public/templates/` — pre-built template blueprints per housing type, served within 3 seconds when AI fails
    - _Requirements: 4.5_

  - [ ] 5.4 Implement `POST /api/blueprint/generate` route — validate inputs with Zod (university, housing type enum, budget 0-50000, arrival date not in past), call Groq with system prompt, parse response with Zod schema, fallback to template on timeout/error, store blueprint in database
    - _Requirements: 4.1, 4.2, 4.4, 4.5, 4.6, 4.7, 6.1, 6.2, 6.3, 6.4_

  - [ ] 5.5 Implement `GET /api/blueprint/:id`, `GET /api/blueprint/active`, and `PATCH /api/blueprint/:id` routes — fetch blueprint, get user's active blueprint, update items (add/remove/mark as obtained)
    - _Requirements: 4.3, 24.1, 24.2_

  - [ ] 5.6 Build blueprint form page at `src/app/(main)/blueprint/page.tsx` with `BlueprintForm` component — inputs for destination university (autocomplete from DB), housing type (select), budget range (slider/inputs), arrival date (date picker)
    - _Requirements: 4.1, 4.7_

  - [ ] 5.7 Build active blueprint view at `src/app/(main)/blueprint/[id]/page.tsx` with `BlueprintChecklist` and `BlueprintCategory` components — interactive checklist with categories, add/remove items, mark as obtained, climate info display, cultural norms section
    - _Requirements: 4.2, 4.3, 6.1, 6.2_

  - [ ]* 5.8 Write property test for blueprint serialization round-trip
    - **Property 6: Blueprint Serialization Round-Trip**
    - Generate random valid blueprints with all fields (university, housing type, budget, date, categorized items with modification states); serialize to JSON; deserialize back; verify identical field values, category structures, and item counts
    - **Validates: Requirements 24.3**

  - [ ]* 5.9 Write unit tests for blueprint generation input validation, fallback trigger, and Zod response schema parsing
    - Test invalid inputs rejection (negative budget, past date, empty housing type)
    - Test fallback activates on timeout simulation
    - Test Zod schema validates correct AI response format
    - _Requirements: 4.5, 4.7, 24.4, 24.5_

- [ ] 6. Marketplace listing creation (P0)
  - [ ] 6.1 Implement `POST /api/listings` route — validate inputs (title ≤100 chars, description ≤2000, price 0.01-999999.99, category, condition, 1-10 photos JPEG/PNG ≤5MB each), enforce location verification requirement, upload photos to Supabase Storage, associate listing with seller's campus
    - _Requirements: 7.1, 7.3, 7.4, 7.7_

  - [ ] 6.2 Implement `GET /api/listings`, `GET /api/listings/:id`, `PATCH /api/listings/:id`, `DELETE /api/listings/:id` routes — CRUD operations with status management (ACTIVE/RESERVED/SOLD), 30-day stale notification logic
    - _Requirements: 7.5, 7.6, 21.1_

  - [ ] 6.3 Build listing creation page at `src/app/(main)/marketplace/create/page.tsx` with `ListingForm` and `PhotoUploader` components — multi-photo upload with drag-and-drop, form validation, category/condition selects
    - _Requirements: 7.1, 7.7_

  - [ ] 6.4 Build listing detail page at `src/app/(main)/marketplace/[id]/page.tsx` — photo gallery, seller info with trust badge, price, description, category, condition, "Contact Seller" button
    - _Requirements: 7.1, 7.5_

  - [ ]* 6.5 Write unit tests for listing validation (title length, price range, photo count/size)
    - _Requirements: 7.1_

- [ ] 7. Matching algorithm (P0)
  - [ ] 7.1 Implement core matching algorithm in `src/lib/matching/algorithm.ts` — `computeMatchScore()` function with distance, price, trust, completeness sub-scores; `normalizeWeights()` function; composite score computation with boost factor; 25km radius filter
    - _Requirements: 9.1, 9.2, 9.3, 25.1, 25.2, 25.3, 25.4, 25.5, 25.6, 25.7_

  - [ ] 7.2 Implement `GET /api/matching` and `POST /api/matching/customize` routes — fetch matched listings for blueprint, pre-filter by 25km spatial query, compute scores, sort descending, support custom weight adjustment (each weight 0.05-0.95, sum to 1.0), re-rank within 3 seconds
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [ ] 7.3 Build matching page at `src/app/(main)/matching/page.tsx` with `MatchList`, `MatchCard`, and `WeightSliders` components — ranked results with score breakdown, adjustable weight sliders, "no matches" message
    - _Requirements: 9.1, 9.4, 9.6_

  - [ ]* 7.4 Write property test for matching algorithm score bounds
    - **Property 1: Matching Algorithm Score Bounds**
    - Generate random listings and blueprints with random valid weights; verify composite score ∈ [0.0, 1.0] for all inputs
    - **Validates: Requirements 25.1**

  - [ ]* 7.5 Write property test for matching algorithm determinism
    - **Property 2: Matching Algorithm Determinism**
    - Run same inputs multiple times with shuffled listing order; verify identical output scores and rankings
    - **Validates: Requirements 25.2**

  - [ ]* 7.6 Write property test for weight normalization invariant
    - **Property 3: Weight Normalization Invariant**
    - Generate arbitrary positive weight vectors; verify post-normalization sum ≈ 1.0 (±1e-10)
    - **Validates: Requirements 25.3**

  - [ ]* 7.7 Write property test for matching monotonicity
    - **Property 4: Matching Monotonicity**
    - Generate pairs of listings differing on one dimension (all others equal); verify higher sub-score → higher composite
    - **Validates: Requirements 25.5**

- [ ] 8. Checkpoint - Ensure core P0 foundation passes all tests
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Controlled communication / real-time chat (P0)
  - [ ] 9.1 Implement Socket.io server setup in `src/lib/chat/socket-server.ts` — JWT authentication on connection, room management (user:{userId}, chat:{sessionId}), event handlers for chat:join, chat:leave, chat:message, chat:typing
    - _Requirements: 11.1, 11.4_

  - [ ] 9.2 Implement contact info detection in `src/lib/chat/contact-detect.ts` — regex patterns for phone numbers, emails, social media handles, and URLs; `detectContactInfo(content: string): boolean` function
    - _Requirements: 11.7_

  - [ ] 9.3 Implement `POST /api/chat/sessions`, `GET /api/chat/sessions`, `GET /api/chat/sessions/:id/messages`, `POST /api/chat/sessions/:id/messages` routes — create session on match contact initiation, list user sessions, paginated message history, REST fallback for message sending
    - _Requirements: 11.1, 11.2, 11.3_

  - [ ] 9.4 Implement `POST /api/chat/sessions/:id/report` route — flag message for admin review, create message_reports record
    - _Requirements: 11.6_

  - [ ] 9.5 Create `useSocket` hook in `src/hooks/useSocket.ts` — Socket.io client connection with JWT, auto-reconnect, message queue on disconnect (30s retry), typing indicators
    - _Requirements: 11.4, 11.5_

  - [ ] 9.6 Build chat list page at `src/app/(main)/chat/page.tsx` and active chat page at `src/app/(main)/chat/[sessionId]/page.tsx` with `ChatWindow`, `MessageBubble`, `ChatInput`, `ContactWarning`, and `DealProposal` components
    - Support text (≤2000 chars), image sharing (≤5MB JPEG/PNG), video verification requests
    - Display contact warning overlay on flagged messages
    - "Report Message" option on each message
    - _Requirements: 11.1, 11.2, 11.3, 11.6, 11.7_

  - [ ]* 9.7 Write unit tests for contact info detection regex (phone, email, social, URL patterns)
    - _Requirements: 11.7_

- [ ] 10. Deal creation and lifecycle (P0)
  - [ ] 10.1 Implement `POST /api/deals` route — create deal proposal (status=PROPOSED) from chat session, specify price and item list, notify counterparty, enforce one active deal per listing
    - _Requirements: 12.1, 12.7_

  - [ ] 10.2 Implement `PATCH /api/deals/:id/accept`, `PATCH /api/deals/:id/reject`, `PATCH /api/deals/:id/cancel` routes — accept locks price/items/participants (status=ACTIVE), set listing to RESERVED, restrict chat to structured messages; reject/48hr timeout expires proposal; cancel returns listing to ACTIVE, record in behavior history
    - _Requirements: 12.2, 12.3, 12.4, 12.5, 12.6_

  - [ ] 10.3 Implement `POST /api/deals/:id/confirm` route — record buyer/seller independent confirmation, mark COMPLETED when both confirm, update listing to SOLD, award +5 trust to both, create deal badges, handle 72hr timeout (flag for dispute or expire)
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.7_

  - [ ] 10.4 Build deals list page at `src/app/(main)/deals/page.tsx` and deal detail page at `src/app/(main)/deals/[id]/page.tsx` with `DealCard`, `DealTimeline`, `ConfirmButton`, `MeetupScheduler` components — deal status progression, dual confirmation UI
    - _Requirements: 12.1, 12.2, 14.1_

  - [ ]* 10.5 Write unit tests for deal state transitions (proposed → active → completed, proposed → expired, active → cancelled)
    - _Requirements: 12.2, 12.5, 12.6, 14.1, 14.4, 14.5_

- [ ] 11. Trust score computation (P0)
  - [ ] 11.1 Implement trust score calculator in `src/lib/trust/calculator.ts` — `computeTrustScore(events: TrustEvent[]): number` with point values from design (+20 email, +10 doc, +10 location, +5 deal, -3 cancel, -5 dispute, +2 verification response, -1 verification ignored, -2 admin warning), floor at 0
    - _Requirements: 15.1, 15.4_

  - [ ] 11.2 Implement `GET /api/trust/:userId` route — fetch trust events, compute score, return breakdown; triggered recalculation within 5 seconds of trust-affecting events
    - _Requirements: 15.2, 15.3_

  - [ ] 11.3 Build trust display components: `TrustBadge` (score display), `VerificationBadges` (email/doc/location badges), `DealBadgeList` (deal badge gallery)
    - Display "New User" indicator when zero completed deals
    - _Requirements: 15.2, 16.3_

  - [ ]* 11.4 Write property test for trust score floor
    - **Property 5: Trust Score Floor**
    - Generate random sequences of trust events (including heavy penalty sequences with many cancellations and disputes); verify computed score ≥ 0 for all cases
    - **Validates: Requirements 15.4**

  - [ ]* 11.5 Write property test for trust score order-independence
    - **Property 7: Trust Score Additivity**
    - Generate random event sequences; shuffle order; recompute; verify identical result regardless of event ordering
    - **Validates: Requirements 15.1, 15.3**

- [ ] 12. Value lock system and deal badges (P0)
  - [ ] 12.1 Implement value lock enforcement — ensure trust points, ranking boosts, and badges are ONLY awarded through Dual_Confirmation pathway in the deal confirm route; no alternative pathway exists in codebase
    - _Requirements: 16.1, 16.2_

  - [ ] 12.2 Implement `GET /api/badges/:userId` route — return user's deal badges with tier, date, and deal reference; prevent duplicate badges per deal per user (unique constraint check)
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5_

  - [ ] 12.3 Implement deal badge display on profile — `DealBadgeList` component showing badges with completion date, navigable to deal summary, total count display
    - _Requirements: 17.2, 17.3_

- [ ] 13. Search and browse listings (P0)
  - [ ] 13.1 Implement `GET /api/listings` route enhanced with search — full-text search using PostgreSQL GIN index (case-insensitive, 2+ character query), filters (category, price range, condition, distance ≤50km), AND logic, pagination (20 per page), ranked by composite score, return within 3 seconds
    - _Requirements: 21.1, 21.2, 21.3, 21.5_

  - [ ] 13.2 Implement `GET /api/listings/map` route — return listings as GeoJSON for map rendering
    - _Requirements: 21.4_

  - [ ] 13.3 Build marketplace browse page at `src/app/(main)/marketplace/page.tsx` with `SearchBar`, `ListingGrid`, `ListingCard` components — search input, filter sidebar, grid results, "no results" message with suggestion
    - _Requirements: 21.1, 21.2, 21.5_

  - [ ] 13.4 Build map view page at `src/app/(main)/marketplace/map/page.tsx` with `MapView` component using React-Leaflet + OpenStreetMap — pins for each listing at campus location
    - _Requirements: 21.4_

- [ ] 14. Checkpoint - All P0 features complete and tested
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 15. Arrival timeline generation (P1)
  - [ ] 15.1 Implement `POST /api/timeline/generate` route — require finalized blueprint + arrival date, call Groq with timeline prompt, generate 5-20 tasks spanning -7 to +14 days, validate with Zod, fallback to template on failure
    - _Requirements: 5.1, 5.2, 5.4_

  - [ ] 15.2 Implement `GET /api/timeline/:id` and `PATCH /api/timeline/:id/tasks/:taskId` routes — fetch timeline, mark task complete with dependent task re-sequencing
    - _Requirements: 5.3_

  - [ ] 15.3 Build timeline view at `src/app/(main)/blueprint/timeline/page.tsx` with `TimelineView` component — day-based task display, mark complete, dependency visualization
    - _Requirements: 5.1, 5.2, 5.3_

- [ ] 16. Climate and culture intelligence (P1)
  - [ ] 16.1 Enhance blueprint generation prompt to include climate data (avg high/low temp, precipitation, season summary) and cultural norms (≥3 from tipping, etiquette, transport, academic culture) from AI response
    - Display climate section and cultural norms in blueprint view
    - Handle unavailable data gracefully with notice to user
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 17. Community knowledge graph (P1)
  - [ ] 17.1 Implement `POST /api/tips`, `GET /api/tips`, `POST /api/tips/:id/vote` routes — submit tip (20-500 chars, topic category, require location-verified outgoing student), fetch tips for campus (sorted by helpfulness descending then date, paginated 20/page), vote with one-vote-per-user constraint (allow changes)
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5_

  - [ ] 17.2 Build tips page at `src/app/(main)/tips/page.tsx` with `TipList`, `TipCard`, `TipForm` components — paginated feed, upvote/downvote, submit new tip form with topic selector
    - _Requirements: 18.1, 18.2, 18.3, 18.4_

- [ ] 18. Mental health check-in layer (P1)
  - [ ] 18.1 Implement `GET /api/wellness/pulse`, `POST /api/wellness/respond`, `PATCH /api/wellness/opt-out` routes — send wellness notification every 7 days within 30 days of arrival (max 4), structured response with ordinal options, display resources on lowest well-being selection, discard response data after navigation, opt-out support
    - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5, 20.6_

  - [ ] 18.2 Build wellness components: `WellnessPulse` modal and `ResourceList` component — periodic check-in UI, mental health resources display (university-specific or generic fallback)
    - _Requirements: 20.1, 20.2, 20.3_

- [ ] 19. User profile management (P1)
  - [ ] 19.1 Implement `GET /api/profile`, `PATCH /api/profile`, `DELETE /api/profile` routes — display profile fields (name, university, badges, trust score, deal badges count, deals count, member since), validate name (2-50 chars, alphanumeric/spaces/hyphens/underscores), account deletion with double confirmation (anonymize deals, remove personal data, preserve anonymous tips)
    - _Requirements: 22.1, 22.2, 22.3, 22.4, 22.5_

  - [ ] 19.2 Build profile pages at `src/app/(main)/profile/page.tsx` (own) and `src/app/(main)/profile/[userId]/page.tsx` (others) with `ProfileCard`, `ProfileEditor`, `DeleteAccountModal` components
    - _Requirements: 22.1, 22.2, 22.3_

- [ ] 20. Notification system (P1)
  - [ ] 20.1 Implement `GET /api/notifications`, `PATCH /api/notifications/:id/read`, `PATCH /api/notifications/preferences` routes — paginated notifications, mark read, preference per category (matches, messages, deals, wellness)
    - _Requirements: 23.1, 23.2, 23.3, 23.4, 23.5, 23.6_

  - [ ] 20.2 Integrate notification dispatching into existing routes — emit Socket.io `notification:new` events on match (≤60s), message (≤2s), deal status change (≤30s)
    - _Requirements: 23.1, 23.2, 23.3_

  - [ ] 20.3 Build notification UI: `NotificationBell` (header icon + unread count badge), `NotificationList`, `NotificationItem` components at `src/app/(main)/notifications/page.tsx`
    - Create `useNotifications` hook for real-time notification subscription
    - _Requirements: 23.4, 23.6_

- [ ] 21. Checkpoint - All P1 features complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 22. Document badge verification (P2)
  - [ ] 22.1 Implement `POST /api/verification/document` and `GET /api/verification/document/status` routes — upload to private Supabase Storage bucket (JPEG/PNG/PDF, 10KB-5MB), enforce 1 pending per user, admin-only access via signed URLs
    - _Requirements: 2.1, 2.3, 2.4, 2.6_

  - [ ] 22.2 Implement admin document review flow in `PATCH /api/admin/documents/:id` — approve (award badge + trust event +10, schedule 7-day deletion) or reject (notify user, allow re-upload)
    - _Requirements: 2.2, 2.5_

- [ ] 23. Exit flow for graduating students (P2)
  - [ ] 23.1 Implement `POST /api/exit-flow/start`, `PATCH /api/exit-flow/draft`, `POST /api/exit-flow/publish` routes — guided session for up to 20 bundles (2-20 items each), suggest category-based groupings, validate all bundles on publish, save draft for 7 days on abandon
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ] 23.2 Build exit flow page at `src/app/(main)/marketplace/exit-flow/page.tsx` with `BundleBuilder` component — multi-step guided interface, suggested bundles, validation feedback
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 24. Boosted listings placeholder (P2)
  - [ ] 24.1 Add disabled "Boost Listing" button to listing UI with "Coming Soon" tooltip, ensure matching algorithm accepts `boost_factor` parameter (1.0-3.0) in scoring formula (default 1.0)
    - _Requirements: 10.1, 10.2, 10.3_

- [ ] 25. Real-world exchange support (P2)
  - [ ] 25.1 Implement `POST /api/deals/:id/meetup` and `POST /api/deals/:id/checkin` routes — confirm meetup time/location via structured messages, optional GPS check-in (within 500m of meetup location, ±60 min of agreed time), display confirmation to both parties
    - _Requirements: 13.1, 13.2, 13.3, 13.4_

  - [ ] 25.2 Build meetup UI with `MeetupScheduler` component — time/location picker, check-in button, distance feedback on failure
    - _Requirements: 13.1, 13.2, 13.3_

- [ ] 26. University partnership integration (P2 - Future)
  - [ ] 26.1 Implement `POST /api/admin/partnerships` and `GET /api/partner/analytics` routes — admin creates partnership with domain + API key, partner dashboard shows aggregate analytics (students onboarded, deal rates, top categories), API key auth, no individual user data exposed
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5_

- [ ] 27. Admin dashboard (P0)
  - [ ] 27.1 Build admin layout at `src/app/admin/layout.tsx` with sidebar navigation, admin role guard
    - _Requirements: 26.1, 26.2_

  - [ ] 27.2 Build admin dashboard page at `src/app/admin/page.tsx` — aggregate stats (total users, active listings, completed deals, average trust score)
    - _Requirements: 26.9_

  - [ ] 27.3 Implement dispute resolution at `src/app/admin/disputes/page.tsx` and `PATCH /api/admin/disputes/:id` route — display pending disputes with deal details + last 50 chat messages, resolve as buyer-favor/seller-favor (complete deal + notify) or dismiss (return to active)
    - _Requirements: 14.6, 26.4, 26.5, 26.6_

  - [ ] 27.4 Implement message reports at `src/app/admin/reports/page.tsx` and `PATCH /api/admin/reports/:id` route — show reported message with 5 messages context before/after, dismiss or warn user (-2 trust + notification)
    - _Requirements: 26.7, 26.8_

  - [ ] 27.5 Implement university domain management at `src/app/admin/domains/page.tsx` with `POST /api/admin/domains` and `DELETE /api/admin/domains/:id` routes — add/remove university domains
    - _Requirements: 1.8, 26.1_

  - [ ] 27.6 Implement document verification queue at `src/app/admin/documents/page.tsx` — list pending documents, approve/reject interface
    - _Requirements: 2.1, 2.2, 2.5_

- [ ] 28. Dashboard and landing pages
  - [ ] 28.1 Build role-based dashboard at `src/app/(main)/dashboard/page.tsx` — incoming student view (active blueprint, matches, upcoming timeline tasks), outgoing student view (active listings, pending deals), shared (notifications, trust score)
    - _Requirements: All (orchestration)_

  - [ ] 28.2 Build landing page at `src/app/page.tsx` — platform overview, call-to-action to verify email, feature highlights
    - _Requirements: All (entry point)_

- [ ] 29. Final checkpoint - Full integration
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- P0 tasks (3-14, 27) form the complete demo-ready core loop
- P1 tasks (15-21) add high-value AI intelligence and social features
- P2 tasks (22-26) are polish features and deferred monetization
- The tech stack is TypeScript throughout: Next.js 14, Supabase, Socket.io, Groq, Vitest + fast-check

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["1.4", "1.5", "1.6"] },
    { "id": 3, "tasks": ["1.7", "1.8"] },
    { "id": 4, "tasks": ["3.1", "3.2", "4.1", "4.4"] },
    { "id": 5, "tasks": ["3.3", "4.2", "5.1"] },
    { "id": 6, "tasks": ["3.4", "3.5", "4.3", "5.2", "5.3"] },
    { "id": 7, "tasks": ["3.6", "4.5", "5.4"] },
    { "id": 8, "tasks": ["5.5", "5.6", "6.1"] },
    { "id": 9, "tasks": ["5.7", "5.8", "5.9", "6.2", "6.3"] },
    { "id": 10, "tasks": ["6.4", "6.5", "7.1"] },
    { "id": 11, "tasks": ["7.2", "7.4", "7.5", "7.6", "7.7"] },
    { "id": 12, "tasks": ["7.3", "9.1", "9.2"] },
    { "id": 13, "tasks": ["9.3", "9.4", "9.5"] },
    { "id": 14, "tasks": ["9.6", "9.7", "11.1"] },
    { "id": 15, "tasks": ["10.1", "11.2", "11.3"] },
    { "id": 16, "tasks": ["10.2", "11.4", "11.5"] },
    { "id": 17, "tasks": ["10.3", "12.1"] },
    { "id": 18, "tasks": ["10.4", "10.5", "12.2", "12.3"] },
    { "id": 19, "tasks": ["13.1", "13.2"] },
    { "id": 20, "tasks": ["13.3", "13.4"] },
    { "id": 21, "tasks": ["27.1", "27.5"] },
    { "id": 22, "tasks": ["27.2", "27.3", "27.4", "27.6"] },
    { "id": 23, "tasks": ["15.1", "16.1", "17.1"] },
    { "id": 24, "tasks": ["15.2", "15.3", "17.2", "18.1"] },
    { "id": 25, "tasks": ["18.2", "19.1", "20.1"] },
    { "id": 26, "tasks": ["19.2", "20.2", "20.3"] },
    { "id": 27, "tasks": ["22.1", "23.1", "24.1", "25.1", "26.1"] },
    { "id": 28, "tasks": ["22.2", "23.2", "25.2"] },
    { "id": 29, "tasks": ["28.1", "28.2"] }
  ]
}
```
