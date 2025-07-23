/**
 * @file app/api/jobs/process/route.ts
 * @description API endpoint for triggering job processing (serverless alternative)
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo ARCHITECTURE-001-04: Serverless job processing endpoint
 */

import { NextRequest, NextResponse } from 'next/server'
import { jobQueueProcessor } from '@/lib/services/jobs/queue-processor'
import { analysisJobManager } from '@/lib/services/jobs/analysis-job-manager'

/**
 * Trigger job processing (useful for cron jobs or serverless environments)
 * This endpoint can be called periodically to process pending jobs
 */
export async function POST(request: NextRequest) {
  console.log('[JobProcessAPI] Job processing trigger received')

  try {
    // Optional: Verify the request is authorized (e.g., from a cron service)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'default-secret'

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.log('[JobProcessAPI] Unauthorized request')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current queue statistics
    const statsBefore = await analysisJobManager.getQueueStats()
    console.log('[JobProcessAPI] Queue stats before processing:', statsBefore)

    // Process jobs with timeout (for serverless functions)
    const timeoutMs = 60000 // 60 seconds max execution time
    const startTime = Date.now()
    let processedJobs = 0
    let errors: string[] = []

    while (Date.now() - startTime < timeoutMs) {
      try {
        // Get next pending job
        const job = await analysisJobManager.getNextPendingJob()
        if (!job) {
          // No more pending jobs
          break
        }

        console.log(
          `[JobProcessAPI] Processing job ${processedJobs + 1}:`,
          job.id
        )

        // Process the job using the queue processor
        const { JobQueueProcessor } = await import(
          '@/lib/services/jobs/queue-processor'
        )
        const processor = new JobQueueProcessor()

        // Execute job directly (since we're in serverless mode)
        await processor.executeJob(job)

        processedJobs++
        console.log(`[JobProcessAPI] ✅ Job completed:`, job.id)
      } catch (error) {
        const errorMsg = `Job processing failed: ${(error as Error).message}`
        errors.push(errorMsg)
        console.error('[JobProcessAPI]', errorMsg)

        // Continue processing other jobs even if one fails
        continue
      }

      // Small delay between jobs to prevent overwhelming the system
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    // Get final statistics
    const statsAfter = await analysisJobManager.getQueueStats()
    console.log('[JobProcessAPI] Queue stats after processing:', statsAfter)

    // Clean up expired jobs
    const cleanedUpCount = await analysisJobManager.cleanupExpiredJobs()

    const response = {
      success: true,
      summary: {
        processedJobs,
        errors: errors.length,
        errorMessages: errors,
        cleanedUpJobs: cleanedUpCount,
        executionTimeMs: Date.now() - startTime,
      },
      queueStats: {
        before: statsBefore,
        after: statsAfter,
      },
    }

    console.log('[JobProcessAPI] Processing complete:', response.summary)

    return NextResponse.json(response)
  } catch (error) {
    console.error('[JobProcessAPI] Processing failed:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Job processing failed',
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
 * Get current job processing status and queue statistics
 */
export async function GET(request: NextRequest) {
  console.log('[JobProcessAPI] Status request received')

  try {
    // Get queue statistics
    const stats = await analysisJobManager.getQueueStats()

    // Get processor status
    const processorStatus = jobQueueProcessor.getStatus()

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      queueStats: stats,
      processorStatus: {
        isProcessing: processorStatus.isProcessing,
        currentJob: processorStatus.currentJob || null,
        startedAt: processorStatus.startedAt
          ? new Date(processorStatus.startedAt).toISOString()
          : null,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('[JobProcessAPI] Status check failed:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get status',
        details:
          process.env.NODE_ENV === 'development'
            ? (error as Error).message
            : undefined,
      },
      { status: 500 }
    )
  }
}
