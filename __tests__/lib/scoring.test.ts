/**
 * @file __tests__/lib/scoring.test.ts
 * @description Comprehensive tests for the 1000-point scoring system
 * @created 2025-07-21
 */

import {
  calculateListingScore,
  ScoringResult,
  CategoryScore,
} from '@/lib/scoring'
import { Database } from '@/types/database'

// Mock the category calculation functions
jest.mock('@/lib/scoring/categories', () => ({
  calculateHostPerformanceScore: jest.fn(),
  calculateGuestSatisfactionScore: jest.fn(),
  calculateContentOptimizationScore: jest.fn(),
  calculateVisualPresentationScore: jest.fn(),
  calculatePropertyFeaturesScore: jest.fn(),
  calculatePricingStrategyScore: jest.fn(),
  calculateAvailabilityBookingScore: jest.fn(),
  calculateLocationMarketScore: jest.fn(),
  calculateBusinessPerformanceScore: jest.fn(),
  calculateTrustSafetyScore: jest.fn(),
}))

// Mock the logger
jest.mock('@/lib/utils/logger', () => ({
  logApiError: jest.fn(),
}))

const mockCategories = require('@/lib/scoring/categories')

type ListingData = Database['public']['Tables']['listings']['Row']

describe('Scoring System', () => {
  const mockListingData: ListingData = {
    id: 'listing-123',
    airbnb_id: 'airbnb-123',
    title: 'Beautiful Test Apartment',
    description: 'A wonderful place to stay in the heart of the city',
    overall_rating: 4.8,
    reviews_count: 150,
    host_is_superhost: true,
    host_response_rate: 95,
    host_response_time: '1 hour',
    price_per_night: 120,
    images_count: 25,
    amenities: JSON.stringify(['WiFi', 'Kitchen', 'Washer']),
    minimum_stay: 2,
    location: 'Munich, Germany',
    property_type: 'Entire apartment',
    room_type: 'Entire home/apt',
    bedrooms: 2,
    bathrooms: 1,
    accommodates: 4,
    created_at: '2025-07-20T12:00:00Z',
    updated_at: '2025-07-21T12:00:00Z',
    user_id: 'user-123',
    airbnb_url: 'https://airbnb.com/rooms/123',
    latitude: 48.1351,
    longitude: 11.582,
    host_name: 'Test Host',
    host_since: '2020-01-01',
    host_profile_pic: 'https://example.com/host.jpg',
    instant_book_enabled: true,
    cancellation_policy: 'moderate',
    check_in_time: '15:00',
    check_out_time: '11:00',
    house_rules: 'No smoking, No parties',
    security_deposit: 100,
    cleaning_fee: 30,
    extra_guest_fee: 15,
    weekly_discount: 10,
    monthly_discount: 20,
    status: 'active',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const createMockCategoryScore = (
    score: number,
    maxScore: number,
    subcategories: any = {}
  ): CategoryScore => ({
    score,
    maxScore,
    percentage: Math.round((score / maxScore) * 100),
    subcategories,
  })

  describe('calculateListingScore', () => {
    it('should calculate a perfect score when all categories are at maximum', async () => {
      // Mock all categories returning maximum scores
      const perfectCategoryScore = createMockCategoryScore(100, 100)

      Object.values(mockCategories).forEach((mockFn: jest.Mock) => {
        mockFn.mockResolvedValue(perfectCategoryScore)
      })

      const result = await calculateListingScore(mockListingData)

      expect(result.totalScore).toBe(1000)
      expect(result.maxScore).toBe(1000)
      expect(result.percentage).toBe(100)
      expect(result.performanceLevel).toBe('Elite Performer (Top 1%)')
      expect(result.recommendations).toHaveLength(0) // No recommendations for perfect score
    })

    it('should calculate scores for different performance levels', async () => {
      const testCases = [
        { score: 950, expectedLevel: 'Elite Performer (Top 1%)' },
        { score: 850, expectedLevel: 'High Performer (Top 5%)' },
        { score: 750, expectedLevel: 'Good Performer (Top 20%)' },
        { score: 650, expectedLevel: 'Average Performer' },
        { score: 550, expectedLevel: 'Below Average' },
        { score: 450, expectedLevel: 'Poor Performer' },
      ]

      for (const testCase of testCases) {
        const categoryScore = createMockCategoryScore(testCase.score / 10, 100)

        Object.values(mockCategories).forEach((mockFn: jest.Mock) => {
          mockFn.mockResolvedValue(categoryScore)
        })

        const result = await calculateListingScore(mockListingData)

        expect(result.totalScore).toBe(testCase.score)
        expect(result.performanceLevel).toBe(testCase.expectedLevel)
        expect(result.percentage).toBe(testCase.score / 10)
      }
    })

    it('should include all 10 categories in the result', async () => {
      const mockCategoryScore = createMockCategoryScore(75, 100)

      Object.values(mockCategories).forEach((mockFn: jest.Mock) => {
        mockFn.mockResolvedValue(mockCategoryScore)
      })

      const result = await calculateListingScore(mockListingData)

      expect(result.categoryScores).toHaveProperty('hostPerformance')
      expect(result.categoryScores).toHaveProperty('guestSatisfaction')
      expect(result.categoryScores).toHaveProperty('contentOptimization')
      expect(result.categoryScores).toHaveProperty('visualPresentation')
      expect(result.categoryScores).toHaveProperty('propertyFeatures')
      expect(result.categoryScores).toHaveProperty('pricingStrategy')
      expect(result.categoryScores).toHaveProperty('availabilityBooking')
      expect(result.categoryScores).toHaveProperty('locationMarket')
      expect(result.categoryScores).toHaveProperty('businessPerformance')
      expect(result.categoryScores).toHaveProperty('trustSafety')

      // Verify total is sum of all categories
      const expectedTotal = Object.values(result.categoryScores).reduce(
        (sum, category) => sum + category.score,
        0
      )
      expect(result.totalScore).toBe(expectedTotal)
    })

    it('should pass additional data to category calculators', async () => {
      const mockCategoryScore = createMockCategoryScore(80, 100)

      Object.values(mockCategories).forEach((mockFn: jest.Mock) => {
        mockFn.mockResolvedValue(mockCategoryScore)
      })

      const additionalData = {
        reviews: [{ rating: 5, comment: 'Great place!' }],
        availability: [{ date: '2025-08-01', available: true }],
        competitors: [{ price: 100, rating: 4.5 }],
        sentimentAnalysis: { positive: 0.8, negative: 0.1, neutral: 0.1 },
        selfReportData: { renovation_year: 2023 },
      }

      await calculateListingScore(mockListingData, additionalData)

      // Verify all category functions were called with additional data
      Object.values(mockCategories).forEach((mockFn: jest.Mock) => {
        expect(mockFn).toHaveBeenCalledWith(mockListingData, additionalData)
      })
    })

    it('should calculate data completeness correctly', async () => {
      const mockCategoryScore = createMockCategoryScore(75, 100)

      Object.values(mockCategories).forEach((mockFn: jest.Mock) => {
        mockFn.mockResolvedValue(mockCategoryScore)
      })

      const result = await calculateListingScore(mockListingData)

      // With all required fields filled, should be 100%
      expect(result.dataCompleteness).toBe(100)

      // Test with incomplete data
      const incompleteData = {
        ...mockListingData,
        description: null,
        host_response_rate: null,
        amenities: null,
      }

      const incompleteResult = await calculateListingScore(incompleteData)
      expect(incompleteResult.dataCompleteness).toBeLessThan(100)
    })

    it('should generate recommendations based on low scores', async () => {
      // Mock low scores for specific categories
      const lowHostPerformance = createMockCategoryScore(60, 100, {
        superhostStatus: { score: 0, maxScore: 20, reason: 'Not a superhost' },
      })
      const lowGuestSatisfaction = createMockCategoryScore(65, 100, {
        overallRating: { score: 30, maxScore: 40, reason: 'Rating below 4.5' },
      })
      const lowContentOptimization = createMockCategoryScore(55, 100, {
        titleOptimization: {
          score: 15,
          maxScore: 25,
          reason: 'Missing keywords',
        },
      })
      const lowVisualPresentation = createMockCategoryScore(60, 100, {
        photoCaptions: { score: 10, maxScore: 25, reason: 'No photo captions' },
      })
      const lowPricingStrategy = createMockCategoryScore(45, 100)
      const averageCategory = createMockCategoryScore(75, 100)

      mockCategories.calculateHostPerformanceScore.mockResolvedValue(
        lowHostPerformance
      )
      mockCategories.calculateGuestSatisfactionScore.mockResolvedValue(
        lowGuestSatisfaction
      )
      mockCategories.calculateContentOptimizationScore.mockResolvedValue(
        lowContentOptimization
      )
      mockCategories.calculateVisualPresentationScore.mockResolvedValue(
        lowVisualPresentation
      )
      mockCategories.calculatePricingStrategyScore.mockResolvedValue(
        lowPricingStrategy
      )

      // Other categories return average scores
      mockCategories.calculatePropertyFeaturesScore.mockResolvedValue(
        averageCategory
      )
      mockCategories.calculateAvailabilityBookingScore.mockResolvedValue(
        averageCategory
      )
      mockCategories.calculateLocationMarketScore.mockResolvedValue(
        averageCategory
      )
      mockCategories.calculateBusinessPerformanceScore.mockResolvedValue(
        averageCategory
      )
      mockCategories.calculateTrustSafetyScore.mockResolvedValue(
        averageCategory
      )

      const result = await calculateListingScore(mockListingData)

      expect(result.recommendations).toContain(
        'Verbessern Sie Ihre Host-Performance durch schnellere Antwortzeiten'
      )
      expect(result.recommendations).toContain(
        'Arbeiten Sie auf den Superhost-Status hin'
      )
      expect(result.recommendations).toContain(
        'Fokussieren Sie sich auf die Verbesserung der Gäste-Zufriedenheit'
      )
      expect(result.recommendations).toContain(
        'Verbessern Sie Ihre Gesamtbewertung durch besseren Service'
      )
      expect(result.recommendations).toContain(
        'Optimieren Sie Ihren Listing-Titel und die Beschreibung'
      )

      // Should limit to 5 recommendations maximum
      expect(result.recommendations.length).toBeLessThanOrEqual(5)
    })

    it('should handle errors gracefully', async () => {
      mockCategories.calculateHostPerformanceScore.mockRejectedValue(
        new Error('Calculation error')
      )

      await expect(calculateListingScore(mockListingData)).rejects.toThrow(
        'Fehler beim Berechnen des Listing-Scores'
      )

      // Should log the error
      const mockLogError = require('@/lib/utils/logger').logApiError
      expect(mockLogError).toHaveBeenCalledWith(
        '[calculateListingScore] Error beim Berechnen des Listing-Scores',
        expect.any(Error),
        {
          listingId: mockListingData.id,
        }
      )
    })

    it('should handle edge cases for score calculations', async () => {
      // Test with zero scores
      const zeroScore = createMockCategoryScore(0, 100)
      Object.values(mockCategories).forEach((mockFn: jest.Mock) => {
        mockFn.mockResolvedValue(zeroScore)
      })

      const zeroResult = await calculateListingScore(mockListingData)
      expect(zeroResult.totalScore).toBe(0)
      expect(zeroResult.percentage).toBe(0)
      expect(zeroResult.performanceLevel).toBe('Poor Performer')

      // Test with maximum scores
      const maxScore = createMockCategoryScore(100, 100)
      Object.values(mockCategories).forEach((mockFn: jest.Mock) => {
        mockFn.mockResolvedValue(maxScore)
      })

      const maxResult = await calculateListingScore(mockListingData)
      expect(maxResult.totalScore).toBe(1000)
      expect(maxResult.percentage).toBe(100)
      expect(maxResult.performanceLevel).toBe('Elite Performer (Top 1%)')
    })
  })

  describe('Performance Level Classification', () => {
    const performanceLevelTests = [
      { score: 1000, expected: 'Elite Performer (Top 1%)' },
      { score: 950, expected: 'Elite Performer (Top 1%)' },
      { score: 900, expected: 'Elite Performer (Top 1%)' },
      { score: 899, expected: 'High Performer (Top 5%)' },
      { score: 850, expected: 'High Performer (Top 5%)' },
      { score: 800, expected: 'High Performer (Top 5%)' },
      { score: 799, expected: 'Good Performer (Top 20%)' },
      { score: 750, expected: 'Good Performer (Top 20%)' },
      { score: 700, expected: 'Good Performer (Top 20%)' },
      { score: 699, expected: 'Average Performer' },
      { score: 650, expected: 'Average Performer' },
      { score: 600, expected: 'Average Performer' },
      { score: 599, expected: 'Below Average' },
      { score: 550, expected: 'Below Average' },
      { score: 500, expected: 'Below Average' },
      { score: 499, expected: 'Poor Performer' },
      { score: 250, expected: 'Poor Performer' },
      { score: 0, expected: 'Poor Performer' },
    ]

    performanceLevelTests.forEach(({ score, expected }) => {
      it(`should classify score ${score} as "${expected}"`, async () => {
        const categoryScore = createMockCategoryScore(score / 10, 100)
        Object.values(mockCategories).forEach((mockFn: jest.Mock) => {
          mockFn.mockResolvedValue(categoryScore)
        })

        const result = await calculateListingScore(mockListingData)
        expect(result.performanceLevel).toBe(expected)
      })
    })
  })
})
