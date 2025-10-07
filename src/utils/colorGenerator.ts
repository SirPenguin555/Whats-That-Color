/**
 * Generates a random hex color
 * @returns A valid 6-digit hex color string with # prefix
 */
export function generateRandomColor(): string {
  const hex = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
  return `#${hex}`
}

/**
 * Ensures colors don't repeat in sequence
 * @param previousColor The last generated color
 * @returns A new color different from the previous one
 */
export function generateDifferentColor(previousColor: string): string {
  let newColor = generateRandomColor()
  let attempts = 0
  
  // Prevent infinite loops with max attempts
  while (newColor === previousColor && attempts < 10) {
    newColor = generateRandomColor()
    attempts++
  }
  
  return newColor
}

/**
 * Validates if a string is a valid hex color
 * @param color The color string to validate
 * @returns true if valid hex color format
 */
export function isValidHexColor(color: string): boolean {
  const hexPattern = /^#[0-9A-Fa-f]{6}$/
  return hexPattern.test(color)
}

/**
 * Converts hex color to RGB values
 * @param hex The hex color string
 * @returns RGB object with r, g, b values
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  if (!isValidHexColor(hex)) return null
  
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

/**
 * Determines if text should be light or dark based on background color
 * @param hex The background hex color
 * @returns 'light' or 'dark' for optimal contrast
 */
export function getContrastColor(hex: string): 'light' | 'dark' {
  const rgb = hexToRgb(hex)
  if (!rgb) return 'dark'

  // Calculate luminance using the relative luminance formula
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255
  return luminance > 0.5 ? 'dark' : 'light'
}

/**
 * Calculates Euclidean distance between two colors in RGB space
 * @param hex1 First hex color
 * @param hex2 Second hex color
 * @returns Distance value (0-441)
 */
export function getColorDistance(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1)
  const rgb2 = hexToRgb(hex2)

  if (!rgb1 || !rgb2) return 0

  const rDiff = rgb1.r - rgb2.r
  const gDiff = rgb1.g - rgb2.g
  const bDiff = rgb1.b - rgb2.b

  return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff)
}

/**
 * Generates two random colors with sufficient distance between them
 * @param minDistance Minimum color distance (default: 100)
 * @returns Object with colorA and colorB
 */
export function generateDualColors(minDistance: number = 100): { colorA: string; colorB: string } {
  const colorA = generateRandomColor()
  let colorB = generateRandomColor()
  let attempts = 0

  // Ensure colors are sufficiently different
  while (getColorDistance(colorA, colorB) < minDistance && attempts < 20) {
    colorB = generateRandomColor()
    attempts++
  }

  return { colorA, colorB }
}