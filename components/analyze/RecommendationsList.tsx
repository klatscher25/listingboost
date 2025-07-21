/**
 * @file components/analyze/RecommendationsList.tsx
 * @description Actionable recommendations with German text
 * @created 2025-07-21
 * @todo FRONTEND-001-02: Recommendations display in German
 */

'use client'

import { useState } from 'react'
import {
  MODERN_DESIGN,
  glass,
  interactiveGlass,
} from '@/lib/design/modern-tokens'
import { ANALYZE_UI } from '@/lib/theme/analyze-constants'
import type { Recommendation, MarketComparison } from './shared-types'

interface RecommendationsListProps {
  recommendations: Recommendation[]
  marketComparison: MarketComparison
}

export function RecommendationsList({
  recommendations,
  marketComparison,
}: RecommendationsListProps) {
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'high' | 'medium' | 'low'
  >('all')
  const [expandedRec, setExpandedRec] = useState<string | null>(null)

  const filteredRecommendations = recommendations.filter(
    (rec) => activeFilter === 'all' || rec.priority === activeFilter
  )

  const sortedRecommendations = [...filteredRecommendations].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    return priorityOrder[b.priority] - priorityOrder[a.priority]
  })

  return (
    <div className="space-y-8">
      {/* Market Comparison Card */}
      <div className={`${glass('primary')} rounded-2xl p-6 md:p-8`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900">Marktvergleich</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`${glass('input')} rounded-lg p-4 text-center`}>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {marketComparison.averagePrice}€
            </div>
            <div className="text-sm text-gray-600 mb-2">Durchschnittspreis</div>
            <span
              className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                marketComparison.pricePosition === 'above'
                  ? 'bg-red-100 text-red-700'
                  : marketComparison.pricePosition === 'below'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-blue-100 text-blue-700'
              }`}
            >
              {marketComparison.pricePosition === 'above' &&
                '↗ Über Durchschnitt'}
              {marketComparison.pricePosition === 'below' &&
                '↙ Unter Durchschnitt'}
              {marketComparison.pricePosition === 'average' &&
                '→ Im Durchschnitt'}
            </span>
          </div>

          <div className={`${glass('input')} rounded-lg p-4 text-center`}>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {marketComparison.competitorCount}
            </div>
            <div className="text-sm text-gray-600">Ähnliche Unterkünfte</div>
          </div>

          <div className={`${glass('input')} rounded-lg p-4 text-center`}>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {marketComparison.occupancyRate}%
            </div>
            <div className="text-sm text-gray-600">Durchschn. Auslastung</div>
          </div>

          <div className={`${glass('input')} rounded-lg p-4 text-center`}>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {marketComparison.averageRating}
            </div>
            <div className="text-sm text-gray-600 mb-2">
              Durchschn. Bewertung
            </div>
            <span
              className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                marketComparison.ratingPosition === 'above'
                  ? 'bg-green-100 text-green-700'
                  : marketComparison.ratingPosition === 'below'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-blue-100 text-blue-700'
              }`}
            >
              {marketComparison.ratingPosition === 'above' &&
                '↗ Überdurchschnittlich'}
              {marketComparison.ratingPosition === 'below' &&
                '↙ Unterdurchschnittlich'}
              {marketComparison.ratingPosition === 'average' &&
                '→ Durchschnittlich'}
            </span>
          </div>
        </div>
      </div>

      {/* Recommendations Section */}
      <div className={`${glass('secondary')} rounded-2xl p-6 md:p-8`}>
        {/* Header with Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {ANALYZE_UI.results.recommendations.title}
              </h3>
              <p className="text-sm text-gray-600">
                {ANALYZE_UI.results.recommendations.subtitle}
              </p>
            </div>
          </div>

          {/* Priority Filter */}
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'Alle', count: recommendations.length },
              {
                key: 'high',
                label: 'Hoch',
                count: recommendations.filter((r) => r.priority === 'high')
                  .length,
              },
              {
                key: 'medium',
                label: 'Mittel',
                count: recommendations.filter((r) => r.priority === 'medium')
                  .length,
              },
              {
                key: 'low',
                label: 'Niedrig',
                count: recommendations.filter((r) => r.priority === 'low')
                  .length,
              },
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key as any)}
                className={`
                  px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${
                    activeFilter === filter.key
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-white/20 text-gray-700 hover:bg-white/30'
                  }
                `}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        </div>

        {/* Recommendations List */}
        <div className="space-y-4">
          {sortedRecommendations.map((recommendation) => (
            <div
              key={recommendation.id}
              className={`
                ${interactiveGlass('input')} rounded-xl p-6
                ${expandedRec === recommendation.id ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
                transition-all duration-300
              `}
            >
              {/* Recommendation Header */}
              <div
                className="flex items-start justify-between cursor-pointer"
                onClick={() =>
                  setExpandedRec(
                    expandedRec === recommendation.id ? null : recommendation.id
                  )
                }
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityStyle(recommendation.priority)}`}
                    >
                      {
                        ANALYZE_UI.results.recommendations.priority[
                          recommendation.priority
                        ]
                      }
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactStyle(recommendation.impact)}`}
                    >
                      {
                        ANALYZE_UI.results.recommendations.impact[
                          recommendation.impact
                        ]
                      }{' '}
                      Impact
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getEffortStyle(recommendation.effort)}`}
                    >
                      {
                        ANALYZE_UI.results.recommendations.effort[
                          recommendation.effort
                        ]
                      }{' '}
                      Aufwand
                    </span>
                    <span className="text-xs text-gray-600">
                      +{recommendation.estimatedImprovement} Punkte
                    </span>
                  </div>

                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {recommendation.title}
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    {recommendation.description}
                  </p>
                </div>

                <svg
                  className={`w-5 h-5 text-gray-400 ml-4 transition-transform duration-200 flex-shrink-0 ${
                    expandedRec === recommendation.id ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>

              {/* Expanded Action Items */}
              {expandedRec === recommendation.id && (
                <div className="mt-6 pt-4 border-t border-white/20">
                  <h5 className="text-sm font-semibold text-gray-900 mb-3">
                    Konkrete Handlungsschritte:
                  </h5>
                  <ul className="space-y-2">
                    {recommendation.actionItems.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="flex items-center justify-center w-6 h-6 bg-blue-500 text-white text-xs font-bold rounded-full flex-shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <span className="text-sm text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* No Recommendations Message */}
        {sortedRecommendations.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🎉</div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Keine Empfehlungen in dieser Kategorie
            </h4>
            <p className="text-gray-600">
              Wählen Sie eine andere Prioritätsstufe oder zeigen Sie alle
              Empfehlungen an.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper functions
function getPriorityStyle(priority: 'high' | 'medium' | 'low'): string {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800'
    case 'low':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function getImpactStyle(impact: 'high' | 'medium' | 'low'): string {
  switch (impact) {
    case 'high':
      return 'bg-emerald-100 text-emerald-800'
    case 'medium':
      return 'bg-blue-100 text-blue-800'
    case 'low':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function getEffortStyle(effort: 'low' | 'medium' | 'high'): string {
  switch (effort) {
    case 'low':
      return 'bg-green-100 text-green-800'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800'
    case 'high':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
