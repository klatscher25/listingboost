/**
 * @file lib/services/jobs/queue-processor.ts
 * @description Queue processing utilities and job orchestration
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo ARCHITECTURE-001-03: Queue processing implementation
 */

import { analysisJobManager } from './analysis-job-manager'
import type {
  AnalysisJob,
  JobStep,
  DEFAULT_JOB_CONFIG,
  STEP_PROGRESS_RANGES,
} from '@/lib/types/analysis-jobs'

/**
 * Job queue processor for background workers
 */
export class JobQueueProcessor {
  private isProcessing: boolean = false
  private processingJob: AnalysisJob | null = null
  private processingInterval: NodeJS.Timeout | null = null
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Start cleanup interval
    this.startCleanupInterval()
  }

  /**
   * Start processing jobs from the queue
   */
  startProcessing(): void {
    if (this.isProcessing) {
      console.log('[QueueProcessor] Already processing jobs')
      return
    }

    console.log('[QueueProcessor] 🚀 Starting job queue processing')
    this.isProcessing = true

    // Poll for jobs every 5 seconds
    this.processingInterval = setInterval(async () => {
      await this.processNextJob()
    }, 5000)
  }

  /**
   * Stop processing jobs
   */
  stopProcessing(): void {
    console.log('[QueueProcessor] 🛑 Stopping job queue processing')
    this.isProcessing = false

    if (this.processingInterval) {
      clearInterval(this.processingInterval)
      this.processingInterval = null
    }

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }

  /**
   * Process the next pending job in the queue
   */
  private async processNextJob(): Promise<void> {
    if (this.processingJob) {
      // Already processing a job
      return
    }

    try {
      const job = await analysisJobManager.getNextPendingJob()
      if (!job) {
        // No pending jobs
        return
      }

      this.processingJob = job
      console.log('[QueueProcessor] 🎯 Processing job:', job.id)

      await this.executeJob(job)
    } catch (error) {
      console.error('[QueueProcessor] Error processing job:', error)

      if (this.processingJob) {
        await analysisJobManager.failJob({
          jobId: this.processingJob.id,
          message: 'Job processing failed: ' + (error as Error).message,
          details: { error: String(error) },
          isRetryable: true,
        })
      }
    } finally {
      this.processingJob = null
    }
  }

  /**
   * Execute a specific job through the analysis pipeline
   */
  async executeJob(job: AnalysisJob): Promise<void> {
    const startTime = Date.now()

    try {
      // Step 1: Initialize
      await this.updateProgress(job.id, 'initializing', 5)

      // Step 2: Import analysis modules dynamically to avoid circular dependencies
      const { AirbnbUrlScraper } = await import(
        '@/lib/services/apify/scrapers/url-scraper'
      )
      const { analyzeListingData, generateRecommendations } = await import(
        '@/lib/services/freemium/analysis'
      )
      const { generateEnhancedFakeData } = await import(
        '@/lib/services/freemium/fake-data'
      )
      const { timeoutPromise } = await import('@/lib/utils/timeout')

      await this.updateProgress(job.id, 'scraping', 15)

      // Step 3: Scrape listing data
      const scrapingStart = Date.now()
      let listing: any = null
      let isRealData = false

      if (
        process.env.APIFY_API_TOKEN &&
        process.env.APIFY_API_TOKEN !== 'placeholder_apify_token'
      ) {
        try {
          console.log(
            '[QueueProcessor] Attempting real scraping for job:',
            job.id
          )
          const scraper = new AirbnbUrlScraper()

          listing = await timeoutPromise(
            60000, // 60 second timeout
            scraper.scrape(job.url, {
              timeout: 60,
              memory: 2048,
            })
          )

          isRealData = true
          console.log(
            '[QueueProcessor] ✅ Real scraping successful for job:',
            job.id
          )
        } catch (error) {
          console.log(
            '[QueueProcessor] Real scraping failed, using fake data for job:',
            job.id,
            error
          )
          listing = null
        }
      }

      // Fallback to enhanced fake data
      if (!listing) {
        listing = generateEnhancedFakeData(job.url)
        isRealData = false
      }

      const scrapingDuration = Date.now() - scrapingStart
      await this.updateProgress(job.id, 'analyzing', 65)

      // Step 4: Run AI analysis
      const analysisStart = Date.now()
      const analysis = await analyzeListingData(listing)
      const recommendations = generateRecommendations(listing, analysis)
      const analysisDuration = Date.now() - analysisStart

      await this.updateProgress(job.id, 'generating_recommendations', 90)

      // Step 5: Complete job
      await this.updateProgress(job.id, 'finalizing', 95)

      const totalDuration = Date.now() - startTime

      await analysisJobManager.completeJob({
        jobId: job.id,
        listingData: listing,
        analysisData: analysis,
        recommendationsData: recommendations,
        isRealData,
        performanceMetrics: {
          scrapingDurationMs: scrapingDuration,
          analysisDurationMs: analysisDuration,
          totalDurationMs: totalDuration,
        },
      })

      console.log(
        `[QueueProcessor] ✅ Job completed successfully: ${job.id} (${totalDuration}ms total)`
      )
    } catch (error) {
      console.error('[QueueProcessor] Job execution failed:', job.id, error)

      await analysisJobManager.failJob({
        jobId: job.id,
        message: 'Job execution failed: ' + (error as Error).message,
        details: {
          error: String(error),
          stack: (error as Error).stack,
          url: job.url,
          token: job.token.substring(0, 10) + '...',
        },
        isRetryable: true,
      })
    }
  }

  /**
   * Update job progress with step and percentage
   */
  private async updateProgress(
    jobId: string,
    step: JobStep,
    progress: number
  ): Promise<void> {
    await analysisJobManager.updateProgress({
      jobId,
      progress,
      currentStep: step,
    })
  }

  /**
   * Start periodic cleanup of expired jobs
   */
  private startCleanupInterval(): void {
    // Clean up expired jobs every 5 minutes
    this.cleanupInterval = setInterval(
      async () => {
        try {
          await analysisJobManager.cleanupExpiredJobs()
        } catch (error) {
          console.error('[QueueProcessor] Cleanup failed:', error)
        }
      },
      5 * 60 * 1000
    ) // 5 minutes
  }

  /**
   * Get current processing status
   */
  getStatus(): {
    isProcessing: boolean
    currentJob?: string
    startedAt?: number
  } {
    return {
      isProcessing: this.isProcessing,
      currentJob: this.processingJob?.id,
      startedAt: this.processingJob?.startedAt
        ? new Date(this.processingJob.startedAt).getTime()
        : undefined,
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats() {
    return await analysisJobManager.getQueueStats()
  }
}

// Singleton instance for use in background workers
export const jobQueueProcessor = new JobQueueProcessor()

/**
 * Utility function to validate job data
 */
export function validateJobData(data: any): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!data.token || data.token.length < 10) {
    errors.push('Invalid token: must be at least 10 characters')
  }

  if (!data.url || !data.url.includes('airbnb.')) {
    errors.push('Invalid URL: must be a valid Airbnb URL')
  }

  // Validate Airbnb URL format
  const airbnbUrlPattern =
    /^https?:\/\/(www\.)?(airbnb\.(com|de|fr|it|es|at|ch))\/rooms\/\d+/
  if (data.url && !airbnbUrlPattern.test(data.url)) {
    errors.push('Invalid Airbnb URL format')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Utility function to generate job ID preview for logging
 */
export function getJobIdPreview(jobId: string): string {
  return jobId.substring(0, 8) + '...'
}

/**
 * Utility function to estimate job completion time
 */
export function estimateJobTime(
  currentProgress: number,
  elapsedMs: number
): number {
  if (currentProgress <= 0) return 60000 // Default 60 seconds

  const progressRatio = currentProgress / 100
  const estimatedTotalTime = elapsedMs / progressRatio
  const remainingTime = estimatedTotalTime - elapsedMs

  return Math.max(0, remainingTime)
}
