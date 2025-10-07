'use client'

import React from 'react'
import { ColorHistorySection } from './ColorHistorySection'

interface ScrollableFooterProps {
  currentColor: string
  onTutorialComplete: () => void
}

export function ScrollableFooter({ currentColor }: ScrollableFooterProps) {
  return (
    <>
      {/* Color History Section - appears immediately when scrolling down */}
      <ColorHistorySection
        currentColor={currentColor}
      />
    </>
  )
}