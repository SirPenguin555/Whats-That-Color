'use client'

import React, { useState, useCallback } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { generateDifferentColor } from '@/utils/colorGenerator'
import { scoreDescription } from '@/utils/scoringEngine'
import { ColorDisplay } from './ColorDisplay'
import { DescriptionInput } from './DescriptionInput'
import { ScoreDisplay } from './ScoreDisplay'

export function GameContainer() {
  const {
    currentColor,
    currentScores,
    isSubmitting,
    setCurrentColor,
    setPlayerDescription,
    setCurrentScores,
    setIsSubmitting,
    addToHistory
  } = useGameStore()
  
  const [showScores, setShowScores] = useState(false)
  
  const handleDescriptionSubmit = useCallback(async (description: string) => {
    if (!description.trim() || isSubmitting) return
    
    setIsSubmitting(true)
    setPlayerDescription(description)
    
    try {
      // Simulate some processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Calculate scores
      const scores = scoreDescription(description, currentColor)
      setCurrentScores(scores)
      
      // Add to history
      addToHistory({
        id: Date.now().toString(),
        hexColor: currentColor,
        description,
        scores,
        timestamp: new Date()
      })
      
      // Show scores
      setShowScores(true)
      
    } catch (error) {
      console.error('Error scoring description:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [currentColor, isSubmitting, setIsSubmitting, setPlayerDescription, setCurrentScores, addToHistory])
  
  const handleNewGame = useCallback(() => {
    // Generate a new color
    const newColor = generateDifferentColor(currentColor)
    setCurrentColor(newColor)
    
    // Reset game state
    setCurrentScores(null)
    setPlayerDescription('')
    setShowScores(false)
  }, [currentColor, setCurrentColor, setCurrentScores, setPlayerDescription])
  
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Color Display */}
      <ColorDisplay hexColor={currentColor} />
      
      {/* Game Interface Overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-8">
        <div className="w-full max-w-4xl mx-auto">
          {/* Score Display */}
          {showScores && currentScores && (
            <div className="mb-8">
              <ScoreDisplay 
                scores={currentScores}
                isVisible={showScores}
                onNewGame={handleNewGame}
              />
            </div>
          )}
          
          {/* Input Section */}
          {!showScores && (
            <DescriptionInput
              onSubmit={handleDescriptionSubmit}
              isSubmitting={isSubmitting}
              disabled={showScores}
              placeholder="Describe this color in your own creative way..."
            />
          )}
        </div>
      </div>
      
      {/* Game Instructions (only show on first load) */}
      {!currentScores && !isSubmitting && (
        <div className="absolute top-4 left-4 right-4 md:top-8 md:left-8 md:right-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 max-w-md mx-auto md:mx-0">
            <h2 className="font-gameshow text-lg text-gray-800 mb-2">
              🎨 How to Play
            </h2>
            <p className="text-sm text-gray-600">
              Look at the color and describe it however you like! 
              Be funny, accurate, or creative - you&apos;ll get scored on all three.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}