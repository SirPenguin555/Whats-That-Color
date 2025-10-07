# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-10-06-dual-color-gradient-mode/spec.md

> Created: 2025-10-06
> Version: 1.0.0

## Schema Changes

### GameState Interface Updates

Add the following fields to the `GameState` interface in `src/stores/gameStore.ts`:

```typescript
interface GameState {
  // ... existing fields ...

  // New fields for dual color mode
  gameMode: 'single' | 'dual'
  dualColors: { colorA: string; colorB: string } | null

  // New actions
  setGameMode: (mode: 'single' | 'dual') => void
  setDualColors: (colors: { colorA: string; colorB: string } | null) => void
}
```

### ColorEntry Interface Updates

Update the `ColorEntry` interface to support dual color mode:

```typescript
export interface ColorEntry {
  id: string
  hexColor: string // For single mode
  dualColors?: { colorA: string; colorB: string } // For dual mode
  description: string
  scores: ScoreResult
  timestamp: Date
  gameMode: 'single' | 'dual' // Track which mode was used
}
```

### Store Implementation

```typescript
export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      // ... existing state ...

      // New initial state
      gameMode: 'single',
      dualColors: null,

      // New actions
      setGameMode: (mode: 'single' | 'dual') => set({ gameMode: mode }),

      setDualColors: (colors: { colorA: string; colorB: string } | null) =>
        set({ dualColors: colors }),
    }),
    {
      name: 'whats-that-color-storage',
      partialize: (state) => ({
        gameHistory: state.gameHistory,
        hasSeenTutorial: state.hasSeenTutorial,
        gameMode: state.gameMode, // Persist mode selection
        // currentColor and dualColors intentionally excluded
      }),
      // ... existing onRehydrateStorage ...
    }
  )
)
```

## Rationale

### Game Mode Persistence
Store the selected game mode in localStorage so users return to their preferred mode on subsequent visits.

### Dual Colors Storage
The `dualColors` field is not persisted because each session should generate fresh colors, maintaining the random gameshow experience.

### ColorEntry History
Adding `gameMode` to `ColorEntry` allows the history to properly display single vs dual color entries with appropriate UI.

## Migration Strategy

No migration needed - new fields will be added with sensible defaults. Existing history entries will work as-is (treated as single mode).
