import { ScoreResult } from '@/stores/gameStore'

// Enhanced color families with more comprehensive naming
const COLOR_NAMES = {
  red: ['red', 'crimson', 'scarlet', 'cherry', 'ruby', 'rose', 'pink', 'salmon', 'brick', 'maroon', 'burgundy', 'wine', 'blood', 'strawberry', 'raspberry', 'cranberry'],
  blue: ['blue', 'navy', 'azure', 'cyan', 'turquoise', 'teal', 'indigo', 'cobalt', 'sapphire', 'cerulean', 'periwinkle', 'aqua', 'sky', 'ocean', 'sea', 'marine'],
  green: ['green', 'emerald', 'jade', 'lime', 'olive', 'mint', 'forest', 'pine', 'sage', 'chartreuse', 'kelly', 'seafoam', 'moss', 'grass', 'leaf', 'pistachio'],
  yellow: ['yellow', 'gold', 'amber', 'lemon', 'canary', 'butter', 'sunshine', 'blonde', 'honey', 'mustard', 'saffron', 'dandelion', 'corn', 'banana'],
  orange: ['orange', 'tangerine', 'peach', 'coral', 'apricot', 'rust', 'pumpkin', 'carrot', 'tiger', 'sunset', 'mango', 'papaya', 'citrus'],
  purple: ['purple', 'violet', 'magenta', 'plum', 'lavender', 'orchid', 'lilac', 'mauve', 'amethyst', 'eggplant', 'grape', 'iris', 'fuchsia', 'berry'],
  brown: ['brown', 'tan', 'beige', 'mocha', 'chocolate', 'coffee', 'caramel', 'taupe', 'walnut', 'chestnut', 'hazel', 'sienna', 'umber', 'bronze', 'khaki'],
  gray: ['gray', 'grey', 'silver', 'charcoal', 'ash', 'slate', 'pewter', 'steel', 'smoke', 'stone', 'graphite', 'cement', 'fog'],
  black: ['black', 'onyx', 'ebony', 'coal', 'midnight', 'raven', 'jet', 'obsidian', 'shadow', 'void', 'pitch'],
  white: ['white', 'cream', 'ivory', 'pearl', 'snow', 'vanilla', 'alabaster', 'milk', 'porcelain', 'linen', 'bone', 'frost']
}

// Enhanced humor detection with more categories
const HUMOR_PATTERNS = {
  descriptive_adjectives: ['funky', 'groovy', 'sassy', 'bold', 'wild', 'crazy', 'wacky', 'zesty', 'spicy', 'fierce', 'dramatic', 'moody', 'rebellious', 'mysterious'],
  fantastical: ['electric', 'cosmic', 'magical', 'dreamy', 'enchanted', 'mystical', 'ethereal', 'otherworldly', 'supernatural', 'celestial'],
  emotional: ['angry', 'happy', 'sad', 'confused', 'anxious', 'confident', 'proud', 'melancholy', 'cheerful', 'grumpy', 'flirty', 'nervous'],
  food_related: ['tasty', 'delicious', 'yummy', 'savory', 'sweet', 'bitter', 'sour', 'fresh', 'rotten', 'crispy'],
  unexpected: ['confused', 'questioning', 'lost', 'seeking', 'yearning', 'dancing', 'screaming', 'whispering', 'singing']
}

// Pop culture and creative references
const CREATIVE_REFERENCES = [
  'avocado', 'millennial', 'boomer', 'gen z', 'vibe', 'aesthetic', 'mood',
  'instagram', 'pinterest', 'tiktok', 'retro', 'vintage', 'hipster',
  '90s', '80s', '70s', 'disco', 'punk', 'goth', 'emo'
]

// Common/overused color descriptions
const COMMON_DESCRIPTIONS = [
  'nice', 'pretty', 'good', 'okay', 'normal', 'regular', 'standard',
  'basic', 'simple', 'plain', 'boring', 'ugly', 'bad', 'weird', 'meh'
]

// Conversational patterns that add personality
const CONVERSATIONAL_PATTERNS = [
  /\bi think\b/i,
  /\bkinda\b|\bkind of\b/i,
  /\bsort of\b|\bsorta\b/i,
  /\blike\b.*\bbut\b/i,
  /\bif.*were\b/i,
  /\bremind.*of\b/i,
  /\bmakes.*feel\b/i,
  /\blooks like\b/i
]

/**
 * Calculate humor score based on creativity and humor keywords
 * @param description The player's color description
 * @returns Score from 0-5
 */
function calculateFunnyScore(description: string): number {
  const desc = description.toLowerCase()
  const words = desc.split(/\s+/)
  let score = 0

  // Base score for length (more descriptive = potentially funnier)
  if (words.length >= 12) score += 1.5
  else if (words.length >= 8) score += 1
  else if (words.length >= 5) score += 0.5

  // Bonus for humor keywords across all categories
  const allHumorKeywords = Object.values(HUMOR_PATTERNS).flat()
  const humorMatches = words.filter(word =>
    allHumorKeywords.some((keyword: string) => word.includes(keyword))
  ).length
  score += Math.min(humorMatches * 0.6, 2.5)

  // Bonus for pop culture and creative references
  const creativeMatches = CREATIVE_REFERENCES.filter(ref => desc.includes(ref)).length
  score += Math.min(creativeMatches * 0.8, 1.5)

  // Bonus for conversational/personality patterns
  const conversationalMatches = CONVERSATIONAL_PATTERNS.filter(pattern => pattern.test(description)).length
  score += Math.min(conversationalMatches * 0.4, 1)

  // Bonus for creative metaphors or comparisons
  if (description.includes('like') || description.includes('as if') || description.includes('reminds me')) {
    score += 0.7
  }

  // Bonus for emotional descriptions (more personality = more humor potential)
  const emotionalWords = HUMOR_PATTERNS.emotional.filter(emotion => desc.includes(emotion)).length
  score += Math.min(emotionalWords * 0.5, 1)

  // Penalty for common/boring descriptions
  const commonMatches = COMMON_DESCRIPTIONS.filter(common => desc.includes(common)).length
  score -= commonMatches * 0.8

  // Bonus for unexpected/creative word usage
  if (words.length > 3 && commonMatches === 0) {
    score += 0.5
  }

  // Bonus for exclamation points (enthusiasm)
  const exclamations = (description.match(/!/g) || []).length
  score += Math.min(exclamations * 0.3, 0.6)

  return Math.max(0, Math.min(score, 5))
}

/**
 * Convert RGB to HSL for better color analysis
 */
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  }
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

  // Convert hex to RGB
  const hex = hexColor.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  // Get HSL for better color analysis
  const hsl = rgbToHsl(r, g, b)

  // Determine dominant color family based on hue
  let dominantColor = 'gray'
  if (hsl.s > 15) { // Only if color has saturation
    if (hsl.h >= 345 || hsl.h < 15) dominantColor = 'red'
    else if (hsl.h >= 15 && hsl.h < 45) dominantColor = 'orange'
    else if (hsl.h >= 45 && hsl.h < 75) dominantColor = 'yellow'
    else if (hsl.h >= 75 && hsl.h < 165) dominantColor = 'green'
    else if (hsl.h >= 165 && hsl.h < 255) dominantColor = 'blue'
    else if (hsl.h >= 255 && hsl.h < 345) dominantColor = 'purple'
  }

  // Check for black/white/gray based on lightness and saturation
  if (hsl.l < 15) dominantColor = 'black'
  else if (hsl.l > 85 && hsl.s < 20) dominantColor = 'white'
  else if (hsl.s < 15) dominantColor = 'gray'
  else if (hsl.h >= 20 && hsl.h < 45 && hsl.s < 50 && hsl.l < 60) dominantColor = 'brown'

  // Check for color name matches with enhanced scoring
  let colorMatchFound = false
  for (const [colorFamily, names] of Object.entries(COLOR_NAMES)) {
    const matches = names.filter(name => desc.includes(name))
    if (matches.length > 0) {
      colorMatchFound = true
      if (colorFamily === dominantColor) {
        score += 3.5 // High accuracy for correct color family
        // Bonus for specific color names (not just generic)
        if (matches.some(m => m.length > 5)) score += 0.5
      } else {
        // Check if it's a close color family
        const closeMatches = isCloseColorFamily(colorFamily, dominantColor)
        if (closeMatches) {
          score += 2 // Partial credit for close colors
        } else {
          score += 0.5 // Minimal credit for wrong color
        }
      }
      break
    }
  }

  // Bonus for lightness/darkness descriptions
  const brightness = (r + g + b) / 3
  const lightnessDescriptors = ['light', 'bright', 'pale', 'pastel', 'washed', 'faded']
  const darknessDescriptors = ['dark', 'deep', 'rich', 'intense', 'bold', 'vivid']
  const mutedDescriptors = ['muted', 'dull', 'dusty', 'grayish', 'desaturated']

  if (brightness > 180 && lightnessDescriptors.some(d => desc.includes(d))) {
    score += 1
  } else if (brightness < 80 && darknessDescriptors.some(d => desc.includes(d))) {
    score += 1
  }

  // Bonus for saturation descriptions
  if (hsl.s > 70 && (desc.includes('vibrant') || desc.includes('saturated') || desc.includes('vivid'))) {
    score += 0.5
  } else if (hsl.s < 30 && mutedDescriptors.some(d => desc.includes(d))) {
    score += 0.5
  }

  // If no color name mentioned at all, cap the score
  if (!colorMatchFound) {
    score = Math.min(score, 1.5)
  }

  return Math.min(score, 5)
}

/**
 * Check if two color families are close/related
 */
function isCloseColorFamily(color1: string, color2: string): boolean {
  const closeColors: Record<string, string[]> = {
    red: ['pink', 'orange', 'purple'],
    orange: ['red', 'yellow', 'brown'],
    yellow: ['orange', 'green'],
    green: ['yellow', 'blue'],
    blue: ['green', 'purple'],
    purple: ['blue', 'red', 'pink'],
    pink: ['red', 'purple'],
    brown: ['orange', 'red']
  }

  return closeColors[color1]?.includes(color2) || closeColors[color2]?.includes(color1) || false
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
  score -= commonCount * 0.7

  // Penalty for being too short (not descriptive enough)
  if (words.length < 2) score -= 2
  else if (words.length < 4) score -= 1

  // Bonus for being descriptive but not overly complex (sweet spot)
  if (words.length >= 5 && words.length <= 10) score += 1.5
  else if (words.length >= 4 && words.length <= 12) score += 0.8

  // Penalty for being overly complex or rambling
  if (words.length > 20) score -= 1.5
  else if (words.length > 15) score -= 0.8

  // Bonus for creative but understandable descriptions
  const creativeWords = words.filter(word =>
    word.length > 6 && !COMMON_DESCRIPTIONS.includes(word)
  ).length
  if (creativeWords > 0 && creativeWords <= 4) {
    score += 0.8
  } else if (creativeWords > 4) {
    score -= 0.3 // Too many complex words = harder to understand
  }

  // Bonus for pop culture references (likely to be popular/shareable)
  const popCultureRefs = CREATIVE_REFERENCES.filter(ref => desc.includes(ref)).length
  score += Math.min(popCultureRefs * 0.6, 1.2)

  // Bonus for emotional/personality descriptors (more engaging)
  const emotionalWords = HUMOR_PATTERNS.emotional.filter(emotion => desc.includes(emotion)).length
  score += Math.min(emotionalWords * 0.4, 1)

  // Bonus for having a conversational tone (more relatable)
  const conversationalTone = CONVERSATIONAL_PATTERNS.filter(pattern => pattern.test(description)).length
  score += Math.min(conversationalTone * 0.5, 1)

  // Bonus for specificity (good balance of unique and descriptive)
  const specificDescriptors = ['exactly', 'precisely', 'specifically', 'distinctly', 'particularly']
  if (specificDescriptors.some(d => desc.includes(d))) {
    score += 0.5
  }

  // Penalty for being too vague
  const vagueDescriptors = ['somewhat', 'maybe', 'possibly', 'unclear', 'undefined']
  const vagueCount = vagueDescriptors.filter(v => desc.includes(v)).length
  score -= vagueCount * 0.4

  // Bonus for questions or curiosity (engaging)
  if (description.includes('?')) {
    score += 0.4
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