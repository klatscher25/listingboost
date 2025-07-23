/**
 * @file lib/utils/scoring-utils.ts
 * @description Scoring utilities and competitive positioning logic extracted from components
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo REFACTOR-001: Extracted from ModernScoreVisualization.tsx for better separation of concerns
 */

export interface ScorePosition {
  label: string
  color: string
  bgColor: string
}

export interface FreemiumMetrics {
  criticalProblems: number
  lostBookings: number
  potentialBookingIncrease: number
  additionalRevenue: number
}

/**
 * Calculate competitive positioning using 1000-point system (ScoringSystem.md compliant)
 * Extracted from ModernScoreVisualization component for reusability
 *
 * @param score - Score value from 0-1000
 * @returns ScorePosition object with label, color, and background color
 */
export function getScorePosition(score: number): ScorePosition {
  if (score >= 900) {
    return {
      label: 'Elite Performer (Top 1%)',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-500',
    }
  }

  if (score >= 800) {
    return {
      label: 'High Performer (Top 5%)',
      color: 'text-blue-600',
      bgColor: 'bg-blue-500',
    }
  }

  if (score >= 700) {
    return {
      label: 'Good Performer (Top 20%)',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-500',
    }
  }

  if (score >= 600) {
    return {
      label: 'Average Performer',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-500',
    }
  }

  if (score >= 500) {
    return {
      label: 'Below Average',
      color: 'text-orange-600',
      bgColor: 'bg-orange-500',
    }
  }

  return {
    label: 'Poor Performer',
    color: 'text-red-600',
    bgColor: 'bg-red-500',
  }
}

/**
 * Calculate display score for UI (converts 1000-point scale to 0-100)
 *
 * @param score - Score value from 0-1000
 * @returns Display score from 0-100
 */
export function getDisplayScore(score: number): number {
  return Math.round(score / 10)
}

/**
 * Generate freemium metrics based on score and analysis data
 * Makes static metrics more dynamic and data-driven
 *
 * @param score - Overall score from 0-1000
 * @returns FreemiumMetrics object with calculated values
 */
export function generateFreemiumMetrics(score: number): FreemiumMetrics {
  // Base calculations on actual score for more realistic metrics
  const scorePercentage = score / 1000
  const inverseScore = 1 - scorePercentage

  return {
    criticalProblems: Math.ceil(inverseScore * 8), // 0-8 problems based on score
    lostBookings: Math.round(inverseScore * 60), // 0-60% lost bookings
    potentialBookingIncrease: Math.round((1 - scorePercentage) * 200), // 0-200% potential increase
    additionalRevenue: Math.round((1 - scorePercentage) * 5000), // €0-5000 additional revenue
  }
}

/**
 * Get score category color for UI elements
 *
 * @param score - Score value from 0-1000
 * @returns Tailwind color class string
 */
export function getScoreColor(score: number): string {
  const position = getScorePosition(score)
  return position.color
}

/**
 * Get score background color for UI elements
 *
 * @param score - Score value from 0-1000
 * @returns Tailwind background color class string
 */
export function getScoreBgColor(score: number): string {
  const position = getScorePosition(score)
  return position.bgColor
}

/**
 * Validate score range and normalize if needed
 *
 * @param score - Input score value
 * @returns Normalized score between 0-1000
 */
export function validateAndNormalizeScore(score: number): number {
  if (score < 0) return 0
  if (score > 1000) return 1000
  return Math.round(score)
}
