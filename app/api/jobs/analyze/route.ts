/**
 * @file app/api/jobs/analyze/route.ts
 * @description Async analysis job creation endpoint
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo ARCHITECTURE-001-05: Async job creation API
 */

import { NextRequest, NextResponse } from 'next/server'
import { analysisJobManager } from '@/lib/services/jobs/analysis-job-manager'
import { validateJobData } from '@/lib/services/jobs/queue-processor'
import type { JobCreateResponse } from '@/lib/types/analysis-jobs'

/**
 * Create a new analysis job (async alternative to synchronous analysis)
 */
export async function POST(request: NextRequest) {
  console.log('[AsyncAnalyzeAPI] Async analysis job creation request received')

  try {
    const body = await request.json()
    const { url, token, userId } = body

    // Validate required parameters
    if (!url || !token) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameters: url and token',
        },
        { status: 400 }
      )
    }

    // Validate job data
    const validation = validateJobData({ url, token })
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validation.errors,
        },
        { status: 400 }
      )
    }

    // Check for existing pending or running job with same token/URL
    const existingJobs = await analysisJobManager.getJobsByToken(token)
    const activeJob = existingJobs.find(
      (job) =>
        job.url === url &&
        (job.status === 'pending' || job.status === 'running')
    )

    if (activeJob) {
      console.log('[AsyncAnalyzeAPI] Found existing active job:', activeJob.id)

      const response: JobCreateResponse = {
        jobId: activeJob.id,
        estimatedTimeSeconds: 60,
        pollUrl: `/api/jobs/status/${activeJob.id}`,
        status: activeJob.status,
      }

      return NextResponse.json({
        success: true,
        data: response,
        message: 'Job already exists and is processing',
      })
    }

    // Create new analysis job
    const job = await analysisJobManager.createJob({
      token,
      url,
      userId,
      maxRetries: 3,
    })

    console.log('[AsyncAnalyzeAPI] ✅ Analysis job created:', job.id)

    // Trigger background worker to process the job
    try {
      const workerAuthToken =
        process.env.WORKER_AUTH_TOKEN || 'dev-worker-token'

      fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/worker/process-jobs`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${workerAuthToken}`,
            'Content-Type': 'application/json',
          },
        }
      ).catch((error) => {
        console.log(
          '[AsyncAnalyzeAPI] Worker trigger failed (non-blocking):',
          error
        )
      })

      console.log('[AsyncAnalyzeAPI] 🚀 Background worker triggered')
    } catch (error) {
      console.log(
        '[AsyncAnalyzeAPI] Worker trigger error (non-blocking):',
        error
      )
    }

    const response: JobCreateResponse = {
      jobId: job.id,
      estimatedTimeSeconds: 60, // Average analysis time
      pollUrl: `/api/jobs/status/${job.id}`,
      status: job.status,
    }

    return NextResponse.json({
      success: true,
      data: response,
      meta: {
        timestamp: new Date().toISOString(),
        estimatedCompletion: new Date(Date.now() + 60000).toISOString(),
        workerTriggered: true,
      },
    })
  } catch (error) {
    console.error('[AsyncAnalyzeAPI] Job creation failed:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create analysis job',
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
 * Get user's analysis jobs (for authenticated users)
 */
export async function GET(request: NextRequest) {
  console.log('[AsyncAnalyzeAPI] Jobs list request received')

  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const userId = searchParams.get('userId')

    if (!token && !userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Either token or userId is required',
        },
        { status: 400 }
      )
    }

    let jobs: any[]
    if (token) {
      jobs = await analysisJobManager.getJobsByToken(token)
    } else {
      // For authenticated users - would need proper auth middleware
      jobs = []
    }

    return NextResponse.json({
      success: true,
      data: {
        jobs: jobs.map((job) => ({
          id: job.id,
          url: job.url,
          status: job.status,
          progress: job.progress,
          currentStep: job.currentStep,
          createdAt: job.createdAt,
          completedAt: job.completedAt,
          isRealData: job.isRealData,
        })),
      },
      meta: {
        count: jobs.length,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('[AsyncAnalyzeAPI] Failed to get jobs:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve jobs',
        details:
          process.env.NODE_ENV === 'development'
            ? (error as Error).message
            : undefined,
      },
      { status: 500 }
    )
  }
}
