/**
 * @file app/freemium/analyze/page.tsx
 * @description Fake-Analyse mit realistischer Simulation für Lead-Generation
 * @created 2025-07-21
 * @todo Freemium Fake Analysis System
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// ✅ FIXED: Move analysisSteps outside component to prevent re-creation
const analysisSteps = [
  { 
    title: "Listing-Daten werden geladen...",
    description: "Wir analysieren Ihre Airbnb-Unterkunft",
    duration: 3000,
    icon: "🔍"
  },
  {
    title: "Marktvergleich läuft...",
    description: "Vergleich mit ähnlichen Unterkünften in der Umgebung",
    duration: 4000,
    icon: "📊"
  },
  {
    title: "Preisoptimierung wird berechnet...",
    description: "Ermittlung des optimalen Preispunkts",
    duration: 3000,
    icon: "💰"
  },
  {
    title: "SEO-Analyse durchgeführt...",
    description: "Bewertung von Titel, Beschreibung und Fotos",
    duration: 4000,
    icon: "🎯"
  },
  {
    title: "KI-Empfehlungen werden erstellt...",
    description: "Personalisierte Optimierungsvorschläge",
    duration: 4000,
    icon: "🤖"
  }
]

export default function FreemiumAnalyzePage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [url, setUrl] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Get URL from localStorage
    const savedUrl = localStorage.getItem('freemium_url')
    if (!savedUrl) {
      router.push('/freemium')
      return
    }
    setUrl(savedUrl)

    // Start analysis simulation with smooth progress
    const runStep = (stepIndex: number) => {
      if (stepIndex >= analysisSteps.length) {
        // Analysis complete - redirect to email collection
        setTimeout(() => {
          router.push('/freemium/email')
        }, 2000)
        return
      }

      setCurrentStep(stepIndex)
      const step = analysisSteps[stepIndex]
      const stepStartProgress = (stepIndex / analysisSteps.length) * 100
      const stepEndProgress = ((stepIndex + 1) / analysisSteps.length) * 100
      const stepProgressRange = stepEndProgress - stepStartProgress

      // ✅ PERFORMANCE OPTIMIZATION: Start background API call during step 1 (Listing-Daten)
      // This gives us 15 seconds (remaining time) to pre-load the analysis data
      if (stepIndex === 0) { // Listing-Daten step - 3 seconds into 18-second flow
        const savedToken = localStorage.getItem('freemium_token')
        if (savedToken && savedUrl) {
          console.log('[PERFORMANCE] Starting background API call during fake analysis...')
          console.log('[TOKEN] Using token for API call:', savedToken)
          
          // Pre-call the API in background to reduce dashboard loading time
          fetch('/api/freemium/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: savedUrl, token: savedToken }),
          })
          .then(response => response.json())
          .then(result => {
            if (result.success) {
              console.log('[PERFORMANCE] Background API call successful - caching result')
              localStorage.setItem('freemium_analysis_cache', JSON.stringify(result.data))
              localStorage.setItem('freemium_analysis_cache_time', Date.now().toString())
            } else {
              console.log('[PERFORMANCE] Background API call failed:', result.error)
            }
          })
          .catch(error => {
            console.log('[PERFORMANCE] Background API call network error:', error)
          })
        } else {
          console.error('[TOKEN ERROR] No token or URL found for background API call')
          console.log('[TOKEN DEBUG] savedToken:', savedToken, 'savedUrl:', savedUrl)
        }
      }

      // Smooth progress animation within this step only
      let stepStartTime = Date.now()
      const stepInterval = setInterval(() => {
        const elapsedTime = Date.now() - stepStartTime
        const stepProgress = Math.min(elapsedTime / step.duration, 1) // 0 to 1
        const currentProgress = stepStartProgress + (stepProgress * stepProgressRange)
        
        setProgress(currentProgress)
        
        // Clear interval when step is complete
        if (stepProgress >= 1) {
          clearInterval(stepInterval)
        }
      }, 50) // Smoother updates every 50ms

      setTimeout(() => {
        clearInterval(stepInterval)
        setProgress(stepEndProgress) // Ensure we end exactly at step boundary
        runStep(stepIndex + 1)
      }, step.duration)
    }

    runStep(0)
  }, [router]) // ✅ FIXED: Removed analysisSteps from dependencies (now outside component)

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
                Wir analysieren Ihr Listing auf {extractDomain(url)} (ID: {extractRoomId(url)})
              </p>
            </div>

            {/* Progress Section */}
            <div className="mb-12">
              {/* Overall Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-700">Gesamtfortschritt</span>
                  <span className="text-sm font-bold text-blue-600">{Math.round(progress)}%</span>
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
              {currentStep < analysisSteps.length && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl animate-bounce">
                      {analysisSteps[currentStep].icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-800 mb-1">
                        {analysisSteps[currentStep].title}
                      </h3>
                      <p className="text-slate-600">
                        {analysisSteps[currentStep].description}
                      </p>
                    </div>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse animation-delay-200" />
                      <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse animation-delay-400" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Analysis Steps Overview */}
            <div className="grid gap-4">
              {analysisSteps.map((step, index) => (
                <div 
                  key={index}
                  className={`flex items-center space-x-4 p-4 rounded-xl transition-all duration-500 ${
                    index < currentStep 
                      ? 'bg-green-50 border border-green-200' 
                      : index === currentStep 
                      ? 'bg-blue-50 border border-blue-200 ring-2 ring-blue-100' 
                      : 'bg-slate-50 border border-slate-100'
                  }`}
                >
                  <div className={`text-2xl ${index === currentStep ? 'animate-bounce' : ''}`}>
                    {index < currentStep ? '✅' : step.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-semibold ${
                      index < currentStep 
                        ? 'text-green-800' 
                        : index === currentStep 
                        ? 'text-blue-800' 
                        : 'text-slate-500'
                    }`}>
                      {index < currentStep ? step.title.replace('...', ' ✓') : step.title}
                    </h4>
                    <p className={`text-sm ${
                      index < currentStep 
                        ? 'text-green-600' 
                        : index === currentStep 
                        ? 'text-blue-600' 
                        : 'text-slate-400'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                  {index < currentStep && (
                    <div className="text-green-500">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Fun Facts */}
            <div className="mt-12 p-6 bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl border border-slate-200">
              <div className="text-center">
                <h3 className="font-bold text-slate-800 mb-2">💡 Wussten Sie schon?</h3>
                <p className="text-slate-600 text-sm">
                  Optimierte Airbnb-Listings erzielen durchschnittlich 35% höhere Buchungsraten 
                  und 28% bessere Bewertungen von Gästen!
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