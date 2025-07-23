/**
 * @file app/api/worker/process-jobs/route.ts
 * @description Background worker for processing analysis jobs
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo ARCHITECTURE-001-05: Background job processing worker
 */

import { NextRequest, NextResponse } from 'next/server'
import { jobQueueProcessor } from '@/lib/services/jobs/queue-processor'

/**
 * Background worker endpoint to process pending jobs
 * This can be called manually or via cron jobs
 */
export async function POST(request: NextRequest) {
  console.log('[BackgroundWorker] Processing jobs request received')

  try {
    // Verify this is an internal call (basic security)
    const authHeader = request.headers.get('Authorization')
    const expectedToken = process.env.WORKER_AUTH_TOKEN || 'dev-worker-token'

    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized - Invalid worker token',
        },
        { status: 401 }
      )
    }

    // Get queue statistics before processing
    const statsBefore = await jobQueueProcessor.getQueueStats()
    console.log(
      '[BackgroundWorker] Queue stats before processing:',
      statsBefore
    )

    if (statsBefore.pending === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pending jobs to process',
        stats: statsBefore,
      })
    }

    // Process a single job (to avoid timeout)
    console.log('[BackgroundWorker] 🚀 Starting job processing...')

    // Get the current processing status
    const workerStatus = jobQueueProcessor.getStatus()

    if (workerStatus.isProcessing) {
      return NextResponse.json({
        success: true,
        message: 'Worker already processing a job',
        currentJob: workerStatus.currentJob,
        stats: statsBefore,
      })
    }

    // Start processing (this will process one job and stop)
    jobQueueProcessor.startProcessing()

    // Give it a moment to pick up a job
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Get updated status
    const statusAfter = jobQueueProcessor.getStatus()
    const statsAfter = await jobQueueProcessor.getQueueStats()

    console.log('[BackgroundWorker] ✅ Processing initiated:', {
      isProcessing: statusAfter.isProcessing,
      currentJob: statusAfter.currentJob,
      stats: statsAfter,
    })

    return NextResponse.json({
      success: true,
      message: 'Job processing initiated',
      worker: {
        isProcessing: statusAfter.isProcessing,
        currentJob: statusAfter.currentJob,
      },
      stats: {
        before: statsBefore,
        after: statsAfter,
      },
      meta: {
        timestamp: new Date().toISOString(),
        workerType: 'on-demand',
      },
    })
  } catch (error) {
    console.error('[BackgroundWorker] Failed to process jobs:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process jobs',
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
 * Get worker status and queue statistics
 */
export async function GET(request: NextRequest) {
  console.log('[BackgroundWorker] Status request received')

  try {
    const workerStatus = jobQueueProcessor.getStatus()
    const queueStats = await jobQueueProcessor.getQueueStats()

    return NextResponse.json({
      success: true,
      data: {
        worker: workerStatus,
        queue: queueStats,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('[BackgroundWorker] Failed to get status:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get worker status',
        details:
          process.env.NODE_ENV === 'development'
            ? (error as Error).message
            : undefined,
      },
      { status: 500 }
    )
  }
}
