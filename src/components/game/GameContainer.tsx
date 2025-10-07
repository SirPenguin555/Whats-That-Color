'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { generateDifferentColor, generateDualColors } from '@/utils/colorGenerator'
import { scoreDescription } from '@/utils/scoringEngine'
import { scoreDescriptionWithAI } from '@/lib/aiScoring'
import { ColorDisplay } from './ColorDisplay'
import { DescriptionInput } from './DescriptionInput'
import { ScoreDisplay } from './ScoreDisplay'
import { ScrollableFooter } from './ScrollableFooter'
import { Tutorial } from './Tutorial'
import { ScoringSettingsModal } from './ScoringSettingsModal'
import { StatsModal } from './StatsModal'
import { ModeToggle } from './ModeToggle'

export function GameContainer() {
  const {
    currentColor,
    currentScores,
    isSubmitting,
    showTutorial,
    hasSeenTutorial,
    gameMode,
    dualColors,
    setCurrentColor,
    setPlayerDescription,
    setCurrentScores,
    setIsSubmitting,
    setDualColors,
    addToHistory,
    completeTutorial,
    setShowTutorial
  } = useGameStore()
  
  const [showScores, setShowScores] = useState(false)
  const [loadingStatus, setLoadingStatus] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showFirstTimeSettings, setShowFirstTimeSettings] = useState(false)
  const [showStatsModal, setShowStatsModal] = useState(false)
  const [showTutorialModal, setShowTutorialModal] = useState(false)
  const hasCheckedTutorial = useRef(false)
  const hasCheckedSettings = useRef(false)
  const hasInitializedColor = useRef(false)

  // Initialize with a random color on client side (after hydration)
  useEffect(() => {
    if (hasInitializedColor.current) return

    // Only set a new random color if we're using the default color
    if (currentColor === '#8B5CF6') {
      if (gameMode === 'dual') {
        setDualColors(generateDualColors())
      } else {
        setCurrentColor(generateDifferentColor('#8B5CF6'))
      }
    }
    hasInitializedColor.current = true
  }, [currentColor, gameMode, setCurrentColor, setDualColors])

  // Show tutorial on first visit only - run once after hydration
  useEffect(() => {
    if (hasCheckedTutorial.current) return

    // Small delay to ensure Zustand has hydrated from localStorage
    const timer = setTimeout(() => {
      if (!hasSeenTutorial && !showTutorial) {
        setShowTutorial(true)
      }
      hasCheckedTutorial.current = true
    }, 100)

    return () => clearTimeout(timer)
  }, [hasSeenTutorial, showTutorial, setShowTutorial])

  // Show settings on first visit if user hasn't seen them yet
  useEffect(() => {
    if (hasCheckedSettings.current) return
    
    const timer = setTimeout(() => {
      const hasSeenSettings = localStorage.getItem('has_seen_scoring_settings')
      if (!hasSeenSettings && !showFirstTimeSettings) {
        setShowFirstTimeSettings(true)
      }
      hasCheckedSettings.current = true
    }, 200) // Slight delay after tutorial check
    
    return () => clearTimeout(timer)
  }, [showFirstTimeSettings])
  
  const handleDescriptionSubmit = useCallback(async (description: string) => {
    if (!description.trim() || isSubmitting) return
    
    setIsSubmitting(true)
    setPlayerDescription(description)
    setLoadingStatus('Analyzing your description...')
    
    try {
      // Check user's scoring preference
      const scoringMethod = localStorage.getItem('scoring_method') || 'local'
      const hasApiKey = !!localStorage.getItem('openai_api_key')
      const shouldUseAI = scoringMethod === 'openai' && hasApiKey
      
      let scores
      
      if (shouldUseAI) {
        try {
          setLoadingStatus('🤖 AI is evaluating your creativity...')
          const colorData = gameMode === 'dual' && dualColors ? dualColors : currentColor
          const apiResponse = await scoreDescriptionWithAI(description, colorData)
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
          const colorData = gameMode === 'dual' && dualColors ? dualColors : currentColor
          scores = scoreDescription(description, colorData)
          await new Promise(resolve => setTimeout(resolve, 300))
        }
      } else {
        setLoadingStatus('💡 Evaluating with smart algorithm...')
        await new Promise(resolve => setTimeout(resolve, 800))
        const colorData = gameMode === 'dual' && dualColors ? dualColors : currentColor
        scores = scoreDescription(description, colorData)
      }
      
      setCurrentScores(scores)
      
      // Add to history
      const historyEntry = {
        id: Date.now().toString(),
        hexColor: currentColor,
        dualColors: gameMode === 'dual' && dualColors ? dualColors : undefined,
        description,
        scores,
        timestamp: new Date(),
        gameMode
      }

      addToHistory(historyEntry)
      
      // Show scores
      setShowScores(true)
      
    } catch (error) {
      console.error('Error scoring description:', error)
      setLoadingStatus('⚠️ Something went wrong, using backup scoring')
      
      // Fallback to basic scoring
      const fallbackScores = scoreDescription(description, currentColor)
      setCurrentScores(fallbackScores)
      
      const fallbackEntry = {
        id: Date.now().toString(),
        hexColor: currentColor,
        dualColors: gameMode === 'dual' && dualColors ? dualColors : undefined,
        description,
        scores: fallbackScores,
        timestamp: new Date(),
        gameMode
      }
      
      addToHistory(fallbackEntry)
      
      setShowScores(true)
    } finally {
      setIsSubmitting(false)
      setLoadingStatus(null)
    }
  }, [currentColor, gameMode, dualColors, isSubmitting, setIsSubmitting, setPlayerDescription, setCurrentScores, addToHistory])
  
  const handleNewGame = useCallback(() => {
    // Generate new color(s) based on mode
    if (gameMode === 'dual') {
      setDualColors(generateDualColors())
    } else {
      const newColor = generateDifferentColor(currentColor)
      setCurrentColor(newColor)
    }

    // Reset game state
    setCurrentScores(null)
    setPlayerDescription('')
    setShowScores(false)
  }, [currentColor, gameMode, setCurrentColor, setDualColors, setCurrentScores, setPlayerDescription])
  
  const handleRefreshColor = useCallback(() => {
    if (isSubmitting) return // Don't allow refresh during submission

    // Generate new color(s) without resetting scores/description
    if (gameMode === 'dual') {
      setDualColors(generateDualColors())
    } else {
      const newColor = generateDifferentColor(currentColor)
      setCurrentColor(newColor)
    }
  }, [currentColor, gameMode, setCurrentColor, setDualColors, isSubmitting])
  
  return (
    <div className="relative">
      {/* Main Game Screen */}
      <div className="relative min-h-screen overflow-hidden">
        {/* Background Color Display */}
        <ColorDisplay
          hexColor={gameMode === 'single' ? currentColor : undefined}
          dualColors={gameMode === 'dual' ? dualColors || undefined : undefined}
        />
        
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
            
            {/* Mode Toggle */}
            <ModeToggle />

            {/* Input Section */}
            {!showScores && (
              <DescriptionInput
                onSubmit={handleDescriptionSubmit}
                isSubmitting={isSubmitting}
                disabled={showScores}
                placeholder="Describe this color in your own creative way..."
                currentColor={currentColor}
              />
            )}
          </div>
        </div>
        
        {/* Top Controls */}
        <div className="absolute top-4 left-4 md:top-8 md:left-8 z-50 flex gap-2">
          <button
            onClick={() => setShowSettings(true)}
            className="bg-white/90 backdrop-blur-sm hover:bg-white/95
                       transition-all duration-200 ease-out
                       rounded-lg px-4 py-2 shadow-lg hover:shadow-xl
                       font-gameshow text-gray-800 text-sm"
            title="Scoring Settings"
          >
            Settings
          </button>
          <button
            onClick={() => setShowStatsModal(true)}
            className="bg-white/90 backdrop-blur-sm hover:bg-white/95
                       transition-all duration-200 ease-out
                       rounded-lg px-4 py-2 shadow-lg hover:shadow-xl
                       font-gameshow text-gray-800 text-sm"
            title="View Statistics"
          >
            Stats
          </button>
          <button
            onClick={() => setShowTutorialModal(true)}
            className="bg-white/90 backdrop-blur-sm hover:bg-white/95
                       transition-all duration-200 ease-out
                       rounded-lg px-4 py-2 shadow-lg hover:shadow-xl
                       font-gameshow text-gray-800 text-sm"
            title="Show Tutorial"
          >
            Tutorial
          </button>
        </div>

        <div className="absolute top-4 right-4 md:top-8 md:right-8 z-50 flex gap-2">
          <button
            onClick={() => window.open('https://github.com/SirPenguin555/Whats-That-Color', '_blank')}
            className="bg-white/90 backdrop-blur-sm hover:bg-white/95
                       transition-all duration-200 ease-out
                       rounded-lg px-4 py-2 shadow-lg hover:shadow-xl
                       font-gameshow text-gray-800 text-sm"
            title="View on GitHub"
          >
            GitHub
          </button>
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

      {/* Scrollable Footer */}
      <ScrollableFooter
        currentColor={currentColor}
        gameMode={gameMode}
        dualColors={dualColors}
        onTutorialComplete={completeTutorial}
      />

      {/* Tutorial Modal - shows on first visit */}
      {showTutorial && (
        <Tutorial onComplete={completeTutorial} />
      )}

      {/* Tutorial Modal - manual trigger */}
      {showTutorialModal && (
        <Tutorial onComplete={() => setShowTutorialModal(false)} />
      )}

      {/* Stats Modal */}
      <StatsModal
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
      />

      {/* Settings Modal */}
      <ScoringSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        isFirstTime={false}
      />

      {/* First-time Settings Modal */}
      <ScoringSettingsModal
        isOpen={showFirstTimeSettings}
        onClose={() => setShowFirstTimeSettings(false)}
        isFirstTime={true}
      />
    </div>
  )
}