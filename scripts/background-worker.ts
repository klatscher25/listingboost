#!/usr/bin/env tsx
/**
 * @file scripts/background-worker.ts
 * @description Standalone background worker for processing analysis jobs
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo ARCHITECTURE-001-04: Background worker implementation
 */

import { config } from 'dotenv'
import { jobQueueProcessor } from '@/lib/services/jobs/queue-processor'
import { analysisJobManager } from '@/lib/services/jobs/analysis-job-manager'

// Load environment variables
config({ path: '.env.local' })

/**
 * Background worker process for ListingBoost Pro
 * Continuously processes analysis jobs from the queue
 */
class BackgroundWorker {
  private isShuttingDown = false
  private statsInterval: NodeJS.Timeout | null = null

  constructor() {
    this.setupSignalHandlers()
  }

  /**
   * Start the background worker
   */
  async start(): Promise<void> {
    console.log('🚀 ListingBoost Background Worker Starting...')
    console.log('📅 Started at:', new Date().toISOString())

    // Validate environment
    if (!this.validateEnvironment()) {
      console.error('❌ Environment validation failed')
      process.exit(1)
    }

    console.log('✅ Environment validation passed')

    // Start queue processing
    jobQueueProcessor.startProcessing()

    // Start periodic statistics logging
    this.startStatsLogging()

    console.log('🎯 Background worker is now processing jobs...')
    console.log('💡 Press Ctrl+C to gracefully shutdown')

    // Keep the process alive
    await this.keepAlive()
  }

  /**
   * Validate required environment variables
   */
  private validateEnvironment(): boolean {
    const required = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']

    const missing = required.filter((key) => !process.env[key])

    if (missing.length > 0) {
      console.error('❌ Missing required environment variables:', missing)
      return false
    }

    // Check optional but recommended variables
    if (!process.env.APIFY_API_TOKEN) {
      console.warn('⚠️  APIFY_API_TOKEN not found - will use fake data only')
    }

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      console.warn(
        '⚠️  GOOGLE_GEMINI_API_KEY not found - analysis may be limited'
      )
    }

    return true
  }

  /**
   * Setup signal handlers for graceful shutdown
   */
  private setupSignalHandlers(): void {
    const handleShutdown = (signal: string) => {
      console.log(`\n📨 Received ${signal}, starting graceful shutdown...`)
      this.shutdown()
    }

    process.on('SIGINT', () => handleShutdown('SIGINT'))
    process.on('SIGTERM', () => handleShutdown('SIGTERM'))

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('💥 Uncaught Exception:', error)
      this.shutdown()
    })

    process.on('unhandledRejection', (reason, promise) => {
      console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason)
      this.shutdown()
    })
  }

  /**
   * Start periodic statistics logging
   */
  private startStatsLogging(): void {
    this.statsInterval = setInterval(async () => {
      try {
        const stats = await jobQueueProcessor.getQueueStats()
        const processorStatus = jobQueueProcessor.getStatus()

        console.log('📊 Worker Statistics:', {
          timestamp: new Date().toISOString(),
          queue: {
            pending: stats.pending,
            running: stats.running,
            completed: stats.completed,
            failed: stats.failed,
            totalToday: stats.totalToday,
          },
          processor: {
            isProcessing: processorStatus.isProcessing,
            currentJob: processorStatus.currentJob || 'none',
          },
        })
      } catch (error) {
        console.error('📊 Failed to log statistics:', error)
      }
    }, 60000) // Every minute
  }

  /**
   * Keep the process alive until shutdown
   */
  private async keepAlive(): Promise<void> {
    return new Promise((resolve) => {
      const checkShutdown = () => {
        if (this.isShuttingDown) {
          resolve()
        } else {
          setTimeout(checkShutdown, 1000)
        }
      }
      checkShutdown()
    })
  }

  /**
   * Gracefully shutdown the worker
   */
  private async shutdown(): Promise<void> {
    if (this.isShuttingDown) {
      console.log('⏳ Shutdown already in progress...')
      return
    }

    this.isShuttingDown = true
    console.log('🛑 Starting graceful shutdown...')

    try {
      // Stop processing new jobs
      jobQueueProcessor.stopProcessing()
      console.log('✅ Stopped job queue processing')

      // Stop statistics logging
      if (this.statsInterval) {
        clearInterval(this.statsInterval)
        this.statsInterval = null
        console.log('✅ Stopped statistics logging')
      }

      // Wait a moment for current operations to complete
      await new Promise((resolve) => setTimeout(resolve, 2000))

      console.log('✅ Background worker shutdown complete')
      console.log('📅 Shutdown at:', new Date().toISOString())
    } catch (error) {
      console.error('❌ Error during shutdown:', error)
    }

    process.exit(0)
  }
}

/**
 * CLI interface for the background worker
 */
async function main() {
  const args = process.argv.slice(2)

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🚀 ListingBoost Background Worker

Usage:
  npm run worker              Start the background worker
  npm run worker:dev          Start in development mode
  npm run worker -- --stats   Show queue statistics and exit
  npm run worker -- --help    Show this help message

Environment Variables:
  NEXT_PUBLIC_SUPABASE_URL    Supabase project URL (required)
  SUPABASE_SERVICE_ROLE_KEY   Supabase service role key (required)
  APIFY_API_TOKEN            Apify API token (optional, enables real scraping)
  GOOGLE_GEMINI_API_KEY      Google Gemini API key (optional, enhances analysis)

Examples:
  # Start worker in production
  NODE_ENV=production npm run worker

  # Start worker with debug logging
  DEBUG=* npm run worker

  # Check queue statistics
  npm run worker -- --stats
    `)
    process.exit(0)
  }

  if (args.includes('--stats')) {
    console.log('📊 Fetching queue statistics...')
    try {
      const stats = await analysisJobManager.getQueueStats()
      console.log('📈 Queue Statistics:', {
        pending: stats.pending,
        running: stats.running,
        completed: stats.completed,
        failed: stats.failed,
        totalToday: stats.totalToday,
      })
    } catch (error) {
      console.error('❌ Failed to fetch statistics:', error)
      process.exit(1)
    }
    process.exit(0)
  }

  // Start the worker
  const worker = new BackgroundWorker()
  await worker.start()
}

// Run the worker if this file is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Worker startup failed:', error)
    process.exit(1)
  })
}

export { BackgroundWorker }
