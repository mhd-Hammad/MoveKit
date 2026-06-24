import { describe, it, expect } from 'vitest'
import { haversine } from './haversine'

describe('haversine', () => {
  it('returns 0 for same point', () => {
    expect(haversine(0, 0, 0, 0)).toBe(0)
    expect(haversine(51.5074, -0.1278, 51.5074, -0.1278)).toBe(0)
  })

  it('calculates London to Paris correctly (~341 km)', () => {
    const distance = haversine(51.5074, -0.1278, 48.8566, 2.3522)
    expect(distance).toBeCloseTo(341, -1) // within 10km
  })

  it('calculates New York to Los Angeles correctly (~3936 km)', () => {
    const distance = haversine(40.7128, -74.006, 34.0522, -118.2437)
    expect(distance).toBeCloseTo(3936, -1)
  })

  it('calculates short distance (MIT to Harvard ~2.4 km)', () => {
    const distance = haversine(42.3601, -71.0942, 42.3770, -71.1167)
    expect(distance).toBeCloseTo(2.4, 0) // within 0.5km
  })

  it('returns positive value regardless of direction', () => {
    const d1 = haversine(0, 0, 10, 10)
    const d2 = haversine(10, 10, 0, 0)
    expect(d1).toBeCloseTo(d2, 10)
  })

  it('handles antipodal points (~20015 km)', () => {
    const distance = haversine(0, 0, 0, 180)
    expect(distance).toBeCloseTo(20015, -2)
  })
})
