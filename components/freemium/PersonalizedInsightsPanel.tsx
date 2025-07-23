/**
 * @file components/freemium/PersonalizedInsightsPanel.tsx
 * @description Hyper-personalized insights panel using Gemini 2.5 Flash for DACH market
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo Display German market-specific personalized recommendations
 */

'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface PersonalizedInsight {
  id: string
  category: 'location' | 'cultural' | 'competitive' | 'pricing' | 'content'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  germanSpecific: boolean
  actionItems: string[]
  culturalReason: string
  confidence: number
}

interface PersonalizedInsightsPanelProps {
  token: string
  onUpgradeClick: () => void
}

export function PersonalizedInsightsPanel({
  token,
  onUpgradeClick,
}: PersonalizedInsightsPanelProps) {
  const [insights, setInsights] = useState<PersonalizedInsight[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const fetchPersonalizedInsights = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/freemium/personalized-insights/${token}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.ok) {
        const result = await response.json()
        setInsights(result.insights || [])
      }
    } catch (error) {
      console.error('Error fetching personalized insights:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'location':
        return '📍'
      case 'cultural':
        return '🇩🇪'
      case 'competitive':
        return '🎯'
      case 'pricing':
        return '💰'
      case 'content':
        return '📝'
      default:
        return '💡'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'location':
        return 'from-blue-500 to-indigo-500'
      case 'cultural':
        return 'from-green-500 to-emerald-500'
      case 'competitive':
        return 'from-purple-500 to-pink-500'
      case 'pricing':
        return 'from-orange-500 to-red-500'
      case 'content':
        return 'from-teal-500 to-cyan-500'
      default:
        return 'from-gray-500 to-slate-500'
    }
  }

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high':
        return (
          <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-full">
            HOCH
          </span>
        )
      case 'medium':
        return (
          <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full">
            MITTEL
          </span>
        )
      case 'low':
        return (
          <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">
            NIEDRIG
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl border border-white/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2 flex items-center space-x-3">
            <span>🧠</span>
            <span>KI-Personalisierte DACH-Optimierung</span>
          </h2>
          <p className="text-slate-600">
            Maßgeschneiderte Empfehlungen für den deutschen Markt basierend auf
            Ihrer Listing-Analyse
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
            🇩🇪 DACH-OPTIMIERT
          </span>
        </div>
      </div>

      {/* Load Insights Button */}
      {insights.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              Personalisierte Markt-Intelligenz
            </h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              Unsere KI analysiert Ihr Listing und erstellt spezifische
              Empfehlungen für den deutschen Markt
            </p>
          </div>

          <motion.button
            onClick={fetchPersonalizedInsights}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
          >
            🇩🇪 DACH-Analyse starten
          </motion.button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-slate-600">
            KI analysiert Ihre Daten für den deutschen Markt...
          </p>
        </div>
      )}

      {/* Insights Display */}
      {insights.length > 0 && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 text-center border border-blue-200/50">
              <div className="text-2xl font-bold text-blue-600">
                {insights.length}
              </div>
              <div className="text-xs text-slate-600">
                Personalisierte Empfehlungen
              </div>
            </div>
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 text-center border border-emerald-200/50">
              <div className="text-2xl font-bold text-emerald-600">
                {insights.filter((i) => i.impact === 'high').length}
              </div>
              <div className="text-xs text-slate-600">
                High-Impact Optimierungen
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 text-center border border-purple-200/50">
              <div className="text-2xl font-bold text-purple-600">
                {insights.filter((i) => i.germanSpecific).length}
              </div>
              <div className="text-xs text-slate-600">DACH-spezifisch</div>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 text-center border border-orange-200/50">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(
                  (insights.reduce((acc, i) => acc + i.confidence, 0) /
                    insights.length) *
                    100
                )}
                %
              </div>
              <div className="text-xs text-slate-600">Konfidenz-Level</div>
            </div>
          </div>

          {/* Insights Grid - Show only 2 insights for freemium */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {insights.slice(0, 2).map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 hover:bg-white/80 transition-all duration-300"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-r ${getCategoryColor(insight.category)} rounded-xl flex items-center justify-center text-xl`}
                    >
                      {getCategoryIcon(insight.category)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg leading-tight">
                        {insight.title}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        {getImpactBadge(insight.impact)}
                        {insight.germanSpecific && (
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                            🇩🇪 DACH
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">
                    {Math.round(insight.confidence * 100)}% sicher
                  </div>
                </div>

                {/* Description */}
                <p className="text-slate-700 mb-4 leading-relaxed">
                  {insight.description}
                </p>

                {/* Cultural Reason */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 mb-4 border border-blue-200/50">
                  <div className="text-sm text-slate-700">
                    <span className="font-semibold text-blue-800">
                      Kultureller Hintergrund:
                    </span>
                    <br />
                    {insight.culturalReason}
                  </div>
                </div>

                {/* Action Items (Teaser) */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-800 text-sm">
                    🔓 Umsetzungsschritte (Pro-Version):
                  </h4>
                  {insight.actionItems.slice(0, 2).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start space-x-2 text-sm text-slate-600"
                    >
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                  {insight.actionItems.length > 2 && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-2 border border-purple-200/50">
                      <button
                        onClick={onUpgradeClick}
                        className="text-xs text-purple-700 font-semibold hover:text-purple-800 transition-colors"
                      >
                        +{insight.actionItems.length - 2} weitere Schritte
                        freischalten →
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Hidden Recommendations Teaser */}
          {insights.length > 2 && (
            <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-6 border border-slate-200/50 text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-lg font-bold text-slate-800">
                  +{insights.length - 2} weitere Premium-Empfehlungen verfügbar
                </span>
              </div>

              {/* Preview of locked insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {insights.slice(2, 4).map((insight, index) => (
                  <div
                    key={insight.id}
                    className="bg-white/60 rounded-xl p-4 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/50 to-transparent backdrop-blur-[1px] flex items-center justify-center z-10">
                      <div className="text-center">
                        <div className="text-2xl mb-1">🔒</div>
                        <div className="text-xs font-bold text-slate-700">
                          Premium
                        </div>
                      </div>
                    </div>
                    <div className="blur-sm">
                      <div className="flex items-center space-x-2 mb-2">
                        <div
                          className={`w-8 h-8 bg-gradient-to-r ${getCategoryColor(insight.category)} rounded-lg flex items-center justify-center text-sm`}
                        >
                          {getCategoryIcon(insight.category)}
                        </div>
                        <div className="text-sm font-bold text-slate-800">
                          {insight.title}
                        </div>
                      </div>
                      <div className="text-xs text-slate-600">
                        {insight.description.substring(0, 60)}...
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={onUpgradeClick}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-3 px-6 rounded-full hover:shadow-lg transition-all duration-200"
              >
                🔓 Alle {insights.length} Empfehlungen freischalten - €49
              </button>
            </div>
          )}

          {/* Upgrade CTA */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200/50 text-center">
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              🚀 Vollständige DACH-Optimierung freischalten
            </h3>
            <p className="text-slate-600 mb-4">
              Erhalten Sie alle Umsetzungsschritte, Erfolgsmetriken und
              kontinuierliche Marktanalysen
            </p>
            <motion.button
              onClick={onUpgradeClick}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Pro-Version aktivieren - €49 einmalig
            </motion.button>
          </div>
        </div>
      )}
    </div>
  )
}
