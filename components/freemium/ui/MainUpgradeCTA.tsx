/**
 * @file components/freemium/ui/MainUpgradeCTA.tsx
 * @description Main upgrade CTA component for UnifiedAIAnalysisPanel
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo COMPLIANCE-001-01: Extracted from UnifiedAIAnalysisPanel for CLAUDE.md compliance
 */

'use client'

import React from 'react'
import { motion } from 'framer-motion'

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

interface MainUpgradeCTAProps {
  personalizedInsights: PersonalizedInsight[]
  onUpgradeClick: () => void
}

export function MainUpgradeCTA({
  personalizedInsights,
  onUpgradeClick,
}: MainUpgradeCTAProps) {
  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-8 border border-purple-200/50 text-center">
      <div className="flex items-center justify-center space-x-2 mb-4">
        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
        <h3 className="text-2xl font-bold text-slate-800">
          🚀 Vollständige KI-Optimierung freischalten
        </h3>
      </div>
      <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
        Erhalten Sie alle {personalizedInsights.length} DACH-Empfehlungen,
        vollständige Umsetzungsanleitungen, Erfolgsmetriken und kontinuierliche
        Marktanalysen für maximale Buchungsoptimierung.
      </p>

      <div className="grid grid-cols-3 gap-6 mb-8 max-w-md mx-auto">
        <div className="text-center">
          <div className="text-3xl font-bold text-emerald-600">
            {personalizedInsights.length}+
          </div>
          <div className="text-sm text-slate-600">DACH-Empfehlungen</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-emerald-600">€2.5K</div>
          <div className="text-sm text-slate-600">Ø Mehr-Umsatz</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-emerald-600">30T</div>
          <div className="text-sm text-slate-600">Geld-zurück</div>
        </div>
      </div>

      <motion.button
        onClick={onUpgradeClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white font-bold py-4 px-10 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 text-lg"
      >
        🔓 Pro-Version aktivieren - €49 einmalig
      </motion.button>
    </div>
  )
}
