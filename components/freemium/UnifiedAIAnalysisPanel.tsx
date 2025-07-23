/**
 * @file components/freemium/UnifiedAIAnalysisPanel.tsx
 * @description Unified AI Analysis Panel - Single entry point for all AI insights
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo Consolidates PersonalizedInsightsPanel + AI Insights Button for optimal UX
 */

'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { FreemiumAIInsights } from '@/lib/types/freemium-types'
import { AIInsightsGrid } from './ui/AIInsightsGrid'
import { MainUpgradeCTA } from './ui/MainUpgradeCTA'

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

interface UnifiedAIAnalysisPanelProps {
  token: string
  aiInsights: FreemiumAIInsights | null
  isLoadingAI: boolean
  onFetchAIInsights: () => void
  onUpgradeClick: () => void
}

export function UnifiedAIAnalysisPanel({
  token,
  aiInsights,
  isLoadingAI,
  onFetchAIInsights,
  onUpgradeClick,
}: UnifiedAIAnalysisPanelProps) {
  const [personalizedInsights, setPersonalizedInsights] = useState<
    PersonalizedInsight[]
  >([])
  const [isLoadingPersonalized, setIsLoadingPersonalized] = useState(false)
  const [analysisStarted, setAnalysisStarted] = useState(false)

  const fetchPersonalizedInsights = async () => {
    setIsLoadingPersonalized(true)
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
        setPersonalizedInsights(result.insights || [])
      }
    } catch (error) {
      console.error('Error fetching personalized insights:', error)
    } finally {
      setIsLoadingPersonalized(false)
    }
  }

  const startUnifiedAnalysis = async () => {
    if (analysisStarted) return

    setAnalysisStarted(true)

    // Start both analyses simultaneously
    Promise.all([fetchPersonalizedInsights(), onFetchAIInsights()])
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

  const isLoading = isLoadingAI || isLoadingPersonalized
  const hasResults = aiInsights || personalizedInsights.length > 0

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl border border-white/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2 flex items-center space-x-3">
            <span>🤖</span>
            <span>KI-gestützte Komplettanalyse</span>
          </h2>
          <p className="text-slate-600">
            Umfassende Optimierungsempfehlungen durch fortschrittliche
            KI-Analyse für den deutschen Markt
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full">
            🚀 PREMIUM-KI
          </span>
        </div>
      </div>

      {/* Analysis Trigger */}
      {!analysisStarted && (
        <div className="text-center py-12">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <span className="text-3xl">🧠</span>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              Vollständige KI-Analyse verfügbar
            </h3>
            <p className="text-slate-600 mb-4 max-w-md mx-auto">
              Starten Sie eine umfassende Analyse mit personalisierter
              DACH-Optimierung und detaillierten Verbesserungsvorschlägen
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 max-w-2xl mx-auto">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 text-center border border-blue-200/50">
                <div className="text-lg font-bold text-blue-600">🇩🇪</div>
                <div className="text-xs text-slate-600">DACH-Markt</div>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 text-center border border-purple-200/50">
                <div className="text-lg font-bold text-purple-600">🎯</div>
                <div className="text-xs text-slate-600">Listing-Optim.</div>
              </div>
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-3 text-center border border-emerald-200/50">
                <div className="text-lg font-bold text-emerald-600">🏆</div>
                <div className="text-xs text-slate-600">Host-Analyse</div>
              </div>
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-3 text-center border border-orange-200/50">
                <div className="text-lg font-bold text-orange-600">📊</div>
                <div className="text-xs text-slate-600">Vollbericht</div>
              </div>
            </div>
          </div>

          <motion.button
            onClick={startUnifiedAnalysis}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white font-bold py-4 px-10 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 text-lg"
          >
            🚀 KI-Komplettanalyse starten
          </motion.button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && analysisStarted && (
        <div className="text-center py-12">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <div
              className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"
              style={{ animationDelay: '0.3s' }}
            ></div>
            <div
              className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"
              style={{ animationDelay: '0.6s' }}
            ></div>
          </div>
          <p className="text-slate-600 text-lg font-medium">
            KI analysiert umfassend Ihre Listing-Daten...
          </p>
          <p className="text-slate-500 text-sm mt-2">
            Personalisierte DACH-Empfehlungen und detaillierte
            Optimierungsstrategien werden erstellt
          </p>
        </div>
      )}

      {/* Results Display */}
      {hasResults && !isLoading && (
        <div className="space-y-8">
          {/* Analysis Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 text-center border border-blue-200/50">
              <div className="text-2xl font-bold text-blue-600">
                {personalizedInsights.length}
              </div>
              <div className="text-xs text-slate-600">DACH-Empfehlungen</div>
            </div>
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 text-center border border-emerald-200/50">
              <div className="text-2xl font-bold text-emerald-600">
                {personalizedInsights.filter((i) => i.impact === 'high').length}
              </div>
              <div className="text-xs text-slate-600">High-Impact</div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 text-center border border-purple-200/50">
              <div className="text-2xl font-bold text-purple-600">5</div>
              <div className="text-xs text-slate-600">AI-Analysen</div>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 text-center border border-orange-200/50">
              <div className="text-2xl font-bold text-orange-600">PRO</div>
              <div className="text-xs text-slate-600">Vollzugriff</div>
            </div>
          </div>

          {/* DACH Personalized Insights */}
          {personalizedInsights.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
                  <span>🇩🇪</span>
                  <span>DACH-Markt Empfehlungen</span>
                </h3>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
                  PREMIUM VORSCHAU
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {personalizedInsights.slice(0, 2).map((insight, index) => (
                  <motion.div
                    key={insight.id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 hover:bg-white/80 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-12 h-12 bg-gradient-to-r ${getCategoryColor(insight.category)} rounded-xl flex items-center justify-center text-xl`}
                        >
                          {getCategoryIcon(insight.category)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-lg leading-tight">
                            {insight.title}
                          </h4>
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
                    </div>

                    <p className="text-slate-700 mb-4 leading-relaxed">
                      {insight.description}
                    </p>

                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 mb-4 border border-blue-200/50">
                      <div className="text-sm text-slate-700">
                        <span className="font-semibold text-blue-800">
                          Kultureller Hintergrund:
                        </span>
                        <br />
                        {insight.culturalReason}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h5 className="font-semibold text-slate-800 text-sm">
                        🔓 Umsetzungsschritte:
                      </h5>
                      {insight.actionItems.slice(0, 1).map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start space-x-2 text-sm text-slate-600"
                        >
                          <span className="text-emerald-500 font-bold">•</span>
                          <span>{item}</span>
                        </div>
                      ))}
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-2 border border-purple-200/50">
                        <button
                          onClick={onUpgradeClick}
                          className="text-xs text-purple-700 font-semibold hover:text-purple-800 transition-colors"
                        >
                          +{insight.actionItems.length - 1} weitere Schritte
                          freischalten →
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* AI Insights Summary */}
          {aiInsights && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
                  <span>📊</span>
                  <span>Detaillierte AI-Analysen</span>
                </h3>
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
                  5 BEREICHE ANALYSIERT
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg">🎯</span>
                    <span className="text-lg font-bold text-orange-600">
                      {Math.round(
                        ((aiInsights.listingOptimization.titleScore +
                          aiInsights.listingOptimization.descriptionScore +
                          aiInsights.listingOptimization.photoScore +
                          aiInsights.listingOptimization.amenityScore) *
                          10) /
                          4
                      )}
                      /1000
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-800 text-sm">
                    Listing-Optimierung
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Titel, Beschreibung, Fotos
                  </p>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg">🏆</span>
                    <span className="text-lg font-bold text-green-600">
                      {Math.round(aiInsights.hostCredibility.currentScore * 10)}
                      /1000
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-800 text-sm">
                    Host-Glaubwürdigkeit
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Vertrauen & Reputation
                  </p>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg">⭐</span>
                    <span className="text-lg font-bold text-purple-600">
                      {aiInsights.ratingImprovement.currentStrengths.length * 5}
                      /50
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-800 text-sm">
                    Bewertungs-Optimierung
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Rating & Reviews
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-4 border border-slate-200/50 text-center">
                <p className="text-sm text-slate-600 mb-3">
                  <span className="font-semibold">
                    Vollständige Analysen verfügbar:
                  </span>{' '}
                  Schritt-für-Schritt Anleitungen, Erfolgsmetriken und
                  kontinuierliche Optimierung
                </p>
                <button
                  onClick={onUpgradeClick}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 text-sm"
                >
                  Vollständige Analysen freischalten
                </button>
              </div>
            </div>
          )}

          {/* Main Upgrade CTA */}
          <MainUpgradeCTA
            personalizedInsights={personalizedInsights}
            onUpgradeClick={onUpgradeClick}
          />
        </div>
      )}
    </div>
  )
}
