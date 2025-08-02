/**
 * Convert hex color to RGB values
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

/**
 * Calculate luminance of an RGB color
 * Based on WCAG guidelines for color contrast
 */
export function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/**
 * Determine if a color is light or dark
 * Returns true if the color is light (needs dark text)
 */
export function isLightColor(hexColor: string): boolean {
  const rgb = hexToRgb(hexColor)
  if (!rgb) return true // Default to light if can't parse
  
  const luminance = getLuminance(rgb.r, rgb.g, rgb.b)
  return luminance > 0.5
}

/**
 * Get contrasting text color (black or white) for a given background color
 */
export function getContrastingTextColor(hexColor: string): 'black' | 'white' {
  return isLightColor(hexColor) ? 'black' : 'white'
}