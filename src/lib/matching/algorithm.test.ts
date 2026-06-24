import { describe, it, expect } from 'vitest'
import {
  normalizeWeights,
  computeDistanceScore,
  computePriceScore,
  computeTrustSubScore,
  computeCompletenessScore,
  computeMatchScore,
} from './algorithm'
import type { MatchWeights } from '@/types/api'

describe('normalizeWeights', () => {
  it('normalizes weights to sum to 1.0', () => {
    const weights: MatchWeights = { distance: 2, price: 2, trust: 3, completeness: 3 }
    const normalized = normalizeWeights(weights)
    const sum = normalized.distance + normalized.price + normalized.trust + normalized.completeness
    expect(Math.abs(sum - 1.0)).toBeLessThan(1e-10)
  })

  it('preserves already-normalized weights', () => {
    const weights: MatchWeights = { distance: 0.25, price: 0.25, trust: 0.30, completeness: 0.20 }
    const normalized = normalizeWeights(weights)
    expect(normalized.distance).toBeCloseTo(0.25)
    expect(normalized.trust).toBeCloseTo(0.30)
  })

  it('handles all-zero weights gracefully', () => {
    const weights: MatchWeights = { distance: 0, price: 0, trust: 0, completeness: 0 }
    const normalized = normalizeWeights(weights)
    expect(normalized.distance).toBe(0.25)
    expect(normalized.price).toBe(0.25)
    expect(normalized.trust).toBe(0.25)
    expect(normalized.completeness).toBe(0.25)
  })
})

describe('computeDistanceScore', () => {
  it('returns 1.0 for same location', () => {
    expect(computeDistanceScore(42.36, -71.09, 42.36, -71.09)).toBe(1)
  })

  it('returns 0 for distance >= 25km', () => {
    // ~50km apart
    expect(computeDistanceScore(42.36, -71.09, 42.80, -71.09)).toBe(0)
  })

  it('returns value between 0 and 1 for intermediate distance', () => {
    // MIT to Harvard (~2.4km) → should be ~0.9
    const score = computeDistanceScore(42.3601, -71.0942, 42.3770, -71.1167)
    expect(score).toBeGreaterThan(0.8)
    expect(score).toBeLessThanOrEqual(1)
  })
})

describe('computePriceScore', () => {
  it('returns 1.0 when price is at or below budget min', () => {
    expect(computePriceScore(50, 100, 500)).toBe(1)
    expect(computePriceScore(100, 100, 500)).toBe(1)
  })

  it('returns 0 when price is at or above budget max', () => {
    expect(computePriceScore(500, 100, 500)).toBe(0)
    expect(computePriceScore(600, 100, 500)).toBe(0)
  })

  it('returns 0.5 at midpoint of budget', () => {
    expect(computePriceScore(300, 100, 500)).toBeCloseTo(0.5)
  })

  it('returns 0 when budget max is 0', () => {
    expect(computePriceScore(50, 0, 0)).toBe(0)
  })
})

describe('computeTrustSubScore', () => {
  it('returns 0 for trust score 0', () => {
    expect(computeTrustSubScore(0)).toBe(0)
  })

  it('returns 1.0 for trust score >= 100', () => {
    expect(computeTrustSubScore(100)).toBe(1)
    expect(computeTrustSubScore(150)).toBe(1)
  })

  it('returns 0.5 for trust score 50', () => {
    expect(computeTrustSubScore(50)).toBe(0.5)
  })
})

describe('computeCompletenessScore', () => {
  it('returns 0 when no categories match', () => {
    expect(computeCompletenessScore(['electronics'], ['kitchen', 'climate'])).toBe(0)
  })

  it('returns 1.0 when all categories match', () => {
    expect(computeCompletenessScore(['kitchen', 'climate'], ['kitchen', 'climate'])).toBe(1)
  })

  it('returns 0.5 when half match', () => {
    expect(computeCompletenessScore(['kitchen'], ['kitchen', 'climate'])).toBe(0.5)
  })

  it('returns 0 for empty blueprint categories', () => {
    expect(computeCompletenessScore(['kitchen'], [])).toBe(0)
  })
})

describe('computeMatchScore', () => {
  const defaultWeights: MatchWeights = {
    distance: 0.25,
    price: 0.25,
    trust: 0.30,
    completeness: 0.20,
  }

  it('returns score between 0 and 1', () => {
    const { score } = computeMatchScore(
      {
        listing: {
          id: '1',
          price: 200,
          seller_trust_score: 50,
          campus_lat: 42.36,
          campus_lon: -71.09,
          boost_factor: 1.0,
          matching_categories: ['kitchen'],
        },
        buyer: {
          destination_lat: 42.37,
          destination_lon: -71.10,
          budget_min: 100,
          budget_max: 500,
          blueprint_categories: ['kitchen', 'climate'],
        },
      },
      defaultWeights
    )
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(1)
  })

  it('perfect match gives score close to 1', () => {
    const { score } = computeMatchScore(
      {
        listing: {
          id: '1',
          price: 50,
          seller_trust_score: 100,
          campus_lat: 42.36,
          campus_lon: -71.09,
          boost_factor: 1.0,
          matching_categories: ['kitchen', 'climate'],
        },
        buyer: {
          destination_lat: 42.36,
          destination_lon: -71.09,
          budget_min: 100,
          budget_max: 500,
          blueprint_categories: ['kitchen', 'climate'],
        },
      },
      defaultWeights
    )
    expect(score).toBeGreaterThan(0.9)
  })

  it('boost factor increases score', () => {
    const input = {
      listing: {
        id: '1',
        price: 200,
        seller_trust_score: 50,
        campus_lat: 42.36,
        campus_lon: -71.09,
        boost_factor: 1.0,
        matching_categories: ['kitchen'],
      },
      buyer: {
        destination_lat: 42.37,
        destination_lon: -71.10,
        budget_min: 100,
        budget_max: 500,
        blueprint_categories: ['kitchen', 'climate'],
      },
    }

    const { score: unboosted } = computeMatchScore(input, defaultWeights)
    const { score: boosted } = computeMatchScore(
      { ...input, listing: { ...input.listing, boost_factor: 2.0 } },
      defaultWeights
    )
    expect(boosted).toBeGreaterThanOrEqual(unboosted)
  })

  it('score is clamped to 1.0 even with high boost', () => {
    const { score } = computeMatchScore(
      {
        listing: {
          id: '1',
          price: 50,
          seller_trust_score: 100,
          campus_lat: 42.36,
          campus_lon: -71.09,
          boost_factor: 3.0,
          matching_categories: ['kitchen', 'climate'],
        },
        buyer: {
          destination_lat: 42.36,
          destination_lon: -71.09,
          budget_min: 100,
          budget_max: 500,
          blueprint_categories: ['kitchen', 'climate'],
        },
      },
      defaultWeights
    )
    expect(score).toBeLessThanOrEqual(1)
  })
})
