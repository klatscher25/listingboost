/**
 * @file lib/scoring/categories/content-optimization.ts
 * @description Listing Content & Optimization scoring category (180 points)
 * @created 2025-07-21
 * @todo CORE-001-01: Content optimization scoring implementation
 */

import { Database } from '@/types/database'
import { CategoryScore } from '../index'

type ListingData = Database['public']['Tables']['listings']['Row']

/**
 * 3. Listing Content & Optimization (180 Punkte)
 */
export async function calculateContentOptimizationScore(
  listing: ListingData,
  additionalData?: any
): Promise<CategoryScore> {
  const subcategories: CategoryScore['subcategories'] = {}
  let totalScore = 0

  // 3.1 Title Optimization (25 Punkte)
  let titleScore = 0
  if (listing.title) {
    const length = listing.title.length
    if (length >= 40 && length <= 50) titleScore += 10
    // Location keywords check - simplified
    if (
      listing.title.toLowerCase().includes('zentral') ||
      listing.title.toLowerCase().includes('mitte') ||
      listing.title.toLowerCase().includes('altstadt')
    ) {
      titleScore += 10
    }
    // Unique selling points - basic check
    if (
      listing.title.toLowerCase().includes('modern') ||
      listing.title.toLowerCase().includes('luxury') ||
      listing.title.toLowerCase().includes('cozy')
    ) {
      titleScore += 5
    }
  }
  subcategories.titleOptimization = {
    score: titleScore,
    maxScore: 25,
    reason: `Titel: ${listing.title ? `${listing.title.length} Zeichen` : 'nicht verfügbar'}`,
  }
  totalScore += titleScore

  // 3.2 Description Quality (30 Punkte)
  let descriptionScore = 0
  if (listing.description) {
    if (listing.description.length >= 500) descriptionScore += 15
    // Keywords and structure analysis would need AI
    descriptionScore += 10 // Default moderate score
  }
  subcategories.descriptionQuality = {
    score: descriptionScore,
    maxScore: 30,
    reason: `Beschreibung: ${listing.description ? `${listing.description.length} Zeichen` : 'nicht verfügbar'}`,
  }
  totalScore += descriptionScore

  // 3.3 HTML Description (25 Punkte)
  let htmlScore = 0
  if (listing.html_description) {
    // Check for HTML formatting
    const htmlString = JSON.stringify(listing.html_description)
    if (htmlString.includes('<p>') && htmlString.includes('<ul>'))
      htmlScore = 25
    else if (htmlString.includes('<p>') || htmlString.includes('<ul>'))
      htmlScore = 15
  }
  subcategories.htmlDescription = {
    score: htmlScore,
    maxScore: 25,
    reason:
      htmlScore > 0 ? 'HTML-Formatierung vorhanden' : 'Keine HTML-Formatierung',
  }
  totalScore += htmlScore

  // 3.4 Highlights Usage (30 Punkte)
  let highlightsScore = 0
  if (listing.highlights) {
    const highlightArray = Array.isArray(listing.highlights)
      ? listing.highlights
      : []
    if (highlightArray.length >= 3) highlightsScore = 30
    else if (highlightArray.length === 2) highlightsScore = 20
    else if (highlightArray.length === 1) highlightsScore = 10
  }
  subcategories.highlights = {
    score: highlightsScore,
    maxScore: 30,
    reason: `${Array.isArray(listing.highlights) ? listing.highlights.length : 0} Highlights`,
  }
  totalScore += highlightsScore

  // 3.5 Location Descriptions (25 Punkte)
  let locationDescScore = 0
  if (listing.location_descriptions) {
    // Simplified check for location descriptions
    locationDescScore = 15 // Default moderate score
  }
  subcategories.locationDescriptions = {
    score: locationDescScore,
    maxScore: 25,
    reason: listing.location_descriptions
      ? 'Standort-Beschreibungen vorhanden'
      : 'Keine Standort-Beschreibungen',
  }
  totalScore += locationDescScore

  // 3.6 House Rules Definition (20 Punkte)
  let rulesScore = 0
  if (listing.house_rules) {
    rulesScore = 15 // Default good score if rules exist
  }
  subcategories.houseRules = {
    score: rulesScore,
    maxScore: 20,
    reason: listing.house_rules ? 'Hausregeln definiert' : 'Keine Hausregeln',
  }
  totalScore += rulesScore

  // 3.7 Meta Description (25 Punkte)
  let metaScore = 0
  if (listing.description && listing.description.length >= 155) {
    const first155 = listing.description.substring(0, 155)
    // Basic quality check for first 155 characters
    if (first155.includes(listing.title?.split(' ')[0] || '')) metaScore = 25
    else metaScore = 15
  }
  subcategories.metaDescription = {
    score: metaScore,
    maxScore: 25,
    reason:
      metaScore > 0
        ? 'Meta-Description optimiert'
        : 'Meta-Description nicht optimiert',
  }
  totalScore += metaScore

  return {
    score: Math.min(totalScore, 180),
    maxScore: 180,
    percentage: Math.round((totalScore / 180) * 100),
    subcategories,
  }
}
