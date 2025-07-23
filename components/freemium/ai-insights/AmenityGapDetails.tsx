/**
 * @file components/freemium/ai-insights/AmenityGapDetails.tsx
 * @description Detailed amenity gap analysis insights component
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo COMPLIANCE-001-06: Extracted from AmenityGapAnalysisSection.tsx for CLAUDE.md compliance
 */

'use client'

import { FreemiumAIInsights, ListingData } from '@/lib/types/freemium-types'

interface Props {
  insights: FreemiumAIInsights
  listing: ListingData | null
}

export function AmenityGapDetails({ insights, listing }: Props) {
  const amenityGap = insights.amenityGapAnalysis

  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'high':
      case 'hoch':
        return 'text-green-600 bg-green-50'
      case 'medium':
      case 'mittel':
        return 'text-yellow-600 bg-yellow-50'
      case 'low':
      case 'niedrig':
        return 'text-gray-600 bg-gray-50'
      default:
        return 'text-blue-600 bg-blue-50'
    }
  }

  const getCostColor = (cost: string) => {
    switch (cost.toLowerCase()) {
      case 'low':
      case 'günstig':
        return 'text-green-600'
      case 'medium':
      case 'mittel':
        return 'text-yellow-600'
      case 'high':
      case 'hoch':
        return 'text-red-600'
      default:
        return 'text-blue-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Critical Gaps */}
      {amenityGap.criticalGaps.length > 0 && (
        <div>
          <h4 className="font-semibold text-slate-700 mb-3">
            🚨 Kritische Lücken
          </h4>
          <div className="space-y-3">
            {amenityGap.criticalGaps.slice(0, 3).map((gap, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-red-50 rounded-lg p-3 border-l-4 border-red-400"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-red-100 text-red-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    !
                  </div>
                  <div>
                    <div className="font-medium text-red-800">{gap}</div>
                    <div className="text-sm text-red-600">
                      Hoher Einfluss auf Buchungen
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-red-600">
                    Priorität
                  </div>
                  <div className="text-xs text-red-500">Sehr hoch</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Budget-Friendly Upgrades */}
      {amenityGap.budgetFriendlyUpgrades.length > 0 && (
        <div>
          <h4 className="font-semibold text-slate-700 mb-3">
            💰 Günstige Upgrades
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {amenityGap.budgetFriendlyUpgrades
              .slice(0, 4)
              .map((upgrade, idx) => (
                <div
                  key={idx}
                  className="bg-green-50 rounded-lg p-3 border-l-4 border-green-400"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600 text-lg">💡</span>
                      <span className="font-medium text-green-800 text-sm">
                        {upgrade}
                      </span>
                    </div>
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                      Günstig
                    </span>
                  </div>
                  <div className="text-xs text-green-600 flex items-center justify-between">
                    <span>ROI: 2-4 Wochen</span>
                    <span>+€20-80/Monat</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* High-Impact Additions */}
      {amenityGap.highImpactAdditions.length > 0 && (
        <div>
          <h4 className="font-semibold text-slate-700 mb-3">
            ⚡ High-Impact Ergänzungen
          </h4>
          <div className="space-y-3">
            {amenityGap.highImpactAdditions.slice(0, 3).map((addition, idx) => (
              <div
                key={idx}
                className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                      ⚡
                    </div>
                    <div>
                      <div className="font-medium text-blue-800">
                        {addition}
                      </div>
                      <div className="text-sm text-blue-600">
                        Signifikanter Einfluss auf Bewertungen
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-blue-600">
                      +€50-150
                    </div>
                    <div className="text-xs text-blue-500">pro Monat</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-3 text-xs">
                  <div className="text-center">
                    <div className="text-blue-600 font-medium">Impact</div>
                    <div className="text-blue-500">Hoch</div>
                  </div>
                  <div className="text-center">
                    <div className="text-blue-600 font-medium">Investition</div>
                    <div className="text-blue-500">€100-500</div>
                  </div>
                  <div className="text-center">
                    <div className="text-blue-600 font-medium">ROI</div>
                    <div className="text-blue-500">3-6 Monate</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Amenities Status */}
      <div>
        <h4 className="font-semibold text-slate-700 mb-3">
          📊 Ausstattungs-Status
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center bg-green-50 rounded-lg p-3">
            <div className="text-lg font-bold text-green-600">
              {listing?.amenities.reduce(
                (count, group) =>
                  count + group.values.filter((a) => a.available).length,
                0
              ) || 0}
            </div>
            <div className="text-sm text-green-700">Vorhanden</div>
          </div>
          <div className="text-center bg-orange-50 rounded-lg p-3">
            <div className="text-lg font-bold text-orange-600">
              {amenityGap.criticalGaps.length +
                amenityGap.budgetFriendlyUpgrades.length}
            </div>
            <div className="text-sm text-orange-700">Verbesserbar</div>
          </div>
          <div className="text-center bg-blue-50 rounded-lg p-3">
            <div className="text-lg font-bold text-blue-600">
              {amenityGap.highImpactAdditions.length}
            </div>
            <div className="text-sm text-blue-700">High-Impact</div>
          </div>
        </div>
      </div>

      {/* Investment Calculator */}
      <div>
        <h4 className="font-semibold text-slate-700 mb-3">
          💡 Investment-Kalkulator
        </h4>
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-slate-600">
                Geschätzte Investition
              </div>
              <div className="text-lg font-bold text-blue-600">€200 - €800</div>
            </div>
            <div>
              <div className="text-sm text-slate-600">
                Monatliches Plus-Potenzial
              </div>
              <div className="text-lg font-bold text-green-600">
                €150 - €400
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-white">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">
                ROI (Return on Investment)
              </span>
              <span className="text-lg font-bold text-purple-600">
                2-6 Monate
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Priority List */}
      <div>
        <h4 className="font-semibold text-slate-700 mb-3">
          ✅ Aktionsplan (Priorität)
        </h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-3 bg-red-50 rounded-lg p-3">
            <span className="bg-red-100 text-red-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
              1
            </span>
            <span className="text-sm text-red-700 flex-1">
              Kritische Lücken schließen (sofortiger Impact)
            </span>
            <span className="text-xs text-red-600">Woche 1</span>
          </div>
          <div className="flex items-center space-x-3 bg-green-50 rounded-lg p-3">
            <span className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
              2
            </span>
            <span className="text-sm text-green-700 flex-1">
              Budget-freundliche Upgrades umsetzen
            </span>
            <span className="text-xs text-green-600">Woche 2-3</span>
          </div>
          <div className="flex items-center space-x-3 bg-blue-50 rounded-lg p-3">
            <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
              3
            </span>
            <span className="text-sm text-blue-700 flex-1">
              High-Impact Investitionen planen
            </span>
            <span className="text-xs text-blue-600">Monat 2-3</span>
          </div>
        </div>
      </div>

      {/* Upgrade CTA */}
      <div className="pt-6 border-t border-slate-200">
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="font-semibold text-slate-800 mb-1">
                Ausstattungs-ROI Rechner
              </h5>
              <p className="text-sm text-slate-600">
                Detaillierte Investitionsplanung mit individueller
                ROI-Berechnung
              </p>
            </div>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap">
              Rechner nutzen
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
