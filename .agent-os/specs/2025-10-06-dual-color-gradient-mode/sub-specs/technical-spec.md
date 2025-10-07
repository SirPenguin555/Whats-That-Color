# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-10-06-dual-color-gradient-mode/spec.md

> Created: 2025-10-06
> Version: 1.0.0

## Technical Requirements

### State Management
- Add `gameMode` field to Zustand store: `'single' | 'dual'`
- Add `dualColors` field to store: `{ colorA: string, colorB: string } | null`
- Persist mode selection via Zustand persist middleware

### UI Components
- Create mode toggle button component with icon/text
- Position button in bottom-middle of screen (fixed positioning)
- Update ColorDisplay component to handle both single and dual modes
- Implement CSS gradient for dual mode display

### Color Generation
- Extend random color generator to produce two colors for dual mode
- Ensure colors are sufficiently different (color distance check)
- Store both hex values in state

### AI Integration
- Modify scoring prompt to evaluate both colors in dual mode
- Pass both hex values to AI when in dual mode
- Ensure accuracy scoring considers both colors
- Update local fallback scoring for dual mode

### Responsive Design
- Toggle button works on all screen sizes
- Gradient display maintains proper proportions on mobile
- Button doesn't interfere with input or other UI elements

## Approach Options

**Option A: CSS Linear Gradient** (Selected)
- Pros: Native browser support, smooth gradients, performant
- Cons: Limited to linear gradients only

**Option B: Canvas-based Gradient**
- Pros: More control over gradient algorithm
- Cons: Overkill for this use case, performance overhead

**Rationale:** CSS linear gradients provide exactly what we need with excellent browser support and performance. No need for canvas complexity.

## External Dependencies

None - all functionality can be implemented with existing dependencies (Zustand, Framer Motion, TailwindCSS).

## Implementation Details

### Gradient CSS
```css
background: linear-gradient(to right,
  colorA 0%,
  colorA 33.33%,
  colorB 66.67%,
  colorB 100%
);
```

### Color Distance Check
Ensure colors have sufficient perceptual difference (Euclidean distance in RGB space > 100).

### AI Prompt Modification
```
When in dual mode, evaluate how well the description captures both colors:
- Color A (hex: ${colorA})
- Color B (hex: ${colorB})
- Gradient transition between them

Score accuracy based on whether both colors are described well.
```
