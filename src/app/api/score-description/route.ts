import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { scoreDescription as fallbackScoring } from '@/utils/scoringEngine'

// Initialize OpenAI client only when needed
let openaiClient: OpenAI | null = null

function getOpenAIClient(): OpenAI {
  if (!openaiClient && process.env.OPENAI_API_KEY) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  if (!openaiClient) {
    throw new Error('OpenAI client not available')
  }
  return openaiClient
}

interface ScoreRequest {
  description: string
  hexColor?: string
  dualColors?: { colorA: string; colorB: string }
  apiKey?: string
}

interface AIScoreResponse {
  funny: number
  accurate: number
  popular: number
}

interface ScoreResponse {
  scores: {
    funny: number
    accurate: number
    popular: number
    overall: number
  }
  cached: boolean
  processingTime: number
  source: 'ai' | 'fallback'
}

const SCORING_PROMPT = `You are an expert judge for a creative color description game. Rate the following description on three criteria:

COLOR: {hexColor}
DESCRIPTION: "{description}"

Rate each criterion from 0.0 to 5.0 (decimal precision):

1. FUNNY: How humorous, creative, or entertaining is this description?
   - Consider wordplay, metaphors, cultural references, unexpected comparisons
   - 0.0 = No humor, 5.0 = Genuinely hilarious

2. ACCURATE: How well does this description match the actual color?
   - Consider color theory, shade precision, visual accuracy
   - 0.0 = Completely wrong, 5.0 = Perfectly accurate

3. POPULAR: Does this strike the right balance between unique and understandable?
   - 2.5 = Perfect balance (creative but accessible)
   - 0.0 = Too obscure/confusing, 5.0 = Too common/boring

Return ONLY this JSON format:
{"funny": X.X, "accurate": X.X, "popular": X.X}`

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

function calculateOverallScore(funny: number, accurate: number, popular: number): number {
  // Weighted average: Accuracy 40%, Funny 30%, Popular 30%
  const weighted = (accurate * 0.4) + (funny * 0.3) + (popular * 0.3)
  return Math.round(weighted * 10) / 10 // Round to 1 decimal place
}

async function scoreWithAI(
  description: string,
  colorData: string | { colorA: string; colorB: string },
  apiKey?: string
): Promise<AIScoreResponse> {
  // Use provided API key or fall back to environment key
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

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    max_tokens: 100,
    temperature: 0.3, // Lower temperature for more consistent scoring
  })

  const content = completion.choices[0]?.message?.content
  if (!content) {
    throw new Error('No response from OpenAI')
  }

  try {
    const parsed = JSON.parse(content) as AIScoreResponse
    
    // Validate the response structure
    if (typeof parsed.funny !== 'number' || 
        typeof parsed.accurate !== 'number' || 
        typeof parsed.popular !== 'number') {
      throw new Error('Invalid response format from OpenAI')
    }

    // Clamp values to 0-5 range
    return {
      funny: Math.max(0, Math.min(5, parsed.funny)),
      accurate: Math.max(0, Math.min(5, parsed.accurate)),
      popular: Math.max(0, Math.min(5, parsed.popular))
    }
  } catch (error) {
    console.error('Failed to parse OpenAI response:', content, error)
    throw new Error('Failed to parse AI response')
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<ScoreResponse | { error: string }>> {
  const startTime = Date.now()
  
  try {
    // Parse request body
    const body = await request.json() as ScoreRequest
    const { description, hexColor, dualColors, apiKey } = body

    // Validate input
    if (!description || (!hexColor && !dualColors)) {
      return NextResponse.json(
        { error: 'Missing description or color information' },
        { status: 400 }
      )
    }

    const colorData = dualColors || hexColor!

    // Determine if we should use AI scoring
    const shouldUseAI = apiKey || (process.env.NEXT_PUBLIC_AI_SCORING_ENABLED === 'true' && process.env.OPENAI_API_KEY)

    let scores: AIScoreResponse
    let source: 'ai' | 'fallback' = 'fallback'

    if (shouldUseAI) {
      try {
        scores = await scoreWithAI(description, colorData, apiKey)
        source = 'ai'
      } catch (aiError) {
        console.warn('AI scoring failed, using fallback:', aiError)
        const fallbackResult = fallbackScoring(description, colorData)
        scores = {
          funny: fallbackResult.funny,
          accurate: fallbackResult.accurate,
          popular: fallbackResult.popular
        }
      }
    } else {
      // Use fallback scoring
      const fallbackResult = fallbackScoring(description, colorData)
      scores = {
        funny: fallbackResult.funny,
        accurate: fallbackResult.accurate,
        popular: fallbackResult.popular
      }
    }

    const overall = calculateOverallScore(scores.funny, scores.accurate, scores.popular)
    const processingTime = Date.now() - startTime

    return NextResponse.json({
      scores: {
        funny: scores.funny,
        accurate: scores.accurate,
        popular: scores.popular,
        overall
      },
      cached: false, // TODO: Implement caching in next iteration
      processingTime,
      source
    })

  } catch (error) {
    console.error('Error in score-description API:', error)
    
    // Fallback to basic scoring on any error
    try {
      const body = await request.json() as ScoreRequest
      const colorData = body.dualColors || body.hexColor!
      const fallbackResult = fallbackScoring(body.description, colorData)
      const processingTime = Date.now() - startTime

      return NextResponse.json({
        scores: fallbackResult,
        cached: false,
        processingTime,
        source: 'fallback' as const
      })
    } catch (fallbackError) {
      console.error('Fallback scoring also failed:', fallbackError)
      return NextResponse.json(
        { error: 'Scoring failed' },
        { status: 500 }
      )
    }
  }
}