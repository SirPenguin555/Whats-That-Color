import { create } from 'zustand'

export interface ScoreResult {
  funny: number
  accurate: number
  popular: number
  overall: number
}

export interface ColorEntry {
  id: string
  hexColor: string
  description: string
  scores: ScoreResult
  timestamp: Date
}

interface GameState {
  // Current game state
  currentColor: string
  playerDescription: string
  currentScores: ScoreResult | null
  isSubmitting: boolean
  
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
  addToHistory: (entry: ColorEntry) => void
  resetGame: () => void
  setShowTutorial: (show: boolean) => void
  completeTutorial: () => void
}

export const useGameStore = create<GameState>((set) => ({
  // Initial state
  currentColor: '#7060bd',
  playerDescription: '',
  currentScores: null,
  isSubmitting: false,
  gameHistory: [],
  showTutorial: true,
  hasSeenTutorial: false,
  
  // Actions
  setCurrentColor: (color: string) => set({ currentColor: color }),
  
  setPlayerDescription: (description: string) => set({ playerDescription: description }),
  
  setCurrentScores: (scores: ScoreResult | null) => set({ currentScores: scores }),
  
  setIsSubmitting: (submitting: boolean) => set({ isSubmitting: submitting }),
  
  addToHistory: (entry: ColorEntry) => 
    set((state) => ({ 
      gameHistory: [entry, ...state.gameHistory] 
    })),
  
  resetGame: () => set({
    currentColor: '#7060bd',
    playerDescription: '',
    currentScores: null,
    isSubmitting: false,
  }),
  
  setShowTutorial: (show: boolean) => set({ showTutorial: show }),
  
  completeTutorial: () => set({ 
    showTutorial: false, 
    hasSeenTutorial: true 
  }),
}))