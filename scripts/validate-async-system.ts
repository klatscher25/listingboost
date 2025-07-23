#!/usr/bin/env tsx
/**
 * @file scripts/validate-async-system.ts
 * @description Validation script for the background job system
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo ARCHITECTURE-001-07: System validation script
 */

import { config } from 'dotenv'
import { analysisJobManager } from '@/lib/services/jobs/analysis-job-manager'
import { validateJobData } from '@/lib/services/jobs/queue-processor'

// Load environment variables
config({ path: '.env.local' })

interface ValidationResult {
  component: string
  status: 'pass' | 'fail' | 'warning'
  message: string
  details?: any
}

/**
 * Comprehensive validation of the background job system
 */
class AsyncSystemValidator {
  private results: ValidationResult[] = []

  /**
   * Run all validation tests
   */
  async validate(): Promise<void> {
    console.log('🧪 ListingBoost Background Job System Validation')
    console.log('='.repeat(60))
    console.log()

    await this.validateEnvironment()
    await this.validateDatabase()
    await this.validateJobManager()
    await this.validateApiEndpoints()
    this.validateFileStructure()

    this.generateReport()
  }

  /**
   * Validate environment configuration
   */
  private async validateEnvironment(): Promise<void> {
    console.log('📋 Environment Configuration')
    console.log('-'.repeat(30))

    // Required environment variables
    const required = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']

    for (const key of required) {
      if (process.env[key]) {
        this.addResult('Environment', 'pass', `${key} is configured`)
      } else {
        this.addResult('Environment', 'fail', `${key} is missing`)
      }
    }

    // Optional but recommended
    const optional = ['APIFY_API_TOKEN', 'GOOGLE_GEMINI_API_KEY']

    for (const key of optional) {
      if (process.env[key] && process.env[key] !== 'placeholder_apify_token') {
        this.addResult('Environment', 'pass', `${key} is configured`)
      } else {
        this.addResult(
          'Environment',
          'warning',
          `${key} not configured (will use fallback)`
        )
      }
    }

    console.log()
  }

  /**
   * Validate database connectivity and schema
   */
  private async validateDatabase(): Promise<void> {
    console.log('🗄️  Database Schema & Connectivity')
    console.log('-'.repeat(30))

    try {
      // Test basic connectivity by getting queue stats
      const stats = await analysisJobManager.getQueueStats()
      this.addResult('Database', 'pass', 'Connection successful')
      this.addResult(
        'Database',
        'pass',
        `Queue stats: ${JSON.stringify(stats)}`
      )
    } catch (error) {
      this.addResult(
        'Database',
        'fail',
        `Connection failed: ${(error as Error).message}`
      )
    }

    console.log()
  }

  /**
   * Validate job manager functionality
   */
  private async validateJobManager(): Promise<void> {
    console.log('⚙️  Job Manager')
    console.log('-'.repeat(30))

    try {
      // Test job data validation
      const validJob = {
        token: 'freemium_test_token_1234567890',
        url: 'https://www.airbnb.com/rooms/123456789',
      }

      const validation = validateJobData(validJob)
      if (validation.valid) {
        this.addResult('JobManager', 'pass', 'Job validation works correctly')
      } else {
        this.addResult(
          'JobManager',
          'fail',
          `Job validation failed: ${validation.errors.join(', ')}`
        )
      }

      // Test invalid job data
      const invalidJob = {
        token: 'short',
        url: 'not-an-airbnb-url',
      }

      const invalidValidation = validateJobData(invalidJob)
      if (!invalidValidation.valid && invalidValidation.errors.length > 0) {
        this.addResult(
          'JobManager',
          'pass',
          'Invalid job detection works correctly'
        )
      } else {
        this.addResult('JobManager', 'fail', 'Invalid job detection failed')
      }
    } catch (error) {
      this.addResult(
        'JobManager',
        'fail',
        `Job manager test failed: ${(error as Error).message}`
      )
    }

    console.log()
  }

  /**
   * Validate API endpoints
   */
  private async validateApiEndpoints(): Promise<void> {
    console.log('🌐 API Endpoints')
    console.log('-'.repeat(30))

    // Check if Next.js server is running
    try {
      const response = await fetch('http://localhost:3000/api/jobs/process', {
        method: 'GET',
      }).catch(() => null)

      if (response) {
        this.addResult('API', 'pass', 'Next.js server is accessible')
      } else {
        this.addResult(
          'API',
          'warning',
          'Next.js server not running (start with npm run dev)'
        )
      }
    } catch (error) {
      this.addResult(
        'API',
        'warning',
        'Cannot test API endpoints - server not running'
      )
    }

    console.log()
  }

  /**
   * Validate file structure and compliance
   */
  private validateFileStructure(): void {
    console.log('📁 File Structure & Compliance')
    console.log('-'.repeat(30))

    const requiredFiles = [
      // Database migration
      'supabase/migrations/20250723_001_analysis_jobs.sql',

      // Core services
      'lib/types/analysis-jobs.ts',
      'lib/services/jobs/analysis-job-manager.ts',
      'lib/services/jobs/queue-processor.ts',

      // API endpoints
      'app/api/jobs/analyze/route.ts',
      'app/api/jobs/status/[jobId]/route.ts',
      'app/api/jobs/process/route.ts',

      // Frontend components
      'hooks/useAnalysisJob.ts',
      'components/jobs/AnalysisProgress.tsx',
      'components/freemium/AsyncFreemiumAnalyze.tsx',

      // Background worker
      'scripts/background-worker.ts',
    ]

    for (const file of requiredFiles) {
      try {
        const fs = require('fs')
        if (fs.existsSync(file)) {
          this.addResult('FileStructure', 'pass', `${file} exists`)
        } else {
          this.addResult('FileStructure', 'fail', `${file} missing`)
        }
      } catch (error) {
        this.addResult('FileStructure', 'fail', `Cannot check ${file}`)
      }
    }

    console.log()
  }

  /**
   * Add validation result
   */
  private addResult(
    component: string,
    status: 'pass' | 'fail' | 'warning',
    message: string,
    details?: any
  ): void {
    this.results.push({ component, status, message, details })

    const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️'
    console.log(`${icon} ${message}`)
  }

  /**
   * Generate final validation report
   */
  private generateReport(): void {
    console.log('📊 Validation Summary')
    console.log('='.repeat(60))

    const passed = this.results.filter((r) => r.status === 'pass').length
    const failed = this.results.filter((r) => r.status === 'fail').length
    const warnings = this.results.filter((r) => r.status === 'warning').length
    const total = this.results.length

    console.log(`✅ Passed: ${passed}/${total}`)
    console.log(`❌ Failed: ${failed}/${total}`)
    console.log(`⚠️  Warnings: ${warnings}/${total}`)
    console.log()

    if (failed === 0) {
      console.log('🎉 Background Job System Validation PASSED!')
      console.log('✨ System is ready for production deployment')
    } else {
      console.log('🚨 Background Job System Validation FAILED!')
      console.log('❗ Please fix the failed items before deploying')
    }

    console.log()
    console.log('🚀 Next Steps:')
    console.log('1. Run the database migration: supabase db reset')
    console.log('2. Start the background worker: npm run worker')
    console.log('3. Test the async flow in development')
    console.log('4. Deploy to production environment')
    console.log()

    process.exit(failed > 0 ? 1 : 0)
  }
}

/**
 * Main validation function
 */
async function main() {
  const validator = new AsyncSystemValidator()
  await validator.validate()
}

// Run validation if this script is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Validation failed:', error)
    process.exit(1)
  })
}

export { AsyncSystemValidator }
