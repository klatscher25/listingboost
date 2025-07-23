/**
 * @file lib/types/analysis-jobs.ts
 * @description TypeScript types for the background analysis job system
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo ARCHITECTURE-001-03: Job queue management types
 */

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed'

export type JobStep =
  | 'initializing'
  | 'scraping'
  | 'analyzing'
  | 'generating_recommendations'
  | 'finalizing'
  | 'completed'
  | 'failed'

export interface AnalysisJobCreate {
  token: string
  url: string
  userId?: string
  maxRetries?: number
}

export interface AnalysisJob {
  id: string
  token: string
  url: string
  userId?: string

  // Status and progress
  status: JobStatus
  progress: number // 0-100
  currentStep?: JobStep

  // Result data (when completed)
  listingData?: any
  analysisData?: any
  recommendationsData?: any
  isRealData?: boolean

  // Error handling
  errorMessage?: string
  errorDetails?: Record<string, any>
  retryCount: number
  maxRetries: number

  // Timestamps
  createdAt: string
  startedAt?: string
  completedAt?: string
  expiresAt: string

  // Performance metrics
  scrapingDurationMs?: number
  analysisDurationMs?: number
  totalDurationMs?: number

  // Metadata
  metadata?: Record<string, any>
}

export interface JobCreateResponse {
  jobId: string
  estimatedTimeSeconds: number
  pollUrl: string
  status: JobStatus
}

export interface JobStatusResponse {
  jobId: string
  status: JobStatus
  progress: number
  currentStep?: JobStep
  stepDescription?: string
  estimatedTimeRemaining?: number

  // Results (when completed)
  results?: {
    listing: any
    analysis: any
    recommendations: any
    isRealData: boolean
  }

  // Error info (when failed)
  error?: {
    message: string
    details?: Record<string, any>
    canRetry: boolean
  }

  // Timing information
  timing?: {
    elapsedMs: number
    estimatedTimeRemainingMs?: number
    isExpired: boolean
  }

  // Timestamps for client tracking
  createdAt: string
  startedAt?: string
  completedAt?: string
}

export interface JobProgress {
  jobId: string
  progress: number
  currentStep: JobStep
  message?: string
}

export interface JobError {
  jobId: string
  message: string
  details?: Record<string, any>
  isRetryable: boolean
}

export interface JobCompletion {
  jobId: string
  listingData: any
  analysisData: any
  recommendationsData: any
  isRealData: boolean
  performanceMetrics: {
    scrapingDurationMs?: number
    analysisDurationMs?: number
    totalDurationMs: number
  }
}

// Job queue configuration
export interface JobQueueConfig {
  maxConcurrentJobs: number
  jobTimeoutMs: number
  retryDelayMs: number
  cleanupIntervalMs: number
  pollIntervalMs: number
}

// Step descriptions for UI
export const JOB_STEP_DESCRIPTIONS: Record<JobStep, string> = {
  initializing: 'Initialisierung der Analyse...',
  scraping: 'Daten von Airbnb werden geladen...',
  analyzing: 'KI-Analyse läuft...',
  generating_recommendations: 'Empfehlungen werden erstellt...',
  finalizing: 'Ergebnisse werden finalisiert...',
  completed: 'Analyse abgeschlossen',
  failed: 'Analyse fehlgeschlagen',
}

// Progress ranges for each step
export const STEP_PROGRESS_RANGES: Record<JobStep, [number, number]> = {
  initializing: [0, 10],
  scraping: [10, 60],
  analyzing: [60, 85],
  generating_recommendations: [85, 95],
  finalizing: [95, 100],
  completed: [100, 100],
  failed: [0, 0],
}

// Default configuration
export const DEFAULT_JOB_CONFIG: JobQueueConfig = {
  maxConcurrentJobs: 5,
  jobTimeoutMs: 180000, // 3 minutes
  retryDelayMs: 5000, // 5 seconds
  cleanupIntervalMs: 300000, // 5 minutes
  pollIntervalMs: 2000, // 2 seconds for frontend polling
}
