/**
 * @file components/analyze/AnalysisProgress.tsx
 * @description Modern glassmorphism progress indicator with step tracking
 * @created 2025-07-21
 * @todo FRONTEND-001-01: User confidence during 90-second analysis process
 */

'use client'

import React, { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { MODERN_DESIGN, glass } from '@/lib/design/modern-tokens'
import { ANALYZE_UI, formatTimeRemaining, getProgressText } from '@/lib/theme/analyze-constants'
import type { ProgressIndicatorProps, ProgressStatus } from './shared-types'

/**
 * 🚀 MODERN ANALYSIS PROGRESS INDICATOR
 * 
 * Features:
 * - Beautiful circular progress with glassmorphism
 * - Step-by-step German status messages
 * - Animated transitions between states  
 * - Time estimation with countdown
 * - Mobile-optimized responsive design
 * - Confidence-building visual design
 * - Micro-animations for engagement
 */

export function AnalysisProgress({
  progress,
  variant = 'circular',
  size = 'lg',
  showTime = true,
  showSteps = true,
  animated = true,
  className,
  ...props
}: ProgressIndicatorProps) {
  // Animation state for smooth transitions
  const [displayPercentage, setDisplayPercentage] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  // Smooth percentage animation
  useEffect(() => {
    if (!animated) {
      setDisplayPercentage(progress.percentage)
      return
    }

    const targetPercentage = Math.min(progress.percentage, 100)
    const duration = 800 // ms
    const steps = 60
    const stepValue = (targetPercentage - displayPercentage) / steps
    const stepDuration = duration / steps

    let currentStep = 0
    const interval = setInterval(() => {
      currentStep++
      setDisplayPercentage(prev => {
        const newValue = prev + stepValue
        if (currentStep >= steps || Math.abs(newValue - targetPercentage) < 0.1) {
          clearInterval(interval)
          return targetPercentage
        }
        return newValue
      })
    }, stepDuration)

    return () => clearInterval(interval)
  }, [progress.percentage, animated, displayPercentage])

  // Check if analysis is complete
  useEffect(() => {
    setIsComplete(progress.percentage >= 100)
  }, [progress.percentage])

  // Size configurations
  const sizeConfig = {
    xs: { 
      container: 'w-16 h-16',
      circle: 'w-12 h-12',
      text: 'text-xs',
      percentage: 'text-sm font-bold',
      strokeWidth: 3
    },
    sm: { 
      container: 'w-24 h-24',
      circle: 'w-20 h-20',
      text: 'text-xs',
      percentage: 'text-lg font-bold',
      strokeWidth: 4
    },
    md: { 
      container: 'w-32 h-32',
      circle: 'w-28 h-28', 
      text: 'text-sm',
      percentage: 'text-xl font-bold',
      strokeWidth: 6
    },
    lg: { 
      container: 'w-48 h-48',
      circle: 'w-44 h-44',
      text: 'text-base', 
      percentage: 'text-3xl font-bold',
      strokeWidth: 8
    },
    xl: { 
      container: 'w-64 h-64',
      circle: 'w-60 h-60',
      text: 'text-lg',
      percentage: 'text-4xl font-bold', 
      strokeWidth: 10
    }
  }

  const config = sizeConfig[size]

  // Circle calculations
  const radius = variant === 'circular' ? 90 : 0
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (displayPercentage / 100) * circumference

  // Current step information
  const currentStepData = ANALYZE_UI.progress.steps[progress.currentStep]

  // Progress ring gradient based on completion
  const getProgressGradient = () => {
    if (isComplete) return 'from-emerald-500 to-green-500'
    if (displayPercentage > 75) return 'from-blue-500 to-indigo-500'  
    if (displayPercentage > 50) return 'from-cyan-500 to-blue-500'
    if (displayPercentage > 25) return 'from-indigo-500 to-purple-500'
    return 'from-purple-500 to-pink-500'
  }

  if (variant === 'linear') {
    return (
      <div className={cn('w-full', className)} {...props}>
        {/* Linear Progress Bar */}
        <div className={cn(
          'relative rounded-full overflow-hidden h-3',
          MODERN_DESIGN.glass.secondary.base,
          MODERN_DESIGN.glass.secondary.border
        )}>
          <div 
            className={cn(
              'h-full rounded-full transition-all duration-1000 ease-out',
              `bg-gradient-to-r ${getProgressGradient()}`
            )}
            style={{ width: `${displayPercentage}%` }}
          />
          
          {/* Shimmer Effect */}
          {!isComplete && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_ease-in-out_infinite]" />
          )}
        </div>

        {/* Progress Info */}
        <div className="flex justify-between items-center mt-3">
          <span className="text-sm font-medium text-gray-700">
            {Math.round(displayPercentage)}%
          </span>
          {showTime && progress.timeRemaining && (
            <span className="text-sm text-gray-600">
              {formatTimeRemaining(progress.timeRemaining)}
            </span>
          )}
        </div>

        {/* Current Step */}
        {showSteps && currentStepData && (
          <div className="mt-4 text-center">
            <p className="text-sm font-medium text-gray-800">
              {currentStepData.title}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {currentStepData.description}
            </p>
          </div>
        )}
      </div>
    )
  }

  // Circular Progress (Default)
  return (
    <div className={cn('flex flex-col items-center', className)} {...props}>
      {/* Progress Header */}
      <div className="text-center mb-8 max-w-md">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {isComplete 
            ? ANALYZE_UI.progress.steps.completed.title
            : ANALYZE_UI.progress.header.title}
        </h3>
        <p className="text-gray-600">
          {isComplete 
            ? ANALYZE_UI.progress.steps.completed.description  
            : ANALYZE_UI.progress.header.subtitle}
        </p>
      </div>

      {/* Circular Progress Container */}
      <div className={cn(
        'relative flex items-center justify-center',
        config.container
      )}>
        {/* Glassmorphism Background Circle */}
        <div className={cn(
          'absolute inset-0 rounded-full',
          MODERN_DESIGN.glass.primary.base,
          MODERN_DESIGN.glass.primary.border,
          MODERN_DESIGN.animations.gentle
        )} />

        {/* SVG Progress Ring */}
        <svg 
          className={cn(config.circle, 'transform -rotate-90')}
          viewBox="0 0 200 200"
        >
          {/* Background Ring */}
          <circle
            cx="100"
            cy="100" 
            r={radius}
            stroke="currentColor"
            strokeWidth={config.strokeWidth}
            fill="transparent"
            className="text-gray-200/50"
          />
          
          {/* Progress Ring with Gradient */}
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" className={`stop-color-gradient-from-${getProgressGradient().split(' ')[0].replace('from-', '')}`} />
              <stop offset="100%" className={`stop-color-gradient-to-${getProgressGradient().split(' ')[2].replace('to-', '')}`} />
            </linearGradient>
          </defs>
          
          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke="url(#progressGradient)"
            strokeWidth={config.strokeWidth}
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={cn(
              'transition-all duration-1000 ease-out',
              animated && 'animate-pulse'
            )}
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {/* Percentage */}
          <div className={cn(config.percentage, 'text-gray-900')}>
            {Math.round(displayPercentage)}%
          </div>
          
          {/* Time Remaining */}
          {showTime && progress.timeRemaining && !isComplete && (
            <div className="text-sm text-gray-600 mt-1">
              {formatTimeRemaining(progress.timeRemaining)}
            </div>
          )}

          {/* Completion Icon */}
          {isComplete && (
            <div className="mt-2">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>

        {/* Floating Particles (Animation Enhancement) */}
        {animated && !isComplete && (
          <>
            <div className="absolute top-2 right-4 w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="absolute bottom-4 left-2 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
            <div className="absolute top-1/3 left-2 w-1 h-1 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
          </>
        )}
      </div>

      {/* Current Step Information */}
      {showSteps && currentStepData && (
        <div className={cn(
          'mt-8 p-6 rounded-xl text-center max-w-lg',
          MODERN_DESIGN.glass.secondary.base,
          MODERN_DESIGN.glass.secondary.border,
          MODERN_DESIGN.animations.gentle
        )}>
          {/* Step Title */}
          <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-center justify-center">
            {/* Step Icon */}
            <div className="w-8 h-8 mr-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            </div>
            {currentStepData.title}
          </h4>
          
          {/* Step Description */}
          <p className="text-gray-700 leading-relaxed">
            {currentStepData.description}
          </p>

          {/* Progress Dots */}
          <div className="flex items-center justify-center mt-4 space-x-2">
            {Object.entries(ANALYZE_UI.progress.steps).map(([stepKey], index) => {
              const isCurrentStep = stepKey === progress.currentStep
              const isCompletedStep = Object.keys(ANALYZE_UI.progress.steps).indexOf(progress.currentStep) > index
              
              return (
                <div
                  key={stepKey}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all duration-300',
                    isCurrentStep ? 'bg-blue-600 w-3 h-3' :
                    isCompletedStep ? 'bg-emerald-500' : 'bg-gray-300'
                  )}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* Cancel Option (for long-running analyses) */}
      {!isComplete && progress.percentage < 95 && (
        <button className={cn(
          'mt-6 px-6 py-2 text-sm font-medium text-gray-600',
          'hover:text-gray-900 transition-colors duration-200',
          'hover:bg-white/20 rounded-lg backdrop-blur-sm'
        )}>
          Analyse abbrechen
        </button>
      )}
    </div>
  )
}

// Display name for debugging
AnalysisProgress.displayName = 'AnalysisProgress'

// Default export for convenience  
export default AnalysisProgress