'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface ConfettiPiece {
  id: number
  x: number
  y: number
  color: string
  rotation: number
  size: number
  delay: number
}

interface ConfettiProps {
  trigger: boolean
  onComplete?: () => void
}

const confettiColors = [
  '#FFD700', // Gold
  '#FF1493', // Hot Pink
  '#00FFFF', // Cyan
  '#39FF14', // Neon Green
  '#8A2BE2', // Blue Violet
  '#FF4500', // Orange Red
  '#FFFF00', // Yellow
  '#FF69B4', // Hot Pink
]

export function Confetti({ trigger, onComplete }: ConfettiProps) {
  const [confettiPieces, setConfettiPieces] = useState<ConfettiPiece[]>([])
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    if (trigger && !isActive) {
      setIsActive(true)
      
      // Generate confetti pieces
      const pieces: ConfettiPiece[] = []
      for (let i = 0; i < 50; i++) {
        pieces.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: -20,
          color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
          rotation: Math.random() * 360,
          size: Math.random() * 8 + 4,
          delay: Math.random() * 0.5
        })
      }
      
      setConfettiPieces(pieces)
      
      // Clear confetti after animation
      setTimeout(() => {
        setIsActive(false)
        setConfettiPieces([])
        onComplete?.()
      }, 3000)
    }
  }, [trigger, isActive, onComplete])

  if (!isActive) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confettiPieces.map((piece) => (
        <motion.div
          key={piece.id}
          initial={{
            x: piece.x,
            y: piece.y,
            rotate: piece.rotation,
            opacity: 1,
            scale: 1
          }}
          animate={{
            y: window.innerHeight + 100,
            rotate: piece.rotation + 720,
            opacity: [1, 1, 0.8, 0],
            scale: [1, 1.2, 1, 0.8]
          }}
          transition={{
            duration: 3,
            delay: piece.delay,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          className="absolute"
          style={{
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '0%'
          }}
        />
      ))}
    </div>
  )
}