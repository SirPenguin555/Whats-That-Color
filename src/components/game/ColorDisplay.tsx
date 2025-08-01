'use client'

import { getContrastColor } from '@/utils/colorGenerator'
import { motion } from 'framer-motion'

interface ColorDisplayProps {
  hexColor: string
  className?: string
}

export function ColorDisplay({ hexColor, className = '' }: ColorDisplayProps) {
  const textColor = getContrastColor(hexColor)
  
  return (
    <motion.div
      key={hexColor}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`relative flex items-center justify-center min-h-screen w-full ${className}`}
      style={{ backgroundColor: hexColor }}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
        {/* Main hex display */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-center"
        >
          <h1 
            className={`text-6xl md:text-8xl font-bold mb-4 font-gameshow tracking-wider
                       ${textColor === 'light' ? 'text-white' : 'text-black'}
                       drop-shadow-lg`}
            style={{
              textShadow: textColor === 'light' 
                ? '2px 2px 4px rgba(0,0,0,0.5)' 
                : '2px 2px 4px rgba(255,255,255,0.5)'
            }}
          >
            {hexColor.toUpperCase()}
          </h1>
          
          {/* Subtitle */}
          <p 
            className={`text-xl md:text-2xl font-medium opacity-90
                       ${textColor === 'light' ? 'text-white' : 'text-black'}`}
            style={{
              textShadow: textColor === 'light' 
                ? '1px 1px 2px rgba(0,0,0,0.3)' 
                : '1px 1px 2px rgba(255,255,255,0.3)'
            }}
          >
            What&apos;s that color?
          </p>
        </motion.div>
        
        {/* Decorative elements */}
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-10 right-10 w-16 h-16 opacity-20"
        >
          <div 
            className={`w-full h-full rounded-full border-4 
                       ${textColor === 'light' ? 'border-white' : 'border-black'}`}
          />
        </motion.div>
        
        <motion.div
          initial={{ rotate: 360 }}
          animate={{ rotate: 0 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-10 left-10 w-12 h-12 opacity-20"
        >
          <div 
            className={`w-full h-full rotate-45 border-4 
                       ${textColor === 'light' ? 'border-white' : 'border-black'}`}
          />
        </motion.div>
      </div>
    </motion.div>
  )
}