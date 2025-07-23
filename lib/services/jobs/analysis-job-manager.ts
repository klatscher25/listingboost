/**
 * @file lib/services/jobs/analysis-job-manager.ts
 * @description Core service for managing background analysis jobs
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo ARCHITECTURE-001-03: Job queue management implementation
 */

import { createClient } from '@supabase/supabase-js'
import type {
  AnalysisJob,
  AnalysisJobCreate,
  JobStatusResponse,
  JobProgress,
  JobCompletion,
  JobError,
  JobStatus,
} from '@/lib/types/analysis-jobs'

/**
 * Central job management service for background analysis processing
 */
export class AnalysisJobManager {
  private supabase

  constructor() {
    // Use service role for backend operations
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }

  /**
   * Create a new analysis job
   */
  async createJob(data: AnalysisJobCreate): Promise<AnalysisJob> {
    console.log('[JobManager] Creating new analysis job:', {
      token: data.token.substring(0, 10) + '...',
      url: data.url,
    })

    const jobData = {
      token: data.token,
      url: data.url,
      user_id: data.userId || null,
      status: 'pending' as JobStatus,
      progress: 0,
      retry_count: 0,
      max_retries: data.maxRetries || 3,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      metadata: {
        userAgent: 'ListingBoost-BackgroundWorker/1.0',
        source: 'freemium_api',
      },
    }

    const { data: job, error } = await this.supabase
      .from('analysis_jobs')
      .insert(jobData)
      .select()
      .single()

    if (error) {
      console.error('[JobManager] Failed to create job:', error)
      throw new Error(`Failed to create analysis job: ${error.message}`)
    }

    console.log('[JobManager] ✅ Job created successfully:', job.id)
    return this.transformJob(job)
  }

  /**
   * Get job status by ID
   */
  async getJobStatus(jobId: string): Promise<JobStatusResponse | null> {
    const { data: job, error } = await this.supabase
      .from('analysis_jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    if (error || !job) {
      console.log('[JobManager] Job not found:', jobId)
      return null
    }

    const transformedJob = this.transformJob(job)

    // Calculate estimated time remaining
    let estimatedTimeRemaining: number | undefined
    if (transformedJob.status === 'running' && transformedJob.startedAt) {
      const elapsedMs =
        Date.now() - new Date(transformedJob.startedAt).getTime()
      const avgJobTime = 60000 // 60 seconds average
      const progressRatio = transformedJob.progress / 100
      estimatedTimeRemaining = Math.max(0, avgJobTime - elapsedMs)
    }

    return {
      jobId: transformedJob.id,
      status: transformedJob.status,
      progress: transformedJob.progress,
      currentStep: transformedJob.currentStep,
      estimatedTimeRemaining,

      // Include results if completed
      results:
        transformedJob.status === 'completed'
          ? {
              listing: transformedJob.listingData,
              analysis: transformedJob.analysisData,
              recommendations: transformedJob.recommendationsData,
              isRealData: transformedJob.isRealData || false,
            }
          : undefined,

      // Include error if failed
      error:
        transformedJob.status === 'failed'
          ? {
              message: transformedJob.errorMessage || 'Unknown error',
              details: transformedJob.errorDetails,
              canRetry: transformedJob.retryCount < transformedJob.maxRetries,
            }
          : undefined,

      createdAt: transformedJob.createdAt,
      startedAt: transformedJob.startedAt,
      completedAt: transformedJob.completedAt,
    }
  }

  /**
   * Get next pending job for processing (used by background worker)
   */
  async getNextPendingJob(): Promise<AnalysisJob | null> {
    const { data, error } = await this.supabase.rpc('get_next_pending_job')

    if (error) {
      console.error('[JobManager] Failed to get next pending job:', error)
      return null
    }

    if (!data || data.length === 0) {
      return null
    }

    const jobInfo = data[0]
    console.log('[JobManager] 🎯 Picked up job for processing:', jobInfo.job_id)

    // Get full job details
    const { data: fullJob, error: fetchError } = await this.supabase
      .from('analysis_jobs')
      .select('*')
      .eq('id', jobInfo.job_id)
      .single()

    if (fetchError || !fullJob) {
      console.error(
        '[JobManager] Failed to fetch full job details:',
        fetchError
      )
      return null
    }

    return this.transformJob(fullJob)
  }

  /**
   * Update job progress
   */
  async updateProgress(progress: JobProgress): Promise<boolean> {
    const { error } = await this.supabase.rpc('update_job_progress', {
      job_id: progress.jobId,
      new_progress: progress.progress,
      new_step: progress.currentStep,
    })

    if (error) {
      console.error('[JobManager] Failed to update progress:', error)
      return false
    }

    console.log(
      `[JobManager] 📊 Progress updated: ${progress.jobId} → ${progress.progress}% (${progress.currentStep})`
    )
    return true
  }

  /**
   * Complete job with results
   */
  async completeJob(completion: JobCompletion): Promise<boolean> {
    const { error } = await this.supabase.rpc('complete_job', {
      job_id: completion.jobId,
      listing_data: completion.listingData,
      analysis_data: completion.analysisData,
      recommendations_data: completion.recommendationsData,
      is_real_data: completion.isRealData,
      scraping_duration: completion.performanceMetrics.scrapingDurationMs,
      analysis_duration: completion.performanceMetrics.analysisDurationMs,
    })

    if (error) {
      console.error('[JobManager] Failed to complete job:', error)
      return false
    }

    console.log('[JobManager] ✅ Job completed successfully:', completion.jobId)
    return true
  }

  /**
   * Fail job with error
   */
  async failJob(jobError: JobError): Promise<boolean> {
    const { error } = await this.supabase.rpc('fail_job', {
      job_id: jobError.jobId,
      error_message: jobError.message,
      error_details: jobError.details,
    })

    if (error) {
      console.error('[JobManager] Failed to mark job as failed:', error)
      return false
    }

    console.log(
      '[JobManager] ❌ Job marked as failed:',
      jobError.jobId,
      '-',
      jobError.message
    )
    return true
  }

  /**
   * Get jobs by token (for freemium users)
   */
  async getJobsByToken(token: string): Promise<AnalysisJob[]> {
    const { data: jobs, error } = await this.supabase
      .from('analysis_jobs')
      .select('*')
      .eq('token', token)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[JobManager] Failed to get jobs by token:', error)
      return []
    }

    return jobs.map((job) => this.transformJob(job))
  }

  /**
   * Cleanup expired jobs
   */
  async cleanupExpiredJobs(): Promise<number> {
    const { data, error } = await this.supabase.rpc('cleanup_expired_jobs')

    if (error) {
      console.error('[JobManager] Failed to cleanup expired jobs:', error)
      return 0
    }

    const deletedCount = data || 0
    if (deletedCount > 0) {
      console.log(`[JobManager] 🧹 Cleaned up ${deletedCount} expired jobs`)
    }

    return deletedCount
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<{
    pending: number
    running: number
    completed: number
    failed: number
    totalToday: number
  }> {
    const { data, error } = await this.supabase
      .from('analysis_jobs')
      .select('status, created_at')

    if (error) {
      console.error('[JobManager] Failed to get queue stats:', error)
      return { pending: 0, running: 0, completed: 0, failed: 0, totalToday: 0 }
    }

    const today = new Date().toISOString().split('T')[0]

    const stats = {
      pending: 0,
      running: 0,
      completed: 0,
      failed: 0,
      totalToday: 0,
    }

    data.forEach((job) => {
      stats[job.status as keyof typeof stats]++
      if (job.created_at.startsWith(today)) {
        stats.totalToday++
      }
    })

    return stats
  }

  /**
   * Transform database row to AnalysisJob interface
   */
  private transformJob(dbJob: any): AnalysisJob {
    return {
      id: dbJob.id,
      token: dbJob.token,
      url: dbJob.url,
      userId: dbJob.user_id,
      status: dbJob.status,
      progress: dbJob.progress,
      currentStep: dbJob.current_step,
      listingData: dbJob.listing_data,
      analysisData: dbJob.analysis_data,
      recommendationsData: dbJob.recommendations_data,
      isRealData: dbJob.is_real_data,
      errorMessage: dbJob.error_message,
      errorDetails: dbJob.error_details,
      retryCount: dbJob.retry_count,
      maxRetries: dbJob.max_retries,
      createdAt: dbJob.created_at,
      startedAt: dbJob.started_at,
      completedAt: dbJob.completed_at,
      expiresAt: dbJob.expires_at,
      scrapingDurationMs: dbJob.scraping_duration_ms,
      analysisDurationMs: dbJob.analysis_duration_ms,
      totalDurationMs: dbJob.total_duration_ms,
      metadata: dbJob.metadata,
    }
  }
}

// Singleton instance
export const analysisJobManager = new AnalysisJobManager()
