/**
 * @file components/ui/PotentialAnalysisWidget.tsx
 * @description Progressive disclosure widget for German freemium conversion optimization
 * @created 2025-07-22
 * @modified 2025-07-22
 * @todo FREEMIUM-DESIGN-001: German-optimized conversion widget with AI insights
 */

'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, BarChart2, Zap, Target, CheckCircle, TrendingUp } from 'lucide-react'

// --- Type Definitions ---
interface AiInsight {
  title: string
  description: string
  recommendation?: string
  impact?: string
}

interface PotentialAnalysisWidgetProps {
  listingTitle: string
  aiInsights?: {
    listingOptimization: {
      titleScore: number
      titleSuggestions: string[]
      descriptionScore: number
      descriptionImprovements: string[]
      photoScore: number
      photoRecommendations: string[]
    }
    hostCredibility: {
      currentScore: number
      improvementTips: string[]
    }
    seasonalOptimization: {
      currentSeason: string
      seasonalTips: string[]
      pricingHints: string[]
    }
    ratingImprovement: {
      currentStrengths: string[]
      improvementAreas: string[]
    }
  }
  onUpgradeClick: () => void
}

// --- Stage Components ---
const Stage1Teaser = ({ 
  listingTitle,
  yearlyPotential 
}: { 
  listingTitle: string
  yearlyPotential: string 
}) => (
  <div className="text-center">
    <div className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-400/30 mb-4">
      <TrendingUp className="h-4 w-4 text-emerald-400 mr-2" />
      <span className="text-sm font-medium text-emerald-300">KI-Potenzial identifiziert</span>
    </div>
    
    <h3 className="text-2xl font-bold text-white mb-2">
      Ihr Listing hat ungenutztes Potenzial
    </h3>
    <p className="text-lg text-slate-300 mb-4">
      &quot;{listingTitle.length > 50 ? listingTitle.substring(0, 50) + '...' : listingTitle}&quot;
    </p>
    
    <div className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 backdrop-blur-sm rounded-xl p-4 border border-emerald-400/20">
      <p className="text-sm text-slate-300 mb-1">Geschätztes Jahrespotenzial:</p>
      <p className="text-3xl font-bold text-emerald-400">{yearlyPotential}</p>
      <p className="text-sm text-emerald-300">zusätzliche Einnahmen möglich</p>
    </div>
  </div>
)

const Stage2Problem = ({ 
  yearlyPotential,
  primaryIssue,
  impact 
}: { 
  yearlyPotential: string
  primaryIssue: string
  impact: string 
}) => (
  <div>
    <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-green-400 mb-2">
      {yearlyPotential} Umsatzsteigerung möglich
    </h3>
    <p className="text-lg text-slate-300 mb-6">
      Unsere KI-Analyse hat einen Optimierungsbereich identifiziert
    </p>
    
    <div className="bg-orange-500/10 backdrop-blur-sm rounded-xl p-4 border border-orange-400/20 mb-4">
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0 mt-1">
          <Target className="h-4 w-4 text-orange-400" />
        </div>
        <div>
          <h4 className="font-semibold text-orange-300 mb-2">Hauptverbesserungsbereich</h4>
          <p className="text-slate-300 text-sm leading-relaxed">{primaryIssue}</p>
        </div>
      </div>
    </div>
    
    <div className="bg-emerald-500/10 backdrop-blur-sm rounded-xl p-4 border border-emerald-400/20">
      <h4 className="font-semibold text-emerald-300 mb-2">Potenzielle Auswirkung</h4>
      <p className="text-slate-300 text-sm">{impact}</p>
    </div>
  </div>
)

const Stage3Solution = ({ 
  recommendations,
  expectedResults 
}: { 
  recommendations: string[]
  expectedResults: string[]
}) => (
  <div>
    <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
      <Zap className="h-7 w-7 text-yellow-400 mr-3" />
      Konkrete Handlungsempfehlungen
    </h3>
    
    <div className="space-y-4 mb-6">
      <div>
        <h4 className="font-semibold text-blue-300 mb-3">Sofort umsetzbar:</h4>
        <div className="space-y-2">
          {recommendations.slice(0, 3).map((rec, index) => (
            <div key={index} className="flex items-start space-x-3 bg-slate-800/50 rounded-lg p-3">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-400">{index + 1}</span>
              </div>
              <p className="text-slate-300 text-sm">{rec}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h4 className="font-semibold text-emerald-300 mb-3">Erwartete Ergebnisse:</h4>
        <div className="space-y-2">
          {expectedResults.map((result, index) => (
            <div key={index} className="flex items-center space-x-3">
              <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              <p className="text-slate-300 text-sm">{result}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
    
    <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 backdrop-blur-sm rounded-xl p-4 border border-amber-400/20">
      <div className="flex items-center space-x-2 mb-2">
        <span className="text-amber-400">💡</span>
        <span className="font-semibold text-amber-300">Vollständige Optimierung</span>
      </div>
      <p className="text-amber-100 text-sm">
        Dies sind nur 3 von 12+ detaillierten Empfehlungen. Der Vollbericht enthält spezifische Umsetzungsschritte, 
        Benchmarks und fortlaufende Optimierungsstrategien.
      </p>
    </div>
  </div>
)

const Stage4CTA = ({ onUpgradeClick }: { onUpgradeClick: () => void }) => (
  <div className="text-center">
    <div className="mb-6">
      <h3 className="text-2xl font-bold text-white mb-2">
        Bereit, Ihr volles Potenzial zu nutzen?
      </h3>
      <p className="text-slate-300">
        Erhalten Sie Zugang zu allen Empfehlungen und Optimierungstools
      </p>
    </div>
    
    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-xl p-6 border border-blue-400/20 mb-6">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="text-center">
          <div className="font-bold text-blue-300 text-lg">12+</div>
          <div className="text-slate-400">Empfehlungen</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-purple-300 text-lg">€19</div>
          <div className="text-slate-400">pro Monat</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-emerald-300 text-lg">30 Tage</div>
          <div className="text-slate-400">Geld-zurück</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-orange-300 text-lg">2.500+</div>
          <div className="text-slate-400">zufriedene Hosts</div>
        </div>
      </div>
    </div>
    
    <button
      onClick={onUpgradeClick}
      className="w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold py-4 px-6 rounded-xl hover:from-emerald-600 hover:to-green-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
    >
      ✨ Vollzugang freischalten - Jetzt starten
    </button>
  </div>
)

// --- Main Component ---
export const PotentialAnalysisWidget: React.FC<PotentialAnalysisWidgetProps> = ({
  listingTitle,
  aiInsights,
  onUpgradeClick,
}) => {
  const [stage, setStage] = useState(0)

  // Calculate potential yearly earnings based on AI insights
  const calculateYearlyPotential = () => {
    if (!aiInsights) return '€2.400 - €4.200'
    
    const titleScore = aiInsights.listingOptimization?.titleScore || 70
    const descScore = aiInsights.listingOptimization?.descriptionScore || 65
    const photoScore = aiInsights.listingOptimization?.photoScore || 72
    
    const avgScore = (titleScore + descScore + photoScore) / 3
    const improvementPotential = Math.max(0, 85 - avgScore) // Potential to reach 85% score
    
    const baseEarnings = 1800 + (improvementPotential * 45) // €45 per improvement point
    const maxEarnings = baseEarnings + 1200
    
    return `€${baseEarnings.toFixed(0)} - €${maxEarnings.toFixed(0)}`
  }

  const yearlyPotential = calculateYearlyPotential()

  // Extract primary issue from AI insights
  const getPrimaryIssue = () => {
    if (!aiInsights) return 'Ihr Listing-Titel könnte spezifischer sein und mehr lokale Highlights enthalten.'
    
    const { listingOptimization } = aiInsights
    if (listingOptimization.titleScore < 75) {
      return listingOptimization.titleSuggestions?.[0] || 'Ihr Listing-Titel benötigt Optimierung für bessere Sichtbarkeit.'
    }
    if (listingOptimization.descriptionScore < 70) {
      return listingOptimization.descriptionImprovements?.[0] || 'Ihre Beschreibung könnte detaillierter und überzeugender sein.'
    }
    if (listingOptimization.photoScore < 80) {
      return listingOptimization.photoRecommendations?.[0] || 'Ihre Fotos haben Potenzial für bessere Präsentation.'
    }
    return 'Allgemeine Optimierungen können Ihre Buchungsrate erheblich steigern.'
  }

  const getRecommendations = () => {
    if (!aiInsights) return [
      'Titel mit lokalen Highlights erweitern (z.B. "2 Min zum Hauptbahnhof")',
      'Beschreibung mit praktischen Details anreichern',
      'Professionelle Fotos bei Tageslicht aufnehmen'
    ]
    
    const recs = []
    if (aiInsights.listingOptimization.titleSuggestions?.[0]) {
      recs.push(aiInsights.listingOptimization.titleSuggestions[0])
    }
    if (aiInsights.listingOptimization.descriptionImprovements?.[0]) {
      recs.push(aiInsights.listingOptimization.descriptionImprovements[0])
    }
    if (aiInsights.listingOptimization.photoRecommendations?.[0]) {
      recs.push(aiInsights.listingOptimization.photoRecommendations[0])
    }
    
    return recs.length > 0 ? recs : [
      'Optimierung von Titel und Beschreibung',
      'Verbesserung der Foto-Qualität',
      'Anpassung an saisonale Faktoren'
    ]
  }

  const expectedResults = [
    '+15-25% mehr qualifizierte Buchungsanfragen',
    'Höhere Sichtbarkeit in den Airbnb-Suchergebnissen',
    'Verbesserte Gästezufriedenheit und Bewertungen'
  ]

  // Declarative stage configuration
  const stages = [
    {
      component: <Stage1Teaser listingTitle={listingTitle} yearlyPotential={yearlyPotential} />,
      cta: 'Potenzial entdecken',
      icon: <BarChart2 className="h-5 w-5" />
    },
    {
      component: (
        <Stage2Problem 
          yearlyPotential={yearlyPotential}
          primaryIssue={getPrimaryIssue()}
          impact="Eine Optimierung dieser Bereiche kann Ihre Buchungsrate um 15-25% steigern."
        />
      ),
      cta: 'Lösung anzeigen',
      icon: <Zap className="h-5 w-5" />
    },
    {
      component: (
        <Stage3Solution 
          recommendations={getRecommendations()}
          expectedResults={expectedResults}
        />
      ),
      cta: 'Vollzugang erhalten',
      icon: <Target className="h-5 w-5" />
    },
    {
      component: <Stage4CTA onUpgradeClick={onUpgradeClick} />,
      cta: null,
      icon: null
    }
  ]

  const handleNextStage = () => {
    if (stage < stages.length - 1) {
      setStage(stage + 1)
    }
  }

  const currentStageConfig = stages[stage]
  const isFinalStage = stage >= stages.length - 1

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.1 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-1 shadow-2xl ring-1 ring-white/10">
        <div className="relative overflow-hidden rounded-xl bg-slate-900/80 transition-all duration-500 ease-in-out">
          
          {/* Accessibility live region */}
          <div className="sr-only" aria-live="polite">
            {currentStageConfig?.cta ? `Nächster Schritt: ${currentStageConfig.cta}` : 'Analyse abgeschlossen.'}
          </div>

          <div className="min-h-[300px] p-6 md:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={stage}
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="h-full"
              >
                {currentStageConfig.component}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progress Indicator */}
          {!isFinalStage && (
            <div className="px-6 pb-2">
              <div className="flex space-x-2">
                {stages.slice(0, -1).map((_, index) => (
                  <div
                    key={index}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      index <= stage ? 'bg-emerald-400' : 'bg-slate-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          {!isFinalStage && currentStageConfig.cta && (
            <div className="p-6 pt-4">
              <button
                onClick={handleNextStage}
                className="group flex items-center justify-center gap-3 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 px-6 py-3 text-lg font-semibold text-slate-900 transition-all duration-300 hover:from-emerald-600 hover:to-green-600 hover:shadow-lg transform hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
              >
                {currentStageConfig.icon}
                <span>{currentStageConfig.cta}</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}