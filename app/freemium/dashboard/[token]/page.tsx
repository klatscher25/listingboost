/**
 * @file app/freemium/dashboard/[token]/page.tsx
 * @description Modern Freemium Dashboard with Real Data Integration (Refactored)
 * @created 2025-07-21
 * @modified 2025-07-22
 * @todo Refactored from 1743-line file for CLAUDE.md compliance
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { PotentialAnalysisWidget } from '@/components/ui/PotentialAnalysisWidget'

// Import types and utilities
import {
  FreemiumData,
  FreemiumAIInsights,
  AIInsightsResponse,
} from '@/lib/types/freemium-types'

// Import freemium dashboard content
import { FreemiumDashboardContent } from '@/components/freemium/FreemiumDashboardContent'
import { ModernDashboardHero } from '@/components/freemium/ModernDashboardHero'
import { StickyUpgradeBar } from '@/components/freemium/StickyUpgradeBar'

export default function ModernFreemiumDashboard() {
  const [data, setData] = useState<FreemiumData | null>(null)
  const [aiInsights, setAiInsights] = useState<FreemiumAIInsights | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingAI, setIsLoadingAI] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [url, setUrl] = useState('')
  const [email, setEmail] = useState('')

  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    // Verify token and get stored data
    const savedUrl = localStorage.getItem('freemium_url')
    const savedEmail = localStorage.getItem('freemium_email')
    const savedToken = localStorage.getItem('freemium_token')

    if (!savedUrl || !savedToken || savedToken !== params.token) {
      router.push('/freemium')
      return
    }

    setUrl(savedUrl)
    setEmail(savedEmail || '')

    // Fetch real data from API
    fetchAnalysisData(savedUrl, savedToken)

    // Show upgrade prompt after 30 seconds (less aggressive)
    setTimeout(() => {
      setShowUpgrade(true)
    }, 30000)
  }, [router, params.token])

  const fetchAnalysisData = async (url: string, token: string) => {
    try {
      console.log('[PERFORMANCE] Loading dashboard data...')

      const dbResponse = await fetch(`/api/freemium/dashboard/${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (dbResponse.ok) {
        const result = await dbResponse.json()
        if (result.success && result.data) {
          console.log(
            '[PERFORMANCE] Dashboard loaded from database successfully'
          )
          setData(result.data)
          setIsLoading(false)
          return
        }
      }

      // Fallback to original analysis if DB fails
      console.log('[PERFORMANCE] Database load failed, using fallback data')
      // Add fallback logic here if needed
    } catch (error) {
      console.error('[DASHBOARD ERROR]', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAIInsights = async () => {
    if (!params.token || isLoadingAI || aiInsights) return

    setIsLoadingAI(true)
    try {
      const response = await fetch(
        `/api/freemium/ai-insights/${params.token}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.ok) {
        const result: AIInsightsResponse = await response.json()
        setAiInsights(result.insights)
      }
    } catch (error) {
      console.error('Error fetching AI insights:', error)
    } finally {
      setIsLoadingAI(false)
    }
  }

  const handleUpgrade = () => {
    // Store upgrade intent in localStorage
    localStorage.setItem('upgrade_intent', 'true')
    localStorage.setItem('upgrade_source', 'freemium_dashboard')

    // Redirect to upgrade page (to be implemented)
    router.push('/upgrade')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Lädt Ihre Analyse...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 text-lg">
            Keine Daten gefunden. Bitte starten Sie eine neue Analyse.
          </p>
          <button
            onClick={() => router.push('/freemium')}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Neue Analyse starten
          </button>
        </div>
      </div>
    )
  }

  const { listing, analysis, recommendations, isRealData } = data

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100/50">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">LB</span>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                ListingBoost Analyse
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
                {isRealData ? (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-blue-700">
                      Live-Analyse
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm font-medium text-orange-700">
                      Demo-Modus
                    </span>
                  </>
                )}
              </div>
              <button
                onClick={handleUpgrade}
                className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 text-sm"
              >
                Pro upgraden
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Modern Hero Section */}
      <ModernDashboardHero data={data} onUpgradeClick={handleUpgrade} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Content */}
        <FreemiumDashboardContent
          data={data}
          aiInsights={aiInsights}
          isLoadingAI={isLoadingAI}
          token={params.token as string}
          onFetchAIInsights={fetchAIInsights}
          onUpgradeClick={() => setShowUpgrade(true)}
        />
      </div>

      {/* Upgrade Modal */}
      {showUpgrade && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 relative">
            <button
              onClick={() => setShowUpgrade(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>

              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                Vollständigen Bericht freischalten
              </h3>

              <p className="text-slate-600 mb-6">
                Erhalten Sie detaillierte Analysen, Konkurrenzvergleiche und
                Schritt-für-Schritt Optimierungsanleitungen.
              </p>

              <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-emerald-600">15+</div>
                  <div className="text-sm text-slate-600">Detailanalysen</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-600">
                    €2.5K
                  </div>
                  <div className="text-sm text-slate-600">Ø Mehr-Umsatz</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-600">30T</div>
                  <div className="text-sm text-slate-600">Geld-zurück</div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowUpgrade(false)}
                  className="flex-1 py-3 px-4 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 transition-all duration-200"
                >
                  Vielleicht später
                </button>
                <button
                  onClick={handleUpgrade}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
                >
                  Vollbericht ansehen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Upgrade Bar */}
      <StickyUpgradeBar onUpgradeClick={handleUpgrade} />

      {/* Glassmorphism Styles */}
      <style jsx global>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.18);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
        }

        .glass-card-dark {
          background: rgba(0, 0, 0, 0.25);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.18);
        }
      `}</style>
    </div>
  )
}
