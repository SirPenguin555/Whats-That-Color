'use client'

import React from 'react'
import { ColorHistorySection } from './ColorHistorySection'

interface ScrollableFooterProps {
  currentColor: string
  gameMode: 'single' | 'dual'
  dualColors: { colorA: string; colorB: string } | null
  onTutorialComplete: () => void
}

export function ScrollableFooter({ currentColor, gameMode, dualColors }: ScrollableFooterProps) {
  return (
    <>
      {/* Color History Section - appears immediately when scrolling down */}
      <ColorHistorySection
        currentColor={currentColor}
        gameMode={gameMode}
        dualColors={dualColors}
      />
    </>
  )
}