/**
 * @file components/analyze/shared-types.ts
 * @description TypeScript interfaces for modern analysis components
 * @created 2025-07-21  
 * @todo FRONTEND-001-01: Type-safe analysis interface architecture
 */

import { MODERN_DESIGN } from '@/lib/design/modern-tokens'
import { ANALYZE_UI } from '@/lib/theme/analyze-constants'

/**
 * 🎨 DESIGN SYSTEM TYPES
 */

// Glassmorphism variant types
export type GlassVariant = keyof typeof MODERN_DESIGN.glass
export type GradientVariant = keyof typeof MODERN_DESIGN.gradients
export type AnimationVariant = keyof typeof MODERN_DESIGN.animations
export type TypographyVariant = keyof typeof MODERN_DESIGN.typography
export type ResponsiveSize = keyof typeof MODERN_DESIGN.responsive.container

// Component size system
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type ComponentState = 'default' | 'loading' | 'success' | 'error' | 'disabled'

/**
 * 📝 ANALYSIS WORKFLOW TYPES
 */

// Analysis types
export type AnalysisType = 'quick' | 'comprehensive'
export type AnalysisStatus = 'idle' | 'validating' | 'analyzing' | 'completed' | 'error'

// Progress tracking
export type ProgressStep = keyof typeof ANALYZE_UI.progress.steps
export type ProgressStatus = {
  currentStep: ProgressStep
  percentage: number
  timeElapsed: number
  timeRemaining: number | null
  message: string
}

// URL validation
export interface URLValidation {
  isValid: boolean
  isAirbnb: boolean
  domain: string | null
  listingId: string | null
  errors: string[]
}

// Analysis request
export interface AnalysisRequest {
  airbnb_url: string
  analysis_type: AnalysisType
  force_update?: boolean
  enable_ai?: boolean
  ai_analysis_type?: 'basic' | 'full'
  user_id: string
}

// Analysis response
export interface AnalysisResponse {
  success: boolean
  data?: AnalysisResult
  error?: {
    code: string
    message: string
    details?: string
  }
  meta?: {
    timestamp: string
    version: string
    analysis_type: AnalysisType
    ai_enabled: boolean
    processing_time: number
  }
}

/**
 * 📊 ANALYSIS RESULTS TYPES  
 */

// Overall score system
export interface ScoreBreakdown {
  overall: number
  categories: {
    photos: number
    description: number
    pricing: number
    amenities: number
    location: number
    reviews: number
  }
}

// Recommendation system
export interface Recommendation {
  id: string
  title: string
  description: string
  category: 'photos' | 'description' | 'pricing' | 'amenities' | 'location' | 'reviews'
  priority: 'high' | 'medium' | 'low'
  impact: 'high' | 'medium' | 'low'
  effort: 'low' | 'medium' | 'high'
  actionItems: string[]
  estimatedImprovement: number // points
}

// Market comparison
export interface MarketComparison {
  averagePrice: number
  pricePosition: 'below' | 'average' | 'above'
  competitorCount: number
  occupancyRate: number
  averageRating: number
  ratingPosition: 'below' | 'average' | 'above'
}

// Complete analysis result
export interface AnalysisResult {
  listingId: string
  url: string
  title: string
  score: ScoreBreakdown
  recommendations: Recommendation[]
  marketComparison: MarketComparison
  aiInsights?: string
  processingInfo: {
    analysisType: AnalysisType
    completedAt: string
    totalTime: number
    dataSourcesUsed: string[]
  }
}

/**
 * 🧩 COMPONENT PROP TYPES
 */

// Base component props
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
  id?: string
  'data-testid'?: string
}

// Glassmorphism component props
export interface GlassComponentProps extends BaseComponentProps {
  variant?: GlassVariant
  interactive?: boolean
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  shadow?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

// Form component props
export interface FormFieldProps extends BaseComponentProps {
  label?: string
  placeholder?: string
  helperText?: string
  error?: string
  required?: boolean
  disabled?: boolean
  size?: ComponentSize
}

// URL Input specific props
export interface URLInputProps extends FormFieldProps {
  value: string
  onChange: (value: string) => void
  onValidation?: (validation: URLValidation) => void
  validationDebounce?: number
  supportedDomains?: string[]
  autoFocus?: boolean
}

// Analysis Type Selector props
export interface AnalysisTypeSelectorProps extends BaseComponentProps {
  selectedType: AnalysisType
  onTypeChange: (type: AnalysisType) => void
  disabled?: boolean
  showFeatures?: boolean
}

// Progress Indicator props
export interface ProgressIndicatorProps extends BaseComponentProps {
  progress: ProgressStatus
  variant?: 'circular' | 'linear'
  size?: ComponentSize
  showTime?: boolean
  showSteps?: boolean
  animated?: boolean
}

// Results Display props
export interface ResultsDisplayProps extends BaseComponentProps {
  results: AnalysisResult
  variant?: 'compact' | 'detailed'
  showExport?: boolean
  onExport?: (format: 'pdf' | 'excel' | 'csv') => void
}

// Error Display props
export interface ErrorDisplayProps extends BaseComponentProps {
  error: {
    type: keyof typeof ANALYZE_UI.errors
    message: string
    code?: string
  }
  onRetry?: () => void
  showContact?: boolean
  size?: ComponentSize
}

// Main Form props  
export interface AnalyzeFormProps extends BaseComponentProps {
  userId: string
  onAnalysisStart?: (request: AnalysisRequest) => void
  onAnalysisComplete?: (result: AnalysisResult) => void
  onAnalysisError?: (error: any) => void
  initialUrl?: string
  initialType?: AnalysisType
}

/**
 * 🎯 HOOK TYPES
 */

// Analysis hook state
export interface UseAnalysisState {
  status: AnalysisStatus
  progress: ProgressStatus | null
  results: AnalysisResult | null
  error: string | null
  isLoading: boolean
  canRetry: boolean
}

// Analysis hook actions
export interface UseAnalysisActions {
  startAnalysis: (request: AnalysisRequest) => Promise<void>
  retryAnalysis: () => Promise<void>
  cancelAnalysis: () => void
  resetAnalysis: () => void
}

// Complete analysis hook return
export interface UseAnalysisReturn extends UseAnalysisState, UseAnalysisActions {}

// URL validation hook
export interface UseURLValidation {
  validation: URLValidation | null
  isValidating: boolean
  validate: (url: string) => void
  reset: () => void
}

/**
 * 🌍 RESPONSIVE & ACCESSIBILITY TYPES
 */

// Responsive prop system
export interface ResponsiveProps {
  mobile?: any
  tablet?: any
  desktop?: any
  wide?: any
}

// Accessibility props
export interface AccessibilityProps {
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-expanded'?: boolean
  'aria-hidden'?: boolean
  role?: string
  tabIndex?: number
}

// Complete component props with responsive and a11y
export interface CompleteComponentProps 
  extends BaseComponentProps, 
          Partial<ResponsiveProps>, 
          Partial<AccessibilityProps> {
  variant?: string
  size?: ComponentSize
  state?: ComponentState
}

/**
 * 📱 MOBILE-SPECIFIC TYPES
 */

// Touch interaction types
export interface TouchInteraction {
  onTouchStart?: (event: React.TouchEvent) => void
  onTouchEnd?: (event: React.TouchEvent) => void
  onTouchMove?: (event: React.TouchEvent) => void
}

// Swipe gesture types
export interface SwipeGesture {
  direction: 'up' | 'down' | 'left' | 'right'
  distance: number
  velocity: number
}

/**
 * 🎨 ANIMATION & TRANSITION TYPES
 */

// Animation configuration
export interface AnimationConfig {
  duration?: number
  delay?: number
  easing?: string
  repeat?: number | 'infinite'
  direction?: 'normal' | 'reverse' | 'alternate'
}

// Transition states
export type TransitionState = 'entering' | 'entered' | 'exiting' | 'exited'

/**
 * 📊 EXPORT & SHARING TYPES
 */

// Export options
export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'json'
export interface ExportRequest {
  format: ExportFormat
  results: AnalysisResult
  includeCharts?: boolean
  includeRecommendations?: boolean
}

// Sharing options
export interface ShareOptions {
  method: 'link' | 'email' | 'download'
  format?: ExportFormat
  recipientEmail?: string
  message?: string
}

/**
 * 🔧 UTILITY TYPES - Re-exported from utility-types.ts for CLAUDE.md compliance
 */
export type {
  Optional,
  RequiredProps, 
  PropsOf,
  BrandedId,
  UserId,
  ListingId,
  AnalysisId,
  APIResponse,
  NetworkStatus,
  LoadingState
} from '@/lib/types/utility-types'

// Export all types for easy importing
import * as React from 'react'
export { React }

// Default export for convenience
const SharedTypes = {
  MODERN_DESIGN,
  ANALYZE_UI
}

export default SharedTypes