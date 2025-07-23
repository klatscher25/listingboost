/**
 * @file app/api/jobs/status/[jobId]/route.ts
 * @description Job status polling endpoint for real-time progress updates
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo ARCHITECTURE-001-05: Job status polling API
 */

import { NextRequest, NextResponse } from 'next/server'
import { analysisJobManager } from '@/lib/services/jobs/analysis-job-manager'
import { JOB_STEP_DESCRIPTIONS } from '@/lib/types/analysis-jobs'

interface StatusParams {
  params: Promise<{
    jobId: string
  }>
}

/**
 * Get job status and progress (used for polling)
 */
export async function GET(request: NextRequest, { params }: StatusParams) {
  const { jobId } = await params

  console.log('[JobStatusAPI] Status request for job:', jobId)

  try {
    // Validate jobId format (UUID)
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(jobId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid job ID format',
        },
        { status: 400 }
      )
    }

    // Get job status
    const jobStatus = await analysisJobManager.getJobStatus(jobId)

    if (!jobStatus) {
      return NextResponse.json(
        {
          success: false,
          error: 'Job not found',
          code: 'JOB_NOT_FOUND',
        },
        { status: 404 }
      )
    }

    // Add German step descriptions for UI
    const stepDescription = jobStatus.currentStep
      ? JOB_STEP_DESCRIPTIONS[jobStatus.currentStep] || jobStatus.currentStep
      : undefined

    // Calculate additional timing information
    const now = new Date()
    const createdAt = new Date(jobStatus.createdAt)
    const elapsedMs = now.getTime() - createdAt.getTime()

    let estimatedTimeRemaining: number | undefined
    if (jobStatus.status === 'running' && jobStatus.progress > 0) {
      const progressRatio = jobStatus.progress / 100
      const estimatedTotalTime = elapsedMs / progressRatio
      estimatedTimeRemaining = Math.max(0, estimatedTotalTime - elapsedMs)
    }

    // Check if job is expired but not completed
    const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000) // 24 hours
    const isExpired = now > expiresAt && jobStatus.status !== 'completed'

    const response = {
      success: true,
      data: {
        ...jobStatus,
        stepDescription,
        timing: {
          elapsedMs,
          estimatedTimeRemainingMs: estimatedTimeRemaining,
          isExpired,
        },
      },
      meta: {
        timestamp: now.toISOString(),
        nextPollDelayMs: getRecommendedPollDelay(
          jobStatus.status,
          jobStatus.progress
        ),
      },
    }

    // Add cache headers based on status
    const headers = new Headers()

    if (jobStatus.status === 'completed' || jobStatus.status === 'failed') {
      // Cache completed/failed jobs for 1 hour
      headers.set('Cache-Control', 'public, max-age=3600')
    } else {
      // Don't cache pending/running jobs
      headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    }

    return NextResponse.json(response, { headers })
  } catch (error) {
    console.error('[JobStatusAPI] Failed to get job status:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get job status',
        details:
          process.env.NODE_ENV === 'development'
            ? (error as Error).message
            : undefined,
      },
      { status: 500 }
    )
  }
}

/**
 * Cancel a job (if still pending or running)
 */
export async function DELETE(request: NextRequest, { params }: StatusParams) {
  const { jobId } = await params

  console.log('[JobStatusAPI] Cancel request for job:', jobId)

  try {
    // Get current job status
    const jobStatus = await analysisJobManager.getJobStatus(jobId)

    if (!jobStatus) {
      return NextResponse.json(
        {
          success: false,
          error: 'Job not found',
        },
        { status: 404 }
      )
    }

    // Check if job can be cancelled
    if (jobStatus.status === 'completed') {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot cancel completed job',
        },
        { status: 400 }
      )
    }

    if (jobStatus.status === 'failed') {
      return NextResponse.json(
        {
          success: false,
          error: 'Job already failed',
        },
        { status: 400 }
      )
    }

    // Mark job as failed with cancellation message
    const cancelled = await analysisJobManager.failJob({
      jobId,
      message: 'Job cancelled by user',
      details: {
        reason: 'user_cancellation',
        cancelledAt: new Date().toISOString(),
      },
      isRetryable: false,
    })

    if (!cancelled) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to cancel job',
        },
        { status: 500 }
      )
    }

    console.log('[JobStatusAPI] ✅ Job cancelled:', jobId)

    return NextResponse.json({
      success: true,
      message: 'Job cancelled successfully',
      data: {
        jobId,
        status: 'failed',
        cancelledAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('[JobStatusAPI] Failed to cancel job:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to cancel job',
        details:
          process.env.NODE_ENV === 'development'
            ? (error as Error).message
            : undefined,
      },
      { status: 500 }
    )
  }
}

/**
 * Get recommended polling delay based on job status and progress
 */
function getRecommendedPollDelay(status: string, progress: number): number {
  switch (status) {
    case 'pending':
      return 3000 // 3 seconds - check more frequently for job pickup
    case 'running':
      if (progress < 50) {
        return 2000 // 2 seconds - more frequent during active processing
      } else {
        return 1500 // 1.5 seconds - even more frequent near completion
      }
    case 'completed':
    case 'failed':
      return 0 // No need to poll anymore
    default:
      return 5000 // 5 seconds default
  }
}
