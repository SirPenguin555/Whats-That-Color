'use client'

import { getContrastColor } from '@/utils/colorGenerator'
import { motion } from 'framer-motion'

interface ColorDisplayProps {
  hexColor?: string
  dualColors?: { colorA: string; colorB: string }
  className?: string
}

export function ColorDisplay({ hexColor, dualColors, className = '' }: ColorDisplayProps) {
  const isDualMode = !!dualColors

  // For dual mode, use gradient background
  const backgroundStyle = isDualMode
    ? {
        background: `linear-gradient(to right, ${dualColors.colorA} 0%, ${dualColors.colorA} 33.33%, ${dualColors.colorB} 66.67%, ${dualColors.colorB} 100%)`
      }
    : { backgroundColor: hexColor }

  // Determine text color - for dual mode, use average or check middle gradient area
  const displayColor = hexColor || (dualColors ? dualColors.colorA : '#8B5CF6')
  const textColor = getContrastColor(displayColor)

  return (
    <motion.div
      key={hexColor || `${dualColors?.colorA}-${dualColors?.colorB}`}
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className={`relative flex items-center justify-center min-h-screen w-full ${className}`}
      style={backgroundStyle}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
        {/* Main hex display */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 100 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, type: "spring", stiffness: 150 }}
          className="text-center"
        >
          {isDualMode ? (
            <>
              <h1
                className={`text-4xl md:text-6xl font-bold mb-2 font-gameshow tracking-wider
                           ${textColor === 'light' ? 'text-white' : 'text-black'}
                           drop-shadow-lg`}
                style={{
                  textShadow: textColor === 'light'
                    ? '2px 2px 4px rgba(0,0,0,0.5)'
                    : '2px 2px 4px rgba(255,255,255,0.5)'
                }}
              >
                {dualColors.colorA.toUpperCase()}
              </h1>
              <p
                className={`text-2xl md:text-3xl font-bold mb-4 font-gameshow
                           ${textColor === 'light' ? 'text-white' : 'text-black'}
                           opacity-75`}
              >
                ↔
              </p>
              <h1
                className={`text-4xl md:text-6xl font-bold mb-4 font-gameshow tracking-wider
                           ${textColor === 'light' ? 'text-white' : 'text-black'}
                           drop-shadow-lg`}
                style={{
                  textShadow: textColor === 'light'
                    ? '2px 2px 4px rgba(0,0,0,0.5)'
                    : '2px 2px 4px rgba(255,255,255,0.5)'
                }}
              >
                {dualColors.colorB.toUpperCase()}
              </h1>
            </>
          ) : (
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
              {hexColor?.toUpperCase()}
            </h1>
          )}

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
            What&apos;s That Color?
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}