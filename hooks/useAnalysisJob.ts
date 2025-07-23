/**
 * @file hooks/useAnalysisJob.ts
 * @description React hook for managing async analysis jobs with real-time progress
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo ARCHITECTURE-001-06: Frontend job management hook
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import type {
  JobStatusResponse,
  JobCreateResponse,
} from '@/lib/types/analysis-jobs'

interface UseAnalysisJobOptions {
  autoStart?: boolean
  onComplete?: (results: any) => void
  onError?: (error: string) => void
  pollIntervalMs?: number
}

interface UseAnalysisJobReturn {
  // Job state
  jobId: string | null
  status: JobStatusResponse['status'] | null
  progress: number
  currentStep: string | null
  stepDescription: string | null

  // Results
  results: any | null
  error: string | null
  isLoading: boolean

  // Timing
  elapsedMs: number | null
  estimatedTimeRemainingMs: number | null

  // Actions
  startJob: (url: string, token: string) => Promise<void>
  cancelJob: () => Promise<void>
  reset: () => void

  // Status checks
  isPending: boolean
  isRunning: boolean
  isCompleted: boolean
  isFailed: boolean
}

/**
 * Hook for managing async analysis jobs with real-time progress updates
 */
export function useAnalysisJob(
  options: UseAnalysisJobOptions = {}
): UseAnalysisJobReturn {
  const {
    autoStart = false,
    onComplete,
    onError,
    pollIntervalMs = 2000,
  } = options

  // State
  const [jobId, setJobId] = useState<string | null>(null)
  const [status, setStatus] = useState<JobStatusResponse['status'] | null>(null)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState<string | null>(null)
  const [stepDescription, setStepDescription] = useState<string | null>(null)
  const [results, setResults] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [elapsedMs, setElapsedMs] = useState<number | null>(null)
  const [estimatedTimeRemainingMs, setEstimatedTimeRemainingMs] = useState<
    number | null
  >(null)

  // Refs for cleanup
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  /**
   * Start a new analysis job
   */
  const startJob = useCallback(
    async (url: string, token: string) => {
      console.log('[useAnalysisJob] Starting job for URL:', url)

      try {
        setIsLoading(true)
        setError(null)
        setResults(null)

        // Cancel any existing requests
        if (abortControllerRef.current) {
          abortControllerRef.current.abort()
        }

        abortControllerRef.current = new AbortController()

        const response = await fetch('/api/jobs/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url, token }),
          signal: abortControllerRef.current.signal,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to create job')
        }

        const data: { success: boolean; data: JobCreateResponse } =
          await response.json()

        if (!data.success) {
          throw new Error('Job creation failed')
        }

        const { jobId: newJobId } = data.data
        setJobId(newJobId)
        setStatus('pending')
        setProgress(0)

        console.log('[useAnalysisJob] ✅ Job created:', newJobId)

        // Start polling for status
        startPolling(newJobId)
      } catch (error) {
        console.error('[useAnalysisJob] Failed to start job:', error)
        const errorMessage =
          (error as Error).message || 'Failed to start analysis'
        setError(errorMessage)
        onError?.(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [onError, pollIntervalMs]
  )

  /**
   * Cancel the current job
   */
  const cancelJob = useCallback(async () => {
    if (!jobId) return

    try {
      console.log('[useAnalysisJob] Cancelling job:', jobId)

      const response = await fetch(`/api/jobs/status/${jobId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to cancel job')
      }

      stopPolling()
      setStatus('failed')
      setError('Analysis cancelled')
    } catch (error) {
      console.error('[useAnalysisJob] Failed to cancel job:', error)
      setError('Failed to cancel analysis')
    }
  }, [jobId])

  /**
   * Reset the hook state
   */
  const reset = useCallback(() => {
    console.log('[useAnalysisJob] Resetting state')

    stopPolling()

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    setJobId(null)
    setStatus(null)
    setProgress(0)
    setCurrentStep(null)
    setStepDescription(null)
    setResults(null)
    setError(null)
    setIsLoading(false)
    setElapsedMs(null)
    setEstimatedTimeRemainingMs(null)
  }, [])

  /**
   * Start polling for job status
   */
  const startPolling = useCallback(
    (targetJobId: string) => {
      console.log('[useAnalysisJob] Starting status polling for:', targetJobId)

      stopPolling() // Clear any existing interval

      const poll = async () => {
        try {
          const response = await fetch(`/api/jobs/status/${targetJobId}`)

          if (!response.ok) {
            if (response.status === 404) {
              setError('Job not found')
              stopPolling()
              return
            }
            throw new Error('Failed to get job status')
          }

          const data: { success: boolean; data: JobStatusResponse } =
            await response.json()

          if (!data.success) {
            throw new Error('Status check failed')
          }

          const jobStatus = data.data

          // Update state
          setStatus(jobStatus.status)
          setProgress(jobStatus.progress)
          setCurrentStep(jobStatus.currentStep || null)
          setStepDescription(jobStatus.stepDescription || null)
          setElapsedMs(jobStatus.timing?.elapsedMs || null)
          setEstimatedTimeRemainingMs(
            jobStatus.timing?.estimatedTimeRemainingMs || null
          )

          // Handle completion
          if (jobStatus.status === 'completed') {
            console.log('[useAnalysisJob] ✅ Job completed:', targetJobId)
            stopPolling()
            setResults(jobStatus.results)
            onComplete?.(jobStatus.results)
          }

          // Handle failure
          else if (jobStatus.status === 'failed') {
            console.log('[useAnalysisJob] ❌ Job failed:', targetJobId)
            stopPolling()
            const errorMessage = jobStatus.error?.message || 'Analysis failed'
            setError(errorMessage)
            onError?.(errorMessage)
          }
        } catch (error) {
          console.error('[useAnalysisJob] Polling error:', error)
          setError('Connection error while checking status')
          stopPolling()
        }
      }

      // Initial poll
      poll()

      // Set up polling interval
      pollIntervalRef.current = setInterval(poll, pollIntervalMs)
    },
    [onComplete, onError, pollIntervalMs]
  )

  /**
   * Stop polling for job status
   */
  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling()
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [stopPolling])

  // Derived state for convenience
  const isPending = status === 'pending'
  const isRunning = status === 'running'
  const isCompleted = status === 'completed'
  const isFailed = status === 'failed'

  return {
    // Job state
    jobId,
    status,
    progress,
    currentStep,
    stepDescription,

    // Results
    results,
    error,
    isLoading,

    // Timing
    elapsedMs,
    estimatedTimeRemainingMs,

    // Actions
    startJob,
    cancelJob,
    reset,

    // Status checks
    isPending,
    isRunning,
    isCompleted,
    isFailed,
  }
}
