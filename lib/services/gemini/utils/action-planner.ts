/**
 * @file lib/services/gemini/utils/action-planner.ts
 * @description Action planning utilities for Gemini AI service
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo COMPLIANCE-001-02: Extracted from index.ts for CLAUDE.md compliance
 */

import { GeminiAnalysisResult } from '../types'

/**
 * Create prioritized action plan based on AI analysis
 */
export function createPrioritizedActionPlan(analysis: GeminiAnalysisResult) {
  const actions: Array<any> = []

  // Add actions from optimization recommendations
  analysis.optimizationRecommendations.forEach((rec) => {
    rec.recommendations.forEach((action) => {
      actions.push({
        priority: rec.priority,
        category: rec.category,
        action: action.action,
        estimatedImpact:
          action.impact === 'high' ? 40 : action.impact === 'medium' ? 25 : 10,
        effort: action.effort,
        timeline: action.timeline,
      })
    })
  })

  // Add pricing actions if significant opportunity
  if (analysis.pricingRecommendation.confidenceLevel > 70) {
    const currentPrice = 0 // Will be filled with actual current price
    const suggestedPrice = analysis.pricingRecommendation.suggestedPrice
    const priceGap = Math.abs(suggestedPrice - currentPrice) / currentPrice

    if (priceGap > 0.1) {
      // 10% difference
      actions.push({
        priority: 'high' as const,
        category: 'pricing',
        action: `Preis auf ${suggestedPrice}€ anpassen`,
        estimatedImpact: Math.round(priceGap * 100),
        effort: 'low' as const,
        timeline: 'Sofort umsetzbar',
      })
    }
  }

  // Add sentiment-based actions
  if (
    analysis.sentimentAnalysis.aggregatedSentiment.overallSentiment ===
    'negative'
  ) {
    const themes = analysis.sentimentAnalysis.aggregatedSentiment.keyThemes
    if (themes.length > 0) {
      actions.push({
        priority: 'high' as const,
        category: 'reviews',
        action: `Negative Themen adressieren: ${themes.slice(0, 2).join(', ')}`,
        estimatedImpact: 25,
        effort: 'medium' as const,
        timeline: '1-2 Wochen',
      })
    }
  }

  // Add description improvement actions
  if (analysis.descriptionAnalysis.qualityScore < 70) {
    const improvements = analysis.descriptionAnalysis.improvementSuggestions
    if (improvements.length > 0) {
      actions.push({
        priority: 'medium' as const,
        category: 'description',
        action: improvements[0], // Take the first suggestion
        estimatedImpact: 20,
        effort: 'low' as const,
        timeline: 'Diese Woche',
      })
    }
  }

  // Sort by priority and estimated impact
  return actions
    .sort((a, b) => {
      const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 }
      const aPriority =
        priorityWeight[a.priority as keyof typeof priorityWeight] || 1
      const bPriority =
        priorityWeight[b.priority as keyof typeof priorityWeight] || 1

      if (aPriority !== bPriority) return bPriority - aPriority
      return b.estimatedImpact - a.estimatedImpact
    })
    .slice(0, 10) // Top 10 actions
}

/**
 * Create quick action plan for fast analysis
 */
export function createQuickActionPlan(
  sentimentAnalysis: any,
  pricingRecommendation: any
) {
  const actions: Array<any> = []

  // Quick sentiment-based action
  if (sentimentAnalysis.aggregatedSentiment.overallSentiment === 'negative') {
    actions.push({
      priority: 'high',
      category: 'reviews',
      action: 'Negative Bewertungsthemen adressieren',
      estimatedImpact: 30,
      effort: 'medium',
      timeline: '1-2 Wochen',
    })
  }

  // Quick pricing action
  if (pricingRecommendation.confidenceLevel > 80) {
    const suggestedPrice = pricingRecommendation.suggestedPrice
    actions.push({
      priority: 'medium',
      category: 'pricing',
      action: `Preisoptimierung auf ${suggestedPrice}€ prüfen`,
      estimatedImpact: 20,
      effort: 'low',
      timeline: 'Sofort umsetzbar',
    })
  }

  return actions.slice(0, 5) // Top 5 actions for quick analysis
}
