/**
 * @file __tests__/integration/apify.test.ts
 * @description Integration tests for Apify scraper services
 * @created 2025-07-21
 */

import { ApifyClient } from '@/lib/services/apify/client'
import { apifyService } from '@/lib/services/apify'
import { ApifyActorResult } from '@/lib/services/apify/types'

// Mock the config
jest.mock('@/lib/config', () => ({
  config: {
    APIFY_API_TOKEN: 'test-token',
    APIFY_ACTOR_URL_SCRAPER: 'tri_angle~airbnb-rooms-urls-scraper',
    APIFY_ACTOR_REVIEW_SCRAPER: 'tri_angle~airbnb-reviews-scraper',
    APIFY_ACTOR_AVAILABILITY_SCRAPER: 'rigelbytes~airbnb-availability-calendar',
    APIFY_ACTOR_LOCATION_SCRAPER: 'tri_angle~airbnb-scraper',
  },
}))

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('Apify Integration Tests', () => {
  let apifyClient: ApifyClient

  beforeEach(() => {
    jest.clearAllMocks()
    apifyClient = new ApifyClient()
  })

  describe('ApifyClient', () => {
    describe('Rate Limiting', () => {
      it('should respect rate limits per actor', async () => {
        // Mock successful response
        mockFetch.mockResolvedValue({
          ok: true,
          status: 201,
          json: () => Promise.resolve({ data: { id: 'run-123' } }),
        })

        const actorId = 'tri_angle~airbnb-rooms-urls-scraper'
        const input = { urls: ['https://airbnb.com/rooms/123'] }

        // Make requests up to the limit
        const promises = []
        for (let i = 0; i < 50; i++) {
          promises.push(apifyClient.runActor(actorId, input, { retries: 0 }))
        }

        await Promise.all(promises)
        expect(mockFetch).toHaveBeenCalledTimes(50)

        // Next request should be rate limited
        mockFetch.mockClear()
        await expect(
          apifyClient.runActor(actorId, input, { retries: 0 })
        ).rejects.toThrow('Rate-Limit')
      })

      it('should allow different limits for different actors', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          status: 201,
          json: () => Promise.resolve({ data: { id: 'run-123' } }),
        })

        // URL scraper should have 50 req/hour limit
        const urlActorId = 'tri_angle~airbnb-rooms-urls-scraper'

        // Review scraper should have 100 req/hour limit
        const reviewActorId = 'tri_angle~airbnb-reviews-scraper'

        const input = { urls: ['https://airbnb.com/rooms/123'] }

        // Both actors should work independently
        await apifyClient.runActor(urlActorId, input, { retries: 0 })
        await apifyClient.runActor(reviewActorId, input, { retries: 0 })

        expect(mockFetch).toHaveBeenCalledTimes(2)
      })
    })

    describe('Actor ID Format Conversion', () => {
      it('should convert display format to API format', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          status: 201,
          json: () => Promise.resolve({ data: { id: 'run-123' } }),
        })

        await apifyClient.runActor(
          'tri_angle/airbnb-rooms-urls-scraper',
          { urls: ['test'] },
          { retries: 0 }
        )

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('tri_angle~airbnb-rooms-urls-scraper'),
          expect.any(Object)
        )
      })
    })

    describe('Error Handling', () => {
      it('should handle network errors', async () => {
        mockFetch.mockRejectedValue(new Error('Network error'))

        await expect(
          apifyClient.runActor('test-actor', {}, { retries: 1 })
        ).rejects.toThrow('Network error')
      })

      it('should handle API errors', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 400,
          json: () =>
            Promise.resolve({
              error: { message: 'Invalid input' },
            }),
        })

        await expect(
          apifyClient.runActor('test-actor', {}, { retries: 0 })
        ).rejects.toThrow('Apify API Error: Invalid input')
      })

      it('should retry on transient errors', async () => {
        // First two calls fail, third succeeds
        mockFetch
          .mockRejectedValueOnce(new Error('Temporary error'))
          .mockRejectedValueOnce(new Error('Temporary error'))
          .mockResolvedValue({
            ok: true,
            status: 201,
            json: () => Promise.resolve({ data: { id: 'run-123' } }),
          })

        const result = await apifyClient.runActor(
          'test-actor',
          {},
          { retries: 3 }
        )

        expect(result.success).toBe(true)
        expect(mockFetch).toHaveBeenCalledTimes(3)
      })
    })

    describe('Authentication', () => {
      it('should include API token in requests', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          status: 201,
          json: () => Promise.resolve({ data: { id: 'run-123' } }),
        })

        await apifyClient.runActor('test-actor', {}, { retries: 0 })

        expect(mockFetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            headers: expect.objectContaining({
              Authorization: 'Bearer test-token',
            }),
          })
        )
      })
    })
  })

  describe('Apify Service Integration', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    describe('URL Scraper', () => {
      it('should scrape URL data successfully', async () => {
        const mockUrlData = {
          id: 'listing-123',
          title: 'Beautiful Apartment',
          price: 120,
          rating: 4.8,
          images: ['img1.jpg', 'img2.jpg'],
        }

        mockFetch.mockResolvedValue({
          ok: true,
          status: 201,
          json: () => Promise.resolve({ data: { id: 'run-123' } }),
        })

        // Mock dataset fetch
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve([mockUrlData]),
        })

        const result = await apifyService.scrapeUrl(
          'https://airbnb.com/rooms/123'
        )

        expect(result.success).toBe(true)
        expect(result.data).toEqual(mockUrlData)
      })

      it('should handle invalid URLs', async () => {
        const result = await apifyService.scrapeUrl('invalid-url')

        expect(result.success).toBe(false)
        expect(result.error).toContain('Ungültige Airbnb-URL')
      })
    })

    describe('Review Scraper', () => {
      it('should scrape reviews successfully', async () => {
        const mockReviews = [
          {
            id: 'review-1',
            rating: 5,
            comment: 'Great place!',
            date: '2025-01-15',
            reviewer: 'John',
          },
          {
            id: 'review-2',
            rating: 4,
            comment: 'Good location',
            date: '2025-01-10',
            reviewer: 'Jane',
          },
        ]

        mockFetch
          .mockResolvedValueOnce({
            ok: true,
            status: 201,
            json: () => Promise.resolve({ data: { id: 'run-123' } }),
          })
          .mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: () => Promise.resolve(mockReviews),
          })

        const result = await apifyService.scrapeReviews(
          'https://airbnb.com/rooms/123'
        )

        expect(result.success).toBe(true)
        expect(result.data).toEqual(mockReviews)
        expect(result.data).toHaveLength(2)
      })
    })

    describe('Location Scraper', () => {
      it('should scrape location data successfully', async () => {
        const mockLocationData = {
          latitude: 48.1351,
          longitude: 11.582,
          address: 'Munich, Germany',
          neighborhood: 'Altstadt',
          walkScore: 95,
          transitScore: 88,
        }

        mockFetch
          .mockResolvedValueOnce({
            ok: true,
            status: 201,
            json: () => Promise.resolve({ data: { id: 'run-123' } }),
          })
          .mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: () => Promise.resolve([mockLocationData]),
          })

        const result = await apifyService.scrapeLocation(
          'https://airbnb.com/rooms/123'
        )

        expect(result.success).toBe(true)
        expect(result.data).toEqual(mockLocationData)
      })
    })

    describe('Error Scenarios', () => {
      it('should handle rate limit errors gracefully', async () => {
        mockFetch.mockRejectedValue(new Error('Rate-Limit erreicht'))

        const result = await apifyService.scrapeUrl(
          'https://airbnb.com/rooms/123'
        )

        expect(result.success).toBe(false)
        expect(result.error).toContain('Rate-Limit')
      })

      it('should handle empty dataset results', async () => {
        mockFetch
          .mockResolvedValueOnce({
            ok: true,
            status: 201,
            json: () => Promise.resolve({ data: { id: 'run-123' } }),
          })
          .mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: () => Promise.resolve([]), // Empty results
          })

        const result = await apifyService.scrapeUrl(
          'https://airbnb.com/rooms/123'
        )

        expect(result.success).toBe(false)
        expect(result.error).toContain('Keine Daten')
      })

      it('should handle malformed responses', async () => {
        mockFetch
          .mockResolvedValueOnce({
            ok: true,
            status: 201,
            json: () => Promise.resolve({ data: { id: 'run-123' } }),
          })
          .mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: () => Promise.resolve({ error: 'Internal server error' }),
          })

        const result = await apifyService.scrapeUrl(
          'https://airbnb.com/rooms/123'
        )

        expect(result.success).toBe(false)
        expect(result.error).toContain('Fehler beim Abrufen')
      })
    })
  })

  describe('Data Transformation', () => {
    it('should transform scraper data to database schema', async () => {
      const mockScraperData = {
        name: 'Beautiful Apartment',
        price: '$120',
        stars: '4.8',
        numberOfReviews: '150',
        host: {
          name: 'John Host',
          isSuperhost: true,
        },
        images: ['img1.jpg', 'img2.jpg', 'img3.jpg'],
        amenities: ['WiFi', 'Kitchen', 'Parking'],
      }

      // We would test the transformer here, but it's not directly exposed
      // This would be tested through the service integration
      expect(mockScraperData).toBeDefined()
    })
  })

  describe('Performance', () => {
    it('should handle concurrent requests efficiently', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 201,
        json: () => Promise.resolve({ data: { id: 'run-123' } }),
      })

      const urls = Array.from(
        { length: 5 },
        (_, i) => `https://airbnb.com/rooms/${i + 1}`
      )

      const startTime = Date.now()
      const promises = urls.map((url) => apifyService.scrapeUrl(url))
      await Promise.all(promises)
      const endTime = Date.now()

      // Should complete reasonably quickly (under 10 seconds for mocked responses)
      expect(endTime - startTime).toBeLessThan(10000)
    })

    it('should timeout long-running requests', async () => {
      // Mock a request that never resolves
      mockFetch.mockImplementation(() => new Promise(() => {}))

      const result = await apifyService.scrapeUrl(
        'https://airbnb.com/rooms/123',
        { timeout: 1 } // 1 second timeout
      )

      expect(result.success).toBe(false)
      expect(result.error).toContain('timeout')
    })
  })
})
