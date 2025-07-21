/**
 * @file components/analyze/ResultsDashboard.tsx
 * @description Main results dashboard with German localization
 * @created 2025-07-21
 * @todo FRONTEND-001-02: Results visualization components
 */

'use client'

import { useState, useEffect } from 'react'
import {
  MODERN_DESIGN,
  glass,
  interactiveGlass,
} from '@/lib/design/modern-tokens'
import { ANALYZE_UI } from '@/lib/theme/analyze-constants'
import { ScoreOverview } from './ScoreOverview'
import { CategoryBreakdown } from './CategoryBreakdown'
import { RecommendationsList } from './RecommendationsList'
import { ExportActions } from './ExportActions'
import type { AnalysisResult, ResultsDisplayProps } from './shared-types'

interface ResultsDashboardProps {
  userId: string
  initialResults?: AnalysisResult
}

export function ResultsDashboard({
  userId,
  initialResults,
}: ResultsDashboardProps) {
  const [results, setResults] = useState<AnalysisResult | null>(
    initialResults || null
  )
  const [isLoading, setIsLoading] = useState(!initialResults)
  const [error, setError] = useState<string | null>(null)

  // Mock data for development - replace with real API call
  useEffect(() => {
    if (!initialResults) {
      // Simulate loading
      const timer = setTimeout(() => {
        setResults(mockAnalysisResult)
        setIsLoading(false)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [initialResults])

  if (isLoading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState error={error} onRetry={() => window.location.reload()} />
  }

  if (!results) {
    return <EmptyState />
  }

  return (
    <div className="space-y-8">
      {/* Results Header with Meta Info */}
      <div className={`${glass('primary')} rounded-2xl p-6 md:p-8`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {results.title}
            </h2>
            <p className="text-gray-600">
              {ANALYZE_UI.results.header.analysisDate.replace(
                '{date}',
                new Intl.DateTimeFormat('de-DE', {
                  dateStyle: 'full',
                  timeStyle: 'short',
                }).format(new Date(results.processingInfo.completedAt))
              )}
            </p>
          </div>
          <ExportActions results={results} />
        </div>
      </div>

      {/* Main Results Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Score Overview - Takes full width on mobile, 5 cols on desktop */}
        <div className="xl:col-span-5">
          <ScoreOverview score={results.score} />
        </div>

        {/* Category Breakdown - Takes remaining space */}
        <div className="xl:col-span-7">
          <CategoryBreakdown categories={results.score.categories} />
        </div>
      </div>

      {/* Recommendations Section */}
      <RecommendationsList
        recommendations={results.recommendations}
        marketComparison={results.marketComparison}
      />

      {/* AI Insights (if available) */}
      {results.aiInsights && (
        <div className={`${glass('secondary')} rounded-2xl p-6 md:p-8`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">KI-Empfehlungen</h3>
          </div>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {results.aiInsights}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// Loading state component
function LoadingState() {
  return (
    <div className="space-y-8">
      <div
        className={`${glass('primary')} rounded-2xl p-6 md:p-8 animate-pulse`}
      >
        <div className="h-8 bg-gray-300/30 rounded-lg mb-4 w-3/4"></div>
        <div className="h-4 bg-gray-300/30 rounded w-1/2"></div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-5">
          <div
            className={`${glass('secondary')} rounded-2xl p-8 animate-pulse`}
          >
            <div className="h-48 bg-gray-300/30 rounded-lg"></div>
          </div>
        </div>
        <div className="xl:col-span-7">
          <div
            className={`${glass('secondary')} rounded-2xl p-8 animate-pulse`}
          >
            <div className="h-48 bg-gray-300/30 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Error state component
function ErrorState({
  error,
  onRetry,
}: {
  error: string
  onRetry: () => void
}) {
  return (
    <div className={`${glass('primary')} rounded-2xl p-8 text-center`}>
      <div className="mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl mb-4">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {ANALYZE_UI.errors.general.title}
        </h3>
        <p className="text-gray-600">{error}</p>
      </div>
      <button
        onClick={onRetry}
        className={`${MODERN_DESIGN.states.button.primary} px-6 py-3 rounded-xl font-medium transition-all duration-300`}
      >
        {ANALYZE_UI.errors.general.retry}
      </button>
    </div>
  )
}

// Empty state component
function EmptyState() {
  return (
    <div className={`${glass('primary')} rounded-2xl p-8 text-center`}>
      <div className="mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-500 rounded-2xl mb-4">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Keine Ergebnisse gefunden
        </h3>
        <p className="text-gray-600 mb-6">
          Starten Sie eine neue Analyse, um Ergebnisse zu sehen.
        </p>
        <a
          href="/dashboard/analyze"
          className={`${MODERN_DESIGN.states.button.primary} inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Neue Analyse starten
        </a>
      </div>
    </div>
  )
}

// Mock data for development
const mockAnalysisResult: AnalysisResult = {
  listingId: '123456',
  url: 'https://airbnb.com/rooms/123456',
  title: 'Gemütliche Wohnung in München Zentrum',
  score: {
    overall: 78,
    categories: {
      photos: 85,
      description: 72,
      pricing: 68,
      amenities: 82,
      location: 90,
      reviews: 75,
    },
  },
  recommendations: [
    {
      id: '1',
      title: 'Preis optimieren',
      description:
        'Ihr Preis liegt 15% über dem Marktdurchschnitt. Eine Preisreduzierung könnte die Buchungsrate deutlich erhöhen.',
      category: 'pricing',
      priority: 'high',
      impact: 'high',
      effort: 'low',
      actionItems: [
        'Preis um 10-15% reduzieren',
        'Dynamische Preisgestaltung implementieren',
        'Saisonale Anpassungen vornehmen',
      ],
      estimatedImprovement: 12,
    },
    {
      id: '2',
      title: 'Beschreibung erweitern',
      description:
        'Ihre Beschreibung ist zu kurz und enthält wichtige Informationen nicht.',
      category: 'description',
      priority: 'medium',
      impact: 'medium',
      effort: 'low',
      actionItems: [
        'Umgebungsinfos hinzufügen',
        'Besondere Features hervorheben',
        'Anreisehinweise ergänzen',
      ],
      estimatedImprovement: 8,
    },
  ],
  marketComparison: {
    averagePrice: 85,
    pricePosition: 'above',
    competitorCount: 127,
    occupancyRate: 68,
    averageRating: 4.3,
    ratingPosition: 'above',
  },
  aiInsights:
    'Ihr Listing zeigt starke Leistung in der Kategorie Lage und Ausstattung. Die größten Verbesserungspotenziale liegen in der Preisoptimierung und der Beschreibung. Mit den empfohlenen Änderungen könnten Sie Ihre Gesamtbewertung um bis zu 15 Punkte steigern.',
  processingInfo: {
    analysisType: 'comprehensive',
    completedAt: new Date().toISOString(),
    totalTime: 87,
    dataSourcesUsed: ['airbnb', 'gemini-ai', 'market-data'],
  },
}
