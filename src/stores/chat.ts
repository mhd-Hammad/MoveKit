import { create } from 'zustand'
import type { Message, ChatSession } from '@/types'

interface ChatState {
  sessions: ChatSession[]
  activeSession: ChatSession | null
  messages: Message[]
  isConnected: boolean
  isLoading: boolean

  setSessions: (sessions: ChatSession[]) => void
  setActiveSession: (session: ChatSession | null) => void
  setMessages: (messages: Message[]) => void
  addMessage: (message: Message) => void
  setConnected: (connected: boolean) => void
  setLoading: (loading: boolean) => void
}

export const useChatStore = create<ChatState>((set) => ({
  sessions: [],
  activeSession: null,
  messages: [],
  isConnected: false,
  isLoading: false,

  setSessions: (sessions) => set({ sessions }),
  setActiveSession: (activeSession) => set({ activeSession }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setConnected: (isConnected) => set({ isConnected }),
  setLoading: (isLoading) => set({ isLoading }),
}))
