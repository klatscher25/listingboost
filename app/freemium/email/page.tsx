/**
 * @file app/freemium/email/page.tsx
 * @description Email-Sammlung für Freemium-Analyse mit Test-Bypass
 * @created 2025-07-21
 * @todo Freemium Email Collection System
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function FreemiumEmailPage() {
  const [email, setEmail] = useState('')
  const [isValidEmail, setIsValidEmail] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showTestBypass, setShowTestBypass] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if URL exists in localStorage
    const savedUrl = localStorage.getItem('freemium_url')
    if (!savedUrl) {
      router.push('/freemium')
    }

    // Show test bypass in development
    setShowTestBypass(process.env.NODE_ENV === 'development')
  }, [router])

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    if (value.length > 3) {
      setIsValidEmail(validateEmail(value))
    } else {
      setIsValidEmail(null)
    }
  }

  const generateFreemiumToken = (): string => {
    return 'freemium_' + Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  const handleSendAnalysis = async () => {
    if (!validateEmail(email)) {
      setIsValidEmail(false)
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // ✅ FIX: Use existing token instead of generating new one
      const existingToken = localStorage.getItem('freemium_token')
      if (!existingToken || !existingToken.startsWith('freemium_')) {
        console.error('[TOKEN ERROR] No valid freemium token found in localStorage')
        // Fallback: generate token if none exists (should not happen in normal flow)
        const fallbackToken = generateFreemiumToken()
        localStorage.setItem('freemium_token', fallbackToken)
        console.log('[TOKEN] Generated fallback token:', fallbackToken)
      }
      
      const token = localStorage.getItem('freemium_token')!
      
      // Store email (token already exists)
      localStorage.setItem('freemium_email', email)
      
      console.log('[TOKEN] Using existing token for dashboard:', token)
      console.log('Sending freemium analysis email to:', email)
      
      // Redirect to success page with existing token
      router.push(`/freemium/dashboard/${token}`)
      
    } catch (error) {
      console.error('Error sending analysis:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestBypass = () => {
    // ✅ FIX: Use existing token for test bypass too
    const existingToken = localStorage.getItem('freemium_token')
    if (!existingToken || !existingToken.startsWith('freemium_')) {
      console.error('[TOKEN ERROR] No valid freemium token found for test bypass')
      const fallbackToken = generateFreemiumToken()
      localStorage.setItem('freemium_token', fallbackToken)
      console.log('[TOKEN] Generated fallback token for test:', fallbackToken)
    }
    
    const token = localStorage.getItem('freemium_token')!
    localStorage.setItem('freemium_email', 'test@example.com')
    
    console.log('[TOKEN] Using existing token for test bypass:', token)
    router.push(`/freemium/dashboard/${token}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-slate-100/30 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
      <div className="absolute top-0 -left-4 w-96 h-96 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob" />
      <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob animation-delay-4000" />

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
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Success Animation */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-2xl mb-6 animate-bounce">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              🎉 Analyse erfolgreich abgeschlossen!
            </h1>
            <p className="text-lg text-slate-600 max-w-lg mx-auto">
              Ihre Airbnb-Analyse ist fertig! Geben Sie Ihre E-Mail-Adresse ein, 
              um die detaillierten Ergebnisse zu erhalten.
            </p>
          </div>

          {/* Email Form */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl p-8 md:p-10">
            
            {/* Form Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                📧 Wohin sollen wir Ihre Analyse senden?
              </h2>
              <p className="text-slate-600">
                Sie erhalten einen Link zu Ihren personalisierten Ergebnissen
              </p>
            </div>

            {/* Email Input */}
            <div className="space-y-6">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="ihre.email@beispiel.de"
                  className={`w-full px-6 py-4 text-lg border-2 rounded-2xl focus:outline-none transition-all duration-300 ${
                    isValidEmail === null 
                      ? 'border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100' 
                      : isValidEmail 
                      ? 'border-green-400 bg-green-50/50 focus:border-green-500 focus:ring-4 focus:ring-green-100' 
                      : 'border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                  }`}
                  disabled={isLoading}
                />
                
                {/* Validation Icon */}
                {isValidEmail !== null && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    {isValidEmail ? (
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
              {isValidEmail === false && (
                <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
                  ⚠️ Bitte geben Sie eine gültige E-Mail-Adresse ein
                </div>
              )}

              {isValidEmail === true && (
                <div className="text-green-600 text-sm bg-green-50 border border-green-200 rounded-lg p-3">
                  ✅ Perfekt! Gültige E-Mail-Adresse
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSendAnalysis}
                disabled={!email.trim() || isLoading}
                className={`w-full py-4 px-8 rounded-2xl font-bold text-lg shadow-xl transition-all duration-300 transform ${
                  email.trim() && !isLoading
                    ? 'bg-gradient-to-r from-emerald-600 to-blue-600 text-white hover:shadow-2xl hover:scale-105'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Wird versendet...</span>
                  </div>
                ) : (
                  '📤 Analyse zusenden'
                )}
              </button>
            </div>

            {/* Privacy Notice */}
            <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-start space-x-3">
                <div className="text-blue-600 mt-0.5">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="text-sm text-slate-600">
                  <strong>Ihre Privatsphäre ist uns wichtig.</strong> Wir verwenden Ihre E-Mail-Adresse 
                  nur zum Versand Ihrer Analyse. Kein Spam, keine Weitergabe an Dritte.
                </div>
              </div>
            </div>

            {/* Test Bypass Button (Development Only) */}
            {showTestBypass && (
              <div className="mt-6 pt-6 border-t border-slate-200">
                <button
                  onClick={handleTestBypass}
                  className="w-full py-3 px-6 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-xl transition-all duration-200"
                >
                  🧪 TEST: Direkt zum Dashboard (ohne Email)
                </button>
                <p className="text-xs text-slate-500 text-center mt-2">
                  Dieser Button ist nur in der Entwicklungsumgebung sichtbar
                </p>
              </div>
            )}
          </div>

          {/* Features */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {[
              { icon: '⚡', title: 'Sofort verfügbar', desc: 'Link in wenigen Sekunden per E-Mail' },
              { icon: '📱', title: 'Mobil optimiert', desc: 'Perfekt auf allen Geräten lesbar' },
              { icon: '🔒', title: '100% sicher', desc: 'Ihre Daten bleiben privat und geschützt' }
            ].map((feature, index) => (
              <div key={index} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/50 shadow-lg">
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="font-bold text-slate-800 mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm">{feature.desc}</p>
              </div>
            ))}
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