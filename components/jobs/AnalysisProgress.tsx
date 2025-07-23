/**
 * @file components/jobs/AnalysisProgress.tsx
 * @description Real-time analysis progress component with German localization
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo ARCHITECTURE-001-06: Frontend progress display component
 */

'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
} from 'lucide-react'
import type { JobStatusResponse } from '@/lib/types/analysis-jobs'

interface AnalysisProgressProps {
  jobId: string | null
  status: JobStatusResponse['status'] | null
  progress: number
  currentStep: string | null
  stepDescription: string | null
  estimatedTimeRemainingMs: number | null
  error: string | null
  onComplete?: () => void
  onError?: () => void
  className?: string
}

/**
 * Real-time progress component for analysis jobs
 */
export function AnalysisProgress({
  jobId,
  status,
  progress,
  currentStep,
  stepDescription,
  estimatedTimeRemainingMs,
  error,
  onComplete,
  onError,
  className = '',
}: AnalysisProgressProps) {
  const [showTimeRemaining, setShowTimeRemaining] = useState(false)

  // Auto-hide time remaining after a few seconds
  useEffect(() => {
    if (estimatedTimeRemainingMs !== null && estimatedTimeRemainingMs > 0) {
      setShowTimeRemaining(true)
      const timer = setTimeout(() => setShowTimeRemaining(false), 10000) // Hide after 10s
      return () => clearTimeout(timer)
    }
  }, [estimatedTimeRemainingMs])

  const formatTimeRemaining = (ms: number): string => {
    const seconds = Math.ceil(ms / 1000)
    if (seconds < 60) {
      return `${seconds} Sekunden`
    }
    const minutes = Math.ceil(seconds / 60)
    return `${minutes} Minute${minutes > 1 ? 'n' : ''}`
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-blue-500" />
      case 'running':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusMessage = () => {
    if (error) return error

    switch (status) {
      case 'pending':
        return 'Ihre Anfrage wird bearbeitet...'
      case 'running':
        return stepDescription || 'Analyse läuft...'
      case 'completed':
        return 'Analyse erfolgreich abgeschlossen!'
      case 'failed':
        return 'Analyse fehlgeschlagen. Bitte versuchen Sie es erneut.'
      default:
        return 'Vorbereitung der Analyse...'
    }
  }

  const getProgressBarColor = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-500'
      case 'failed':
        return 'bg-red-500'
      case 'running':
        return 'bg-blue-500'
      default:
        return 'bg-gray-400'
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with status icon and message */}
      <div className="flex items-center space-x-3">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {getStatusIcon()}
        </motion.div>
        <div className="flex-1">
          <motion.h3
            className="text-lg font-semibold text-gray-900"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {getStatusMessage()}
          </motion.h3>

          {/* Job ID (for debugging) */}
          {jobId && process.env.NODE_ENV === 'development' && (
            <p className="text-xs text-gray-500 mt-1">
              Job ID: {jobId.substring(0, 8)}...
            </p>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Fortschritt: {progress}%</span>

          {/* Time Remaining */}
          <AnimatePresence>
            {showTimeRemaining &&
              estimatedTimeRemainingMs &&
              estimatedTimeRemainingMs > 0 && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="text-gray-500 text-xs"
                >
                  ⏱️ Noch ca. {formatTimeRemaining(estimatedTimeRemainingMs)}
                </motion.span>
              )}
          </AnimatePresence>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <motion.div
            className={`h-full ${getProgressBarColor()} transition-colors duration-300`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{
              duration: 0.8,
              ease: 'easeInOut',
            }}
          />
        </div>
      </div>

      {/* Step Details */}
      {currentStep && status === 'running' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Aktueller Schritt:</strong>{' '}
                {stepDescription || currentStep}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Error Details */}
      {error && status === 'failed' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <XCircle className="w-4 h-4 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                <strong>Fehler:</strong> {error}
              </p>
              <button
                onClick={onError}
                className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
              >
                Erneut versuchen
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Success Message */}
      {status === 'completed' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <p className="ml-3 text-sm text-green-700">
                <strong>Fertig!</strong> Ihre Airbnb-Analyse ist bereit.
              </p>
            </div>
            <button
              onClick={onComplete}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
            >
              Ergebnisse anzeigen
            </button>
          </div>
        </motion.div>
      )}

      {/* Analysis Steps Indicator */}
      {(status === 'running' || status === 'completed') && (
        <div className="grid grid-cols-4 gap-2 mt-4">
          {[
            { step: 'initializing', label: 'Start', range: [0, 10] },
            { step: 'scraping', label: 'Daten laden', range: [10, 60] },
            { step: 'analyzing', label: 'KI-Analyse', range: [60, 85] },
            { step: 'finalizing', label: 'Abschluss', range: [85, 100] },
          ].map(({ step, label, range }) => {
            const isActive = currentStep === step
            const isCompleted = progress > range[1]
            const isInProgress = progress >= range[0] && progress <= range[1]

            return (
              <div
                key={step}
                className={`text-xs text-center p-2 rounded-lg transition-colors ${
                  isCompleted
                    ? 'bg-green-100 text-green-800'
                    : isActive || isInProgress
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-500'
                }`}
              >
                {label}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
