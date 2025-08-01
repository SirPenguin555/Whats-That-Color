'use client'

import React, { useState, useCallback } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { generateDifferentColor } from '@/utils/colorGenerator'
import { scoreDescription } from '@/utils/scoringEngine'
import { scoreDescriptionWithAI } from '@/lib/aiScoring'
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
  const [loadingStatus, setLoadingStatus] = useState<string | null>(null)
  
  const handleDescriptionSubmit = useCallback(async (description: string) => {
    if (!description.trim() || isSubmitting) return
    
    setIsSubmitting(true)
    setPlayerDescription(description)
    setLoadingStatus('Analyzing your description...')
    
    try {
      // Try AI scoring first
      const aiEnabled = process.env.NEXT_PUBLIC_AI_SCORING_ENABLED === 'true'
      let scores
      
      if (aiEnabled) {
        try {
          setLoadingStatus('🤖 AI is evaluating your creativity...')
          const apiResponse = await scoreDescriptionWithAI(description, currentColor)
          scores = apiResponse.scores
          
          // Show feedback about scoring method
          if (apiResponse.source === 'ai') {
            setLoadingStatus('✨ Scored by AI!')
          } else {
            setLoadingStatus('💡 Using smart algorithm')
          }
          
          // Brief delay to show the status
          await new Promise(resolve => setTimeout(resolve, 500))
        } catch (aiError) {
          console.warn('AI scoring failed, using fallback:', aiError)
          setLoadingStatus('💡 Using smart algorithm')
          scores = scoreDescription(description, currentColor)
          await new Promise(resolve => setTimeout(resolve, 300))
        }
      } else {
        setLoadingStatus('💡 Evaluating with smart algorithm...')
        await new Promise(resolve => setTimeout(resolve, 800))
        scores = scoreDescription(description, currentColor)
      }
      
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
      setLoadingStatus('⚠️ Something went wrong, using backup scoring')
      
      // Fallback to basic scoring
      const fallbackScores = scoreDescription(description, currentColor)
      setCurrentScores(fallbackScores)
      
      addToHistory({
        id: Date.now().toString(),
        hexColor: currentColor,
        description,
        scores: fallbackScores,
        timestamp: new Date()
      })
      
      setShowScores(true)
    } finally {
      setIsSubmitting(false)
      setLoadingStatus(null)
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
          
          {/* Loading Status */}
          {isSubmitting && loadingStatus && (
            <div className="mb-8">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 text-center">
                <div className="animate-pulse mb-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mx-auto mb-3 animate-bounce"></div>
                </div>
                <p className="font-gameshow text-lg text-gray-800">
                  {loadingStatus}
                </p>
              </div>
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