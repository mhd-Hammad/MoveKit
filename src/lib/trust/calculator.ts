import type { TrustEvent, TrustEventType } from '@/types'

/**
 * Point values for each trust event type.
 * Based on Requirement 15.1 specification.
 */
export const TRUST_POINTS: Record<TrustEventType, number> = {
  email_verified: 20,
  document_verified: 10,
  location_verified: 10,
  deal_completed: 5,
  deal_cancelled: -3,
  dispute: -5,
  verification_response: 2,
  verification_ignored: -1,
  admin_warning: -2,
}

/**
 * Computes a user's trust score from their trust event history.
 * Score is clamped at minimum 0 (Requirement 15.4).
 * Score is order-independent — same events always produce same result.
 */
export function computeTrustScore(events: TrustEvent[]): number {
  const total = events.reduce((sum, event) => sum + event.points, 0)
  return Math.max(0, total)
}

/**
 * Returns a breakdown of trust score by category.
 */
export function computeTrustBreakdown(events: TrustEvent[]) {
  let identity_trust = 0
  let location_trust = 0
  let behavior_trust = 0
  let interaction_trust = 0

  for (const event of events) {
    switch (event.event_type) {
      case 'email_verified':
      case 'document_verified':
        identity_trust += event.points
        break
      case 'location_verified':
        location_trust += event.points
        break
      case 'deal_completed':
      case 'deal_cancelled':
      case 'dispute':
      case 'admin_warning':
        behavior_trust += event.points
        break
      case 'verification_response':
      case 'verification_ignored':
        interaction_trust += event.points
        break
    }
  }

  return {
    identity_trust: Math.max(0, identity_trust),
    location_trust: Math.max(0, location_trust),
    behavior_trust: Math.max(0, behavior_trust),
    interaction_trust: Math.max(0, interaction_trust),
  }
}

/**
 * Determines if a user is "new" (zero completed deals).
 */
export function isNewUser(events: TrustEvent[]): boolean {
  return !events.some((e) => e.event_type === 'deal_completed')
}
