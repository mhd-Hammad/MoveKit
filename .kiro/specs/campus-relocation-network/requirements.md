# Requirements Document

## Introduction

Campus Relocation Network is an AI-powered, verified peer-to-peer platform that helps incoming university students prepare for relocation by generating personalized survival kits and matching them with outgoing students selling relevant items nearby. The system uses reputation-based trust, structured deal completion, and bypass prevention to create a safe, reliable relocation infrastructure — not just a marketplace. The platform targets international students who face confusion about what to bring, expensive duplicate purchases, lack of local knowledge, and unsafe peer-to-peer transactions across fragmented social media groups.

**Hackathon Context:** This project is built for the Youth Code x AI hackathon (Track 03/05) with judging criteria focused on originality, social value, presentation, and UX. All infrastructure uses free-tier or open-source tools with zero budget.

**Priority Tiers:**
- **P0 (Must Demo):** Requirements 1, 3, 4, 7, 9, 11, 12, 14, 15, 16, 21, 24, 25 — Full core loop from verification through deal completion
- **P1 (High Demo Value):** Requirements 5, 6, 18, 20, 22, 23 — AI intelligence features and social value
- **P2 (Nice to Have):** Requirements 2, 8, 10, 13, 17, 19 — Polish features and deferred monetization

## Glossary

- **Platform**: The Campus Relocation Network application system
- **Incoming_Student**: A verified user who is relocating to a university and seeking items/guidance
- **Outgoing_Student**: A verified user who is leaving a university and listing items/bundles for sale
- **Survival_Blueprint**: An AI-generated personalized checklist of items and tasks for a relocating student
- **AI_Engine**: The local AI inference service (Ollama/Groq/Gemini free tier) that generates survival blueprints and recommendations
- **Matching_Algorithm**: The custom weighted algorithm that ranks listings by distance, price, trust score, and checklist completeness
- **Trust_Score**: A composite numeric score reflecting a user's identity verification, location verification, behavior history, and interaction responsiveness
- **Deal**: A structured transaction record with locked price, locked items, locked participants, and a unique Deal ID
- **Bundle**: A grouped set of items listed together by an outgoing student
- **Verification_Badge**: A visual indicator that a user has completed identity or document verification
- **Deal_Badge**: A purchasable trust badge awarded after successful deal completion
- **Boosted_Listing**: A listing that has been promoted via payment to rank higher in search results
- **Value_Lock_System**: The mechanism that ensures trust, ranking, and badges are only gained through in-app deal completion
- **Arrival_Timeline**: An AI-generated time-sequenced action plan for a student's first days at a new location
- **Knowledge_Graph**: A collection of verified tips and advice left by senior/outgoing students
- **Chat_Session**: An in-app real-time messaging session between matched users
- **Meetup**: A real-world exchange event where buyer and seller meet to complete a deal
- **Dual_Confirmation**: The process where both buyer and seller independently confirm deal completion

## Requirements

### Requirement 1: University Email Verification

**User Story:** As an incoming or outgoing student, I want to verify my identity using my university email, so that only legitimate students can access the platform.

#### Acceptance Criteria

1. WHEN a user submits a university email address, THE Platform SHALL send a 6-digit numeric one-time password (OTP) to that email address within 30 seconds
2. WHEN a user submits a valid OTP within 10 minutes of issuance, THE Platform SHALL mark the user's account as email-verified and store the associated university domain
3. IF a user submits an OTP after the 10-minute expiration window, THEN THE Platform SHALL reject the OTP, display a message indicating the code has expired, and allow the user to request a new OTP
4. IF a user submits an invalid OTP, THEN THE Platform SHALL display an error message indicating the code is incorrect and allow up to 3 retry attempts
5. IF a user exceeds 3 OTP retry attempts, THEN THE Platform SHALL lock the verification process for that email for 15 minutes
6. THE Platform SHALL only accept email addresses from recognized university domains sourced from an open dataset of global university email domains
7. IF a user submits an email address with a domain not present in the recognized university domains list, THEN THE Platform SHALL reject the submission and display an error message indicating the domain is not recognized
8. THE Platform SHALL allow administrators to manually add or remove university domains from the accepted list

### Requirement 2: Optional Document Badge Verification

**User Story:** As a student, I want to optionally upload identity documents, so that I can earn higher trust and stand out as a verified user.

#### Acceptance Criteria

1. WHEN an email-verified user uploads a student ID document, THE Platform SHALL store the document in access-controlled storage accessible only to admin users and flag the account for document review
2. WHEN a document is approved by an administrator, THE Platform SHALL award a Verification_Badge to the user's profile and notify the user of approval
3. IF a document upload fails validation (unsupported format, file too large), THEN THE Platform SHALL display an error message indicating whether the failure was due to unsupported format or exceeded file size
4. THE Platform SHALL accept documents in JPEG, PNG, or PDF formats with a file size between 10KB and 5MB
5. IF an administrator rejects a submitted document, THEN THE Platform SHALL notify the user that verification was not approved, remove the pending review flag, and allow the user to upload a replacement document
6. THE Platform SHALL allow a maximum of 1 pending document upload per user at a time; a new upload SHALL replace any previously pending document that has not yet been reviewed

### Requirement 3: Location Verification

**User Story:** As a student, I want to verify my physical location near campus, so that buyers and sellers can trust geographic proximity.

#### Acceptance Criteria

1. WHEN a user initiates location verification, THE Platform SHALL request GPS coordinates from the user's device and wait up to 30 seconds for a response
2. WHEN GPS coordinates are received within 10 km of a registered university campus, THE Platform SHALL mark the user's profile as location-verified for that campus with a verification timestamp, and the verification SHALL remain valid for 90 days
3. IF GPS coordinates are outside the 10 km radius, THEN THE Platform SHALL notify the user that location verification failed, display the detected distance from the nearest registered campus, suggest retrying when closer to campus, and limit verification attempts to 5 per 24-hour period
4. THE Platform SHALL store only the verified campus association and verification timestamp, not raw GPS coordinates, for privacy
5. THE Platform SHALL allow only one active university association per user at a time; changing university requires re-verification which replaces the previous campus association
6. IF the user's device denies GPS permission or GPS coordinates cannot be acquired within the 30-second timeout, THEN THE Platform SHALL display an error message indicating that location access is required for verification and provide instructions for enabling location services

### Requirement 4: AI Survival Blueprint Generation

**User Story:** As an incoming student, I want to receive a personalized list of items and tasks I need for my relocation, so that I know exactly what to prepare without guesswork.

#### Acceptance Criteria

1. WHEN an Incoming_Student provides destination university, housing type (one of: dormitory, shared apartment, studio apartment, or homestay), budget range (between 0 and 50,000 USD), and arrival date, THE AI_Engine SHALL generate a Survival_Blueprint within 15 seconds
2. THE Survival_Blueprint SHALL contain categorized sections: climate kit, housing essentials, electronics/adapters, kitchen essentials, and local setup tasks, with each section containing at least 3 items or tasks
3. WHEN an Incoming_Student adds, removes, or marks as obtained an item in a generated Survival_Blueprint, THE Platform SHALL save the updated checklist as the user's active blueprint within 5 seconds
4. THE AI_Engine SHALL tailor recommendations based on the destination university's geographic climate zone and the user's specified housing type such that different climate zones or housing types produce non-identical blueprint content
5. IF the AI_Engine fails to respond within 15 seconds or returns an error, THEN THE Platform SHALL serve a pre-built template blueprint based on the destination university and housing type within 3 seconds of detecting the failure
6. THE Platform SHALL use a single configurable AI provider (Ollama, Groq free tier, or Gemini free tier) determined at deployment time without requiring paid API keys
7. IF an Incoming_Student submits a blueprint generation request with missing or invalid inputs (unrecognized university, empty housing type, negative budget, or arrival date in the past), THEN THE Platform SHALL display an error message indicating which fields are invalid without calling the AI_Engine

### Requirement 5: Arrival Timeline Generation

**User Story:** As an incoming student, I want a time-sequenced action plan for my first days at my new location, so that I can prioritize tasks effectively.

#### Acceptance Criteria

1. WHEN an Incoming_Student has a finalized Survival_Blueprint (user has explicitly confirmed or modified the generated blueprint) and arrival date, THE AI_Engine SHALL generate an Arrival_Timeline within 15 seconds with tasks ordered by day relative to arrival, spanning from 7 days before arrival through 14 days after arrival
2. THE Arrival_Timeline SHALL include between 5 and 20 time-sensitive tasks (SIM card purchase, bank account setup, grocery run) sequenced by urgency and dependency, with each task assigned to a specific day or day range
3. WHEN an Incoming_Student marks a timeline task as complete, THE Platform SHALL update the task status and re-sequence any dependent tasks that were waiting on the completed task
4. IF the AI_Engine is unavailable when generating an Arrival_Timeline, THEN THE Platform SHALL serve a pre-built template timeline with generic tasks appropriate for the destination country

### Requirement 6: Climate and Culture Intelligence

**User Story:** As an incoming student, I want climate and cultural context for my destination, so that I can adapt my packing list and behavior expectations.

#### Acceptance Criteria

1. WHEN generating a Survival_Blueprint, THE AI_Engine SHALL include climate information for the arrival month at the destination, covering: average high and low temperature in Celsius, average precipitation in millimeters, and a seasonal summary (e.g., dry season, monsoon, winter)
2. WHEN generating a Survival_Blueprint, THE AI_Engine SHALL include at least 3 cultural norms in the Survival_Blueprint's local setup tasks section, drawn from the following categories: tipping customs, social etiquette, local transportation norms, and academic culture expectations
3. THE Platform SHALL source climate data from publicly available datasets or APIs at zero cost
4. IF climate or cultural data is unavailable for the destination, THEN THE AI_Engine SHALL generate the Survival_Blueprint without the missing section and display a notice to the user indicating which context section is unavailable

### Requirement 7: Marketplace Listing Creation

**User Story:** As an outgoing student, I want to list items or bundles for sale, so that incoming students can find and purchase what they need.

#### Acceptance Criteria

1. WHEN an Outgoing_Student creates a listing, THE Platform SHALL require a title (maximum 100 characters), description (maximum 2000 characters), price (between 0.01 and 999,999.99 in the platform's base currency), category, condition, and between 1 and 10 photos in JPEG or PNG format each no larger than 5MB
2. THE Platform SHALL allow an Outgoing_Student to group between 2 and 20 items into a single Bundle listing
3. WHEN a listing is created, THE Platform SHALL associate the listing with the seller's verified university campus location
4. IF an Outgoing_Student attempts to create a listing without a verified campus location, THEN THE Platform SHALL prevent listing creation and display an error message indicating that location verification is required
5. THE Platform SHALL display listing status as ACTIVE, RESERVED, or SOLD
6. IF a listing has been ACTIVE for more than 30 days without a received message, deal initiation, or reservation, THEN THE Platform SHALL notify the Outgoing_Student to update or remove the listing
7. THE Platform SHALL store listing photos in Supabase Storage (free tier) and serve them via CDN with images loading within 3 seconds on a standard broadband connection

### Requirement 8: Graduating Student Exit Flow

**User Story:** As a graduating or departing student, I want to bulk-list my belongings as bundles, so that I can quickly offload items before leaving.

#### Acceptance Criteria

1. WHEN an Outgoing_Student activates the Exit Flow, THE Platform SHALL provide a guided interface for creating up to 20 Bundle listings in a single session, where each Bundle contains at least 2 items
2. WHEN an Outgoing_Student adds items during the Exit Flow, THE Platform SHALL suggest pre-populated bundle groupings (kitchen bundle, electronics bundle, furniture bundle) based on item categories, which the user can accept, modify, or dismiss
3. WHEN an Outgoing_Student confirms the Exit Flow for publishing, THE Platform SHALL validate all Bundle listings against standard listing requirements (title, description, price, category, condition, at least one photo per Bundle) and publish all valid listings simultaneously
4. IF one or more Bundle listings fail validation during Exit Flow publishing, THEN THE Platform SHALL identify the failing listings with specific validation errors and allow the user to correct them without losing other valid listings in the session
5. IF an Outgoing_Student abandons the Exit Flow before publishing, THEN THE Platform SHALL save all entered data as a draft session retrievable for up to 7 days

### Requirement 9: Marketplace Matching

**User Story:** As an incoming student, I want to see listings matched to my survival blueprint, so that I can find relevant items without manual searching.

#### Acceptance Criteria

1. WHEN an Incoming_Student views their Survival_Blueprint, THE Matching_Algorithm SHALL display matched listings ranked by a composite score
2. THE Matching_Algorithm SHALL compute the composite score using: distance (weighted 25%), price relative to budget (weighted 25%), seller Trust_Score (weighted 30%), and checklist item completeness (weighted 20%)
3. THE Matching_Algorithm SHALL only return listings from sellers within 25 km of the buyer's destination university
4. WHEN an Incoming_Student adjusts priority weights for matching factors (each weight between 0.05 and 0.95, all weights summing to 1.0), THE Matching_Algorithm SHALL re-rank results using the adjusted weights within 3 seconds
5. WHEN a new listing is created or an existing listing changes status, THE Platform SHALL update matching results for affected blueprints within 30 seconds
6. IF the Matching_Algorithm finds no listings within the 25 km radius that match any blueprint item, THEN THE Platform SHALL display a message indicating no matches are currently available and suggest broadening the search radius

### Requirement 10: Boosted Listings (Deferred Monetization)

**User Story:** As an outgoing student, I want to boost my listing visibility in the future, so that my items sell faster when the feature is available.

#### Acceptance Criteria

1. THE Platform SHALL include a "Boost Listing" button on each listing that is visually disabled and displays a "Coming Soon" tooltip when hovered or tapped
2. THE Platform SHALL design the listing ranking system to accept a boost factor parameter (between 1.0 and 3.0) that multiplies the composite score for future activation
3. WHEN a user interacts with the disabled "Boost Listing" button, THE Platform SHALL display a message explaining that boosted listings will be available in a future update

### Requirement 11: Controlled Communication

**User Story:** As a matched buyer or seller, I want to communicate securely within the app, so that I can negotiate and plan meetups without sharing personal contact information.

#### Acceptance Criteria

1. WHEN the Matching_Algorithm produces a match and the Incoming_Student initiates contact, THE Platform SHALL open a Chat_Session between the two users and persist all messages for retrieval on subsequent logins
2. THE Chat_Session SHALL support text messages up to 2000 characters, image sharing up to 5MB per image (JPEG and PNG formats), and video verification requests that prompt the recipient to record a short confirmation clip
3. WHILE a Chat_Session is active and no Deal exists, THE Platform SHALL allow free-form negotiation messages
4. THE Platform SHALL deliver messages in real-time using WebSocket connections with a maximum latency of 2 seconds
5. IF message delivery fails due to a connection interruption, THEN THE Platform SHALL queue the message and retry delivery for up to 30 seconds, displaying a "message not sent" indicator to the sender if delivery is not confirmed within that period
6. THE Platform SHALL provide a "Report Message" option on each message allowing users to flag inappropriate content for admin review
7. WHEN an outgoing message contains detected external contact information (phone numbers, email addresses, social media handles), THE Platform SHALL still send the message but display a warning overlay to the sender indicating that sharing contact information outside the platform bypasses trust protections

### Requirement 12: Deal Creation

**User Story:** As a buyer or seller, I want to formally lock in a transaction agreement, so that both parties are committed and the listing is reserved.

#### Acceptance Criteria

1. WHEN either participant in a Chat_Session initiates a deal by specifying price and item list, THE Platform SHALL send a deal proposal to the other participant for acceptance
2. WHEN the counterparty accepts the deal proposal, THE Platform SHALL create a Deal record with a unique Deal ID, locked price, locked item list, and locked participant identifiers
3. WHEN a Deal is created, THE Platform SHALL change the associated listing status to RESERVED
4. WHEN a Deal is created, THE Platform SHALL restrict the Chat_Session to structured messages only (meetup scheduling, confirmation requests, cancellation requests)
5. IF the counterparty rejects or does not respond to a deal proposal within 48 hours, THEN THE Platform SHALL expire the proposal and allow new proposals to be sent
6. IF either participant cancels a Deal before dual confirmation, THEN THE Platform SHALL return the listing status to ACTIVE and record the cancellation in the canceller's behavior history
7. THE Platform SHALL allow only one active Deal per listing at a time

### Requirement 13: Real-World Exchange Support

**User Story:** As a buyer or seller, I want optional location check-in support for meetups, so that both parties feel safe during the exchange.

#### Acceptance Criteria

1. WHEN both Deal participants confirm a proposed meetup time and location via the Chat_Session's structured meetup scheduling messages, THE Platform SHALL record the agreed date, time, and location coordinates in the Deal record
2. WHERE a user opts into location check-in, WHEN the user triggers a check-in action within 60 minutes before or after the agreed meetup time, THE Platform SHALL verify that the user's GPS coordinates are within 500 meters of the agreed meetup location and display a confirmation indicator to both Deal participants
3. IF a user triggers a location check-in and their GPS coordinates are beyond 500 meters from the agreed meetup location, THEN THE Platform SHALL display a message indicating the user is not within range and allow the user to retry without limit
4. THE Platform SHALL not require location check-in for deal completion; location check-in remains optional

### Requirement 14: Dual Confirmation and Deal Completion

**User Story:** As a buyer and seller, I want both of us to confirm the exchange happened, so that the platform can update our trust scores fairly.

#### Acceptance Criteria

1. WHEN both the buyer and seller submit independent completion confirmations for a Deal, THE Platform SHALL mark the Deal as COMPLETED
2. WHEN a Deal is marked COMPLETED, THE Platform SHALL update both participants' Trust_Scores by incrementing behavior trust by 5 points each
3. WHEN a Deal is marked COMPLETED, THE Platform SHALL change the listing status to SOLD
4. IF only one participant confirms completion and the other participant does not confirm within 72 hours of the first confirmation submission, THEN THE Platform SHALL flag the Deal for manual admin dispute review and notify both participants
5. IF neither participant confirms within 72 hours of the planned meetup time, or within 72 hours of Deal creation if no meetup time is recorded, THEN THE Platform SHALL mark the Deal as EXPIRED and return the listing to ACTIVE
6. WHEN a Deal is flagged for dispute, THE Platform SHALL present the dispute details in an admin dashboard for manual resolution
7. WHEN a participant submits a completion confirmation for a Deal, THE Platform SHALL record the confirmation as final and not allow that participant to retract or modify it

### Requirement 15: Trust Score Computation

**User Story:** As a user, I want a transparent trust score that reflects my verified identity and transaction history, so that other users can assess my reliability.

#### Acceptance Criteria

1. THE Platform SHALL compute Trust_Score as a weighted sum of: identity trust (email verification: 20 points, document badge: 10 points), location trust (GPS verified: 10 points), behavior trust (completed deals: +5 points each, cancellations: -3 points each, disputes: -5 points each), and interaction trust (verification request responses within 24 hours: +2 points each, verification requests not responded to within 24 hours: -1 point each)
2. THE Platform SHALL display Trust_Score as an integer value on user profiles and alongside listings
3. WHEN a trust-affecting event occurs (deal completion, deal cancellation, dispute recorded, verification status change, or verification request response timeout), THE Platform SHALL recalculate the affected user's Trust_Score within 5 seconds
4. THE Platform SHALL not allow Trust_Score to drop below zero

### Requirement 16: Value Lock System (Bypass Prevention)

**User Story:** As a platform operator, I want to ensure users only gain reputation benefits by completing deals inside the app, so that the platform retains value and engagement.

#### Acceptance Criteria

1. THE Platform SHALL award trust points, ranking boosts (via increased composite score weight in the Matching_Algorithm), and badges exclusively through in-app deal completion via Dual_Confirmation
2. THE Platform SHALL only increment behavior trust, award Deal_Badges, and improve Matching_Algorithm ranking through the Dual_Confirmation pathway; no alternative pathway shall exist to gain these benefits
3. WHEN a user has zero completed deals, THE Platform SHALL display a "New User" indicator alongside their identity and location trust points instead of a full behavior-based Trust_Score breakdown
4. THE Platform SHALL allow users to leave conversations and cancel deals at any time without penalty beyond the recorded cancellation in behavior history

### Requirement 17: Verified Deal Badge (Deferred Monetization)

**User Story:** As a buyer or seller, I want a deal badge after a successful transaction in the future, so that I can showcase verified transaction history.

#### Acceptance Criteria

1. WHEN a Deal is marked COMPLETED, THE Platform SHALL automatically award exactly one free Deal_Badge to each of the two participants, preventing duplicate badges for the same Deal
2. THE Platform SHALL display each Deal_Badge on the user's profile showing the completion date and a reference to the associated Deal, such that selecting the badge navigates to the completed Deal summary
3. THE Platform SHALL display the total number of Deal_Badges on a user's profile summary as an integer count
4. THE Platform SHALL store each Deal_Badge with a tier attribute (defaulting to "free") so that additional badge tiers can be introduced by adding new tier values without modifying existing badge records or display logic
5. IF the Platform attempts to award a Deal_Badge for a Deal that has already been badged for that participant, THEN THE Platform SHALL not create a duplicate badge and shall retain the original badge unchanged

### Requirement 18: Community Knowledge Graph

**User Story:** As an outgoing student, I want to leave verified tips for incoming students, so that my local knowledge helps future relocators.

#### Acceptance Criteria

1. WHEN a verified Outgoing_Student submits a tip containing a text body (between 20 and 500 characters) and selects a topic category, THE Platform SHALL store the tip in the Knowledge_Graph associated with the student's university
2. THE Platform SHALL categorize tips by topic (housing, transportation, food, academics, social life)
3. WHEN an Incoming_Student views their destination university, THE Platform SHALL display Knowledge_Graph tips matching that university, sorted by helpfulness vote count descending then by submission date descending, showing a maximum of 20 tips per page with pagination controls
4. WHEN a user votes on a tip's helpfulness using an upvote or downvote action, THE Platform SHALL update the tip's ranking score and restrict each user to one vote per tip, allowing vote changes but not duplicate votes
5. IF a verified Outgoing_Student submits a tip with a text body shorter than 20 characters or longer than 500 characters, THEN THE Platform SHALL reject the submission and display an error message indicating the length requirement

### Requirement 19: University Partnership Integration (Future B2B)

**User Story:** As a university administrator, I want to integrate with the platform to support incoming student onboarding, so that the university can improve the relocation experience.

#### Acceptance Criteria

1. WHERE a university has an active partnership (created by a platform administrator via the admin dashboard with a designated university domain and administrator email), THE Platform SHALL provide a dedicated university dashboard showing aggregate onboarding analytics: number of students onboarded, deal completion rates, and the top 5 item categories ranked by number of completed deals
2. WHERE a university has an active partnership, WHEN a user registers with an email address matching the partner university's domain, THE Platform SHALL mark the user's account as email-verified and store the associated university domain without requiring OTP submission
3. THE Platform SHALL expose a RESTful API for university systems to query anonymized aggregate data, requiring API key authentication issued per partnership, and returning only aggregate counts with no individual user identifiers
4. THE Platform SHALL design the partnership system as a future module such that all core platform features (verification, blueprints, matching, deals, chat) remain fully functional when the partnership module is disabled or not deployed
5. WHERE a university has an active partnership, THE Platform SHALL restrict dashboard and API access to authenticated university administrator accounts associated with that partnership

### Requirement 20: Mental Health Check-in Layer

**User Story:** As an incoming student in the settling-in period, I want periodic wellness check-ins, so that I can access mental health resources if I am struggling.

#### Acceptance Criteria

1. WHEN an Incoming_Student is within 30 days after their arrival date, THE Platform SHALL send a settling-in wellness pulse notification every 7 days, for a maximum of 4 notifications per settling-in period
2. WHEN a user responds to a wellness pulse, THE Platform SHALL present a structured response selection with at minimum three ordinal options ranging from positive to struggling, and IF the user selects the lowest well-being option, THEN THE Platform SHALL display at least 3 mental health resources specific to their destination university
3. IF no university-specific mental health resources are available, THEN THE Platform SHALL display general mental health resources including at minimum a crisis helpline and an online counseling directory
4. THE Platform SHALL not store individual wellness responses beyond the active wellness check-in interaction; responses SHALL be discarded from server storage once the user navigates away from the wellness pulse screen or the user session ends, whichever comes first
5. WHEN a user opts out of wellness check-ins, THE Platform SHALL cease all future wellness pulse notifications within 24 hours and SHALL not send any further wellness notifications unless the user explicitly re-enables them
6. THE Platform SHALL allow users to opt out of wellness check-ins at any time via notification preferences

### Requirement 21: Search and Browse Listings

**User Story:** As any user, I want to search and browse available listings by keyword, category, and location, so that I can discover items outside my survival blueprint.

#### Acceptance Criteria

1. WHEN a user enters a search query of at least 2 characters, THE Platform SHALL return listings where the query text appears as a case-insensitive substring in the title or description fields, displaying the first page of up to 20 results within 3 seconds
2. THE Platform SHALL support filtering search results by category, price range (within 0.01 to 999,999.99), item condition, and distance (up to 50 km) from a specified location, applying all selected filters simultaneously using AND logic
3. THE Platform SHALL display search results ranked by the Matching_Algorithm composite score (with trust score included)
4. THE Platform SHALL render search results on a map view using OpenStreetMap via Leaflet.js, displaying a pin for each listing at its associated campus location
5. IF a search query or filter combination yields no matching listings, THEN THE Platform SHALL display a message indicating no results were found and suggest broadening the search criteria

### Requirement 22: User Profile Management

**User Story:** As a user, I want to manage my profile information, so that other users can learn about me and trust my identity.

#### Acceptance Criteria

1. THE Platform SHALL display on each user profile: display name, university, verification badges, Trust_Score, Deal_Badges count, completed deals count, and member-since date
2. WHEN a user updates their display name, THE Platform SHALL validate that the new name is between 2 and 50 characters, contains only alphanumeric characters, spaces, hyphens, or underscores, save the changes, and reflect them across the platform within 5 seconds
3. WHEN a user requests account deletion, THE Platform SHALL require the user to confirm the deletion action a second time before proceeding, and complete the deletion within 30 seconds of confirmation
4. WHEN a user confirms account deletion, THE Platform SHALL anonymize their completed deal records (replacing identity with "Deleted User") and retain aggregate statistics, remove all personal information, listings, and chat history, and preserve their Knowledge_Graph tips in anonymized form
5. IF a profile update fails due to validation or a server error, THEN THE Platform SHALL display an error message indicating the reason for failure and retain the user's previous profile state without partial changes

### Requirement 23: Notification System

**User Story:** As a user, I want to receive timely notifications about matches, messages, and deal updates, so that I stay informed without constantly checking the app.

#### Acceptance Criteria

1. WHEN a new match is found for an Incoming_Student's Survival_Blueprint, THE Platform SHALL send an in-app notification to the student within 60 seconds of match computation
2. WHEN a new message arrives in a Chat_Session, THE Platform SHALL send a real-time notification to the recipient within 2 seconds
3. WHEN a Deal status changes (created, confirmed, cancelled, expired, disputed), THE Platform SHALL notify all involved participants within 30 seconds of the status change
4. THE Platform SHALL support in-app notifications displayed in a notification center accessible from all screens, and optional browser push notifications for web users
5. THE Platform SHALL allow users to configure notification preferences per category (matches, messages, deals, wellness), with all categories enabled by default
6. THE Platform SHALL persist unread notifications until the user views them or explicitly dismisses them, displaying an unread count badge on the notification center icon

### Requirement 24: Survival Blueprint Serialization

**User Story:** As a developer, I want survival blueprints to be reliably serialized and deserialized, so that blueprints persist correctly across sessions and API boundaries.

#### Acceptance Criteria

1. THE Platform SHALL serialize Survival_Blueprint objects to JSON format for storage and API transmission, including all blueprint fields: destination university, housing type, budget range, arrival date, categorized item sections (climate kit, housing essentials, electronics/adapters, kitchen essentials, local setup tasks), and user modifications
2. THE Platform SHALL deserialize stored JSON back into valid Survival_Blueprint objects preserving all field values, item ordering within categories, and user modification states identical to the pre-serialization state
3. FOR ALL valid Survival_Blueprint objects, serializing then deserializing SHALL produce a Survival_Blueprint object with identical field values, identical category structures, and identical item counts as the original (round-trip property)
4. IF a malformed JSON payload is received for blueprint deserialization, THEN THE Platform SHALL reject the payload and return a parse error indicating the character position or field path where the malformation occurs
5. IF a JSON payload is syntactically valid but missing required blueprint fields or containing fields with values outside accepted types, THEN THE Platform SHALL reject the payload and return a validation error listing each invalid or missing field by name

### Requirement 25: Matching Algorithm Score Computation

**User Story:** As a developer, I want the matching algorithm to produce consistent, correct scores, so that ranking results are fair and predictable.

#### Acceptance Criteria

1. THE Matching_Algorithm SHALL produce a composite score between 0.0 and 1.0 (inclusive) for every listing-blueprint pair by computing a weighted sum of four normalized dimension sub-scores: distance (0.0 = farthest at 25 km, 1.0 = closest at 0 km), price relative to budget (0.0 = at or above budget, 1.0 = farthest below budget), seller Trust_Score (0.0 = minimum trust of 0, 1.0 = maximum trust), and checklist item completeness (0.0 = zero matching items, 1.0 = all blueprint items matched)
2. THE Matching_Algorithm SHALL produce identical scores for identical inputs regardless of execution order (deterministic)
3. WHEN all weight factors sum to a value other than 1.0, THE Matching_Algorithm SHALL normalize weights by dividing each weight by the sum of all weights before computing the composite score
4. IF any individual weight factor is zero or negative, THEN THE Matching_Algorithm SHALL reject the weight configuration and return an error indication specifying which weight is invalid
5. FOR ALL listing pairs, IF listing A scores equal to or higher than listing B on one dimension sub-score while all other dimension sub-scores and weights are held equal, THEN listing A SHALL receive a composite score equal to or higher than listing B (per-dimension monotonicity property)
6. THE Matching_Algorithm SHALL complete scoring for up to 1000 listings within 3 seconds
7. IF a dimension sub-score cannot be computed for a listing (seller has no Trust_Score or listing lacks price), THEN THE Matching_Algorithm SHALL assign a sub-score of 0.0 for that dimension and include the listing in results with the remaining dimensions contributing to the composite score

### Requirement 26: Admin Dashboard

**User Story:** As a platform administrator, I want a dedicated admin panel, so that I can review disputes, manage reported content, and monitor platform health.

#### Acceptance Criteria

1. THE Platform SHALL provide a separate admin route (/admin) accessible only to users with an admin role
2. IF a non-admin user attempts to access the admin route, THEN THE Platform SHALL deny access and redirect the user to the platform home page
3. WHEN the Platform is deployed, THE Platform SHALL seed an initial admin user account with credentials configurable via environment variables
4. THE Platform SHALL display pending dispute cases with Deal details, participant information, and the last 50 messages from the associated Chat_Session on the admin dashboard
5. WHEN an administrator resolves a dispute as resolved-in-favor-of-buyer or resolved-in-favor-of-seller, THE Platform SHALL mark the Deal as COMPLETED, update the listing status to SOLD, and notify both participants of the resolution outcome
6. WHEN an administrator resolves a dispute as dismissed, THE Platform SHALL return the Deal to its pre-dispute state (ACTIVE listing) and notify both participants that the dispute was dismissed
7. THE Platform SHALL display reported messages with the 5 messages before and 5 messages after the reported message from the same Chat_Session, and allow administrators to dismiss reports or issue warnings to offending users
8. WHEN an administrator issues a warning to a user, THE Platform SHALL send a notification to the warned user indicating which message violated platform guidelines and deduct 2 points from the user's Trust_Score
9. THE Platform SHALL display aggregate platform statistics (total users, active listings, completed deals, average trust score) on the admin dashboard
