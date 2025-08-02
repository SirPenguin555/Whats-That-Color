'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MagnifyingGlass, X, Download } from '@phosphor-icons/react'
import { ColorEntry } from '@/stores/gameStore'
import { getColorHistory, searchColorHistory, getUserStatistics } from '@/lib/colorHistory'
import { StarRating } from './ScoreDisplay'

interface ColorHistoryProps {
  isOpen: boolean
  onClose: () => void
  defaultTab?: 'history' | 'stats'
}

interface UserStats {
  totalEntries: number
  averageScore: number
  highestScore: number
  favoriteColors: string[]
}

export function ColorHistory({ isOpen, onClose, defaultTab = 'history' }: ColorHistoryProps) {
  const [history, setHistory] = useState<ColorEntry[]>([])
  const [filteredHistory, setFilteredHistory] = useState<ColorEntry[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [minScore, setMinScore] = useState<number | undefined>()
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [activeTab, setActiveTab] = useState<'history' | 'stats'>(defaultTab)

  // Load history when component opens
  useEffect(() => {
    if (isOpen) {
      loadHistory()
      loadStatistics()
    }
  }, [isOpen])

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

  const loadHistory = async () => {
    setLoading(true)
    try {
      const historyData = await getColorHistory(100)
      setHistory(historyData)
      setFilteredHistory(historyData)
    } catch (error) {
      console.error('Error loading history:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStatistics = async () => {
    try {
      const statsData = await getUserStatistics()
      setStats(statsData)
    } catch (error) {
      console.error('Error loading statistics:', error)
    }
  }


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

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-gameshow font-bold bg-gradient-to-r from-gameshow-purple to-gameshow-hot bg-clip-text text-transparent">
                🎨 Your Color Journey
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'history'
                    ? 'bg-white text-gameshow-purple shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                📚 History
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'stats'
                    ? 'bg-white text-gameshow-purple shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                📊 Statistics
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'history' ? (
              <HistoryTab
                history={filteredHistory}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                minScore={minScore}
                setMinScore={setMinScore}
                loading={loading}
                onExport={exportHistory}
              />
            ) : (
              <StatsTab stats={stats} />
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

interface HistoryTabProps {
  history: ColorEntry[]
  searchTerm: string
  setSearchTerm: (term: string) => void
  minScore: number | undefined
  setMinScore: (score: number | undefined) => void
  loading: boolean
  onExport: () => void
}

function HistoryTab({ 
  history, 
  searchTerm, 
  setSearchTerm, 
  minScore, 
  setMinScore, 
  loading, 
  onExport 
}: HistoryTabProps) {
  return (
    <>
      {/* Filters */}
      <div className="p-6 border-b border-gray-100 bg-gray-50">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlass size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search colors or descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gameshow-purple focus:border-transparent"
            />
          </div>
          
          <select
            value={minScore || ''}
            onChange={(e) => setMinScore(e.target.value ? Number(e.target.value) : undefined)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gameshow-purple focus:border-transparent"
          >
            <option value="">All Scores</option>
            <option value="4.5">4.5+ Stars</option>
            <option value="4.0">4.0+ Stars</option>
            <option value="3.0">3.0+ Stars</option>
            <option value="2.0">2.0+ Stars</option>
          </select>

          <button
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2 bg-gameshow-purple text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Loading your color history...</div>
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <div className="text-4xl mb-4">🎨</div>
            <div className="text-lg font-medium mb-2">No colors found</div>
            <div className="text-sm">Start describing colors to build your history!</div>
          </div>
        ) : (
          <div className="grid gap-4">
            {history.map((entry, index) => (
              <ColorHistoryItem key={entry.id || `${entry.hexColor}-${entry.description}-${entry.timestamp.getTime()}-${index}`} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

interface StatsTabProps {
  stats: UserStats | null
}

function StatsTab({ stats }: StatsTabProps) {
  if (!stats) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading statistics...</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border-2 border-blue-200">
          <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalEntries}</div>
          <div className="text-sm text-blue-700 font-medium">Colors Described</div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl border-2 border-yellow-200">
          <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.averageScore}</div>
          <div className="text-sm text-yellow-700 font-medium">Average Score</div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200">
          <div className="text-3xl font-bold text-green-600 mb-2">{stats.highestScore}</div>
          <div className="text-sm text-green-700 font-medium">Best Score</div>
        </div>
      </div>

      {/* Favorite Colors */}
      {stats.favoriteColors.length > 0 && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200">
          <h3 className="text-lg font-gameshow font-bold text-purple-800 mb-4">🌈 Your Favorite Colors</h3>
          <div className="flex flex-wrap gap-3">
            {stats.favoriteColors.map((color, index) => (
              <div key={`${color}-${index}`} className="flex items-center gap-2">
                <div 
                  className="w-8 h-8 rounded-full border-2 border-white shadow-md"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm font-medium text-purple-700">
                  {color.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface ColorHistoryItemProps {
  entry: ColorEntry
}

function ColorHistoryItem({ entry }: ColorHistoryItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-4">
        {/* Color Swatch */}
        <div 
          className="w-16 h-16 rounded-lg border-2 border-white shadow-md flex-shrink-0"
          style={{ backgroundColor: entry.hexColor }}
        />
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-medium text-gray-900 mb-1">{entry.hexColor.toUpperCase()}</h3>
              <p className="text-sm text-gray-600 italic">&ldquo;{entry.description}&rdquo;</p>
            </div>
            <div className="text-xs text-gray-500 ml-4">
              {entry.timestamp.toLocaleDateString()}
            </div>
          </div>
          
          {/* Scores */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1">
              <span className="text-purple-600">😂</span>
              <StarRating rating={entry.scores.funny} size={14} showValue={true} animated={false} />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-blue-600">🎯</span>
              <StarRating rating={entry.scores.accurate} size={14} showValue={true} animated={false} />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-green-600">👑</span>
              <StarRating rating={entry.scores.popular} size={14} showValue={true} animated={false} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}