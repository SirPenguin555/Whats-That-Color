import { ScoreResult } from '@/stores/gameStore'

interface ScoreAPIResponse {
  scores: ScoreResult
  cached: boolean
  processingTime: number
  source: 'ai' | 'fallback'
}

interface ScoreRequest {
  description: string
  hexColor?: string
  dualColors?: { colorA: string; colorB: string }
  apiKey?: string
}

// Simple cache for API responses
class ScoringCache {
  private cache = new Map<string, { data: ScoreAPIResponse; timestamp: number }>()
  private readonly TTL = 24 * 60 * 60 * 1000 // 24 hours
  private readonly MAX_SIZE = 100

  private generateKey(description: string, colorData: string | { colorA: string; colorB: string }): string {
    // Simple hash function for cache key
    const colorStr = typeof colorData === 'string'
      ? colorData.toLowerCase()
      : `${colorData.colorA.toLowerCase()}_${colorData.colorB.toLowerCase()}`
    const str = `${colorStr}_${description.toLowerCase().trim()}`
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return `score_${Math.abs(hash)}`
  }

  get(description: string, colorData: string | { colorA: string; colorB: string }): ScoreAPIResponse | null {
    const key = this.generateKey(description, colorData)
    const cached = this.cache.get(key)

    if (!cached) return null

    // Check if expired
    if (Date.now() - cached.timestamp > this.TTL) {
      this.cache.delete(key)
      return null
    }

    return { ...cached.data, cached: true }
  }

  set(description: string, colorData: string | { colorA: string; colorB: string }, data: ScoreAPIResponse): void {
    const key = this.generateKey(description, colorData)
    
    // Implement LRU eviction if at max size
    if (this.cache.size >= this.MAX_SIZE) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }
    
    this.cache.set(key, {
      data: { ...data, cached: false },
      timestamp: Date.now()
    })
  }

  clear(): void {
    this.cache.clear()
  }

  getStats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size,
      maxSize: this.MAX_SIZE
    }
  }
}

// Global cache instance
const scoringCache = new ScoringCache()

export async function scoreDescriptionWithAI(
  description: string,
  colorData: string | { colorA: string; colorB: string }
): Promise<ScoreAPIResponse> {
  // Check cache first
  const cached = scoringCache.get(description, colorData)
  if (cached) {
    return cached
  }

  // Get user's API key from localStorage
  const userApiKey = localStorage.getItem('openai_api_key')
  const scoringMethod = localStorage.getItem('scoring_method')

  try {
    const requestBody: ScoreRequest = {
      description: description.trim(),
      ...(typeof colorData === 'string'
        ? { hexColor: colorData.toLowerCase() }
        : { dualColors: { colorA: colorData.colorA.toLowerCase(), colorB: colorData.colorB.toLowerCase() } }),
      ...(userApiKey && scoringMethod === 'openai' && { apiKey: userApiKey })
    }

    const response = await fetch('/api/score-description', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    const result: ScoreAPIResponse = await response.json()

    // Cache the result
    scoringCache.set(description, colorData, result)

    return result
  } catch (error) {
    console.error('AI scoring API call failed:', error)
    throw error
  }
}

// Export cache for debugging/stats
export const getCacheStats = () => scoringCache.getStats()
export const clearCache = () => scoringCache.clear()