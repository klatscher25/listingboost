/**
 * @file components/freemium/ai-insights/SeasonalOptimizationSection.tsx
 * @description Seasonal optimization AI insights component
 * @created 2025-07-22
 * @modified 2025-07-22
 * @todo Extracted from main dashboard for CLAUDE.md compliance
 */

'use client'

import { FreemiumAIInsights } from '@/lib/types/freemium-types'
import {
  getCurrentSeason,
  getDaysInCurrentSeason,
} from '@/lib/utils/freemium-utils'

interface Props {
  insights: FreemiumAIInsights | null
  isLoadingAI: boolean
}

export default function SeasonalOptimizationSection({
  insights,
  isLoadingAI,
}: Props) {
  const currentSeason = getCurrentSeason()
  const daysRemaining = getDaysInCurrentSeason()

  if (isLoadingAI) {
    return (
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-800">
            🌍 Saisonale Optimierung
          </h3>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        </div>
        <p className="text-slate-600">KI analysiert saisonale Trends...</p>
      </div>
    )
  }

  if (!insights) {
    return (
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20">
        <h3 className="text-xl font-bold text-slate-800 mb-4">
          🌍 Saisonale Optimierung
        </h3>
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-semibold text-slate-800">
                Aktuelle Saison: {currentSeason}
              </div>
              <div className="text-sm text-slate-600">
                Noch {daysRemaining} Tage bis zur nächsten Saison
              </div>
            </div>
            <div className="text-3xl">
              {currentSeason === 'Frühling' && '🌸'}
              {currentSeason === 'Sommer' && '☀️'}
              {currentSeason === 'Herbst' && '🍂'}
              {currentSeason === 'Winter' && '❄️'}
            </div>
          </div>
          <p className="text-sm text-slate-600">
            Nutzen Sie KI-Analyse für saisonale Preisoptimierung und
            Marketingstrategien.
          </p>
        </div>
      </div>
    )
  }

  const seasonal = insights.seasonalOptimization

  // Get season emoji
  const getSeasonEmoji = (season: string) => {
    switch (season.toLowerCase()) {
      case 'frühling':
        return '🌸'
      case 'sommer':
        return '☀️'
      case 'herbst':
        return '🍂'
      case 'winter':
        return '❄️'
      default:
        return '🌍'
    }
  }

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-800">
          🌍 Saisonale Optimierung
        </h3>
        <div className="flex items-center space-x-2">
          <span className="text-2xl">
            {getSeasonEmoji(seasonal.currentSeason)}
          </span>
          <div className="text-right">
            <div className="text-sm font-semibold text-slate-700">
              {seasonal.currentSeason}
            </div>
            <div className="text-xs text-slate-500">
              {daysRemaining} Tage verbleibend
            </div>
          </div>
        </div>
      </div>

      {/* Current Season Status */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-slate-800">📅 Saison-Status</h4>
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {seasonal.currentSeason}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-slate-600">Verbleibende Zeit</div>
              <div className="text-lg font-bold text-blue-600">
                {daysRemaining} Tage
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-600">
                Optimierungs-Potenzial
              </div>
              <div className="text-lg font-bold text-green-600">Hoch</div>
            </div>
          </div>
        </div>
      </div>

      {/* Seasonal Tips */}
      {seasonal.seasonalTips.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-slate-700 mb-3">
            💡 Saisonale Tipps
          </h4>
          <div className="space-y-3">
            {seasonal.seasonalTips.slice(0, 3).map((tip, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3"
              >
                <div className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {idx + 1}
                </div>
                <div className="text-sm text-slate-700 flex-1">{tip}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pricing Hints */}
      {seasonal.pricingHints.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-slate-700 mb-3">
            💰 Preis-Optimierung
          </h4>
          <div className="space-y-2">
            {seasonal.pricingHints.slice(0, 3).map((hint, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-3 bg-yellow-50 rounded-lg p-3"
              >
                <span className="text-yellow-600 text-lg">💡</span>
                <div className="text-sm text-slate-700 flex-1">{hint}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Season Timeline */}
      <div className="mb-6">
        <h4 className="font-semibold text-slate-700 mb-3">
          🗓️ Saison-Timeline
        </h4>
        <div className="grid grid-cols-4 gap-2">
          {['Frühling', 'Sommer', 'Herbst', 'Winter'].map((season) => (
            <div
              key={season}
              className={`text-center p-2 rounded-lg transition-all ${
                season === seasonal.currentSeason
                  ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              <div className="text-lg mb-1">{getSeasonEmoji(season)}</div>
              <div className="text-xs font-medium">{season}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress through season */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">
            Saison-Fortschritt
          </span>
          <span className="text-sm text-slate-600">
            {Math.round(((90 - daysRemaining) / 90) * 100)}% abgeschlossen
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${Math.round(((90 - daysRemaining) / 90) * 100)}%`,
            }}
          ></div>
        </div>
      </div>

      {/* Action Items */}
      <div className="mb-6">
        <h4 className="font-semibold text-slate-700 mb-3">
          ✅ Sofortige Maßnahmen
        </h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-3 bg-orange-50 rounded-lg p-3">
            <span className="text-orange-600">⚡</span>
            <span className="text-sm text-slate-700">
              Preise für verbleibende {daysRemaining} Tage optimieren
            </span>
          </div>
          <div className="flex items-center space-x-3 bg-green-50 rounded-lg p-3">
            <span className="text-green-600">📸</span>
            <span className="text-sm text-slate-700">
              Saisonale Fotos in der Beschreibung hervorheben
            </span>
          </div>
          <div className="flex items-center space-x-3 bg-blue-50 rounded-lg p-3">
            <span className="text-blue-600">📝</span>
            <span className="text-sm text-slate-700">
              Titel mit saisonalen Keywords aktualisieren
            </span>
          </div>
        </div>
      </div>

      {/* Upgrade CTA */}
      <div className="pt-6 border-t border-slate-200">
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="font-semibold text-slate-800 mb-1">
                Saisonale Preis-Strategie
              </h5>
              <p className="text-sm text-slate-600">
                Automatisierte saisonale Preisanpassungen und Markt-Trends
              </p>
            </div>
            <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors whitespace-nowrap">
              Pro holen
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
