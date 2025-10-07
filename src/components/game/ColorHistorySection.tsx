'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { MagnifyingGlass, Download, Trash } from '@phosphor-icons/react'
import { ColorEntry, useGameStore } from '@/stores/gameStore'
import { getColorHistory, searchColorHistory } from '@/lib/colorHistory'
import { StarRating } from './ScoreDisplay'
import { getContrastingTextColor } from '@/utils/colorUtils'

interface ColorHistorySectionProps {
  currentColor: string
}

export function ColorHistorySection({ currentColor }: ColorHistorySectionProps) {
  const [history, setHistory] = useState<ColorEntry[]>([])
  const [filteredHistory, setFilteredHistory] = useState<ColorEntry[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [minScore, setMinScore] = useState<number | undefined>()
  const [loading, setLoading] = useState(true)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [isClient, setIsClient] = useState(false)

  const { gameHistory, clearHistory } = useGameStore()
  const textColor = getContrastingTextColor(currentColor)

  // Define loadHistory function with useCallback
  const loadHistory = useCallback(async () => {
    setLoading(true)
    try {
      // Load history from localStorage (via colorHistory functions that read Zustand storage)
      const localHistory = await getColorHistory(100)
      
      // Use gameHistory from Zustand store as primary source, fallback to localStorage reader
      const historyToUse = gameHistory.length > 0 ? gameHistory : localHistory
      
      setHistory(historyToUse)
      setFilteredHistory(historyToUse)
    } catch (error) {
      console.error('Error loading history:', error)
      // Fallback to Zustand store history
      setHistory(gameHistory)
      setFilteredHistory(gameHistory)
    } finally {
      setLoading(false)
    }
  }, [gameHistory])

  // Track client-side mounting to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load history when component mounts or gameHistory changes
  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  // Handle search and filtering
  useEffect(() => {
    const performSearch = async () => {
      if (!searchTerm.trim()) {
        filterByScore()
        return
      }

      setLoading(true)
      try {
        const searchResults = await searchColorHistory(searchTerm, 50)
        const filtered = minScore 
          ? searchResults.filter(entry => entry.scores.overall >= minScore)
          : searchResults
        setFilteredHistory(filtered)
      } catch (error) {
        console.error('Error searching history:', error)
      } finally {
        setLoading(false)
      }
    }

    const filterByScore = () => {
      if (minScore !== undefined) {
        const filtered = history.filter(entry => entry.scores.overall >= minScore)
        setFilteredHistory(filtered)
      } else {
        setFilteredHistory(history)
      }
    }

    if (searchTerm) {
      performSearch()
    } else {
      filterByScore()
    }
  }, [searchTerm, minScore, history])

  const exportHistory = () => {
    const dataStr = JSON.stringify(filteredHistory, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `color-history-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleResetHistory = () => {
    clearHistory()
    setHistory([])
    setFilteredHistory([])
    setShowResetConfirm(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen w-full"
      style={{ backgroundColor: currentColor }}
    >
      {/* 50% width spacer above History */}
      <div className="flex justify-center">
        <div className="border-t-2 border-opacity-75 border-current w-1/2"></div>
      </div>
      
      {/* Header */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <h2 className={`text-3xl font-gameshow font-bold mb-6 text-center
                         ${textColor === 'white' ? 'text-white' : 'text-black'}`}>
            History
          </h2>

          {/* Filters and Controls */}
          <div className="flex flex-col lg:flex-row gap-4 justify-center items-center">
            <div className="flex-1 max-w-md relative">
              <MagnifyingGlass 
                size={20} 
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 
                           ${textColor === 'white' ? 'text-white/60' : 'text-black/60'}`} 
              />
              <input
                type="text"
                placeholder="Search colors or descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg backdrop-blur-sm border-2 border-opacity-30 border-current
                           bg-white/20 placeholder:text-current placeholder:text-opacity-60
                           focus:border-opacity-60 focus:outline-none transition-all
                           ${textColor === 'white' ? 'text-white' : 'text-black'}`}
              />
            </div>
            
            <select
              value={minScore || ''}
              onChange={(e) => setMinScore(e.target.value ? Number(e.target.value) : undefined)}
              className={`px-4 py-2 rounded-lg backdrop-blur-sm border-2 border-opacity-30 border-current
                         bg-white/20 focus:border-opacity-60 focus:outline-none transition-all
                         hover:border-opacity-60 hover:bg-white/10 cursor-pointer
                         ${textColor === 'white' ? 'text-white' : 'text-black'}`}
            >
              <option value="" className="bg-white text-black">All Scores</option>
              <option value="4.5" className="bg-white text-black">4.5+ Stars</option>
              <option value="4.0" className="bg-white text-black">4.0+ Stars</option>
              <option value="3.0" className="bg-white text-black">3.0+ Stars</option>
              <option value="2.0" className="bg-white text-black">2.0+ Stars</option>
            </select>

            <button
              onClick={exportHistory}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg backdrop-blur-sm border-2 border-opacity-30 border-current
                         hover:border-opacity-60 hover:bg-white/10 transition-all
                         ${textColor === 'white' ? 'text-white' : 'text-black'}`}
            >
              <Download size={16} />
              Export
            </button>

            <button
              onClick={() => setShowResetConfirm(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg backdrop-blur-sm border-2 border-opacity-30 border-current
                         hover:border-opacity-60 hover:bg-white/10 transition-all
                         ${textColor === 'white' ? 'text-white' : 'text-black'}`}
            >
              <Trash size={16} />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* 50% width spacer below controls */}
      <div className="flex justify-center">
        <div className="border-t-2 border-opacity-75 border-current w-1/2"></div>
      </div>

      {/* History Content */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className={`text-lg
                             ${textColor === 'white' ? 'text-white/70' : 'text-black/70'}`}>
                Loading your color history...
              </div>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className={`text-xl font-medium mb-2
                             ${textColor === 'white' ? 'text-white' : 'text-black'}`}>
                No colors found
              </div>
              <div className={`text-lg
                             ${textColor === 'white' ? 'text-white/70' : 'text-black/70'}`}>
                Start describing colors to build your history!
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredHistory.map((entry, index) => (
                <ColorHistoryItem 
                  key={entry.id || `${entry.hexColor}-${entry.description}-${entry.timestamp.getTime()}-${index}`} 
                  entry={entry} 
                  textColor={textColor}
                  isClient={isClient}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-gameshow font-bold text-gray-900 mb-4">
              🗑️ Reset Color History
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete all your color descriptions? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResetHistory}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Reset History
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}

interface ColorHistoryItemProps {
  entry: ColorEntry
  textColor: 'black' | 'white'
  isClient: boolean
}

function ColorHistoryItem({ entry, textColor, isClient }: ColorHistoryItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`backdrop-blur-sm border-2 border-opacity-20 border-current rounded-xl p-4 
                 hover:border-opacity-40 transition-all duration-300
                 ${textColor === 'white' ? 'bg-white/10' : 'bg-black/10'}`}
    >
      <div className="flex items-start gap-4">
        {/* Color Swatch */}
        <div 
          className="w-16 h-16 rounded-lg border-2 border-white/50 shadow-lg flex-shrink-0"
          style={{ backgroundColor: entry.hexColor }}
        />
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className={`font-medium mb-1
                            ${textColor === 'white' ? 'text-white' : 'text-black'}`}>
                {entry.hexColor.toUpperCase()}
              </h3>
              <p className={`text-sm italic
                           ${textColor === 'white' ? 'text-white/80' : 'text-black/80'}`}>
                &ldquo;{entry.description}&rdquo;
              </p>
            </div>
            <div className={`text-xs ml-4
                           ${textColor === 'white' ? 'text-white/60' : 'text-black/60'}`}>
              {isClient ? 
                (entry.timestamp instanceof Date ? 
                  entry.timestamp.toLocaleDateString() : 
                  new Date(entry.timestamp).toLocaleDateString()
                ) : 
                ''
              }
            </div>
          </div>
          
          {/* Scores */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1">
              <span className="text-purple-400">😂</span>
              <StarRating rating={entry.scores.funny} size={14} showValue={true} animated={false} />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-blue-400">🎯</span>
              <StarRating rating={entry.scores.accurate} size={14} showValue={true} animated={false} />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-green-400">👑</span>
              <StarRating rating={entry.scores.popular} size={14} showValue={true} animated={false} />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-yellow-400">⭐</span>
              <StarRating rating={entry.scores.overall} size={14} showValue={true} animated={false} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}