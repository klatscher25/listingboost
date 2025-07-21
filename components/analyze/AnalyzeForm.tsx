/**
 * @file components/analyze/AnalyzeForm.tsx
 * @description Main orchestrator component for analysis workflow
 * @created 2025-07-21
 * @todo FRONTEND-001-01: Complete analysis workflow orchestration
 */

'use client'

import React, { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { MODERN_DESIGN, glass } from '@/lib/design/modern-tokens'
import { ANALYZE_UI } from '@/lib/theme/analyze-constants'
import { URLInputField } from './URLInputField'
import { AnalysisProgress } from './AnalysisProgress'
import type { AnalyzeFormProps, AnalysisType, AnalysisStatus, ProgressStatus, URLValidation } from './shared-types'

/**
 * 🚀 MAIN ANALYSIS FORM ORCHESTRATOR
 * 
 * Complete workflow management:
 * - URL input with validation
 * - Analysis type selection  
 * - Progress tracking
 * - State management
 * - Error handling
 */

export function AnalyzeForm({
  userId,
  onAnalysisStart,
  onAnalysisComplete,
  onAnalysisError,
  initialUrl = '',
  initialType = 'comprehensive',
  className,
  ...props
}: AnalyzeFormProps) {
  // Core state
  const [url, setUrl] = useState(initialUrl)
  const [analysisType, setAnalysisType] = useState<AnalysisType>(initialType)
  const [status, setStatus] = useState<AnalysisStatus>('idle')
  const [urlValidation, setUrlValidation] = useState<URLValidation | null>(null)
  
  // Progress state
  const [progress, setProgress] = useState<ProgressStatus | null>(null)

  // Form validation
  const canStartAnalysis = urlValidation?.isValid && status === 'idle'

  // Mock analysis simulation for demo
  const simulateAnalysis = useCallback(async () => {
    const steps = Object.keys(ANALYZE_UI.progress.steps)
    const totalDuration = analysisType === 'quick' ? 30000 : 90000 // ms
    const stepDuration = totalDuration / steps.length

    for (let i = 0; i < steps.length; i++) {
      const stepKey = steps[i] as keyof typeof ANALYZE_UI.progress.steps
      const percentage = ((i + 1) / steps.length) * 100
      const timeRemaining = totalDuration - ((i + 1) * stepDuration)

      setProgress({
        currentStep: stepKey,
        percentage,
        timeElapsed: (i + 1) * stepDuration,
        timeRemaining: Math.max(0, timeRemaining),
        message: ANALYZE_UI.progress.steps[stepKey].description
      })

      // Wait for step duration
      await new Promise(resolve => setTimeout(resolve, stepDuration))
    }
  }, [analysisType])

  // Handle analysis start
  const handleStartAnalysis = useCallback(async () => {
    if (!canStartAnalysis) return

    setStatus('analyzing')
    onAnalysisStart?.({
      airbnb_url: url,
      analysis_type: analysisType,
      user_id: userId,
      enable_ai: analysisType === 'comprehensive'
    })

    try {
      // Simulate analysis process
      await simulateAnalysis()
      
      setStatus('completed')
      // Mock successful completion
      onAnalysisComplete?.({
        listingId: urlValidation!.listingId!,
        url,
        title: 'Beautiful Apartment in Berlin',
        score: {
          overall: 85,
          categories: {
            photos: 92,
            description: 78,
            pricing: 85,
            amenities: 88,
            location: 95,
            reviews: 82
          }
        },
        recommendations: [],
        marketComparison: {
          averagePrice: 120,
          pricePosition: 'average',
          competitorCount: 45,
          occupancyRate: 0.78,
          averageRating: 4.2,
          ratingPosition: 'above'
        },
        processingInfo: {
          analysisType,
          completedAt: new Date().toISOString(),
          totalTime: analysisType === 'quick' ? 30 : 90,
          dataSourcesUsed: ['airbnb-api', 'ai-analysis']
        }
      })
    } catch (error) {
      setStatus('error')
      onAnalysisError?.(error)
    }
  }, [canStartAnalysis, url, analysisType, userId, urlValidation, simulateAnalysis, onAnalysisStart, onAnalysisComplete, onAnalysisError])

  // Reset form
  const handleReset = () => {
    setStatus('idle')
    setProgress(null)
    setUrl('')
    setUrlValidation(null)
  }

  // Show progress during analysis
  if (status === 'analyzing' && progress) {
    return (
      <div className={cn('w-full', className)} {...props}>
        <AnalysisProgress
          progress={progress}
          variant="circular"
          size="lg"
          showTime={true}
          showSteps={true}
          animated={true}
        />
      </div>
    )
  }

  // Show completion message
  if (status === 'completed') {
    return (
      <div className={cn('text-center py-12', className)} {...props}>
        <div className={cn(
          'p-8 rounded-2xl max-w-md mx-auto',
          MODERN_DESIGN.glass.primary.base,
          MODERN_DESIGN.glass.primary.border
        )}>
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Analyse abgeschlossen!
          </h3>
          <p className="text-gray-600 mb-6">
            Ihre Listing-Analyse ist bereit. Schauen Sie sich die Ergebnisse an.
          </p>
          <button
            onClick={handleReset}
            className={cn(
              'px-6 py-3 rounded-lg font-medium',
              MODERN_DESIGN.states.button.secondary,
              MODERN_DESIGN.animations.gentle
            )}
          >
            Neue Analyse starten
          </button>
        </div>
      </div>
    )
  }

  // Main form interface
  return (
    <div className={cn('w-full max-w-2xl mx-auto', className)} {...props}>
      {/* URL Input Section */}
      <div className="space-y-6">
        <URLInputField
          value={url}
          onChange={setUrl}
          onValidation={setUrlValidation}
          autoFocus={true}
          size="lg"
        />

        {/* Analysis Type Selection */}
        <div className={cn(
          'p-6 rounded-xl space-y-4',
          MODERN_DESIGN.glass.secondary.base,
          MODERN_DESIGN.glass.secondary.border
        )}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {ANALYZE_UI.form.analysisType.label}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Quick Analysis Option */}
            <button
              onClick={() => setAnalysisType('quick')}
              className={cn(
                'p-5 rounded-lg text-left transition-all duration-200',
                analysisType === 'quick'
                  ? `${MODERN_DESIGN.glass.primary.base} ${MODERN_DESIGN.glass.primary.border}`
                  : `${MODERN_DESIGN.glass.input.base} hover:${MODERN_DESIGN.glass.input.hover}`,
                MODERN_DESIGN.animations.gentle
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">
                  {ANALYZE_UI.form.analysisType.quick.title}
                </h4>
                <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  {ANALYZE_UI.form.analysisType.quick.duration}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                {ANALYZE_UI.form.analysisType.quick.description}
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                {ANALYZE_UI.form.analysisType.quick.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <span className="w-1 h-1 bg-blue-400 rounded-full mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
            </button>

            {/* Comprehensive Analysis Option */}
            <button
              onClick={() => setAnalysisType('comprehensive')}
              className={cn(
                'p-5 rounded-lg text-left transition-all duration-200 relative',
                analysisType === 'comprehensive'
                  ? `${MODERN_DESIGN.glass.primary.base} ${MODERN_DESIGN.glass.primary.border}`
                  : `${MODERN_DESIGN.glass.input.base} hover:${MODERN_DESIGN.glass.input.hover}`,
                MODERN_DESIGN.animations.gentle
              )}
            >
              {/* Recommended Badge */}
              <div className="absolute -top-2 -right-2">
                <span className="bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                  {ANALYZE_UI.form.analysisType.comprehensive.recommended}
                </span>
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">
                  {ANALYZE_UI.form.analysisType.comprehensive.title}
                </h4>
                <span className="text-sm bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                  {ANALYZE_UI.form.analysisType.comprehensive.duration}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                {ANALYZE_UI.form.analysisType.comprehensive.description}
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                {ANALYZE_UI.form.analysisType.comprehensive.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <span className="w-1 h-1 bg-indigo-400 rounded-full mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
            </button>
          </div>
        </div>

        {/* Start Analysis Button */}
        <button
          onClick={handleStartAnalysis}
          disabled={!canStartAnalysis}
          className={cn(
            'w-full py-4 px-6 rounded-xl font-semibold text-lg',
            canStartAnalysis
              ? `${MODERN_DESIGN.states.button.primary} ${MODERN_DESIGN.animations.hoverScale}`
              : 'bg-gray-300 text-gray-500 cursor-not-allowed',
            MODERN_DESIGN.animations.gentle
          )}
        >
          {analysisType === 'quick' 
            ? ANALYZE_UI.form.actions.startQuick
            : ANALYZE_UI.form.actions.startComprehensive}
        </button>
      </div>
    </div>
  )
}

// Display name for debugging
AnalyzeForm.displayName = 'AnalyzeForm'

export default AnalyzeForm