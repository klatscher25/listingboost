/**
 * @file lib/utils/freemium-utils.ts
 * @description Utility functions for freemium dashboard system
 * @created 2025-07-22
 * @modified 2025-07-22
 * @todo Extracted from app/freemium/dashboard/[token]/page.tsx for CLAUDE.md compliance
 */

import { ListingData } from '@/lib/types/freemium-types'

/**
 * Generate contextual, relevant optimized title based on listing data
 */
export function generateOptimizedTitle(listing: ListingData | null): string {
  if (!listing) return 'Optimierter Titel'

  const currentTitle = listing.title || ''
  const propertyType = listing.propertyType || 'Wohnung'
  const roomType = listing.roomType || 'Private'
  const personCapacity = listing.personCapacity || 2
  const bedrooms = listing.bedrooms || 1

  // Extract location hints from title
  const locationKeywords = extractLocationFromTitle(currentTitle)
  const locationPart = locationKeywords ? ` • ${locationKeywords}` : ''

  // Create capacity description
  const capacityPart = personCapacity > 1 ? ` • ${personCapacity} Gäste` : ''
  const bedroomPart = bedrooms > 1 ? ` • ${bedrooms} Zimmer` : ''

  // Detect property features
  const features = detectPropertyFeatures(currentTitle, listing)
  const featurePart = features.length > 0 ? ` • ${features.join(' • ')}` : ''

  // Create optimized title
  let optimizedTitle =
    propertyType === 'Hotel' || currentTitle.includes('Hotel')
      ? `Premium ${currentTitle.split(' ')[0] || 'Hotel'}${locationPart}${capacityPart}`
      : `${propertyType === 'Entire home/apartment' ? 'Komplette' : 'Private'} ${propertyType}${locationPart}${capacityPart}${bedroomPart}`

  // Add key features
  if (features.length > 0) {
    optimizedTitle += ` • ${features[0]}` // Add most important feature
  }

  // Keep title length reasonable (max 65 chars)
  if (optimizedTitle.length > 65) {
    optimizedTitle = optimizedTitle.substring(0, 62) + '...'
  }

  return optimizedTitle
}

/**
 * Extract location information from the current title
 */
export function extractLocationFromTitle(title: string): string | null {
  const locationPatterns = [
    /im? (Herzen von|Zentrum|zentral)/i,
    /(Köln|Berlin|München|Hamburg|Frankfurt|Stuttgart|Düsseldorf)/i,
    /(Altstadt|Innenstadt|Stadtmitte|Zentrum)/i,
  ]

  for (const pattern of locationPatterns) {
    const match = title.match(pattern)
    if (match) {
      return match[0]
    }
  }

  return null
}

/**
 * Detect property features from title and listing data
 */
export function detectPropertyFeatures(
  title: string,
  listing: ListingData
): string[] {
  const features: string[] = []

  // Check for common features in title
  if (
    title.toLowerCase().includes('balkon') ||
    title.toLowerCase().includes('terrasse')
  ) {
    features.push('Balkon/Terrasse')
  }

  if (title.toLowerCase().includes('garten')) {
    features.push('Garten')
  }

  if (
    title.toLowerCase().includes('wifi') ||
    title.toLowerCase().includes('wlan')
  ) {
    features.push('WLAN')
  }

  if (title.toLowerCase().includes('küche')) {
    features.push('Küche')
  }

  if (
    title.toLowerCase().includes('parkplatz') ||
    title.toLowerCase().includes('parking')
  ) {
    features.push('Parkplatz')
  }

  if (
    title.toLowerCase().includes('zentral') ||
    title.toLowerCase().includes('city center')
  ) {
    features.push('Zentrale Lage')
  }

  // Check amenities for additional features
  if (listing.amenities) {
    for (const amenityGroup of listing.amenities) {
      for (const amenity of amenityGroup.values) {
        if (amenity.available) {
          const amenityTitle = amenity.title.toLowerCase()

          if (amenityTitle.includes('wlan') || amenityTitle.includes('wifi')) {
            if (!features.includes('WLAN')) features.push('WLAN')
          }

          if (
            amenityTitle.includes('klimaanlage') ||
            amenityTitle.includes('ac')
          ) {
            if (!features.includes('Klimaanlage')) features.push('Klimaanlage')
          }

          if (amenityTitle.includes('waschmaschine')) {
            if (!features.includes('Waschmaschine'))
              features.push('Waschmaschine')
          }

          if (
            amenityTitle.includes('geschirrspüler') ||
            amenityTitle.includes('dishwasher')
          ) {
            if (!features.includes('Geschirrspüler'))
              features.push('Geschirrspüler')
          }

          if (amenityTitle.includes('pool')) {
            if (!features.includes('Pool')) features.push('Pool')
          }

          if (
            amenityTitle.includes('fitnessstudio') ||
            amenityTitle.includes('gym')
          ) {
            if (!features.includes('Fitnessstudio'))
              features.push('Fitnessstudio')
          }
        }
      }
    }
  }

  return features.slice(0, 3) // Return max 3 features to avoid title bloat
}

/**
 * Format currency for German locale
 */
export function formatCurrency(amount: string): string {
  const numericAmount = parseFloat(
    amount.replace(/[^\d.,]/g, '').replace(',', '.')
  )
  if (isNaN(numericAmount)) return amount

  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericAmount)
}

/**
 * Format rating score with German decimal formatting
 */
export function formatRating(rating: number): string {
  return rating.toFixed(1).replace('.', ',')
}

/**
 * Calculate days remaining in current season for seasonal optimization
 */
export function getDaysInCurrentSeason(): number {
  const now = new Date()
  const month = now.getMonth()

  // Define season boundaries (Germany/DACH region)
  let seasonEnd: Date

  if (month >= 2 && month <= 4) {
    // Spring: March-May
    seasonEnd = new Date(now.getFullYear(), 5, 0) // End of May
  } else if (month >= 5 && month <= 7) {
    // Summer: June-August
    seasonEnd = new Date(now.getFullYear(), 8, 0) // End of August
  } else if (month >= 8 && month <= 10) {
    // Fall: September-November
    seasonEnd = new Date(now.getFullYear(), 11, 0) // End of November
  } else {
    // Winter: December-February
    seasonEnd = new Date(now.getFullYear() + (month >= 11 ? 1 : 0), 2, 0) // End of February
  }

  const diffTime = seasonEnd.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return Math.max(0, diffDays)
}

/**
 * Get current season name in German
 */
export function getCurrentSeason(): string {
  const month = new Date().getMonth()

  if (month >= 2 && month <= 4) return 'Frühling'
  if (month >= 5 && month <= 7) return 'Sommer'
  if (month >= 8 && month <= 10) return 'Herbst'
  return 'Winter'
}
