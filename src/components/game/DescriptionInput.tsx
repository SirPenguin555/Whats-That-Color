'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PaperPlaneRight } from '@phosphor-icons/react'

const descriptionSchema = z.object({
  description: z.string()
    .min(1, 'Please enter a description')
    .max(200, 'Description must be 200 characters or less')
    .refine(
      (val) => val.trim().length > 0,
      'Description cannot be empty or just spaces'
    )
})

type DescriptionFormData = z.infer<typeof descriptionSchema>

interface DescriptionInputProps {
  onSubmit: (description: string) => void
  isSubmitting?: boolean
  disabled?: boolean
  placeholder?: string
  className?: string
}

export function DescriptionInput({ 
  onSubmit, 
  isSubmitting = false, 
  disabled = false,
  placeholder = "Describe this color...",
  className = '' 
}: DescriptionInputProps) {
  const [charCount, setCharCount] = useState(0)
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch
  } = useForm<DescriptionFormData>({
    resolver: zodResolver(descriptionSchema),
    mode: 'onChange'
  })
  
  const description = watch('description', '')
  
  // Update character count when description changes
  React.useEffect(() => {
    setCharCount(description?.length || 0)
  }, [description])
  
  const handleFormSubmit = (data: DescriptionFormData) => {
    onSubmit(data.description.trim())
    reset()
    setCharCount(0)
  }
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (isValid && !isSubmitting && !disabled) {
        handleSubmit(handleFormSubmit)()
      }
    }
  }
  
  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={`w-full max-w-2xl mx-auto p-6 ${className}`}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="relative">
          {/* Main input field */}
          <div className="relative">
            <textarea
              {...register('description')}
              placeholder={placeholder}
              disabled={disabled || isSubmitting}
              onKeyPress={handleKeyPress}
              className={`w-full px-6 py-4 pr-16 text-lg rounded-2xl border-2 
                         bg-white/90 backdrop-blur-sm resize-none
                         transition-all duration-300 focus:outline-none
                         ${errors.description 
                           ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                           : 'border-gray-300 focus:border-gameshow-gold focus:ring-2 focus:ring-gameshow-gold/20'
                         }
                         ${disabled || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
                         placeholder:text-gray-500`}
              rows={3}
              maxLength={200}
            />
            
            {/* Submit button */}
            <button
              type="submit"
              disabled={!isValid || isSubmitting || disabled}
              className={`absolute right-2 bottom-2 p-3 rounded-xl
                         transition-all duration-300 transform
                         ${!isValid || isSubmitting || disabled
                           ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                           : 'bg-gameshow-gold hover:bg-yellow-500 text-white hover:scale-105 active:scale-95'
                         }`}
            >
              {isSubmitting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <PaperPlaneRight size={24} weight="bold" />
              )}
            </button>
          </div>
          
          {/* Character counter */}
          <div className="flex justify-between items-center mt-2 px-2">
            <div className="text-sm text-gray-600">
              {errors.description && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-red-500 font-medium"
                >
                  {errors.description.message}
                </motion.span>
              )}
            </div>
            
            <span className={`text-sm font-medium
                           ${charCount > 180 ? 'text-red-500' : 
                             charCount > 150 ? 'text-yellow-600' : 'text-gray-500'}`}>
              {charCount}/200
            </span>
          </div>
        </div>
        
        {/* Help text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-gray-600 text-sm"
        >
          Be creative! Describe the color however you like - funny, accurate, or unique.
        </motion.p>
      </form>
    </motion.div>
  )
}