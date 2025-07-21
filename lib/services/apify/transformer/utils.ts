/**
 * @file lib/services/apify/transformer/utils.ts
 * @description Utility functions for data transformation
 * @created 2025-07-21
 * @todo CORE-001-02: Transformer utility functions
 */

/**
 * Extract numeric values from price strings
 */
export const extractPrice = (priceStr: string): number => {
  const match = priceStr.match(/[\d.,]+/)
  if (!match) return 0
  return parseFloat(match[0].replace(',', '.'))
}

/**
 * Extract numeric values from percentage strings
 */
export const extractPercentage = (percentStr: string): string => {
  return percentStr.replace('%', '')
}

/**
 * Extract years from host experience string
 */
export const extractHostYears = (timeStr: string): number => {
  const yearMatch = timeStr.match(/(\d+)\s*year/i)
  if (yearMatch) return parseInt(yearMatch[1])

  const monthMatch = timeStr.match(/(\d+)\s*month/i)
  if (monthMatch) return Math.floor(parseInt(monthMatch[1]) / 12)

  return 0
}

/**
 * Extract months from host experience string
 */
export const extractHostMonths = (timeStr: string): number => {
  const yearMatch = timeStr.match(/(\d+)\s*year/i)
  const monthMatch = timeStr.match(/(\d+)\s*month/i)

  let totalMonths = 0
  if (yearMatch) totalMonths += parseInt(yearMatch[1]) * 12
  if (monthMatch) totalMonths += parseInt(monthMatch[1])

  return totalMonths
}

/**
 * Extract host response rate from hostDetails
 */
export const extractHostResponseRate = (
  hostDetails: string[]
): string | null => {
  if (!hostDetails) return null
  const responseRateItem = hostDetails.find((detail) =>
    detail.includes('Response rate:')
  )
  if (responseRateItem) {
    const match = responseRateItem.match(/(\d+%)/i)
    return match ? match[1] : null
  }
  return null
}

/**
 * Extract host response time from hostDetails
 */
export const extractHostResponseTime = (
  hostDetails: string[]
): string | null => {
  if (!hostDetails) return null
  const responseTimeItem = hostDetails.find((detail) =>
    detail.includes('Responds')
  )
  if (responseTimeItem) {
    return responseTimeItem.replace('Responds ', '').trim()
  }
  return null
}
