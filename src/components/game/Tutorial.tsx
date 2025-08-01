'use client'

import React, { useState } from 'react'

interface TutorialProps {
  onComplete: () => void
}

interface TutorialStep {
  title: string
  content: string
  example?: string
}

const tutorialSteps: TutorialStep[] = [
  {
    title: "Welcome to What's That Color!",
    content: "This is a creative game where you describe colors and get scored on three different criteria. Let's learn how to play!",
  },
  {
    title: "Your Mission",
    content: "Look at the color filling your screen and describe it in your own words. Be as creative, funny, or accurate as you want!",
    example: "Instead of just 'blue', try something like 'midnight ocean after a storm' or 'sad robot tears'"
  },
  {
    title: "How You're Scored",
    content: "Every description gets rated on three criteria:",
  },
  {
    title: "Funny Score (0-5 stars)",
    content: "How humorous, creative, or entertaining is your description? Wordplay, metaphors, and unexpected comparisons score higher.",
    example: "High: 'angry grape having an existential crisis' vs Low: 'purple color'"
  },
  {
    title: "Accuracy Score (0-5 stars)", 
    content: "How well does your description match the actual color? Consider the shade, brightness, and tone.",
    example: "High: 'deep forest green with blue undertones' vs Low: 'some green thing'"
  },
  {
    title: "Popularity Score (0-5 stars)",
    content: "This balances uniqueness with understandability. The sweet spot is creative but accessible to others.",
    example: "High: 'sunset orange with a hint of warmth' vs Low: 'chromatic manifestation of temporal displacement'"
  },
  {
    title: "Game Controls",
    content: "• Type your description in the text box and hit Enter or click Submit\n• Use 'New Color' button to get a different color anytime\n• View your history of past descriptions and scores",
  },
  {
    title: "Tips for High Scores",
    content: "• Be descriptive but not overly complex\n• Use comparisons and metaphors\n• Consider the color's mood or personality\n• Have fun with wordplay and creativity\n• Balance humor with accuracy",
  },
  {
    title: "Ready to Play!",
    content: "That's everything you need to know. Start describing colors and watch your creativity scores soar!",
  },
]

export function Tutorial({ onComplete }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    handleComplete()
  }

  const handleComplete = () => {
    setIsVisible(false)
    setTimeout(() => {
      onComplete()
    }, 300)
  }

  const currentStepData = tutorialSteps[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === tutorialSteps.length - 1

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`
        bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto
        transform transition-all duration-300 ease-out
        ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
      `}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h1 className="font-gameshow text-2xl text-gray-800">
              {currentStepData.title}
            </h1>
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600 text-sm font-medium"
            >
              Skip Tutorial
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Step {currentStep + 1} of {tutorialSteps.length}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed text-base whitespace-pre-line">
              {currentStepData.content}
            </p>
            
            {currentStepData.example && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border-l-4 border-purple-400">
                <p className="text-sm font-medium text-gray-600 mb-1">Example:</p>
                <p className="text-sm text-gray-700 italic">
                  {currentStepData.example}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={isFirstStep}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 
                       disabled:opacity-50 disabled:cursor-not-allowed
                       font-medium transition-colors duration-200"
          >
            Previous
          </button>
          
          <div className="flex gap-2">
            {tutorialSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentStep 
                    ? 'bg-purple-400 scale-110' 
                    : index < currentStep 
                      ? 'bg-purple-200' 
                      : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-gradient-to-r from-purple-400 to-pink-400 
                       text-white font-gameshow rounded-lg
                       hover:from-purple-500 hover:to-pink-500
                       transform hover:scale-105 active:scale-95
                       transition-all duration-200 shadow-lg"
          >
            {isLastStep ? 'Start Playing!' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}