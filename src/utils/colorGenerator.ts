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