import { haversine } from './haversine'
import type { MatchWeights } from '@/types/api'

export interface MatchInput {
  listing: {
    id: string
    price: number
    seller_trust_score: number
    campus_lat: number
    campus_lon: number
    boost_factor: number
    matching_categories: string[]
  }
  buyer: {
    destination_lat: number
    destination_lon: number
    budget_min: number
    budget_max: number
    blueprint_categories: string[]
  }
}

export interface ScoreBreakdown {
  distance_score: number
  price_score: number
  trust_score: number
  completeness_score: number
}

/**
 * Normalizes a set of weights so they sum to exactly 1.0.
 */
export function normalizeWeights(weights: MatchWeights): MatchWeights {
  const sum = weights.distance + weights.price + weights.trust + weights.completeness

  if (sum === 0) {
    return { distance: 0.25, price: 0.25, trust: 0.25, completeness: 0.25 }
  }

  return {
    distance: weights.distance / sum,
    price: weights.price / sum,
    trust: weights.trust / sum,
    completeness: weights.completeness / sum,
  }
}

/**
 * Computes distance sub-score (0-1). Closer = higher score.
 * Max distance is 25km (listings beyond this are filtered out).
 */
export function computeDistanceScore(
  sellerLat: number,
  sellerLon: number,
  buyerLat: number,
  buyerLon: number
): number {
  const distance = haversine(sellerLat, sellerLon, buyerLat, buyerLon)
  const maxDistance = 25 // km

  if (distance >= maxDistance) return 0
  return 1 - distance / maxDistance
}

/**
 * Computes price sub-score (0-1). Closer to budget center = higher score.
 */
export function computePriceScore(
  listingPrice: number,
  budgetMin: number,
  budgetMax: number
): number {
  if (budgetMax <= 0) return 0
  if (listingPrice <= budgetMin) return 1
  if (listingPrice >= budgetMax) return 0

  return 1 - (listingPrice - budgetMin) / (budgetMax - budgetMin)
}

/**
 * Computes trust sub-score (0-1). Normalized against a reference max (100 points).
 */
export function computeTrustSubScore(sellerTrustScore: number): number {
  const referenceMax = 100
  return Math.min(1, Math.max(0, sellerTrustScore / referenceMax))
}

/**
 * Computes completeness sub-score (0-1). More blueprint categories matched = higher.
 */
export function computeCompletenessScore(
  listingCategories: string[],
  blueprintCategories: string[]
): number {
  if (blueprintCategories.length === 0) return 0

  const matched = listingCategories.filter((cat) =>
    blueprintCategories.includes(cat)
  ).length

  return matched / blueprintCategories.length
}

/**
 * Computes the full composite match score for a listing.
 * Returns a score in [0, 1] (before boost) or [0, 3] with boost.
 * Final score is clamped to [0, 1] for display consistency.
 */
export function computeMatchScore(
  input: MatchInput,
  weights: MatchWeights
): { score: number; breakdown: ScoreBreakdown } {
  const normalized = normalizeWeights(weights)

  const breakdown: ScoreBreakdown = {
    distance_score: computeDistanceScore(
      input.listing.campus_lat,
      input.listing.campus_lon,
      input.buyer.destination_lat,
      input.buyer.destination_lon
    ),
    price_score: computePriceScore(
      input.listing.price,
      input.buyer.budget_min,
      input.buyer.budget_max
    ),
    trust_score: computeTrustSubScore(input.listing.seller_trust_score),
    completeness_score: computeCompletenessScore(
      input.listing.matching_categories,
      input.buyer.blueprint_categories
    ),
  }

  const rawScore =
    normalized.distance * breakdown.distance_score +
    normalized.price * breakdown.price_score +
    normalized.trust * breakdown.trust_score +
    normalized.completeness * breakdown.completeness_score

  // Apply boost factor, clamp to [0, 1]
  const score = Math.min(1, Math.max(0, rawScore * input.listing.boost_factor))

  return { score, breakdown }
}
