/**
 * @file __tests__/api/analyze.test.ts
 * @description Comprehensive tests for the analyze API endpoint
 * @created 2025-07-21
 */

import { NextRequest } from 'next/server'
import { POST } from '@/app/api/analyze/route'

// Mock dependencies
jest.mock('@/lib/supabase')
jest.mock('@/lib/services/apify')
jest.mock('@/lib/services/enhanced-analysis')
jest.mock('@/lib/utils/logger')

const mockEnhancedAnalysisService = {
  analyzeQuick: jest.fn(),
  analyzeComprehensive: jest.fn(),
}

const mockLogger = {
  logInfo: jest.fn(),
  logApiError: jest.fn(),
}

require('@/lib/services/enhanced-analysis').enhancedAnalysisService =
  mockEnhancedAnalysisService
require('@/lib/utils/logger').logInfo = mockLogger.logInfo
require('@/lib/utils/logger').logApiError = mockLogger.logApiError

describe('/api/analyze', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
    // Clear any existing timeouts
    jest.useRealTimers()
  })

  const createMockRequest = (body: any) => {
    return new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  describe('Input Validation', () => {
    it('should return 400 if airbnb_url is missing', async () => {
      const request = createMockRequest({})
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('MISSING_URL')
      expect(data.error.message).toBe('Airbnb-URL ist erforderlich')
    })

    it('should return 400 if airbnb_url is invalid', async () => {
      const request = createMockRequest({
        airbnb_url: 'https://invalid-url.com',
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('INVALID_URL')
      expect(data.error.message).toBe('Ungültige Airbnb-URL')
    })

    it('should accept valid Airbnb URLs', async () => {
      const validUrls = [
        'https://www.airbnb.com/rooms/123456',
        'https://airbnb.com/rooms/123456',
        'https://www.airbnb.de/rooms/123456',
        'https://airbnb.fr/rooms/123456',
        'https://www.airbnb.co.uk/rooms/123456',
      ]

      for (const url of validUrls) {
        const mockResult = {
          score: 750,
          processingInfo: { totalTime: 1500 },
        }
        mockEnhancedAnalysisService.analyzeComprehensive.mockResolvedValue(
          mockResult
        )

        const request = createMockRequest({ airbnb_url: url })
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data).toEqual(mockResult)
      }
    })
  })

  describe('Quick Analysis', () => {
    it('should perform quick analysis when analysis_type is quick', async () => {
      const mockResult = {
        score: 650,
        processingInfo: { totalTime: 800 },
      }
      mockEnhancedAnalysisService.analyzeQuick.mockResolvedValue(mockResult)

      const request = createMockRequest({
        airbnb_url: 'https://www.airbnb.com/rooms/123456',
        analysis_type: 'quick',
        enable_ai: true,
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockResult)
      expect(data.meta.analysis_type).toBe('quick')
      expect(data.meta.ai_enabled).toBe(true)

      expect(mockEnhancedAnalysisService.analyzeQuick).toHaveBeenCalledWith(
        'https://www.airbnb.com/rooms/123456',
        '00000000-0000-0000-0000-000000000000',
        true
      )
    })

    it('should disable AI when enable_ai is false', async () => {
      const mockResult = {
        score: 600,
        processingInfo: { totalTime: 600 },
      }
      mockEnhancedAnalysisService.analyzeQuick.mockResolvedValue(mockResult)

      const request = createMockRequest({
        airbnb_url: 'https://www.airbnb.com/rooms/123456',
        analysis_type: 'quick',
        enable_ai: false,
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.meta.ai_enabled).toBe(false)
      expect(data.meta.ai_analysis_type).toBeUndefined()

      expect(mockEnhancedAnalysisService.analyzeQuick).toHaveBeenCalledWith(
        'https://www.airbnb.com/rooms/123456',
        '00000000-0000-0000-0000-000000000000',
        false
      )
    })
  })

  describe('Comprehensive Analysis', () => {
    it('should perform comprehensive analysis by default', async () => {
      const mockResult = {
        score: 850,
        processingInfo: { totalTime: 3000 },
        aiAnalysis: { insights: ['Great listing!'] },
      }
      mockEnhancedAnalysisService.analyzeComprehensive.mockResolvedValue(
        mockResult
      )

      const request = createMockRequest({
        airbnb_url: 'https://www.airbnb.com/rooms/123456',
        force_update: true,
        ai_analysis_type: 'detailed',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockResult)
      expect(data.meta.analysis_type).toBe('comprehensive')
      expect(data.meta.ai_analysis_type).toBe('detailed')

      expect(
        mockEnhancedAnalysisService.analyzeComprehensive
      ).toHaveBeenCalledWith(
        'https://www.airbnb.com/rooms/123456',
        '00000000-0000-0000-0000-000000000000',
        {
          includeReviews: true,
          includeAvailability: false,
          includeCompetitors: true,
          forceUpdate: true,
          enableAI: true,
          aiAnalysisType: 'detailed',
        }
      )
    })
  })

  describe('Error Handling', () => {
    it('should handle rate limit errors', async () => {
      const rateLimitError = new Error('Rate-Limit erreicht für Apify-Service')
      mockEnhancedAnalysisService.analyzeComprehensive.mockRejectedValue(
        rateLimitError
      )

      const request = createMockRequest({
        airbnb_url: 'https://www.airbnb.com/rooms/123456',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('RATE_LIMIT_EXCEEDED')
      expect(data.error.message).toBe('Rate-Limit erreicht für Apify-Service')
    })

    it('should handle scraping errors', async () => {
      const scrapingError = new Error('Scraping failed')
      mockEnhancedAnalysisService.analyzeComprehensive.mockRejectedValue(
        scrapingError
      )

      const request = createMockRequest({
        airbnb_url: 'https://www.airbnb.com/rooms/123456',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('SCRAPING_ERROR')
      expect(data.error.message).toBe('Fehler beim Analysieren des Listings')
      expect(data.error.details).toBe('Scraping failed')
    })

    it('should handle unexpected errors', async () => {
      // Mock JSON parsing to throw error
      const request = {
        json: () => {
          throw new Error('Invalid JSON')
        },
      } as NextRequest

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('INTERNAL_ERROR')
      expect(data.error.message).toBe('Ein unerwarteter Fehler ist aufgetreten')
    })
  })

  describe('API Timeout', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should timeout after 90 seconds', async () => {
      // Mock a long-running analysis
      const longRunningPromise = new Promise((resolve) => {
        setTimeout(() => {
          resolve({ score: 750, processingInfo: { totalTime: 95000 } })
        }, 95000) // 95 seconds
      })
      mockEnhancedAnalysisService.analyzeComprehensive.mockReturnValue(
        longRunningPromise
      )

      const request = createMockRequest({
        airbnb_url: 'https://www.airbnb.com/rooms/123456',
      })

      const responsePromise = POST(request)

      // Fast-forward time to trigger timeout
      jest.advanceTimersByTime(90001)

      const response = await responsePromise
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('SCRAPING_ERROR')
      expect(data.error.details).toContain(
        'API timeout nach 90 Sekunden erreicht'
      )
    })
  })

  describe('Response Format', () => {
    it('should return correctly formatted success response', async () => {
      const mockResult = {
        score: 750,
        processingInfo: { totalTime: 2500 },
        categoryScores: {
          visual_presentation: 85,
          content_optimization: 78,
        },
      }
      mockEnhancedAnalysisService.analyzeComprehensive.mockResolvedValue(
        mockResult
      )

      const request = createMockRequest({
        airbnb_url: 'https://www.airbnb.com/rooms/123456',
        analysis_type: 'comprehensive',
        enable_ai: true,
        ai_analysis_type: 'full',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toMatchObject({
        success: true,
        data: mockResult,
        meta: {
          timestamp: expect.any(String),
          version: '3.0.0',
          analysis_type: 'comprehensive',
          ai_enabled: true,
          ai_analysis_type: 'full',
          data_source: 'enhanced_analysis',
          processing_time: 2500,
        },
      })
    })
  })

  describe('Default Parameters', () => {
    it('should use default parameters when not specified', async () => {
      const mockResult = {
        score: 700,
        processingInfo: { totalTime: 2000 },
      }
      mockEnhancedAnalysisService.analyzeComprehensive.mockResolvedValue(
        mockResult
      )

      const request = createMockRequest({
        airbnb_url: 'https://www.airbnb.com/rooms/123456',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.meta.analysis_type).toBe('comprehensive')
      expect(data.meta.ai_enabled).toBe(true)
      expect(data.meta.ai_analysis_type).toBe('full')

      expect(
        mockEnhancedAnalysisService.analyzeComprehensive
      ).toHaveBeenCalledWith(
        'https://www.airbnb.com/rooms/123456',
        '00000000-0000-0000-0000-000000000000',
        {
          includeReviews: true,
          includeAvailability: false,
          includeCompetitors: true,
          forceUpdate: false,
          enableAI: true,
          aiAnalysisType: 'full',
        }
      )
    })
  })
})
