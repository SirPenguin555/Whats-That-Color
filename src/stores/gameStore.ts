import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generateRandomColor } from '@/utils/colorGenerator'

export interface ScoreResult {
  funny: number
  accurate: number
  popular: number
  overall: number
}

export interface ColorEntry {
  id: string
  hexColor: string
  dualColors?: { colorA: string; colorB: string }
  description: string
  scores: ScoreResult
  timestamp: Date
  gameMode: 'single' | 'dual'
}

interface GameState {
  // Current game state
  currentColor: string
  playerDescription: string
  currentScores: ScoreResult | null
  isSubmitting: boolean

  // Game mode state
  gameMode: 'single' | 'dual'
  dualColors: { colorA: string; colorB: string } | null

  // Game history
  gameHistory: ColorEntry[]

  // Tutorial state
  showTutorial: boolean
  hasSeenTutorial: boolean

  // Actions
  setCurrentColor: (color: string) => void
  setPlayerDescription: (description: string) => void
  setCurrentScores: (scores: ScoreResult | null) => void
  setIsSubmitting: (submitting: boolean) => void
  setGameMode: (mode: 'single' | 'dual') => void
  setDualColors: (colors: { colorA: string; colorB: string } | null) => void
  addToHistory: (entry: ColorEntry) => void
  resetGame: () => void
  setShowTutorial: (show: boolean) => void
  completeTutorial: () => void
  clearHistory: () => void
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      // Initial state - use a consistent default color to avoid hydration issues
      currentColor: '#8B5CF6', // Default purple color
      playerDescription: '',
      currentScores: null,
      isSubmitting: false,
      gameMode: 'single',
      dualColors: null,
      gameHistory: [],
      showTutorial: false, // Will be set based on hasSeenTutorial
      hasSeenTutorial: false,

      // Actions
      setCurrentColor: (color: string) => set({ currentColor: color }),

      setPlayerDescription: (description: string) => set({ playerDescription: description }),

      setCurrentScores: (scores: ScoreResult | null) => set({ currentScores: scores }),

      setIsSubmitting: (submitting: boolean) => set({ isSubmitting: submitting }),

      setGameMode: (mode: 'single' | 'dual') => set({ gameMode: mode }),

      setDualColors: (colors: { colorA: string; colorB: string } | null) =>
        set({ dualColors: colors }),

      addToHistory: (entry: ColorEntry) =>
        set((state) => ({
          gameHistory: [entry, ...state.gameHistory]
        })),

      resetGame: () => set({
        currentColor: generateRandomColor(),
        playerDescription: '',
        currentScores: null,
        isSubmitting: false,
      }),

      setShowTutorial: (show: boolean) => set({ showTutorial: show }),

      completeTutorial: () => set({
        showTutorial: false,
        hasSeenTutorial: true
      }),

      clearHistory: () => set({ gameHistory: [] }),
    }),
    {
      name: 'whats-that-color-storage',
      partialize: (state) => ({
        gameHistory: state.gameHistory,
        hasSeenTutorial: state.hasSeenTutorial,
        gameMode: state.gameMode,
        // currentColor and dualColors intentionally excluded
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.gameHistory) {
          // Convert timestamp strings back to Date objects
          state.gameHistory = state.gameHistory.map(entry => ({
            ...entry,
            timestamp: new Date(entry.timestamp)
          }))
        }
      },
    }
  )
)