import { create } from 'zustand'
import type { MatchResult, MatchWeights } from '@/types/api'

interface MatchingState {
  matches: MatchResult[]
  weights: MatchWeights
  isLoading: boolean
  error: string | null

  setMatches: (matches: MatchResult[]) => void
  setWeights: (weights: MatchWeights) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

const defaultWeights: MatchWeights = {
  distance: 0.25,
  price: 0.25,
  trust: 0.30,
  completeness: 0.20,
}

export const useMatchingStore = create<MatchingState>((set) => ({
  matches: [],
  weights: defaultWeights,
  isLoading: false,
  error: null,

  setMatches: (matches) => set({ matches }),
  setWeights: (weights) => set({ weights }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}))
