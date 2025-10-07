'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from '@phosphor-icons/react'
import { getUserStatistics } from '@/lib/colorHistory'

interface StatsModalProps {
  isOpen: boolean
  onClose: () => void
}

interface UserStats {
  totalEntries: number
  averageScore: number
  highestScore: number
  favoriteColors: string[]
}

export function StatsModal({ isOpen, onClose }: StatsModalProps) {
  const [stats, setStats] = useState<UserStats | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadStatistics()
    }
  }, [isOpen])

  const loadStatistics = async () => {
    try {
      const statsData = await getUserStatistics()
      setStats(statsData)
    } catch (error) {
      console.error('Error loading statistics:', error)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-4 py-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-gameshow font-bold bg-gradient-to-r from-gameshow-purple to-gameshow-hot bg-clip-text text-transparent">
                📊 Your Stats
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 py-4 sm:p-6">
            {!stats ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">Loading statistics...</div>
              </div>
            ) : (
              <div className="space-y-6">
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
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}