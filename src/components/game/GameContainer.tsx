'use client'

import React, { useState, useCallback } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { generateDifferentColor } from '@/utils/colorGenerator'
import { scoreDescription } from '@/utils/scoringEngine'
import { scoreDescriptionWithAI } from '@/lib/aiScoring'
import { ColorDisplay } from './ColorDisplay'
import { DescriptionInput } from './DescriptionInput'
import { ScoreDisplay } from './ScoreDisplay'
import { Tutorial } from './Tutorial'

export function GameContainer() {
  const {
    currentColor,
    currentScores,
    isSubmitting,
    showTutorial,
    setCurrentColor,
    setPlayerDescription,
    setCurrentScores,
    setIsSubmitting,
    addToHistory,
    completeTutorial,
    setShowTutorial
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
  
  const handleRefreshColor = useCallback(() => {
    if (isSubmitting) return // Don't allow refresh during submission
    
    // Generate a new color without resetting scores/description
    const newColor = generateDifferentColor(currentColor)
    setCurrentColor(newColor)
  }, [currentColor, setCurrentColor, isSubmitting])
  
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
      
      {/* Top Controls */}
      <div className="absolute top-4 left-4 right-4 md:top-8 md:left-8 md:right-8">
        <div className="flex justify-between items-start">
          {/* Tutorial Button */}
          <button
            onClick={() => setShowTutorial(true)}
            className="bg-white/90 backdrop-blur-sm hover:bg-white/95 
                       transition-all duration-200 ease-out
                       rounded-lg px-4 py-2 shadow-lg hover:shadow-xl
                       font-gameshow text-gray-800 text-sm"
            title="Show tutorial"
          >
            Tutorial
          </button>

          {/* Refresh Color Button */}
          <button
            onClick={handleRefreshColor}
            disabled={isSubmitting}
            className="bg-white/90 backdrop-blur-sm hover:bg-white/95 
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-200 ease-out
                       rounded-lg px-4 py-2 shadow-lg hover:shadow-xl
                       font-gameshow text-gray-800 text-sm"
            title="Get a new color"
          >
            New Color
          </button>
        </div>
      </div>

      {/* Tutorial Modal */}
      {showTutorial && (
        <Tutorial onComplete={completeTutorial} />
      )}
    </div>
  )
}