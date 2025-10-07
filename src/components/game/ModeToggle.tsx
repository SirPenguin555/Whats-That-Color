'use client'

import { motion } from 'framer-motion'
import { useGameStore } from '@/stores/gameStore'
import { generateRandomColor, generateDualColors } from '@/utils/colorGenerator'

export function ModeToggle() {
  const { gameMode, setGameMode, setCurrentColor, setDualColors, setCurrentScores, setPlayerDescription } = useGameStore()

  const handleToggle = () => {
    const newMode = gameMode === 'single' ? 'dual' : 'single'
    setGameMode(newMode)

    // Reset game state and generate new colors
    setCurrentScores(null)
    setPlayerDescription('')

    if (newMode === 'dual') {
      const colors = generateDualColors()
      setDualColors(colors)
    } else {
      setDualColors(null)
      setCurrentColor(generateRandomColor())
    }
  }

  return (
    <div className="flex justify-center mb-4">
      <motion.button
        onClick={handleToggle}
        className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm
                   px-6 py-2 rounded-full shadow-lg
                   font-semibold text-sm
                   border-2 border-purple-500
                   hover:bg-purple-50 dark:hover:bg-gray-700
                   transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {gameMode === 'single' ? '🎨 Dual Mode' : '🎨 Single Mode'}
      </motion.button>
    </div>
  )
}
