/**
 * @file components/freemium/AsyncFreemiumAnalyze.tsx
 * @description Async freemium analysis component with real-time progress
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo ARCHITECTURE-001-06: Async freemium analysis integration
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, ExternalLink, RefreshCw } from 'lucide-react'
import { useAnalysisJob } from '@/hooks/useAnalysisJob'
import { AnalysisProgress } from '@/components/jobs/AnalysisProgress'

interface AsyncFreemiumAnalyzeProps {
  url: string
  token: string
  onAnalysisComplete?: (results: any) => void
}

/**
 * Async freemium analysis component that replaces the fake 18-second flow
 * with real background processing and progress updates
 */
export function AsyncFreemiumAnalyze({
  url,
  token,
  onAnalysisComplete,
}: AsyncFreemiumAnalyzeProps) {
  const router = useRouter()
  const [showUrlInfo, setShowUrlInfo] = useState(true)
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Use the analysis job hook
  const {
    jobId,
    status,
    progress,
    currentStep,
    stepDescription,
    estimatedTimeRemainingMs,
    results,
    error,
    isLoading,
    startJob,
    reset,
    isCompleted,
    isFailed,
  } = useAnalysisJob({
    onComplete: (jobResults) => {
      console.log('[AsyncFreemiumAnalyze] Analysis completed:', jobResults)

      // Store results in localStorage for dashboard access
      if (jobResults) {
        localStorage.setItem(
          `freemium_results_${token}`,
          JSON.stringify({
            ...jobResults,
            analyzedAt: new Date().toISOString(),
          })
        )
      }

      // Callback to parent component
      onAnalysisComplete?.(jobResults)

      // Auto-redirect to dashboard after a brief delay
      setTimeout(() => {
        setIsRedirecting(true)
        router.push(`/freemium/dashboard/${token}`)
      }, 2000)
    },
    onError: (errorMessage) => {
      console.error('[AsyncFreemiumAnalyze] Analysis failed:', errorMessage)
    },
  })

  // Start analysis automatically when component mounts
  useEffect(() => {
    console.log('[AsyncFreemiumAnalyze] Starting analysis for URL:', url)
    startJob(url, token)
  }, [url, token, startJob])

  // Hide URL info after analysis starts
  useEffect(() => {
    if (status === 'running' && progress > 10) {
      setShowUrlInfo(false)
    }
  }, [status, progress])

  const handleRetry = () => {
    console.log('[AsyncFreemiumAnalyze] Retrying analysis')
    reset()
    setTimeout(() => {
      startJob(url, token)
    }, 500)
  }

  const handleGoToDashboard = () => {
    setIsRedirecting(true)
    router.push(`/freemium/dashboard/${token}`)
  }

  const extractListingId = (airbnbUrl: string): string => {
    const match = airbnbUrl.match(/\/rooms\/(\d+)/)
    return match ? match[1] : 'Unknown'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Airbnb-Analyse läuft
            </h1>
            <p className="text-gray-600">
              Wir analysieren Ihr Listing mit modernster KI-Technologie
            </p>
          </motion.div>

          {/* URL Information */}
          {showUrlInfo && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900 mb-1">
                    Listing-URL analysieren
                  </h3>
                  <p className="text-sm text-gray-600 break-all">{url}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Listing-ID: {extractListingId(url)}
                  </p>
                </div>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Listing in neuem Tab öffnen"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            </motion.div>
          )}

          {/* Progress Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8"
          >
            <AnalysisProgress
              jobId={jobId}
              status={status}
              progress={progress}
              currentStep={currentStep}
              stepDescription={stepDescription}
              estimatedTimeRemainingMs={estimatedTimeRemainingMs}
              error={error}
              onComplete={handleGoToDashboard}
              onError={handleRetry}
            />
          </motion.div>

          {/* Status-specific Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center space-y-4"
          >
            {/* Loading State */}
            {(status === 'pending' || status === 'running') && !error && (
              <div className="space-y-4">
                <p className="text-gray-600 text-sm">
                  Die Analyse läuft im Hintergrund. Sie können diese Seite
                  verlassen und später zurückkehren.
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => window.open(url, '_blank')}
                    className="flex items-center px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Listing anzeigen
                  </button>
                </div>
              </div>
            )}

            {/* Error State */}
            {isFailed && error && (
              <div className="space-y-4">
                <p className="text-red-600 text-sm">
                  Bei der Analyse ist ein Fehler aufgetreten. Bitte versuchen
                  Sie es erneut.
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={handleRetry}
                    className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Erneut versuchen
                  </button>
                  <button
                    onClick={() => router.push('/freemium')}
                    className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Neue URL eingeben
                  </button>
                </div>
              </div>
            )}

            {/* Success State */}
            {isCompleted && !isRedirecting && (
              <div className="space-y-4">
                <p className="text-green-600 text-sm font-medium">
                  ✅ Analyse erfolgreich abgeschlossen!
                </p>
                <button
                  onClick={handleGoToDashboard}
                  className="flex items-center px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mx-auto"
                >
                  Ergebnisse anzeigen
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            )}

            {/* Redirecting State */}
            {isRedirecting && (
              <div className="space-y-4">
                <p className="text-blue-600 text-sm">
                  Weiterleitung zum Dashboard...
                </p>
                <div className="flex justify-center">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              </div>
            )}
          </motion.div>

          {/* Technical Info (Development Only) */}
          {process.env.NODE_ENV === 'development' && jobId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-8 bg-gray-50 rounded-lg p-4 border-l-4 border-gray-400"
            >
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                🛠️ Entwickler-Info
              </h4>
              <div className="text-xs text-gray-600 space-y-1">
                <p>
                  <strong>Job ID:</strong> {jobId}
                </p>
                <p>
                  <strong>Token:</strong> {token.substring(0, 15)}...
                </p>
                <p>
                  <strong>Status:</strong> {status}
                </p>
                <p>
                  <strong>Step:</strong> {currentStep || 'none'}
                </p>
                {estimatedTimeRemainingMs && (
                  <p>
                    <strong>Verbleibend:</strong>{' '}
                    {Math.ceil(estimatedTimeRemainingMs / 1000)}s
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
