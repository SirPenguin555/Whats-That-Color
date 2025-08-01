# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-07-31-core-mvp-game-loop/spec.md

> Created: 2025-07-31
> Version: 1.0.0

## Technical Requirements

- **Color Generation:** Generate random 6-digit hexadecimal colors with proper validation
- **Full-Screen Display:** Color fills entire viewport background with readable text overlay
- **Text Input:** Controlled React input with real-time validation and character limits
- **Scoring Engine:** Mathematical algorithms for humor, accuracy, and popularity evaluation
- **Star Rating:** Visual component displaying 0-5 stars with decimal precision animations
- **State Management:** Zustand store for current color, description, scores, and game flow
- **Responsive Design:** Mobile-first approach with breakpoints for tablet and desktop
- **Performance:** Sub-200ms color transitions, immediate user feedback

## Approach Options

**Option A:** Single Page Application with Client-Side Rendering
- Pros: Fast interactions, simple deployment, no server complexity
- Cons: SEO limitations, initial bundle size

**Option B:** Next.js with Server-Side Rendering (Selected)
- Pros: Better performance, SEO-ready, TypeScript integration, future scalability
- Cons: Slightly more complex setup

**Option C:** Static Site with JavaScript Enhancement
- Pros: Ultra-fast loading, simple hosting
- Cons: Limited interactivity, harder to extend with AI later

**Rationale:** Option B provides the best foundation for future phases while maintaining excellent performance for the MVP. Next.js App Router offers modern React patterns and easy API integration for Phase 2.

## External Dependencies

- **Next.js 14+** - React framework with App Router for modern development patterns
- **TypeScript** - Type safety and better development experience
- **TailwindCSS** - Utility-first CSS for rapid UI development and responsive design
- **Zustand** - Lightweight state management for game state and user interactions
- **React Hook Form** - Form handling with validation for text input
- **Zod** - Schema validation for input sanitization and type safety
- **Framer Motion** - Animation library for star ratings and transitions (basic usage only)

**Justification:**
- Next.js: Chosen for its excellent TypeScript support, built-in optimizations, and scalability for future AI integration
- Zustand: Lightweight alternative to Redux, perfect for simple game state management
- React Hook Form + Zod: Industry standard for form handling with robust validation
- Framer Motion: Essential for engaging star rating animations, will be expanded in Phase 3

## Component Architecture

### Core Components
```typescript
GameContainer: Main game wrapper and state coordinator
ColorDisplay: Full-screen color background with hex code overlay
DescriptionInput: Text input with validation and submit handling
ScoreDisplay: Star rating visualization with individual category scores
GameController: Manages game flow and state transitions
```

### State Structure
```typescript
interface GameState {
  currentColor: string
  playerDescription: string
  currentScores: ScoreResult | null
  gameHistory: ColorEntry[]
  isSubmitting: boolean
}
```

## Scoring Algorithm Design

### Basic Scoring Rules (Temporary for MVP)

**Funny Score (0-5):**
- Length bonus: +1 for 10+ words
- Humor keywords: +0.5 for words like "funky", "groovy", "sassy"
- Creativity bonus: +1 for unusual adjectives or metaphors

**Accuracy Score (0-5):**
- Color name matching: +2 for correct basic colors (red, blue, etc.)
- Shade recognition: +1 for specific shades (crimson, navy, etc.)
- Hue accuracy: Mathematical comparison to actual hex values

**Popularity Score (0-5):**
- Common words penalty: -0.5 for overused terms
- Uniqueness bonus: +1 for uncommon but understandable descriptions
- Sweet spot: 2-4 range for balanced creativity

### Score Combination
Overall rating = (Funny × 0.3 + Accuracy × 0.4 + Popularity × 0.3)
Displayed as 0-5 stars with decimal precision (e.g., 3.7 stars)