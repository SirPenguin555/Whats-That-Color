import { ScoreResult } from '@/stores/gameStore'

// Basic color names for accuracy scoring
const COLOR_NAMES = {
  red: ['red', 'crimson', 'scarlet', 'cherry', 'ruby', 'rose', 'pink'],
  blue: ['blue', 'navy', 'azure', 'cyan', 'turquoise', 'teal', 'indigo'],
  green: ['green', 'emerald', 'jade', 'lime', 'olive', 'mint', 'forest'],
  yellow: ['yellow', 'gold', 'amber', 'lemon', 'canary', 'butter'],
  orange: ['orange', 'tangerine', 'peach', 'coral', 'apricot', 'rust'],
  purple: ['purple', 'violet', 'magenta', 'plum', 'lavender', 'orchid'],
  brown: ['brown', 'tan', 'beige', 'mocha', 'chocolate', 'coffee'],
  gray: ['gray', 'grey', 'silver', 'charcoal', 'ash', 'slate'],
  black: ['black', 'onyx', 'ebony', 'coal', 'midnight'],
  white: ['white', 'cream', 'ivory', 'pearl', 'snow', 'vanilla']
}

// Humor keywords that might indicate funny descriptions
const HUMOR_KEYWORDS = [
  'funky', 'groovy', 'sassy', 'bold', 'wild', 'crazy', 'wacky', 'zesty',
  'spicy', 'fierce', 'dramatic', 'moody', 'rebellious', 'mysterious',
  'electric', 'cosmic', 'magical', 'dreamy', 'enchanted'
]

// Common/overused color descriptions
const COMMON_DESCRIPTIONS = [
  'nice', 'pretty', 'good', 'okay', 'normal', 'regular', 'standard',
  'basic', 'simple', 'plain', 'boring', 'ugly', 'bad', 'weird'
]

/**
 * Calculate humor score based on creativity and humor keywords
 * @param description The player's color description
 * @returns Score from 0-5
 */
function calculateFunnyScore(description: string): number {
  const words = description.toLowerCase().split(/\s+/)
  let score = 0
  
  // Base score for length (more descriptive = potentially funnier)
  if (words.length >= 10) score += 1
  if (words.length >= 5) score += 0.5
  
  // Bonus for humor keywords
  const humorMatches = words.filter(word => 
    HUMOR_KEYWORDS.some(keyword => word.includes(keyword))
  ).length
  score += Math.min(humorMatches * 0.5, 2)
  
  // Bonus for creative metaphors or comparisons
  if (description.includes('like') || description.includes('as if')) {
    score += 0.5
  }
  
  // Bonus for unusual word combinations
  if (words.length > 3 && !COMMON_DESCRIPTIONS.some(common => 
    description.toLowerCase().includes(common)
  )) {
    score += 0.5
  }
  
  return Math.min(score, 5)
}

/**
 * Calculate accuracy score based on color matching
 * @param description The player's color description
 * @param hexColor The actual hex color
 * @returns Score from 0-5
 */
function calculateAccuracyScore(description: string, hexColor: string): number {
  const desc = description.toLowerCase()
  let score = 0
  
  // Convert hex to RGB for basic color matching
  const hex = hexColor.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  
  // Determine dominant color
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const diff = max - min
  
  let dominantColor = 'gray'
  if (diff > 50) {
    if (r === max) dominantColor = 'red'
    else if (g === max) dominantColor = 'green'
    else if (b === max) dominantColor = 'blue'
  }
  
  // Check for color name matches
  for (const [colorFamily, names] of Object.entries(COLOR_NAMES)) {
    const matches = names.filter(name => desc.includes(name))
    if (matches.length > 0) {
      if (colorFamily === dominantColor) {
        score += 3 // High accuracy for correct color family
      } else {
        score += 1 // Some credit for any color name
      }
      break
    }
  }
  
  // Bonus for lightness/darkness descriptions
  const brightness = (r + g + b) / 3
  if (brightness > 180 && (desc.includes('light') || desc.includes('bright') || desc.includes('pale'))) {
    score += 1
  } else if (brightness < 80 && (desc.includes('dark') || desc.includes('deep') || desc.includes('rich'))) {
    score += 1
  }
  
  return Math.min(score, 5)
}

/**
 * Calculate popularity score based on uniqueness vs comprehensibility
 * @param description The player's color description
 * @returns Score from 0-5
 */
function calculatePopularityScore(description: string): number {
  const desc = description.toLowerCase()
  const words = desc.split(/\s+/)
  let score = 3 // Start at middle ground
  
  // Penalty for very common descriptions
  const commonCount = COMMON_DESCRIPTIONS.filter(common => 
    desc.includes(common)
  ).length
  score -= commonCount * 0.5
  
  // Penalty for being too short (not descriptive enough)
  if (words.length < 3) score -= 1
  
  // Bonus for being descriptive but not overly complex
  if (words.length >= 4 && words.length <= 8) score += 1
  
  // Penalty for being overly complex
  if (words.length > 12) score -= 0.5
  
  // Bonus for creative but understandable descriptions
  const creativeWords = words.filter(word => 
    word.length > 6 && !COMMON_DESCRIPTIONS.includes(word)
  ).length
  if (creativeWords > 0 && creativeWords <= 3) {
    score += 0.5
  }
  
  return Math.max(0, Math.min(score, 5))
}

/**
 * Calculate overall score from individual category scores
 * @param funny Humor score (0-5)
 * @param accurate Accuracy score (0-5)
 * @param popular Popularity score (0-5)
 * @returns Overall weighted score (0-5)
 */
function calculateOverallScore(funny: number, accurate: number, popular: number): number {
  // Weighted average: Accuracy 40%, Funny 30%, Popular 30%
  const weighted = (accurate * 0.4) + (funny * 0.3) + (popular * 0.3)
  return Math.round(weighted * 10) / 10 // Round to 1 decimal place
}

/**
 * Main scoring function that evaluates a color description
 * @param description The player's description
 * @param hexColor The hex color being described
 * @returns Complete score breakdown
 */
export function scoreDescription(description: string, hexColor: string): ScoreResult {
  if (!description.trim()) {
    return { funny: 0, accurate: 0, popular: 0, overall: 0 }
  }
  
  const funny = Math.round(calculateFunnyScore(description) * 10) / 10
  const accurate = Math.round(calculateAccuracyScore(description, hexColor) * 10) / 10
  const popular = Math.round(calculatePopularityScore(description) * 10) / 10
  const overall = calculateOverallScore(funny, accurate, popular)
  
  return {
    funny,
    accurate,
    popular,
    overall
  }
}