import { describe, it, expect } from 'vitest'
import { computeTrustScore, computeTrustBreakdown, isNewUser, TRUST_POINTS } from './calculator'
import type { TrustEvent, TrustEventType } from '@/types'

function makeEvent(type: TrustEventType, points?: number): TrustEvent {
  return {
    id: crypto.randomUUID(),
    user_id: 'user-1',
    event_type: type,
    points: points ?? TRUST_POINTS[type],
    reference_id: null,
    created_at: new Date().toISOString(),
  }
}

describe('computeTrustScore', () => {
  it('returns 0 for empty events', () => {
    expect(computeTrustScore([])).toBe(0)
  })

  it('sums positive events correctly', () => {
    const events = [
      makeEvent('email_verified'),     // +20
      makeEvent('location_verified'),  // +10
      makeEvent('deal_completed'),     // +5
    ]
    expect(computeTrustScore(events)).toBe(35)
  })

  it('subtracts negative events', () => {
    const events = [
      makeEvent('email_verified'),     // +20
      makeEvent('deal_cancelled'),     // -3
    ]
    expect(computeTrustScore(events)).toBe(17)
  })

  it('floors at 0 — never goes negative', () => {
    const events = [
      makeEvent('deal_cancelled'),  // -3
      makeEvent('deal_cancelled'),  // -3
      makeEvent('dispute'),         // -5
      makeEvent('dispute'),         // -5
      makeEvent('dispute'),         // -5
    ]
    expect(computeTrustScore(events)).toBe(0)
  })

  it('is order-independent', () => {
    const events = [
      makeEvent('email_verified'),
      makeEvent('deal_completed'),
      makeEvent('deal_cancelled'),
      makeEvent('location_verified'),
    ]
    const reversed = [...events].reverse()
    expect(computeTrustScore(events)).toBe(computeTrustScore(reversed))
  })
})

describe('computeTrustBreakdown', () => {
  it('categorizes events correctly', () => {
    const events = [
      makeEvent('email_verified'),         // identity
      makeEvent('document_verified'),      // identity
      makeEvent('location_verified'),      // location
      makeEvent('deal_completed'),         // behavior
      makeEvent('verification_response'),  // interaction
    ]
    const breakdown = computeTrustBreakdown(events)
    expect(breakdown.identity_trust).toBe(30)
    expect(breakdown.location_trust).toBe(10)
    expect(breakdown.behavior_trust).toBe(5)
    expect(breakdown.interaction_trust).toBe(2)
  })

  it('floors each category at 0', () => {
    const events = [
      makeEvent('deal_cancelled'),
      makeEvent('deal_cancelled'),
      makeEvent('deal_cancelled'),
    ]
    const breakdown = computeTrustBreakdown(events)
    expect(breakdown.behavior_trust).toBe(0)
  })
})

describe('isNewUser', () => {
  it('returns true when no completed deals', () => {
    const events = [
      makeEvent('email_verified'),
      makeEvent('location_verified'),
    ]
    expect(isNewUser(events)).toBe(true)
  })

  it('returns false when at least one deal completed', () => {
    const events = [
      makeEvent('email_verified'),
      makeEvent('deal_completed'),
    ]
    expect(isNewUser(events)).toBe(false)
  })

  it('returns true for empty events', () => {
    expect(isNewUser([])).toBe(true)
  })
})
