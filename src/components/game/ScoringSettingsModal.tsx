'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Gear, Robot, Calculator } from '@phosphor-icons/react'

interface ScoringSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  isFirstTime?: boolean
}

type ScoringMethod = 'local' | 'openai'

export function ScoringSettingsModal({ isOpen, onClose, isFirstTime = false }: ScoringSettingsModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<ScoringMethod>('local')
  const [apiKey, setApiKey] = useState('')
  const [showApiInput, setShowApiInput] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // Load current settings
      const savedMethod = localStorage.getItem('scoring_method') as ScoringMethod || 'local'
      const savedApiKey = localStorage.getItem('openai_api_key') || ''
      
      setSelectedMethod(savedMethod)
      setApiKey(savedApiKey)
      setShowApiInput(savedMethod === 'openai')
    }
  }, [isOpen])

  const handleSave = () => {
    // Save settings to localStorage
    localStorage.setItem('scoring_method', selectedMethod)
    
    if (selectedMethod === 'openai' && apiKey.trim()) {
      localStorage.setItem('openai_api_key', apiKey.trim())
    } else if (selectedMethod === 'local') {
      localStorage.removeItem('openai_api_key')
    }

    // Mark that user has seen settings (for first-time flow)
    if (isFirstTime) {
      localStorage.setItem('has_seen_scoring_settings', 'true')
    }

    onClose()
  }

  const handleMethodChange = (method: ScoringMethod) => {
    setSelectedMethod(method)
    setShowApiInput(method === 'openai')
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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Gear size={28} className="text-purple-600" />
                <h2 className="text-2xl font-gameshow font-bold bg-gradient-to-r from-gameshow-purple to-gameshow-hot bg-clip-text text-transparent">
                  {isFirstTime ? 'Welcome! Choose Your Scoring Method' : 'Scoring Settings'}
                </h2>
              </div>
              {!isFirstTime && (
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {isFirstTime && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-blue-800 text-center font-medium">
                  Choose how you&apos;d like your creative color descriptions to be scored!
                </p>
              </div>
            )}

            {/* Scoring Method Options */}
            <div className="space-y-4">
              {/* Local Algorithm Option */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                  selectedMethod === 'local'
                    ? 'border-purple-400 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleMethodChange('local')}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full ${
                    selectedMethod === 'local' ? 'bg-purple-100' : 'bg-gray-100'
                  }`}>
                    <Calculator size={24} className={selectedMethod === 'local' ? 'text-purple-600' : 'text-gray-600'} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="radio"
                        checked={selectedMethod === 'local'}
                        onChange={() => handleMethodChange('local')}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <h3 className="text-lg font-gameshow font-bold text-gray-900">
                        Smart Algorithm (Free)
                      </h3>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Uses our built-in algorithm that analyzes your descriptions for color accuracy, 
                      creativity, and accessibility. Works completely offline and provides instant feedback.
                      Perfect for casual play!
                    </p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                      <span>✓ Always free</span>
                      <span>✓ Instant scoring</span>
                      <span>✓ Works offline</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* OpenAI API Option */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                  selectedMethod === 'openai'
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleMethodChange('openai')}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full ${
                    selectedMethod === 'openai' ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <Robot size={24} className={selectedMethod === 'openai' ? 'text-green-600' : 'text-gray-600'} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="radio"
                        checked={selectedMethod === 'openai'}
                        onChange={() => handleMethodChange('openai')}
                        className="text-green-600 focus:ring-green-500"
                      />
                      <h3 className="text-lg font-gameshow font-bold text-gray-900">
                        AI-Powered Scoring (Your API Key)
                      </h3>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Uses GPT-4 to provide sophisticated, nuanced scoring that truly understands humor, 
                      creativity, and cultural references. Requires your own OpenAI API key. 
                      (~$0.01 per description)
                    </p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                      <span>✓ Advanced AI analysis</span>
                      <span>✓ Understands humor</span>
                      <span>✓ Cultural awareness</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* API Key Input */}
              <AnimatePresence>
                {showApiInput && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-green-50 border border-green-200 rounded-xl p-4"
                  >
                    <label className="block text-sm font-medium text-green-800 mb-2">
                      OpenAI API Key
                    </label>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="sk-..."
                      className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-sm"
                    />
                    <p className="text-xs text-green-600 mt-1">
                      Your key is stored locally and never shared. Get yours at{' '}
                      <a 
                        href="https://platform.openai.com/api-keys" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="underline hover:text-green-800"
                      >
                        platform.openai.com
                      </a>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
              {!isFirstTime && (
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={selectedMethod === 'openai' && !apiKey.trim()}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isFirstTime ? "Let's Play!" : 'Save Settings'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}