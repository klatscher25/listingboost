/**
 * @file app/freemium/analyze/page.tsx
 * @description Async Analysis with Background Job System (ARCHITECTURE-001)
 * @created 2025-07-21
 * @modified 2025-07-23
 * @todo ARCHITECTURE-001-04: Frontend async integration with job polling
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

// Job step types
type JobStep =
  | 'initializing'
  | 'scraping'
  | 'analyzing'
  | 'generating_recommendations'
  | 'finalizing'
  | 'completed'

// Job step mapping to user-friendly messages
const stepMessages: Record<
  JobStep,
  { title: string; description: string; icon: string }
> = {
  initializing: {
    title: 'Analyse wird initialisiert...',
    description: 'System wird für Ihre Airbnb-Analyse vorbereitet',
    icon: '🔧',
  },
  scraping: {
    title: 'Listing-Daten werden geladen...',
    description: 'Wir analysieren Ihre Airbnb-Unterkunft direkt',
    icon: '🔍',
  },
  analyzing: {
    title: 'KI-Analyse läuft...',
    description: 'Intelligente Bewertung aller Listing-Komponenten',
    icon: '🤖',
  },
  generating_recommendations: {
    title: 'Empfehlungen werden erstellt...',
    description: 'Personalisierte Optimierungsvorschläge',
    icon: '💡',
  },
  finalizing: {
    title: 'Ergebnisse werden finalisiert...',
    description: 'Letzte Berechnungen und Validierung',
    icon: '✨',
  },
  completed: {
    title: 'Analyse abgeschlossen!',
    description: 'Ihre personalisierten Ergebnisse sind bereit',
    icon: '🎉',
  },
}

export default function FreemiumAnalyzePage() {
  const [currentStep, setCurrentStep] = useState<JobStep>('initializing')
  const [progress, setProgress] = useState(0)
  const [url, setUrl] = useState('')
  const [jobId, setJobId] = useState<string | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Poll job status for real-time updates
  const pollJobStatus = useCallback(
    async (jobId: string) => {
      try {
        const statusResponse = await fetch(`/api/jobs/status/${jobId}`)
        const statusResult = await statusResponse.json()

        if (!statusResult.success) {
          setError(statusResult.error || 'Failed to get job status')
          return
        }

        const jobStatus = statusResult.data
        console.log(
          '[AsyncAnalysis] Job status:',
          jobStatus.status,
          `${jobStatus.progress}%`
        )

        // Update UI state
        setProgress(jobStatus.progress)
        if (jobStatus.currentStep && jobStatus.currentStep in stepMessages) {
          setCurrentStep(jobStatus.currentStep as JobStep)
        }

        if (jobStatus.status === 'completed') {
          console.log('[AsyncAnalysis] ✅ Job completed!')
          setIsComplete(true)

          // Redirect to email collection after brief delay
          setTimeout(() => {
            router.push('/freemium/email')
          }, 2000)
        } else if (jobStatus.status === 'failed') {
          console.error('[AsyncAnalysis] ❌ Job failed:', jobStatus.error)
          setError(jobStatus.error?.message || 'Analysis failed')
        } else {
          // Job still running - continue polling
          const nextPollDelay = statusResult.meta?.nextPollDelayMs || 2000
          setTimeout(() => pollJobStatus(jobId), nextPollDelay)
        }
      } catch (error) {
        console.error('[AsyncAnalysis] Polling error:', error)
        setError('Connection error during analysis')
      }
    },
    [router]
  )

  useEffect(() => {
    // Get URL from localStorage
    const savedUrl = localStorage.getItem('freemium_url')
    if (!savedUrl) {
      router.push('/freemium')
      return
    }
    setUrl(savedUrl)

    // Start async analysis with background job system
    const startAsyncAnalysis = async () => {
      try {
        const savedToken = localStorage.getItem('freemium_token')
        if (!savedToken) {
          console.error('[AsyncAnalysis] No token found')
          router.push('/freemium')
          return
        }

        console.log('[AsyncAnalysis] Creating analysis job...')

        // Create analysis job
        const jobResponse = await fetch('/api/jobs/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: savedUrl, token: savedToken }),
        })

        const jobResult = await jobResponse.json()

        if (!jobResult.success) {
          setError(jobResult.error || 'Failed to create analysis job')
          return
        }

        const newJobId = jobResult.data.jobId
        setJobId(newJobId)
        console.log('[AsyncAnalysis] ✅ Job created:', newJobId)

        // Start polling for job status
        pollJobStatus(newJobId)
      } catch (error) {
        console.error('[AsyncAnalysis] Failed to start analysis:', error)
        setError('Failed to start analysis')
      }
    }

    startAsyncAnalysis()
  }, [router, pollJobStatus])

  const extractDomain = (url: string) => {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname.replace('www.', '')
    } catch {
      return 'airbnb.de'
    }
  }

  const extractRoomId = (url: string) => {
    const match = url.match(/rooms\/(\d+)/)
    return match ? match[1] : '12345678'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-100/30 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-slate-100/30 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
      <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse" />
      <div className="absolute -bottom-8 right-20 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-2000" />

      {/* Navigation */}
      <nav className="relative z-50 border-b border-white/20 backdrop-blur-xl bg-white/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">LB</span>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                ListingBoost Pro
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Analysis Card */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl p-8 md:p-12">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                Ihre Airbnb-Analyse läuft...
              </h1>
              <p className="text-slate-600 text-lg">
                Wir analysieren Ihr Listing auf {extractDomain(url)} (ID:{' '}
                {extractRoomId(url)})
              </p>
            </div>

            {/* Progress Section */}
            <div className="mb-12">
              {/* Overall Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-700">
                    Gesamtfortschritt
                  </span>
                  <span className="text-sm font-bold text-blue-600">
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-300 ease-out relative"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Current Step */}
              {!error && stepMessages[currentStep] && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl animate-bounce">
                      {stepMessages[currentStep].icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-800 mb-1">
                        {stepMessages[currentStep].title}
                      </h3>
                      <p className="text-slate-600">
                        {stepMessages[currentStep].description}
                      </p>
                      {jobId && (
                        <p className="text-xs text-slate-400 mt-2">
                          Job ID: {jobId.substring(0, 8)}...
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse animation-delay-200" />
                      <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse animation-delay-400" />
                    </div>
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 border border-red-200">
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl">❌</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-red-800 mb-1">
                        Analyse fehlgeschlagen
                      </h3>
                      <p className="text-red-600">{error}</p>
                      <button
                        onClick={() => window.location.reload()}
                        className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Erneut versuchen
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Analysis Steps Overview */}
            {!error && (
              <div className="grid gap-4">
                {Object.entries(stepMessages).map(([stepKey, step]) => {
                  const stepOrder = [
                    'initializing',
                    'scraping',
                    'analyzing',
                    'generating_recommendations',
                    'finalizing',
                    'completed',
                  ]
                  const currentStepIndex = stepOrder.indexOf(currentStep)
                  const thisStepIndex = stepOrder.indexOf(stepKey)

                  const isCompleted =
                    thisStepIndex < currentStepIndex ||
                    (currentStep === 'completed' && stepKey === 'completed')
                  const isCurrent = stepKey === currentStep
                  const isPending = thisStepIndex > currentStepIndex

                  return (
                    <div
                      key={stepKey}
                      className={`flex items-center space-x-4 p-4 rounded-xl transition-all duration-500 ${
                        isCompleted
                          ? 'bg-green-50 border border-green-200'
                          : isCurrent
                            ? 'bg-blue-50 border border-blue-200 ring-2 ring-blue-100'
                            : 'bg-slate-50 border border-slate-100'
                      }`}
                    >
                      <div
                        className={`text-2xl ${isCurrent ? 'animate-bounce' : ''}`}
                      >
                        {isCompleted ? '✅' : step.icon}
                      </div>
                      <div className="flex-1">
                        <h4
                          className={`font-semibold ${
                            isCompleted
                              ? 'text-green-800'
                              : isCurrent
                                ? 'text-blue-800'
                                : 'text-slate-500'
                          }`}
                        >
                          {isCompleted
                            ? step.title.replace('...', ' ✓')
                            : step.title}
                        </h4>
                        <p
                          className={`text-sm ${
                            isCompleted
                              ? 'text-green-600'
                              : isCurrent
                                ? 'text-blue-600'
                                : 'text-slate-400'
                          }`}
                        >
                          {step.description}
                        </p>
                      </div>
                      {isCompleted && (
                        <div className="text-green-500">
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Fun Facts */}
            <div className="mt-12 p-6 bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl border border-slate-200">
              <div className="text-center">
                <h3 className="font-bold text-slate-800 mb-2">
                  💡 Wussten Sie schon?
                </h3>
                <p className="text-slate-600 text-sm">
                  Optimierte Airbnb-Listings erzielen durchschnittlich 35%
                  höhere Buchungsraten und 28% bessere Bewertungen von Gästen!
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  )
}
