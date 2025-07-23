/**
 * @file components/freemium/FreemiumDashboardContent.tsx
 * @description Main content sections for freemium dashboard
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo Extracted from dashboard page for CLAUDE.md compliance
 */

'use client'

import { ModernScoreVisualization } from './ModernScoreVisualization'
import { ModernRecommendationsTeaser } from './ModernRecommendationsTeaser'
import { UnifiedAIAnalysisPanel } from './UnifiedAIAnalysisPanel'
import { ProgressIndicator } from './ProgressIndicator'
import { PotentialAnalysisWidget } from '@/components/ui/PotentialAnalysisWidget'
import ListingOptimizationSection from '@/components/freemium/ai-insights/ListingOptimizationSection'
import HostCredibilitySection from '@/components/freemium/ai-insights/HostCredibilitySection'
import SeasonalOptimizationSection from '@/components/freemium/ai-insights/SeasonalOptimizationSection'
import RatingImprovementSection from '@/components/freemium/ai-insights/RatingImprovementSection'
import AmenityGapAnalysisSection from '@/components/freemium/ai-insights/AmenityGapAnalysisSection'
import type {
  FreemiumData,
  FreemiumAIInsights,
} from '@/lib/types/freemium-types'

interface FreemiumDashboardContentProps {
  data: FreemiumData
  aiInsights: FreemiumAIInsights | null
  isLoadingAI: boolean
  token: string
  onFetchAIInsights: () => void
  onUpgradeClick: () => void
}

export function FreemiumDashboardContent({
  data,
  aiInsights,
  isLoadingAI,
  token,
  onFetchAIInsights,
  onUpgradeClick,
}: FreemiumDashboardContentProps) {
  const { listing } = data

  return (
    <>
      {/* Modern Score Visualization */}
      <div className="mb-8">
        <ModernScoreVisualization data={data} onUpgradeClick={onUpgradeClick} />
      </div>

      {/* Modern Recommendations Teaser */}
      <div className="mb-8">
        <ModernRecommendationsTeaser
          data={data}
          onUpgradeClick={onUpgradeClick}
        />
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <ProgressIndicator
          currentStep={3}
          totalSteps={4}
          onUpgradeClick={onUpgradeClick}
        />
      </div>

      {/* Unified AI Analysis Panel - Single entry point for all AI insights */}
      <div className="mb-8">
        <UnifiedAIAnalysisPanel
          token={token}
          aiInsights={aiInsights}
          isLoadingAI={isLoadingAI}
          onFetchAIInsights={onFetchAIInsights}
          onUpgradeClick={onUpgradeClick}
        />
      </div>

      {/* AI Insights Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ListingOptimizationSection
          insights={aiInsights}
          listing={listing}
          isLoadingAI={isLoadingAI}
        />

        <HostCredibilitySection
          insights={aiInsights}
          listing={listing}
          isLoadingAI={isLoadingAI}
        />

        <SeasonalOptimizationSection
          insights={aiInsights}
          isLoadingAI={isLoadingAI}
        />

        <RatingImprovementSection
          insights={aiInsights}
          listing={listing}
          isLoadingAI={isLoadingAI}
        />
      </div>

      {/* Full-width Amenity Analysis */}
      <div className="mb-8">
        <AmenityGapAnalysisSection
          insights={aiInsights}
          listing={listing}
          isLoadingAI={isLoadingAI}
        />
      </div>

      {/* Potential Analysis Widget */}
      <div className="mb-8">
        <PotentialAnalysisWidget
          listingTitle={listing?.title || 'Ihr Listing'}
          onUpgradeClick={onUpgradeClick}
        />
      </div>
    </>
  )
}
