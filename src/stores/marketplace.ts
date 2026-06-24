import { create } from 'zustand'
import type { Listing } from '@/types'
import type { ListingSearchParams } from '@/types/api'

interface MarketplaceState {
  listings: Listing[]
  totalListings: number
  isLoading: boolean
  error: string | null
  searchParams: ListingSearchParams

  setListings: (listings: Listing[], total: number) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setSearchParams: (params: Partial<ListingSearchParams>) => void
  resetSearch: () => void
}

const defaultSearchParams: ListingSearchParams = {
  page: 1,
  per_page: 20,
}

export const useMarketplaceStore = create<MarketplaceState>((set) => ({
  listings: [],
  totalListings: 0,
  isLoading: false,
  error: null,
  searchParams: defaultSearchParams,

  setListings: (listings, totalListings) => set({ listings, totalListings }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setSearchParams: (params) =>
    set((state) => ({
      searchParams: { ...state.searchParams, ...params },
    })),
  resetSearch: () => set({ searchParams: defaultSearchParams }),
}))
