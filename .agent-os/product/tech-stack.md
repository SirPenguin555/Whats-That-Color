# Technical Stack

> Last Updated: 2025-08-01
> Version: 1.0.0

## Core Technologies

### Application Framework
- **Framework:** Next.js 15.4+ (App Router)
- **Language:** TypeScript (Strict mode)
- **Type Checking:** Strict mode enabled

### Data Storage
- **Primary:** localStorage (via Zustand persist middleware)
- **Type:** Browser-based local storage
- **Persistence:** Automatic via Zustand
- **Offline Support:** Full offline functionality

## Frontend Stack

### JavaScript Framework
- **Framework:** React (Latest stable)
- **Build Tool:** Next.js built-in (Turbopack)

### State Management
- **Library:** Zustand
- **Purpose:** Game state, score history, UI state management

### Data Fetching & Server State
- **Library:** TanStack Query (React Query)
- **Purpose:** AI API calls and caching
- **Features:** Request caching, error handling, retry logic

### Form Handling
- **Library:** React Hook Form
- **Validation:** Zod 3.23+ schema validation
- **Purpose:** Color description input validation

### CSS Framework
- **Framework:** TailwindCSS 4.0+
- **PostCSS:** Yes
- **Custom Theme:** Gameshow-style bright colors

### UI Components
- **Library:** Tailwind Plus (Tailwind UI)
- **Design System:** Custom gameshow theme
- **Implementation:** React components

### Animation
- **Library:** Framer Motion
- **Purpose:** Gameshow animations, transitions, score reveals
- **Features:** Star rating animations, color transitions, confetti effects

## AI & Scoring

### AI Service
- **Provider:** OpenAI GPT-4 (User-provided API key)
- **Purpose:** Score color descriptions on humor, accuracy, popularity
- **API:** OpenAI API v1
- **Fallback:** Local scoring algorithm for offline/error states
- **Configuration:** First-time modal for API key selection

### Scoring Algorithm
- **Funny Score:** GPT-4 humor assessment (0-5)
- **Accuracy Score:** Color perception matching (0-5)  
- **Popularity Score:** Uniqueness vs comprehensibility balance (0-5)
- **Overall Rating:** Weighted average displayed as stars

## Assets & Media

### Fonts
- **Provider:** Google Fonts
- **Primary:** Fredoka One (gameshow style)
- **Loading Strategy:** Next.js Font Optimization

### Icons
- **Library:** Phosphor Icons
- **Implementation:** @phosphor-icons/react
- **Usage:** Star ratings, UI controls

### Sound Effects
- **Library:** Howler.js
- **Purpose:** Gameshow sound effects, score reveals
- **Assets:** Custom gameshow-style audio clips

## Deployment & Infrastructure

### Application Hosting
- **Platform:** Vercel (recommended) or Netlify
- **Integration:** GitHub deployments
- **Previews:** Automatic PR previews
- **Static Export:** Full static site generation support

## Development Tools

### Testing Framework
- **Unit Testing:** Vitest
- **Component Testing:** React Testing Library
- **E2E Testing:** Playwright
- **AI Testing:** Mock OpenAI responses

### Code Quality
- **TypeScript:** Strict mode configuration
- **Linting:** ESLint (Next.js config)
- **Formatting:** Prettier
- **Git Hooks:** Husky + lint-staged

### Development Environment
- **Local Development:** Next.js dev server
- **Environment Variables:** .env.local files
- **AI Development:** User-provided OpenAI API keys via UI
- **Data Storage:** localStorage for development and production