'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star } from '@phosphor-icons/react'
import { ScoreResult } from '@/stores/gameStore'

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: number
  animated?: boolean
  showValue?: boolean
  label?: string
}

function StarRating({ 
  rating, 
  maxRating = 5, 
  size = 24, 
  animated = true,
  showValue = true,
  label 
}: StarRatingProps) {
  const stars = []
  
  for (let i = 1; i <= maxRating; i++) {
    const filled = rating >= i
    const partialFill = rating > i - 1 && rating < i
    const fillPercentage = partialFill ? ((rating - (i - 1)) * 100) : (filled ? 100 : 0)
    
    stars.push(
      <motion.div
        key={i}
        initial={animated ? { scale: 0, rotate: -180 } : undefined}
        animate={animated ? { scale: 1, rotate: 0 } : undefined}
        transition={animated ? { 
          delay: i * 0.1, 
          duration: 0.5, 
          type: "spring",
          stiffness: 200
        } : undefined}
        className="relative"
      >
        {/* Background star */}
        <Star 
          size={size} 
          weight="fill" 
          className="text-star-empty"
        />
        
        {/* Filled star with partial fill */}
        {fillPercentage > 0 && (
          <div 
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${fillPercentage}%` }}
          >
            <Star 
              size={size} 
              weight="fill" 
              className="text-star-filled animate-star-glow"
            />
          </div>
        )}
      </motion.div>
    )
  }
  
  return (
    <div className="flex items-center gap-1">
      {label && (
        <span className="text-sm font-medium text-gray-700 mr-2">
          {label}:
        </span>
      )}
      <div className="flex items-center gap-1">
        {stars}
      </div>
      {showValue && (
        <span className="ml-2 text-sm font-bold text-gray-800">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}

interface ScoreDisplayProps {
  scores: ScoreResult | null
  isVisible?: boolean
  onNewGame?: () => void
  className?: string
}

export function ScoreDisplay({ 
  scores, 
  isVisible = true, 
  onNewGame,
  className = '' 
}: ScoreDisplayProps) {
  if (!scores || !isVisible) {
    return null
  }
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.9 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
        className={`bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl 
                   border border-gray-200 max-w-md mx-auto ${className}`}
      >
        {/* Overall Score */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl font-gameshow text-gray-800 mb-4">
            Your Score
          </h2>
          
          <div className="mb-4">
            <StarRating 
              rating={scores.overall} 
              size={40} 
              animated={true}
              showValue={false}
            />
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-4xl font-bold text-gameshow-gold mb-2"
          >
            {scores.overall.toFixed(1)} ⭐
          </motion.div>
        </motion.div>
        
        {/* Category Breakdown */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-4 mb-8"
        >
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4">
            <StarRating 
              rating={scores.funny} 
              size={20}
              label="Funny"
              animated={true}
            />
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-4">
            <StarRating 
              rating={scores.accurate} 
              size={20}
              label="Accurate"
              animated={true}
            />
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4">
            <StarRating 
              rating={scores.popular} 
              size={20}
              label="Popular"
              animated={true}
            />
          </div>
        </motion.div>
        
        {/* New Game Button */}
        {onNewGame && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            onClick={onNewGame}
            className="w-full py-4 px-6 bg-gradient-to-r from-gameshow-gold to-yellow-500
                     text-white font-bold rounded-2xl text-lg
                     hover:from-yellow-500 hover:to-gameshow-gold
                     transform transition-all duration-300
                     hover:scale-105 active:scale-95
                     shadow-lg hover:shadow-xl"
          >
            Next Color! 🎨
          </motion.button>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

export { StarRating }