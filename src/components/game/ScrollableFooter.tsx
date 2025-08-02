'use client'

import React, { useState } from 'react'
import { ColorHistorySection } from './ColorHistorySection'
import { Tutorial } from './Tutorial'

interface ScrollableFooterProps {
  currentColor: string
  onTutorialComplete: () => void
}

export function ScrollableFooter({ currentColor, onTutorialComplete }: ScrollableFooterProps) {
  const [showTutorial, setShowTutorial] = useState(false)

  return (
    <>
      {/* Color History Section - appears immediately when scrolling down */}
      <ColorHistorySection 
        currentColor={currentColor} 
        onShowTutorial={() => setShowTutorial(true)}
      />

      {/* Tutorial Modal */}
      {showTutorial && (
        <Tutorial onComplete={() => {
          setShowTutorial(false)
          onTutorialComplete()
        }} />
      )}
    </>
  )
}