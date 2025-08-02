import { ColorEntry } from '@/stores/gameStore'

// All color history operations now use localStorage only
// Data is managed through Zustand store with persist middleware

// Get color history from localStorage (via Zustand store)
export async function getColorHistory(
  limitCount: number = 50,
  minScore?: number
): Promise<ColorEntry[]> {
  try {
    // Get data from localStorage through Zustand
    const stored = localStorage.getItem('whats-that-color-storage')
    if (!stored) return []
    
    const data = JSON.parse(stored)
    const gameHistory = data.state?.gameHistory || []
    
    // Convert timestamp strings back to Date objects if needed
    const history = gameHistory.map((entry: ColorEntry) => ({
      ...entry,
      timestamp: new Date(entry.timestamp)
    }))
    
    // Filter by minimum score if specified
    const filtered = minScore !== undefined 
      ? history.filter((entry: ColorEntry) => entry.scores.overall >= minScore)
      : history
    
    // Sort by timestamp (newest first) and limit results
    return filtered
      .sort((a: ColorEntry, b: ColorEntry) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, limitCount)
  } catch (error) {
    console.error('Error loading color history from localStorage:', error)
    return []
  }
}

// Search color history in localStorage
export async function searchColorHistory(
  searchTerm: string,
  limitCount: number = 20
): Promise<ColorEntry[]> {
  try {
    const allHistory = await getColorHistory(100) // Get more entries to search through
    
    // Client-side filtering
    const searchLower = searchTerm.toLowerCase()
    return allHistory
      .filter(entry => 
        entry.description.toLowerCase().includes(searchLower) ||
        entry.hexColor.toLowerCase().includes(searchLower)
      )
      .slice(0, limitCount)
  } catch (error) {
    console.error('Error searching color history:', error)
    return []
  }
}

// Get user statistics from localStorage
export async function getUserStatistics(): Promise<{
  totalEntries: number
  averageScore: number
  highestScore: number
  favoriteColors: string[]
}> {
  try {
    const allHistory = await getColorHistory(1000) // Get all entries for stats
    
    if (allHistory.length === 0) {
      return {
        totalEntries: 0,
        averageScore: 0,
        highestScore: 0,
        favoriteColors: []
      }
    }

    const totalScore = allHistory.reduce((sum, entry) => sum + entry.scores.overall, 0)
    const averageScore = totalScore / allHistory.length
    const highestScore = Math.max(...allHistory.map(entry => entry.scores.overall))
    
    // Get most common colors (simplified)
    const colorCounts: Record<string, number> = {}
    allHistory.forEach(entry => {
      colorCounts[entry.hexColor] = (colorCounts[entry.hexColor] || 0) + 1
    })
    
    const favoriteColors = Object.entries(colorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([color]) => color)

    return {
      totalEntries: allHistory.length,
      averageScore: Math.round(averageScore * 10) / 10,
      highestScore: Math.round(highestScore * 10) / 10,
      favoriteColors
    }
  } catch (error) {
    console.error('Error getting user statistics:', error)
    return {
      totalEntries: 0,
      averageScore: 0,
      highestScore: 0,
      favoriteColors: []
    }
  }
}

// Save color entry (now handled by Zustand store automatically, but kept for API compatibility)
export async function saveColorEntry(): Promise<void> {
  // This function is now a no-op since Zustand with persist middleware
  // automatically saves to localStorage when addToHistory is called
  // Keeping this function for backwards compatibility with existing code
  return Promise.resolve()
}

// Generate anonymous user ID (keeping for potential future use)
export function generateAnonymousUserId(): string {
  const existingId = localStorage.getItem('anonymous_user_id')
  if (existingId) return existingId
  
  const newId = 'anon_' + Math.random().toString(36).substring(2) + Date.now().toString(36)
  localStorage.setItem('anonymous_user_id', newId)
  return newId
}