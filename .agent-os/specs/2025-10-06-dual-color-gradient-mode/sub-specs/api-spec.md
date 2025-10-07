# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-10-06-dual-color-gradient-mode/spec.md

> Created: 2025-10-06
> Version: 1.0.0

## Endpoints

### POST /api/score-description

**Purpose:** Score color descriptions with support for both single and dual color modes

**Parameters:**
- `description` (string, required): The player's color description
- `hexColor` (string, optional): Single color hex value (for single mode)
- `dualColors` (object, optional): Dual color hex values (for dual mode)
  - `colorA` (string): First color hex value
  - `colorB` (string): Second color hex value
- `apiKey` (string, optional): User-provided OpenAI API key

**Request Body (Single Mode):**
```json
{
  "description": "Sunset orange with a hint of warmth",
  "hexColor": "#FF6B35",
  "apiKey": "sk-..."
}
```

**Request Body (Dual Mode):**
```json
{
  "description": "Ocean blue transitioning to sandy beige",
  "dualColors": {
    "colorA": "#0077BE",
    "colorB": "#F5DEB3"
  },
  "apiKey": "sk-..."
}
```

**Response:**
```json
{
  "scores": {
    "funny": 3.5,
    "accurate": 4.2,
    "popular": 3.8,
    "overall": 3.9
  },
  "cached": false,
  "processingTime": 1250,
  "source": "ai"
}
```

**Errors:**
- `400 Bad Request`: Missing required fields
- `500 Internal Server Error`: Scoring failed

## Implementation Changes

### Request Validation

Update the validation logic to handle either `hexColor` OR `dualColors`:

```typescript
interface ScoreRequest {
  description: string
  hexColor?: string
  dualColors?: { colorA: string; colorB: string }
  apiKey?: string
}

// Validate input
if (!description || (!hexColor && !dualColors)) {
  return NextResponse.json(
    { error: 'Missing description or color information' },
    { status: 400 }
  )
}
```

### Dual Mode Scoring Prompt

Create a new prompt for dual color mode:

```typescript
const DUAL_SCORING_PROMPT = `You are an expert judge for a creative color description game. Rate the following description of a GRADIENT between two colors on three criteria:

COLOR A: {colorA}
COLOR B: {colorB}
GRADIENT: {colorA} → {colorB}
DESCRIPTION: "{description}"

Rate each criterion from 0.0 to 5.0 (decimal precision):

1. FUNNY: How humorous, creative, or entertaining is this description?
   - Consider wordplay, metaphors, cultural references, unexpected comparisons
   - 0.0 = No humor, 5.0 = Genuinely hilarious

2. ACCURATE: How well does this description capture BOTH colors and the transition?
   - Must describe both Color A and Color B well to score high
   - Consider if the transition/gradient is mentioned
   - 0.0 = Completely wrong, 5.0 = Both colors perfectly described

3. POPULAR: Does this strike the right balance between unique and understandable?
   - 2.5 = Perfect balance (creative but accessible)
   - 0.0 = Too obscure/confusing, 5.0 = Too common/boring

Return ONLY this JSON format:
{"funny": X.X, "accurate": X.X, "popular": X.X}`
```

### Scoring Logic

```typescript
async function scoreWithAI(
  description: string,
  colorData: string | { colorA: string; colorB: string },
  apiKey?: string
): Promise<AIScoreResponse> {
  const openai = apiKey
    ? new OpenAI({ apiKey })
    : getOpenAIClient()

  let prompt: string

  if (typeof colorData === 'string') {
    // Single color mode
    prompt = SCORING_PROMPT
      .replace('{hexColor}', colorData)
      .replace('{description}', description)
  } else {
    // Dual color mode
    prompt = DUAL_SCORING_PROMPT
      .replace(/{colorA}/g, colorData.colorA)
      .replace(/{colorB}/g, colorData.colorB)
      .replace('{description}', description)
  }

  // ... rest of scoring logic
}
```

### Fallback Scoring

Update `src/utils/scoringEngine.ts` to support dual mode:

```typescript
export function scoreDescription(
  description: string,
  colorData: string | { colorA: string; colorB: string }
): ScoreResult {
  // If dual mode, average the scores for both colors
  if (typeof colorData !== 'string') {
    const scoreA = scoreDescription(description, colorData.colorA)
    const scoreB = scoreDescription(description, colorData.colorB)

    return {
      funny: (scoreA.funny + scoreB.funny) / 2,
      accurate: (scoreA.accurate + scoreB.accurate) / 2,
      popular: (scoreA.popular + scoreB.popular) / 2,
      overall: (scoreA.overall + scoreB.overall) / 2
    }
  }

  // ... existing single color logic
}
```

## Rationale

The API must handle both single and dual color modes while maintaining backward compatibility. Using optional parameters (`hexColor` XOR `dualColors`) allows the same endpoint to serve both modes. The dual mode prompt explicitly instructs the AI to evaluate both colors, ensuring accurate scoring for the gradient challenge.
