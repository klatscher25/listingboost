/**
 * @file app/freemium/page.tsx
 * @description Kostenlose Analyse Landing Page für anonyme Benutzer
 * @created 2025-07-21
 * @todo Freemium Lead-Generation System
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function FreemiumPage() {
  const [url, setUrl] = useState('')
  const [isValidUrl, setIsValidUrl] = useState<boolean | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  // URL Validation
  const validateAirbnbUrl = (inputUrl: string): boolean => {
    const airbnbRegex = /^https?:\/\/(www\.)?(airbnb\.(com|de|fr|it|es|at|ch))\/rooms\/\d+/
    return airbnbRegex.test(inputUrl)
  }

  const handleUrlChange = (value: string) => {
    setUrl(value)
    if (value.length > 10) {
      setIsValidUrl(validateAirbnbUrl(value))
    } else {
      setIsValidUrl(null)
    }
  }

  const generateFreemiumToken = (): string => {
    return 'freemium_' + Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  const handleStartAnalysis = () => {
    if (!validateAirbnbUrl(url)) {
      setIsValidUrl(false)
      return
    }
    
    // ✅ FIX: Generate token here (start of flow) for consistency
    const token = generateFreemiumToken()
    
    // Store URL and token in localStorage for analysis
    localStorage.setItem('freemium_url', url)
    localStorage.setItem('freemium_token', token)
    
    console.log('[TOKEN] Generated freemium token at start:', token)
    
    router.push('/freemium/analyze')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/70 to-purple-50 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 bg-grid-slate-100/30 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
      <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob" />
      <div className="absolute top-0 -right-4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob animation-delay-4000" />
      
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
            <div className="hidden md:flex items-center space-x-6">
              <button 
                onClick={() => router.push('/auth/login')}
                className="text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium"
              >
                Anmelden
              </button>
              <button 
                onClick={() => router.push('/auth/register')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Registrieren
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className={`relative z-10 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-16">
          
          {/* Hero Section */}
          <div className="text-center mb-12">
            {/* Status Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 backdrop-blur-sm border border-green-200/50 rounded-full shadow-sm mb-6">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
              <span className="text-sm font-medium text-slate-700">✨ 100% kostenlos - keine Registrierung erforderlich</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 bg-clip-text text-transparent">
                Kostenlose Analyse
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Ihres Airbnb-Listings
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-12 px-4">
              Erfahren Sie in nur wenigen Minuten, wie Sie Ihr Airbnb-Listing optimieren können. 
              <span className="text-blue-600 font-semibold"> Komplett kostenlos und ohne Anmeldung!</span>
            </p>
          </div>

          {/* URL Input Form */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/40 shadow-2xl p-8 mb-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                  Airbnb-URL eingeben
                </h2>
                <p className="text-slate-600">
                  Kopieren Sie die URL Ihres Airbnb-Listings hier ein
                </p>
              </div>

              <div className="space-y-6">
                {/* URL Input Field */}
                <div className="relative">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="https://www.airbnb.de/rooms/12345678"
                    className={`w-full px-6 py-4 text-lg border-2 rounded-2xl focus:outline-none transition-all duration-300 ${
                      isValidUrl === null 
                        ? 'border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100' 
                        : isValidUrl 
                        ? 'border-green-400 bg-green-50/50 focus:border-green-500 focus:ring-4 focus:ring-green-100' 
                        : 'border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                    }`}
                  />
                  
                  {/* Validation Icon */}
                  {isValidUrl !== null && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      {isValidUrl ? (
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Validation Message */}
                {isValidUrl === false && (
                  <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
                    ⚠️ Bitte geben Sie eine gültige Airbnb-URL ein (z.B. https://www.airbnb.de/rooms/12345)
                  </div>
                )}

                {isValidUrl === true && (
                  <div className="text-green-600 text-sm bg-green-50 border border-green-200 rounded-lg p-3">
                    ✅ Perfekt! Gültige Airbnb-URL erkannt
                  </div>
                )}

                {/* Submit Button */}
                <button
                  onClick={handleStartAnalysis}
                  disabled={!url.trim()}
                  className={`w-full py-4 px-8 rounded-2xl font-bold text-lg shadow-xl transition-all duration-300 transform ${
                    url.trim()
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-2xl hover:scale-105 hover:from-blue-700 hover:to-purple-700'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {url.trim() ? '🚀 Kostenlose Analyse starten' : 'URL eingeben zum Fortfahren'}
                </button>
              </div>
            </div>

            {/* Features Preview */}
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: '🎯', title: 'Sofort-Analyse', desc: 'Ergebnisse in unter 60 Sekunden' },
                { icon: '📊', title: 'Detaillierte Insights', desc: 'Umfassende Bewertung Ihres Listings' },
                { icon: '💡', title: 'Konkrete Tipps', desc: 'Praktische Optimierungsvorschläge' }
              ].map((feature, index) => (
                <div key={index} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="text-3xl mb-3">{feature.icon}</div>
                  <h3 className="font-bold text-slate-800 mb-2">{feature.title}</h3>
                  <p className="text-slate-600 text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
      `}</style>
    </div>
  )
}