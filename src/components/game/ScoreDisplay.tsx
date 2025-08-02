'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star } from '@phosphor-icons/react'
import { ScoreResult } from '@/stores/gameStore'
import { Confetti } from './Confetti'

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
        initial={animated ? { scale: 0, rotate: -360, opacity: 0 } : undefined}
        animate={animated ? { scale: 1, rotate: 0, opacity: 1 } : undefined}
        transition={animated ? { 
          delay: i * 0.15, 
          duration: 0.8, 
          type: "spring",
          stiffness: 300,
          damping: 20
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
  const [showConfetti, setShowConfetti] = useState(false)
  const [confettiTriggered, setConfettiTriggered] = useState(false)

  // Trigger confetti for high scores (4.0 or higher)
  useEffect(() => {
    if (scores && scores.overall >= 4.0 && isVisible && !confettiTriggered) {
      setTimeout(() => {
        setShowConfetti(true)
        setConfettiTriggered(true)
      }, 2500) // Delay to sync with score reveal
    }
  }, [scores, isVisible, confettiTriggered])

  if (!scores || !isVisible) {
    return null
  }
  
  return (
    <AnimatePresence>
      {/* Confetti for high scores */}
      <Confetti 
        trigger={showConfetti} 
        onComplete={() => setShowConfetti(false)}
      />
      
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.5, rotateX: 90 }}
        animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
        exit={{ opacity: 0, y: -100, scale: 0.5, rotateX: -90 }}
        transition={{ duration: 1, type: "spring", stiffness: 150, damping: 15 }}
        className={`bg-gradient-to-br from-yellow-50 via-white to-purple-50 
                   backdrop-blur-sm rounded-2xl p-8 shadow-2xl 
                   border-4 border-gradient-to-r from-gameshow-gold via-gameshow-hot to-gameshow-purple
                   max-w-md mx-auto ${className}`}
        style={{
          background: 'linear-gradient(135deg, #fef3c7 0%, #ffffff 50%, #f3e8ff 100%)',
          borderImage: 'linear-gradient(45deg, #ffd700, #ff1493, #8a2be2) 1'
        }}
      >
        {/* Overall Score */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-gameshow font-bold bg-gradient-to-r from-gameshow-gold via-gameshow-hot to-gameshow-purple bg-clip-text text-transparent mb-4">
            {scores.overall >= 4.5 ? 'AMAZING SCORE!' : 
             scores.overall >= 4.0 ? 'EXCELLENT!' : 
             'YOUR SCORE!'}
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
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
            className="text-6xl font-bold bg-gradient-to-r from-yellow-400 via-gameshow-gold to-yellow-600 bg-clip-text text-transparent mb-2 drop-shadow-lg"
            style={{
              textShadow: '0 0 20px rgba(255, 215, 0, 0.5), 0 0 40px rgba(255, 215, 0, 0.3)'
            }}
          >
            {scores.overall.toFixed(1)} ⭐
          </motion.div>
        </motion.div>
        
        {/* Category Breakdown */}
        <div className="space-y-4 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 1.2, duration: 0.6, type: "spring" }}
            className="bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100 rounded-2xl p-4 border-2 border-purple-200 shadow-lg flex justify-center"
          >
            <StarRating 
              rating={scores.funny} 
              size={24}
              label="😂 Funny"
              animated={true}
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 1.8, duration: 0.6, type: "spring" }}
            className="bg-gradient-to-r from-blue-100 via-cyan-100 to-blue-100 rounded-2xl p-4 border-2 border-blue-200 shadow-lg flex justify-center"
          >
            <StarRating 
              rating={scores.accurate} 
              size={24}
              label="🎯 Accurate"
              animated={true}
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: -100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 2.4, duration: 0.6, type: "spring" }}
            className="bg-gradient-to-r from-green-100 via-emerald-100 to-green-100 rounded-2xl p-4 border-2 border-green-200 shadow-lg flex justify-center"
          >
            <StarRating 
              rating={scores.popular} 
              size={24}
              label="👑 Popular"
              animated={true}
            />
          </motion.div>
        </div>
        
        {/* New Game Button */}
        {onNewGame && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 3, duration: 0.8, type: "spring", stiffness: 200 }}
            onClick={onNewGame}
            className="w-full py-4 px-6 bg-gradient-to-r from-gameshow-gold via-yellow-400 to-gameshow-gold
                     text-black font-bold rounded-2xl text-xl font-gameshow
                     hover:from-yellow-300 hover:via-gameshow-gold hover:to-yellow-300
                     transform transition-all duration-300
                     hover:scale-105 active:scale-95
                     shadow-xl hover:shadow-2xl border-4 border-yellow-300
                     animate-pulse hover:animate-none"
            style={{
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
              boxShadow: '0 0 20px rgba(255, 215, 0, 0.5), 0 10px 30px rgba(0,0,0,0.3)'
            }}
          >
            NEXT COLOR!
          </motion.button>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

export { StarRating }