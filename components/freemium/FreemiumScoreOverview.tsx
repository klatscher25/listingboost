/**
 * @file components/freemium/FreemiumScoreOverview.tsx
 * @description Adapter component to display freemium scores using ScoreOverview
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo Adapter for freemium API data to ScoreOverview component
 */

'use client'

import { ScoreOverview } from '@/components/analyze/ScoreOverview'
import type { ScoreBreakdown } from '@/components/analyze/shared-types'
import type { FreemiumData } from '@/lib/types/freemium-types'

interface FreemiumScoreOverviewProps {
  data: FreemiumData
}

export function FreemiumScoreOverview({ data }: FreemiumScoreOverviewProps) {
  // Transform freemium API data to ScoreOverview format
  const scoreBreakdown: ScoreBreakdown = {
    // Use actual 1000-point scoring system
    overall: Math.round(data.analysis.overallScore),
    categories: {
      photos: data.analysis.categoryScores.photos,
      description: data.analysis.categoryScores.description,
      pricing: data.analysis.categoryScores.pricing,
      amenities: data.analysis.categoryScores.amenities,
      location: data.analysis.categoryScores.location,
      // Map title score to reviews since they're conceptually similar
      reviews: data.analysis.categoryScores.title,
    },
  }

  return <ScoreOverview score={scoreBreakdown} />
}
