import { create } from 'zustand'
import type { SurvivalBlueprint, BlueprintItem } from '@/types'

interface BlueprintState {
  activeBlueprint: SurvivalBlueprint | null
  items: BlueprintItem[]
  isGenerating: boolean
  error: string | null

  setBlueprint: (blueprint: SurvivalBlueprint | null) => void
  setItems: (items: BlueprintItem[]) => void
  setGenerating: (generating: boolean) => void
  setError: (error: string | null) => void
  markItemObtained: (itemId: string) => void
  markItemNeeded: (itemId: string) => void
  removeItem: (itemId: string) => void
  addItem: (item: BlueprintItem) => void
}

export const useBlueprintStore = create<BlueprintState>((set) => ({
  activeBlueprint: null,
  items: [],
  isGenerating: false,
  error: null,

  setBlueprint: (activeBlueprint) => set({ activeBlueprint }),
  setItems: (items) => set({ items }),
  setGenerating: (isGenerating) => set({ isGenerating }),
  setError: (error) => set({ error }),

  markItemObtained: (itemId) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === itemId ? { ...item, is_obtained: true } : item
      ),
    })),

  markItemNeeded: (itemId) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === itemId ? { ...item, is_obtained: false } : item
      ),
    })),

  removeItem: (itemId) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== itemId),
    })),

  addItem: (item) =>
    set((state) => ({
      items: [...state.items, item],
    })),
}))
