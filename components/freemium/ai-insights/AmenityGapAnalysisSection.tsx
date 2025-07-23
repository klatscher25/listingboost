/**
 * @file components/freemium/ai-insights/AmenityGapAnalysisSection.tsx
 * @description Amenity gap analysis AI insights component - refactored for CLAUDE.md compliance
 * @created 2025-07-22
 * @modified 2025-07-23
 * @todo COMPLIANCE-001-06: Refactored using modular architecture
 */

'use client'

import { FreemiumAIInsights, ListingData } from '@/lib/types/freemium-types'
import { AmenityGapDetails } from './AmenityGapDetails'

interface Props {
  insights: FreemiumAIInsights | null
  listing: ListingData | null
  isLoadingAI: boolean
}

interface AmenityItem {
  name: string
  icon: string
  impact: 'high' | 'medium' | 'low'
  cost: 'low' | 'medium' | 'high'
  estimatedRevenue: string
}

export default function AmenityGapAnalysisSection({
  insights,
  listing,
  isLoadingAI,
}: Props) {
  if (isLoadingAI) {
    return (
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-800">
            🏠 Ausstattungs-Analyse
          </h3>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        </div>
        <p className="text-slate-600">KI analysiert fehlende Ausstattung...</p>
      </div>
    )
  }

  // Sample amenity data for demonstration when no insights
  const sampleAmenities: AmenityItem[] = [
    {
      name: 'WLAN',
      icon: '📶',
      impact: 'high',
      cost: 'low',
      estimatedRevenue: '+€50/Monat',
    },
    {
      name: 'Klimaanlage',
      icon: '❄️',
      impact: 'high',
      cost: 'high',
      estimatedRevenue: '+€120/Monat',
    },
    {
      name: 'Waschmaschine',
      icon: '🧺',
      impact: 'medium',
      cost: 'medium',
      estimatedRevenue: '+€80/Monat',
    },
    {
      name: 'Kaffeemaschine',
      icon: '☕',
      impact: 'medium',
      cost: 'low',
      estimatedRevenue: '+€30/Monat',
    },
  ]

  if (!insights) {
    return (
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20">
        <h3 className="text-xl font-bold text-slate-800 mb-6">
          🏠 Ausstattungs-Analyse
        </h3>

        {/* Current Amenities Preview */}
        <div className="mb-6">
          <h4 className="font-semibold text-slate-700 mb-3">
            ✅ Vorhandene Ausstattung
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {listing?.amenities
              .slice(0, 6)
              .map((amenityGroup, groupIdx) =>
                amenityGroup.values.slice(0, 2).map(
                  (amenity, idx) =>
                    amenity.available && (
                      <div
                        key={`${groupIdx}-${idx}`}
                        className="flex items-center space-x-2 bg-green-50 rounded-lg p-2"
                      >
                        <span className="text-green-600">✓</span>
                        <span className="text-sm text-green-700 truncate">
                          {amenity.title}
                        </span>
                      </div>
                    )
                )
              )
              .flat()
              .slice(0, 6)}
          </div>
        </div>

        {/* Sample Gap Analysis */}
        <div className="mb-6">
          <h4 className="font-semibold text-slate-700 mb-3">
            💡 Verbesserungsmöglichkeiten
          </h4>
          <div className="space-y-3">
            {sampleAmenities.slice(0, 3).map((amenity, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-blue-50 rounded-lg p-3"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{amenity.icon}</span>
                  <div>
                    <div className="font-medium text-slate-800">
                      {amenity.name}
                    </div>
                    <div className="text-sm text-slate-600">
                      {amenity.impact === 'high'
                        ? 'Hoher Impact'
                        : amenity.impact === 'medium'
                          ? 'Mittlerer Impact'
                          : 'Niedriger Impact'}{' '}
                      •
                      {amenity.cost === 'low'
                        ? ' Günstig'
                        : amenity.cost === 'medium'
                          ? ' Mittlere Kosten'
                          : ' Höhere Investition'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-green-600">
                    {amenity.estimatedRevenue}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-slate-600">
            Starten Sie eine KI-Analyse für personalisierte
            Ausstattungsempfehlungen mit ROI-Berechnung.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-800">
          🏠 Ausstattungs-Analyse
        </h3>
        <div className="text-right">
          <div className="text-sm text-slate-600">Potenzial</div>
          <div className="text-lg font-bold text-green-600">
            +€200-500/Monat
          </div>
        </div>
      </div>

      {/* Detailed insights sections */}
      <AmenityGapDetails insights={insights} listing={listing} />
    </div>
  )
}
