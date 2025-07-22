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

// Import AI insight components
import ListingOptimizationSection from '@/components/freemium/ai-insights/ListingOptimizationSection'
import HostCredibilitySection from '@/components/freemium/ai-insights/HostCredibilitySection'
import SeasonalOptimizationSection from '@/components/freemium/ai-insights/SeasonalOptimizationSection'
import RatingImprovementSection from '@/components/freemium/ai-insights/RatingImprovementSection'
import AmenityGapAnalysisSection from '@/components/freemium/ai-insights/AmenityGapAnalysisSection'

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-sm sticky top-0 z-40">
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section with Listing Info */}
        <div className="mb-8">
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Listing Image */}
              {listing.images && listing.images.length > 0 && (
                <div className="lg:w-1/3">
                  <div className="relative h-64 lg:h-48 rounded-xl overflow-hidden">
                    <Image
                      src={listing.images[0].url}
                      alt={listing.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                </div>
              )}

              {/* Listing Details */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-slate-800 mb-2 leading-tight">
                  {listing.title}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-slate-600 mb-4">
                  <span>{listing.propertyType}</span>
                  <span>•</span>
                  <span>{listing.personCapacity} Gäste</span>
                  {listing.bedrooms && (
                    <>
                      <span>•</span>
                      <span>{listing.bedrooms} Schlafzimmer</span>
                    </>
                  )}
                </div>

                {/* Price and Rating */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl font-bold text-slate-800">
                      {listing.price.amount} {listing.price.qualifier}
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-500">⭐</span>
                      <span className="font-medium text-slate-700">
                        {listing.rating.guestSatisfaction.toFixed(1)}
                      </span>
                      <span className="text-slate-500 text-sm">
                        ({listing.rating.reviewsCount} Bewertungen)
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">
                      {analysis.overallScore}/100
                    </div>
                    <div className="text-sm text-slate-500">Gesamt-Score</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights Button */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200/50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">
                  🤖 KI-gestützte Optimierung
                </h2>
                <p className="text-slate-600">
                  Entdecken Sie 5 neue Bereiche mit personalisierten
                  Verbesserungsvorschlägen
                </p>
              </div>
              <button
                onClick={fetchAIInsights}
                disabled={isLoadingAI}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50"
              >
                {isLoadingAI
                  ? 'KI analysiert...'
                  : aiInsights
                    ? 'Bereits analysiert'
                    : 'KI-Analyse starten'}
              </button>
            </div>
          </div>
        </div>

        {/* AI Insights Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ListingOptimizationSection
            insights={aiInsights}
            listing={listing}
            isLoadingAI={isLoadingAI}
          />

          <HostCredibilitySection
            insights={aiInsights}
            listing={listing}
            isLoadingAI={isLoadingAI}
          />

          <SeasonalOptimizationSection
            insights={aiInsights}
            isLoadingAI={isLoadingAI}
          />

          <RatingImprovementSection
            insights={aiInsights}
            listing={listing}
            isLoadingAI={isLoadingAI}
          />
        </div>

        {/* Full-width Amenity Analysis */}
        <div className="mb-8">
          <AmenityGapAnalysisSection
            insights={aiInsights}
            listing={listing}
            isLoadingAI={isLoadingAI}
          />
        </div>

        {/* Potential Analysis Widget */}
        <div className="mb-8">
          <PotentialAnalysisWidget
            listingTitle={listing?.title || 'Ihr Listing'}
            onUpgradeClick={() => setShowUpgrade(true)}
          />
        </div>
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
