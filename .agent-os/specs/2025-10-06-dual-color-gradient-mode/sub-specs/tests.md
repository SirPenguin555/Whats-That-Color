# Tests Specification

This is the tests coverage details for the spec detailed in @.agent-os/specs/2025-10-06-dual-color-gradient-mode/spec.md

> Created: 2025-10-06
> Version: 1.0.0

## Test Coverage

### Unit Tests

**gameStore.ts**
- `setGameMode()` updates mode to 'single' or 'dual'
- `setDualColors()` stores both color hex values
- Mode persists to localStorage correctly
- `gameMode` defaults to 'single' on first load
- History entries track gameMode correctly

**colorGenerator.ts**
- `generateDualColors()` produces two valid hex colors
- Dual colors have sufficient color distance (> 100)
- Colors are properly formatted (#RRGGBB)
- Regenerates if colors are too similar

**scoringEngine.ts (fallback)**
- Scores dual color descriptions correctly
- Averages scores from both colors
- Returns valid ScoreResult for dual mode
- Handles edge cases (identical colors, extreme descriptions)

### Integration Tests

**Mode Toggle Feature**
- Clicking toggle switches from single to dual mode
- Clicking toggle switches from dual to single mode
- Mode persists after page refresh
- Toggle button appears in correct position (bottom-middle)
- Toggle button is responsive on mobile

**Dual Color Display**
- Screen shows gradient with correct proportions (33% - 33% - 33%)
- Color A appears in first third
- Color B appears in last third
- Gradient appears in middle third
- CSS gradient renders correctly across browsers

**Dual Color Scoring**
- POST request includes dualColors instead of hexColor
- API correctly routes to dual mode prompt
- AI evaluates both colors in response
- Fallback scoring averages both color scores
- Score display works for dual mode entries

**History Integration**
- Dual mode entries save with both colors
- History displays gradient for dual entries
- Filtering works for both single and dual entries
- Export includes dual color data
- Statistics calculate correctly for mixed history

### Feature Tests

**End-to-End: Dual Mode Gameplay**
1. User loads game (defaults to single mode)
2. User clicks mode toggle
3. Screen displays gradient with two colors
4. User enters description mentioning both colors
5. AI scores description based on both colors
6. Score displays with stars
7. Entry saved to history with gradient preview
8. Mode persists on page refresh

**End-to-End: Mode Switching**
1. User plays single mode, submits description
2. User switches to dual mode
3. New dual colors generated
4. User submits dual description
5. User switches back to single mode
6. New single color generated
7. History shows both entry types correctly

### Mocking Requirements

- **OpenAI API:** Mock responses for both single and dual prompts
- **Color Generation:** Mock `Math.random()` for consistent dual colors
- **localStorage:** Mock Zustand persist for mode persistence tests
- **CSS Gradient Rendering:** Visual regression tests for gradient display
