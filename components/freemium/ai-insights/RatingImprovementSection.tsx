/**
 * @file components/freemium/ai-insights/RatingImprovementSection.tsx
 * @description Rating improvement AI insights component
 * @created 2025-07-22
 * @modified 2025-07-22
 * @todo Extracted from main dashboard for CLAUDE.md compliance
 */

'use client'

import { FreemiumAIInsights, ListingData } from '@/lib/types/freemium-types'
import { formatRating } from '@/lib/utils/freemium-utils'

interface Props {
  insights: FreemiumAIInsights | null
  listing: ListingData | null
  isLoadingAI: boolean
}

export default function RatingImprovementSection({
  insights,
  listing,
  isLoadingAI,
}: Props) {
  if (isLoadingAI) {
    return (
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-800">
            ⭐ Bewertung verbessern
          </h3>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        </div>
        <p className="text-slate-600">
          KI analysiert Bewertungsverbesserungen...
        </p>
      </div>
    )
  }

  const currentRating = listing?.rating.guestSatisfaction || 0
  const ratingCategories = listing
    ? [
        { label: 'Sauberkeit', value: listing.rating.cleanliness, icon: '🧽' },
        { label: 'Genauigkeit', value: listing.rating.accuracy, icon: '✅' },
        { label: 'Lage', value: listing.rating.location, icon: '📍' },
        { label: 'Preis-Leistung', value: listing.rating.value, icon: '💰' },
      ]
    : []

  if (!insights) {
    return (
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-800">
            ⭐ Bewertung verbessern
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-yellow-600">
              {formatRating(currentRating)}
            </span>
            <div className="text-sm text-slate-500">
              ({listing?.rating.reviewsCount || 0} Bewertungen)
            </div>
          </div>
        </div>

        {/* Current Rating Breakdown */}
        {listing && (
          <div className="mb-6">
            <h4 className="font-semibold text-slate-700 mb-3">
              📊 Aktuelle Bewertungen
            </h4>
            <div className="space-y-3">
              {ratingCategories.map((category) => (
                <div
                  key={category.label}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <span>{category.icon}</span>
                    <span className="text-sm text-slate-700">
                      {category.label}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(category.value / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-slate-700 w-8">
                      {formatRating(category.value)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-yellow-50 rounded-lg p-4">
          <p className="text-sm text-slate-600">
            Starten Sie eine KI-Analyse für personalisierte
            Bewertungsverbesserungen.
          </p>
        </div>
      </div>
    )
  }

  const ratingImprovement = insights.ratingImprovement

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-800">
          ⭐ Bewertung verbessern
        </h3>
        <div className="text-right">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-yellow-600">
              {formatRating(currentRating)}
            </span>
            <div className="text-sm text-slate-500">aktuell</div>
          </div>
          <div className="text-xs text-slate-400">
            ({listing?.rating.reviewsCount || 0} Bewertungen)
          </div>
        </div>
      </div>

      {/* Current Strengths */}
      {ratingImprovement.currentStrengths.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-slate-700 mb-3">💪 Ihre Stärken</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ratingImprovement.currentStrengths
              .slice(0, 4)
              .map((strength, idx) => (
                <div
                  key={idx}
                  className="flex items-center space-x-3 bg-green-50 rounded-lg p-3"
                >
                  <span className="text-green-600 text-lg">✨</span>
                  <span className="text-sm text-green-700 flex-1">
                    {strength}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Improvement Areas */}
      {ratingImprovement.improvementAreas.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-slate-700 mb-3">
            🎯 Verbesserungsbereiche
          </h4>
          <div className="space-y-3">
            {ratingImprovement.improvementAreas.slice(0, 3).map((area, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-3 bg-orange-50 rounded-lg p-3"
              >
                <div className="bg-orange-100 text-orange-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  !
                </div>
                <div className="flex-1">
                  <div className="text-sm text-orange-800 font-medium mb-1">
                    Verbesserungsbereich {idx + 1}
                  </div>
                  <div className="text-sm text-orange-700">{area}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Guest Experience Tips */}
      {ratingImprovement.guestExperienceTips.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-slate-700 mb-3">
            🌟 Gästeerfahrung-Tipps
          </h4>
          <div className="space-y-3">
            {ratingImprovement.guestExperienceTips
              .slice(0, 3)
              .map((tip, idx) => (
                <div
                  key={idx}
                  className="flex items-start space-x-3 bg-blue-50 rounded-lg p-3"
                >
                  <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="text-sm text-blue-700 flex-1">{tip}</div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Rating Categories Breakdown */}
      {listing && (
        <div className="mb-6">
          <h4 className="font-semibold text-slate-700 mb-3">
            📊 Kategorie-Aufschlüsselung
          </h4>
          <div className="space-y-3">
            {ratingCategories.map((category) => {
              const isLow = category.value < 4.0
              const isMedium = category.value >= 4.0 && category.value < 4.5
              const isHigh = category.value >= 4.5

              return (
                <div
                  key={category.label}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <span>{category.icon}</span>
                    <span className="text-sm text-slate-700">
                      {category.label}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-slate-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          isHigh
                            ? 'bg-gradient-to-r from-green-400 to-green-500'
                            : isMedium
                              ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                              : 'bg-gradient-to-r from-red-400 to-red-500'
                        }`}
                        style={{ width: `${(category.value / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span
                      className={`text-sm font-semibold w-8 ${
                        isHigh
                          ? 'text-green-600'
                          : isMedium
                            ? 'text-yellow-600'
                            : 'text-red-600'
                      }`}
                    >
                      {formatRating(category.value)}
                    </span>
                    {isLow && (
                      <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
                        Fokus
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Potential Rating Impact */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-slate-800">📈 Potenzial</h4>
            <div className="flex items-center space-x-2">
              <span className="text-lg text-slate-600">
                {formatRating(currentRating)}
              </span>
              <span className="text-slate-400">→</span>
              <span className="text-lg font-bold text-green-600">
                {formatRating(Math.min(5.0, currentRating + 0.5))}
              </span>
            </div>
          </div>
          <div className="text-sm text-slate-600">
            Mit gezielten Verbesserungen können Sie Ihre Bewertung um bis zu 0,5
            Punkte steigern
          </div>
        </div>
      </div>

      {/* Upgrade CTA */}
      <div className="pt-6 border-t border-slate-200">
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="font-semibold text-slate-800 mb-1">
                Bewertungs-Optimierung Pro
              </h5>
              <p className="text-sm text-slate-600">
                Detaillierte Strategien und Checklisten für 5-Sterne-Bewertungen
              </p>
            </div>
            <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors whitespace-nowrap">
              Strategien holen
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
