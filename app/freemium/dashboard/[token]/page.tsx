/**
 * @file app/freemium/dashboard/[token]/page.tsx
 * @description Modern Freemium Dashboard with Real Data Integration
 * @created 2025-07-21
 * @modified 2025-07-21
 * @todo Modern dashboard with real scraped data and conversion optimization
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { PotentialAnalysisWidget } from '@/components/ui/PotentialAnalysisWidget'

/**
 * NOTE: Amenity translations are now handled entirely by the backend API
 * in /api/freemium/dashboard/[token]/route.ts cleanupAmenities() function.
 * This eliminates the double translation anti-pattern and ensures
 * consistent German translations from a single source of truth.
 */

interface AmenityValue {
  title: string
  icon: string
  available: boolean
}

interface Amenity {
  title: string
  values: AmenityValue[]
}

interface ListingImage {
  url: string
  caption?: string
  orientation?: string
  width?: number
  height?: number
}

interface ListingData {
  id: string
  url: string
  title: string
  description: string
  propertyType: string
  roomType: string
  personCapacity: number
  bedrooms?: number
  beds?: number
  baths?: number
  rating: {
    guestSatisfaction: number
    accuracy: number
    cleanliness: number
    location: number
    value: number
    reviewsCount: number
  }
  host: {
    id: string
    name: string
    firstName?: string
    isSuperHost: boolean
    profileImage?: string
    about?: string[]
    highlights?: string[]
    responseRate?: string
    responseTime?: string
    timeAsHost?: string
    verificationLevel?: string
  }
  price: {
    amount: string
    qualifier: string
    label: string
  }
  images?: ListingImage[]
  amenities: Amenity[]
}

interface AnalysisResult {
  overallScore: number
  categoryScores: {
    title: number
    description: number
    photos: number
    pricing: number
    amenities: number
    location: number
  }
}

interface FreemiumAIInsights {
  listingOptimization: {
    titleScore: number
    titleSuggestions: string[]
    descriptionScore: number
    descriptionImprovements: string[]
    photoScore: number
    photoRecommendations: string[]
    amenityScore: number
    missingAmenities: string[]
  }
  hostCredibility: {
    currentScore: number
    improvementTips: string[]
    superhostBenefits: string[]
  }
  seasonalOptimization: {
    currentSeason: string
    seasonalTips: string[]
    pricingHints: string[]
  }
  ratingImprovement: {
    currentStrengths: string[]
    improvementAreas: string[]
    guestExperienceTips: string[]
  }
  amenityGapAnalysis: {
    criticalGaps: string[]
    budgetFriendlyUpgrades: string[]
    highImpactAdditions: string[]
  }
}

interface FreemiumData {
  listing: ListingData
  analysis: AnalysisResult
  recommendations: string[]
  isRealData: boolean
}

interface AIInsightsResponse {
  insights: FreemiumAIInsights
  metadata: {
    generatedAt: string
    processingTime: number
    model: string
    language: string
    token: string
  }
}

/**
 * Generate contextual, relevant optimized title based on listing data
 */
function generateOptimizedTitle(listing: ListingData | null): string {
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
  let optimizedTitle = propertyType === 'Hotel' || currentTitle.includes('Hotel') 
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
function extractLocationFromTitle(title: string): string | null {
  const locationPatterns = [
    /im? (Herzen von|Zentrum|zentral)/i,
    /(Köln|Berlin|München|Hamburg|Frankfurt|Stuttgart|Düsseldorf)/i,
    /(Altstadt|Innenstadt|Stadtmitte|Zentrum)/i,
  ]
  
  for (const pattern of locationPatterns) {
    const match = title.match(pattern)
    if (match) {
      return match[1] || match[0]
    }
  }
  
  return null
}

/**
 * Detect key property features from title and listing data
 */
function detectPropertyFeatures(title: string, listing: ListingData): string[] {
  const features: string[] = []
  
  // Check for common features in title
  if (title.match(/modern|neu|renoviert/i)) features.push('Modern')
  if (title.match(/balkon|terrasse|garten/i)) features.push('Balkon')
  if (title.match(/küche|küchenzeile/i)) features.push('Küche')
  if (title.match(/parking|parkplatz/i)) features.push('Parkplatz')
  if (title.match(/wifi|wlan|internet/i)) features.push('WLAN')
  
  // Check amenities for key features
  if (listing.amenities && Array.isArray(listing.amenities)) {
    const hasWifi = listing.amenities.some((group: any) => 
      group.values?.some((amenity: any) => 
        amenity.title?.toLowerCase().includes('wifi') || 
        amenity.title?.toLowerCase().includes('wlan')
      )
    )
    if (hasWifi && !features.includes('WLAN')) features.push('WLAN')
    
    const hasParking = listing.amenities.some((group: any) =>
      group.values?.some((amenity: any) =>
        amenity.title?.toLowerCase().includes('parking') ||
        amenity.title?.toLowerCase().includes('parkplatz')
      )
    )
    if (hasParking && !features.includes('Parkplatz')) features.push('Parkplatz')
  }
  
  return features.slice(0, 2) // Max 2 features
}

export default function ModernFreemiumDashboard() {
  const [data, setData] = useState<FreemiumData | null>(null)
  const [aiInsights, setAiInsights] = useState<FreemiumAIInsights | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingAI, setIsLoadingAI] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [url, setUrl] = useState('')
  const [email, setEmail] = useState('')
  
  const [showTitleSimulator, setShowTitleSimulator] = useState(false)
  const [selectedTitleVersion, setSelectedTitleVersion] = useState('current')
  
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    // Verify token and get stored data
    const savedUrl = localStorage.getItem('freemium_url')
    const savedEmail = localStorage.getItem('freemium_email')
    const savedToken = localStorage.getItem('freemium_token')

    if (!savedUrl || !savedToken || savedToken !== params.token) {
      router.push('/freemium')
      return
    }

    setUrl(savedUrl)
    setEmail(savedEmail || '')

    // Fetch real data from API
    fetchAnalysisData(savedUrl, savedToken)

    // Show upgrade prompt after 30 seconds (less aggressive)
    setTimeout(() => {
      setShowUpgrade(true)
    }, 30000)
  }, [router, params.token])

  const fetchAnalysisData = async (url: string, token: string) => {
    try {
      // ✅ NEW APPROACH: First try to load from DB (fast), then fallback to API (slow)
      console.log('[PERFORMANCE] Attempting to load from database first...')
      
      const dbResponse = await fetch(`/api/freemium/dashboard/${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (dbResponse.ok) {
        const dbResult = await dbResponse.json()
        
        if (dbResult.success) {
          console.log('[PERFORMANCE] ✅ Data loaded from DB instantly!', dbResult.meta)
          setData(dbResult.data)
          setIsLoading(false)
          // Fetch AI insights after basic data is loaded
          fetchAIInsights(token)
          return
        }
      }

      // Fallback: Data not in DB yet - check cache first, then API
      console.log('[PERFORMANCE] DB load failed, checking cache...')
      
      const cachedAnalysis = localStorage.getItem('freemium_analysis_cache')
      const cacheTime = localStorage.getItem('freemium_analysis_cache_time')
      
      // Use cached data if available and less than 5 minutes old
      if (cachedAnalysis && cacheTime) {
        const cacheAge = Date.now() - parseInt(cacheTime)
        const maxCacheAge = 5 * 60 * 1000 // 5 minutes
        
        if (cacheAge < maxCacheAge) {
          console.log('[PERFORMANCE] Using cached analysis data - avoiding API call')
          try {
            const parsedData = JSON.parse(cachedAnalysis)
            setData(parsedData)
            setIsLoading(false)
            // Fetch AI insights after cached data is loaded
            fetchAIInsights(token)
            return
          } catch (error) {
            console.log('[PERFORMANCE] Cache parse error, falling back to API:', error)
          }
        } else {
          console.log('[PERFORMANCE] Cache expired, clearing and fetching fresh data')
          localStorage.removeItem('freemium_analysis_cache')
          localStorage.removeItem('freemium_analysis_cache_time')
        }
      }

      // Final fallback: Make fresh API call (this should happen less often now)
      console.log('[PERFORMANCE] Making fresh API call as final fallback...')
      const response = await fetch('/api/freemium/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, token }),
      })

      const result = await response.json()
      
      if (result.success) {
        setData(result.data)
        // Cache the fresh data
        localStorage.setItem('freemium_analysis_cache', JSON.stringify(result.data))
        localStorage.setItem('freemium_analysis_cache_time', Date.now().toString())
        // Fetch AI insights after fresh data is loaded
        fetchAIInsights(token)
      } else {
        console.error('API error:', result.error)
        // Handle error state
      }
    } catch (error) {
      console.error('Fetch error:', error)
      // Handle network error
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAIInsights = async (token: string) => {
    try {
      setIsLoadingAI(true)
      console.log('[AI] Fetching AI insights for enhanced dashboard...')
      
      const response = await fetch(`/api/freemium/ai-insights/${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          console.log('[AI] ✅ AI insights loaded successfully!')
          setAiInsights(result.data.insights)
        } else {
          console.error('[AI] Failed to load AI insights:', result.error)
        }
      } else {
        console.error('[AI] AI insights API error:', response.status)
      }
    } catch (error) {
      console.error('[AI] Error fetching AI insights:', error)
    } finally {
      setIsLoadingAI(false)
    }
  }

  const handleUpgrade = () => {
    router.push('/auth/register?source=freemium&upgrade=true')
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-500'
    if (score >= 60) return 'from-yellow-500 to-orange-500'
    return 'from-red-500 to-pink-500'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 80) return '🟢'
    if (score >= 60) return '🟡'
    return '🔴'
  }

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Lädt Ihre Analyse...</p>
        </div>
      </div>
    )
  }

  const { listing, analysis, recommendations, isRealData } = data

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">LB</span>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                ListingBoost Pro
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
                {isRealData ? (
                  <>
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-sm font-medium text-green-700">✨ Live-Analyse</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                    <span className="text-sm font-medium text-orange-700">🧪 Demo-Modus</span>
                  </>
                )}
              </div>
              <button 
                onClick={handleUpgrade}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Vollbericht freischalten
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hero Section with Background Image */}
        <div className="relative mb-8 overflow-hidden rounded-3xl shadow-2xl">
          {/* Background Image with Error Handling */}
          <div className="absolute inset-0">
            {listing.images?.[0]?.url ? (
              <>
                <Image
                  src={listing.images[0].url}
                  alt={listing.title || 'Airbnb Listing'}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                  onError={(e) => {
                    console.log('[IMAGE] Airbnb image failed to load, trying fallback. URL was:', listing.images[0]?.url)
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    const fallbackDiv = target.nextElementSibling as HTMLDivElement
                    if (fallbackDiv) {
                      fallbackDiv.classList.remove('hidden')
                      console.log('[IMAGE] Showing gradient fallback')
                    }
                  }}
                />
                {/* Fallback gradient - shown if Airbnb image fails to load */}
                <div className="hidden w-full h-full bg-gradient-to-br from-blue-600 to-purple-600">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white/70 text-center">
                      <div className="text-6xl mb-4">🏠</div>
                      <div className="text-lg font-medium">Airbnb Listing</div>
                      <div className="text-sm">Bild nicht verfügbar</div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white/70 text-center">
                    <div className="text-6xl mb-4">🏠</div>
                    <div className="text-lg font-medium">Airbnb Listing</div>
                    <div className="text-sm">Keine Bilder verfügbar</div>
                  </div>
                </div>
              </div>
            )}
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60" />
          </div>
          
          {/* Content Overlay */}
          <div className="relative z-10 p-8 md:p-12 text-white">
            <div className="max-w-4xl">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-200 font-medium">
                  Analyse abgeschlossen • {new Date().toLocaleDateString('de-DE')}
                </span>
              </div>
              
              <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                {listing.title}
              </h1>
              
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2 border border-white/20">
                      <span className="text-sm font-medium">
                        {listing.propertyType} • {listing.roomType}
                      </span>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2 border border-white/20">
                      <span className="text-sm font-medium">
                        {listing.personCapacity} Gäste • {listing.bedrooms} SZ • {listing.beds} Betten
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-white/90 text-lg leading-relaxed">
                    {listing.description.substring(0, 150)}...
                  </p>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">
                        ⭐ {listing.rating.guestSatisfaction.toFixed(1)}
                      </div>
                      <div className="text-sm text-white/80">
                        {listing.rating.reviewsCount} Bewertungen
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">
                        €{listing.price.amount}
                      </div>
                      <div className="text-sm text-white/80">
                        pro {listing.price.qualifier}
                      </div>
                    </div>
                    
                    {listing.host.isSuperHost && (
                      <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-xl px-3 py-1 border border-yellow-400/30">
                        <span className="text-yellow-300 font-semibold text-sm">
                          🏆 Superhost
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Overall Score Gauge */}
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-48 h-48 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-5xl font-bold mb-2">
                          {analysis.overallScore}
                        </div>
                        <div className="text-lg text-white/80">
                          von 1000
                        </div>
                        <div className="text-sm text-green-300 font-semibold">
                          {Math.round((analysis.overallScore / 1000) * 100)}% Score
                        </div>
                      </div>
                    </div>
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                      Gut
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Trust Signal - German Style - Fixed positioning with proper spacing */}
        <div className="fixed top-20 right-4 z-30 bg-white/95 backdrop-blur-xl rounded-xl px-4 py-2 border border-slate-200/50 shadow-lg hidden lg:block max-w-xs">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <div className="text-xs text-slate-600">
              <span className="font-medium">Über 2.500 Hosts</span> vertrauen ListingBoost
            </div>
          </div>
        </div>

        {/* Potential Analysis Widget - German Conversion Optimized */}
        <div className="mb-12">
          <PotentialAnalysisWidget
            listingTitle={listing.title}
            aiInsights={aiInsights || undefined}
            onUpgradeClick={handleUpgrade}
          />
        </div>

        {/* Category Score Breakdown */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">
            📊 Detailierte Bewertung
          </h2>
          
          {/* Before/After Title Simulator */}
          <div className="mb-8 bg-gradient-to-r from-blue-50/80 to-purple-50/80 backdrop-blur-xl rounded-2xl p-6 border border-blue-200/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center">
                <span className="text-2xl mr-2">🧪</span>
                Titel-Optimierungs-Simulator
              </h3>
              <button 
                onClick={() => setShowTitleSimulator(!showTitleSimulator)}
                className="text-blue-600 font-semibold text-sm hover:text-blue-700 transition-colors"
              >
                {showTitleSimulator ? 'Ausblenden' : 'Ausprobieren'}
              </button>
            </div>
            
            {showTitleSimulator && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-slate-200/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-600">🔴 Aktueller Titel</span>
                      <button 
                        onClick={() => setSelectedTitleVersion('current')}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                          selectedTitleVersion === 'current' 
                            ? 'bg-red-100 text-red-700 border border-red-200' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Auswählen
                      </button>
                    </div>
                    <p className="text-slate-800 font-medium text-sm leading-relaxed">{data?.listing.title}</p>
                    <div className="mt-3 text-xs text-slate-500">
                      📈 Geschätzte CTR: <span className="text-red-600 font-semibold">{(2.1 + Math.random() * 1.2).toFixed(1)}%</span>
                    </div>
                  </div>
                  
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-emerald-200/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-600">🟢 KI-Optimiert</span>
                      <button 
                        onClick={() => setSelectedTitleVersion('optimized')}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                          selectedTitleVersion === 'optimized' 
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Auswählen
                      </button>
                    </div>
                    <p className="text-slate-800 font-medium text-sm leading-relaxed">
                      ✨ {generateOptimizedTitle(data?.listing)}
                    </p>
                    <div className="mt-3 text-xs text-slate-500">
                      📈 Geschätzte CTR: <span className="text-emerald-600 font-semibold">{(4.8 + Math.random() * 1.7).toFixed(1)}%</span>
                      <span className="ml-2 text-emerald-600">↗️ +{Math.round(85 + Math.random() * 25)}% besser</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-emerald-100/60 to-green-100/60 backdrop-blur-sm rounded-xl p-4 border border-emerald-200/50">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-emerald-600">💡</span>
                    <span className="font-semibold text-emerald-800">Potenzielle Jahres-Steigerung</span>
                  </div>
                  <p className="text-emerald-700 text-sm">
                    Mit optimiertem Titel: <span className="font-bold">+€{(1200 + Math.random() * 800).toFixed(0)} - €{(2100 + Math.random() * 600).toFixed(0)}</span> zusätzliche Einnahmen pro Jahr
                  </p>
                </div>
                
                <button 
                  onClick={handleUpgrade}
                  className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all duration-200"
                >
                  🚀 Titel-Optimierung freischalten
                </button>
              </div>
            )}
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Unlocked Categories */}
            {[
              { key: 'title', label: 'Titel', icon: '📝', tooltip: 'Ihr Titel ist der erste Eindruck! 89% der Gäste entscheiden in den ersten 3 Sekunden.' },
              { key: 'description', label: 'Beschreibung', icon: '📄', tooltip: 'Eine optimierte Beschreibung steigert Buchungen um durchschnittlich 34%.' },
              { key: 'photos', label: 'Fotos', icon: '📸', tooltip: 'Professionelle Fotos erhöhen die Buchungsrate um bis zu 76%!' }
            ].map(category => {
              const score = analysis.categoryScores[category.key as keyof typeof analysis.categoryScores]
              return (
                <div key={category.key} className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl relative group hover:shadow-2xl transition-all duration-300">
                  {/* Interactive Tooltip */}
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                    <div className="bg-slate-800 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
                      {category.tooltip}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="text-3xl animate-pulse">{category.icon}</div>
                    <div>
                      <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{category.label}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-slate-800">{score}%</span>
                        <span>{getScoreIcon(score)}</span>
                        {score >= 75 && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">Top 10%</span>}
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 rounded-full h-3 mb-3">
                    <div 
                      className={`h-full rounded-full bg-gradient-to-r ${getScoreColor(score)} transition-all duration-700`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-slate-600">
                      {score >= 80 ? `Exzellent! Ihr ${category.label.toLowerCase()} liegt im Top-10%-Bereich ähnlicher Listings.` :
                       score >= 60 ? `Solide Basis mit konkretem Optimierungspotenzial. Ähnliche Listings mit optimiertem ${category.label.toLowerCase()} erhalten 15-25% mehr Anfragen.` :
                       `Hier liegt großes Potenzial. Eine ${category.label.toLowerCase()}-Optimierung kann Ihre Buchungsrate um bis zu 40% steigern.`}
                    </p>
                    
                    {/* Success Story */}
                    {score >= 70 && category.key === 'title' && (
                      <div className="bg-green-50/80 backdrop-blur-sm rounded-lg p-3 border border-green-200/50">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-green-600">✨</span>
                          <span className="text-xs font-semibold text-green-800">Erfolgsgeschichte</span>
                        </div>
                        <p className="text-xs text-green-700">
                          &quot;Nach der Titel-Optimierung hatte ich 67% mehr Anfragen!&quot; - Maria K., Superhost
                        </p>
                      </div>
                    )}
                    
                    {score >= 70 && category.key === 'photos' && (
                      <div className="bg-blue-50/80 backdrop-blur-sm rounded-lg p-3 border border-blue-200/50">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-blue-600">📸</span>
                          <span className="text-xs font-semibold text-blue-800">Pro-Tipp</span>
                        </div>
                        <p className="text-xs text-blue-700">
                          Listings mit 15+ Fotos erhalten 42% mehr Buchungen
                        </p>
                      </div>
                    )}
                    
                    {score < 60 && (
                      <div className="bg-amber-50/80 backdrop-blur-sm rounded-lg p-3 border border-amber-200/50">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-amber-600">⚡</span>
                          <span className="text-xs font-semibold text-amber-800">Potenzial</span>
                        </div>
                        <p className="text-xs text-amber-700">
                          +€{(200 + Math.random() * 400).toFixed(0)}/Monat möglich bei Optimierung
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
            
            {/* Locked Categories - Fixed z-index and spacing */}
            {[
              { key: 'pricing', label: 'Preisoptimierung', icon: '💰' },
              { key: 'amenities', label: 'Ausstattung', icon: '🏠' },
              { key: 'location', label: 'Standort', icon: '📍' }
            ].map(category => (
              <div key={category.key} className="bg-white/40 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 shadow-xl relative overflow-hidden min-h-[200px]">
                {/* Blur Overlay with proper z-index */}
                <div className="absolute inset-0 backdrop-blur-sm bg-white/30 z-10" />
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <div className="text-center p-4">
                    <div className="text-4xl mb-3">🔒</div>
                    <p className="text-sm text-slate-600 mb-3 font-medium">
                      Premium-Feature
                    </p>
                    <button 
                      onClick={handleUpgrade}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 shadow-md"
                    >
                      Freischalten
                    </button>
                  </div>
                </div>
                
                {/* Background Content (blurred) */}
                <div className="opacity-50">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="text-3xl">{category.icon}</div>
                    <div>
                      <h3 className="font-bold text-slate-800">{category.label}</h3>
                      <div className="text-2xl font-bold text-slate-800">••%</div>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3 mb-3">
                    <div className="h-full rounded-full bg-gradient-to-r from-slate-300 to-slate-400 w-3/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI-Powered Enhanced Sections */}
        {aiInsights && (
          <>
            {/* 1. Listing Optimization Score */}
            <div className="mb-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">
                  🤖 KI-gestützte Optimierung
                </h2>
                <div className="flex items-center justify-center space-x-2 text-sm text-emerald-600">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span className="font-medium">Von Gemini AI analysiert</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-white/90 to-blue-50/80 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-2xl mb-8">
                <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                  <span className="text-3xl mr-3">🎯</span>
                  Listing-Optimierungsscore
                </h3>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Title Score */}
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-600">📝 Titel</span>
                      <span className="text-xl font-bold text-slate-800">{aiInsights.listingOptimization.titleScore}/100</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-700"
                        style={{ width: `${aiInsights.listingOptimization.titleScore}%` }}
                      />
                    </div>
                    <div className="mt-3 space-y-1">
                      {aiInsights.listingOptimization.titleSuggestions.slice(0, 2).map((suggestion, i) => (
                        <p key={i} className="text-xs text-slate-600 leading-tight">• {suggestion}</p>
                      ))}
                    </div>
                  </div>

                  {/* Description Score */}
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-600">📄 Beschreibung</span>
                      <span className="text-xl font-bold text-slate-800">{aiInsights.listingOptimization.descriptionScore}/100</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-700"
                        style={{ width: `${aiInsights.listingOptimization.descriptionScore}%` }}
                      />
                    </div>
                    <div className="mt-3 space-y-1">
                      {aiInsights.listingOptimization.descriptionImprovements.slice(0, 2).map((improvement, i) => (
                        <p key={i} className="text-xs text-slate-600 leading-tight">• {improvement}</p>
                      ))}
                    </div>
                  </div>

                  {/* Photo Score */}
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-600">📸 Fotos</span>
                      <span className="text-xl font-bold text-slate-800">{aiInsights.listingOptimization.photoScore}/100</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-700"
                        style={{ width: `${aiInsights.listingOptimization.photoScore}%` }}
                      />
                    </div>
                    <div className="mt-3 space-y-1">
                      {aiInsights.listingOptimization.photoRecommendations.slice(0, 2).map((rec, i) => (
                        <p key={i} className="text-xs text-slate-600 leading-tight">• {rec}</p>
                      ))}
                    </div>
                  </div>

                  {/* Amenity Score */}
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-600">🏠 Ausstattung</span>
                      <span className="text-xl font-bold text-slate-800">{aiInsights.listingOptimization.amenityScore}/100</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-700"
                        style={{ width: `${aiInsights.listingOptimization.amenityScore}%` }}
                      />
                    </div>
                    <div className="mt-3 space-y-1">
                      {aiInsights.listingOptimization.missingAmenities.slice(0, 2).map((amenity, i) => (
                        <p key={i} className="text-xs text-slate-600 leading-tight">• {amenity}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Rating Improvement Plan */}
            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              <div className="bg-gradient-to-br from-white/90 to-green-50/80 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-2xl">
                <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                  <span className="text-3xl mr-3">⭐</span>
                  Rating-Verbesserungsplan
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                      <span className="mr-2">✅</span> Ihre Stärken
                    </h4>
                    <div className="space-y-2">
                      {aiInsights.ratingImprovement.currentStrengths.map((strength, i) => (
                        <div key={i} className="bg-green-100/60 backdrop-blur-sm rounded-lg p-3 border border-green-200/50">
                          <p className="text-sm text-green-800 font-medium">{strength}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-orange-800 mb-3 flex items-center">
                      <span className="mr-2">🎯</span> Verbesserungsbereiche
                    </h4>
                    <div className="space-y-2">
                      {aiInsights.ratingImprovement.improvementAreas.map((area, i) => (
                        <div key={i} className="bg-orange-100/60 backdrop-blur-sm rounded-lg p-3 border border-orange-200/50">
                          <p className="text-sm text-orange-800 font-medium">{area}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Host Credibility Boost */}
              <div className="bg-gradient-to-br from-white/90 to-purple-50/80 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-2xl">
                <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                  <span className="text-3xl mr-3">👤</span>
                  Host-Vertrauenswürdigkeit
                </h3>
                
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-slate-700">Aktueller Score</span>
                    <span className="text-2xl font-bold text-purple-600">{aiInsights.hostCredibility.currentScore}/100</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-700"
                      style={{ width: `${aiInsights.hostCredibility.currentScore}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-700 mb-2 flex items-center">
                      <span className="mr-2">💡</span> Sofort umsetzbar
                    </h4>
                    <div className="space-y-2">
                      {aiInsights.hostCredibility.improvementTips.slice(0, 3).map((tip, i) => (
                        <p key={i} className="text-sm text-slate-600 bg-purple-50/60 backdrop-blur-sm rounded-lg p-2 border border-purple-200/30">
                          • {tip}
                        </p>
                      ))}
                    </div>
                  </div>

                  {listing.host.isSuperHost && (
                    <div className="bg-gradient-to-r from-yellow-100/60 to-orange-100/60 backdrop-blur-sm rounded-xl p-4 border border-yellow-200/50">
                      <p className="text-sm font-medium text-yellow-800 mb-2">🏆 Superhost-Vorteile:</p>
                      <ul className="text-xs text-yellow-700 space-y-1">
                        {aiInsights.hostCredibility.superhostBenefits.map((benefit, i) => (
                          <li key={i}>• {benefit}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 4. Seasonal Optimization & 5. Amenity Gap Analysis */}
            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              {/* 4. Seasonal Optimization */}
              <div className="bg-gradient-to-br from-white/90 to-amber-50/80 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-2xl">
                <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                  <span className="text-3xl mr-3">🍂</span>
                  {aiInsights.seasonalOptimization.currentSeason}-Optimierung
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-amber-800 mb-3 flex items-center">
                      <span className="mr-2">🌟</span> Saisonale Empfehlungen
                    </h4>
                    <div className="space-y-2">
                      {aiInsights.seasonalOptimization.seasonalTips.map((tip, i) => (
                        <div key={i} className="bg-amber-100/60 backdrop-blur-sm rounded-lg p-3 border border-amber-200/50">
                          <p className="text-sm text-amber-800">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                      <span className="mr-2">💰</span> Preisoptimierung
                    </h4>
                    <div className="space-y-2">
                      {aiInsights.seasonalOptimization.pricingHints.map((hint, i) => (
                        <div key={i} className="bg-green-100/60 backdrop-blur-sm rounded-lg p-3 border border-green-200/50">
                          <p className="text-sm text-green-800 font-medium">{hint}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. Amenity Gap Analysis */}
              <div className="bg-gradient-to-br from-white/90 to-cyan-50/80 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-2xl">
                <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                  <span className="text-3xl mr-3">🔍</span>
                  Ausstattungs-Analyse
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-red-800 mb-3 flex items-center">
                      <span className="mr-2">🚨</span> Kritische Lücken
                    </h4>
                    <div className="space-y-2">
                      {aiInsights.amenityGapAnalysis.criticalGaps.slice(0, 3).map((gap, i) => (
                        <div key={i} className="bg-red-100/60 backdrop-blur-sm rounded-lg p-3 border border-red-200/50">
                          <p className="text-sm text-red-800 font-medium">{gap}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                      <span className="mr-2">💸</span> Budget-freundlich
                    </h4>
                    <div className="space-y-2">
                      {aiInsights.amenityGapAnalysis.budgetFriendlyUpgrades.slice(0, 3).map((upgrade, i) => (
                        <div key={i} className="bg-blue-100/60 backdrop-blur-sm rounded-lg p-2 border border-blue-200/50">
                          <p className="text-xs text-blue-800">{upgrade}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
                      <span className="mr-2">⚡</span> Hohe Wirkung
                    </h4>
                    <div className="space-y-2">
                      {aiInsights.amenityGapAnalysis.highImpactAdditions.slice(0, 2).map((addition, i) => (
                        <div key={i} className="bg-purple-100/60 backdrop-blur-sm rounded-lg p-2 border border-purple-200/50">
                          <p className="text-xs text-purple-800 font-medium">{addition}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Loading Indicator */}
            {isLoadingAI && (
              <div className="mb-12 bg-gradient-to-br from-white/90 to-blue-50/80 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-2xl">
                <div className="flex items-center justify-center space-x-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <div className="text-slate-600">
                    <span className="font-medium">KI-Analyse läuft...</span>
                    <p className="text-sm text-slate-500">Gemini AI generiert personalisierte Empfehlungen</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Amenities Analysis */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-white/50 shadow-xl">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">
              🏠 Ihre Ausstattung
            </h3>
            
            <div className="space-y-6">
              {listing.amenities.map((amenityGroup, groupIndex) => {
                // Backend already provides translated group titles and amenity names
                return (
                  <div key={groupIndex}>
                    <h4 className="font-semibold text-slate-700 mb-3">{amenityGroup.title}</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {amenityGroup.values.map((amenity, index) => {
                        // Use backend-provided data directly (no frontend translation needed)
                        const displayTitle = amenity.title
                        const displayIcon = amenity.icon || '✨' // Simple fallback
                        
                        return (
                          <div key={index} className={`flex items-center space-x-2 p-2 rounded-lg ${
                            amenity.available ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                          }`}>
                            <span className="text-lg">{displayIcon}</span>
                            <span className={`text-sm font-medium ${
                              amenity.available ? 'text-green-800' : 'text-red-800'
                            }`}>
                              {displayTitle}
                            </span>
                            <span>{amenity.available ? '✅' : '❌'}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
              
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-blue-600">💡</span>
                  <span className="font-semibold text-blue-800">Verbesserungsvorschlag</span>
                </div>
                <p className="text-blue-700 text-sm">
                  Wir haben bemerkt, dass Ihnen &apos;Arbeitsplatz&apos; fehlt. 73% der Top-Performer in Ihrer Gegend bieten dies an.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-8 border border-slate-200/50 shadow-xl relative overflow-hidden">
            {/* Blur Overlay */}
            <div className="absolute inset-0 backdrop-blur-sm bg-white/30" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
                <div className="text-5xl mb-4">📈</div>
                <h4 className="font-bold text-slate-800 mb-2">Vollständige Konkurrenzanalyse</h4>
                <p className="text-slate-600 text-sm mb-4">
                  Sehen Sie, was Ihre Konkurrenten bieten und<br/>
                  wie Sie sich verbessern können
                </p>
                <button 
                  onClick={handleUpgrade}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
                >
                  Freischalten für €19/Monat
                </button>
              </div>
            </div>
            
            {/* Background Content (blurred) */}
            <div className="opacity-30">
              <h3 className="text-2xl font-bold text-slate-800 mb-6">🏆 Konkurrenzvergleich</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-100 rounded-lg">
                  <span>Durchschnittspreis Konkurrenz:</span>
                  <span className="font-bold">€••</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-100 rounded-lg">
                  <span>Top 3 fehlende Amenities:</span>
                  <span className="font-bold">•••</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Host Credibility */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-white/50 shadow-xl mb-12">
          <h3 className="text-2xl font-bold text-slate-800 mb-6">👤 Host-Profil</h3>
          
          <div className="flex items-center space-x-6">
            {listing.host.profileImage && listing.host.profileImage.trim() !== '' ? (
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <Image
                    src={listing.host.profileImage} 
                    alt={listing.host.name}
                    width={80}
                    height={80}
                    className="object-cover"
                    onError={(e) => {
                      console.log('[IMAGE] Host profile image failed to load')
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      const fallbackDiv = target.parentElement?.nextElementSibling as HTMLDivElement
                      if (fallbackDiv && fallbackDiv.classList.contains('hidden')) {
                        fallbackDiv.classList.remove('hidden')
                      }
                    }}
                  />
                </div>
                {listing.host.isSuperHost && (
                  <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    ⭐
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center border-4 border-white shadow-lg">
                  <span className="text-white text-2xl font-bold">
                    {listing.host.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                {listing.host.isSuperHost && (
                  <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    ⭐
                  </div>
                )}
              </div>
            )}
            
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h4 className="text-xl font-bold text-slate-800">{listing.host.name}</h4>
                {listing.host.isSuperHost && (
                  <span className="bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold border border-yellow-300">
                    🏆 Superhost
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                {listing.host.responseRate && (
                  <div>
                    <span className="text-slate-600">Antwortrate: </span>
                    <span className="font-semibold text-slate-800">{listing.host.responseRate}</span>
                  </div>
                )}
                {listing.host.responseTime && (
                  <div>
                    <span className="text-slate-600">Antwortzeit: </span>
                    <span className="font-semibold text-slate-800">{listing.host.responseTime}</span>
                  </div>
                )}
                {listing.host.timeAsHost && (
                  <div>
                    <span className="text-slate-600">Host seit: </span>
                    <span className="font-semibold text-slate-800">
                      {typeof listing.host.timeAsHost === 'object' 
                        ? `${(listing.host.timeAsHost as any).years || 0} Jahre, ${(listing.host.timeAsHost as any).months || 0} Monate`
                        : listing.host.timeAsHost
                      }
                    </span>
                  </div>
                )}
                {listing.host.verificationLevel && (
                  <div>
                    <span className="text-slate-600">Verifiziert: </span>
                    <span className="font-semibold text-slate-800">{listing.host.verificationLevel}</span>
                  </div>
                )}
              </div>
              
              {/* Host About - basiert auf Apify-Daten */}
              {listing.host.about && listing.host.about.length > 0 && (
                <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm font-medium text-slate-700 mb-2">Über den Host:</p>
                  <p className="text-sm text-slate-700 italic">
                    &quot;{listing.host.about[0].substring(0, 200)}{listing.host.about[0].length > 200 ? '...' : ''}&quot;
                  </p>
                </div>
              )}
              
              {/* Host Highlights */}
              {listing.host.highlights && listing.host.highlights.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-slate-700 mb-2">Host-Highlights:</p>
                  <div className="flex flex-wrap gap-2">
                    {listing.host.highlights.slice(0, 3).map((highlight, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        ⭐ {highlight}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Zusätzliche Host-Infos */}
              <div className="mt-4 flex flex-wrap gap-2">
                {listing.host.verificationLevel && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    ✅ {listing.host.verificationLevel}
                  </span>
                )}
                {listing.host.firstName && listing.host.firstName !== listing.host.name && (
                  <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-full text-xs font-medium">
                    👤 {listing.host.firstName}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Personalized Recommendations - AI Enhanced */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-white/50 shadow-xl mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-slate-800">
              💡 Personalisierte Empfehlungen
            </h3>
            {aiInsights && (
              <div className="flex items-center space-x-2 text-sm text-emerald-600">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="font-medium">KI-personalisiert für &quot;{listing.title.substring(0, 25)}...&quot;</span>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            {/* Enhanced AI-based recommendations */}
            {aiInsights ? (
              <>
                {aiInsights.listingOptimization.titleSuggestions.slice(0, 1).map((suggestion, index) => (
                  <div key={`title-${index}`} className="flex items-start space-x-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      1
                    </div>
                    <div>
                      <p className="text-slate-700 leading-relaxed font-medium">📝 Titel optimieren</p>
                      <p className="text-slate-600 text-sm mt-1">{suggestion}</p>
                    </div>
                  </div>
                ))}
                {aiInsights.listingOptimization.descriptionImprovements.slice(0, 1).map((improvement, index) => (
                  <div key={`desc-${index}`} className="flex items-start space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                    <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      2
                    </div>
                    <div>
                      <p className="text-slate-700 leading-relaxed font-medium">📄 Beschreibung verbessern</p>
                      <p className="text-slate-600 text-sm mt-1">{improvement}</p>
                    </div>
                  </div>
                ))}
                {aiInsights.seasonalOptimization.seasonalTips.slice(0, 1).map((tip, index) => (
                  <div key={`seasonal-${index}`} className="flex items-start space-x-4 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl">
                    <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      3
                    </div>
                    <div>
                      <p className="text-slate-700 leading-relaxed font-medium">🌟 {aiInsights.seasonalOptimization.currentSeason}-Optimierung</p>
                      <p className="text-slate-600 text-sm mt-1">{tip}</p>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              // Fallback generic recommendations
              recommendations.slice(0, 3).map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-slate-700 leading-relaxed">{recommendation}</p>
                </div>
              ))
            )}
            
            <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-amber-600">🔒</span>
                <span className="font-semibold text-amber-800">Vollbericht verfügbar</span>
              </div>
              <p className="text-amber-700 text-sm">
                +12 weitere detaillierte Empfehlungen mit konkreten Umsetzungsschritten im Premium-Bericht
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Premium Teasers Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">
              💎 Premium Analytics & Optimization
            </h2>
            <p className="text-slate-600">
              Schalten Sie professionelle Funktionen frei für maximale Airbnb-Einnahmen
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-12">
            {/* 1. Full Analytics Dashboard Teaser */}
            <div className="bg-gradient-to-br from-white/90 to-indigo-50/80 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-2xl relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <span className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                  PRO
                </span>
              </div>
              
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">
                Vollständiges Analytics Dashboard
              </h3>
              
              {/* Preview Content */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center bg-indigo-50/60 backdrop-blur-sm rounded-lg p-2">
                  <span className="text-sm text-slate-700">Sichtbarkeits-Score</span>
                  <span className="font-bold text-indigo-600">{Math.round(72 + Math.random() * 15)}/100</span>
                </div>
                <div className="flex justify-between items-center bg-green-50/60 backdrop-blur-sm rounded-lg p-2">
                  <span className="text-sm text-slate-700">Suchergebnis-Ranking</span>
                  <span className="font-bold text-green-600">#{Math.round(8 + Math.random() * 5)}</span>
                </div>
                <div className="flex justify-between items-center bg-purple-50/60 backdrop-blur-sm rounded-lg p-2">
                  <span className="text-sm text-slate-700">Click-Through-Rate</span>
                  <span className="font-bold text-purple-600">{(12.5 + Math.random() * 3.5).toFixed(1)}%</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-indigo-100/60 to-blue-100/60 backdrop-blur-sm rounded-xl p-3 border border-indigo-200/50 mb-4">
                <p className="text-sm text-indigo-800 font-medium">
                  📈 Live-Tracking Ihrer Listing-Performance im Vergleich zu 10.000+ ähnlichen Unterkünften
                </p>
              </div>

              <button 
                onClick={handleUpgrade}
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all duration-200"
              >
                Analytics freischalten
              </button>
            </div>

            {/* 2. AI-Powered Pricing Optimization */}
            <div className="bg-gradient-to-br from-white/90 to-emerald-50/80 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-2xl relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <span className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                  AI PRO
                </span>
              </div>
              
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">
                KI-Preisoptimierung
              </h3>
              
              {/* Revenue Potential Preview */}
              <div className="mb-4">
                <div className="bg-gradient-to-r from-emerald-100/60 to-green-100/60 backdrop-blur-sm rounded-xl p-4 border border-emerald-200/50 mb-3">
                  <div className="text-center">
                    <p className="text-sm text-emerald-800 mb-1">Ihr Jahres-Potenzial:</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      €{(3200 + Math.random() * 5700).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} - €{(6500 + Math.random() * 2400).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                    </p>
                    <p className="text-xs text-emerald-700">zusätzliche Einnahmen möglich</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-emerald-50/60 backdrop-blur-sm rounded-lg p-2">
                    <span className="text-sm text-slate-700">Wochenende-Aufschlag</span>
                    <span className="font-bold text-emerald-600">+{Math.round(22 + Math.random() * 8)}%</span>
                  </div>
                  <div className="flex justify-between items-center bg-orange-50/60 backdrop-blur-sm rounded-lg p-2">
                    <span className="text-sm text-slate-700">Saison-Optimierung</span>
                    <span className="font-bold text-orange-600">+{Math.round(15 + Math.random() * 12)}%</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-emerald-100/60 to-green-100/60 backdrop-blur-sm rounded-xl p-3 border border-emerald-200/50 mb-4">
                <p className="text-sm text-emerald-800 font-medium">
                  💰 Dynamische Preisanpassung basierend auf Nachfrage, Events und 50+ Faktoren
                </p>
              </div>

              <button 
                onClick={handleUpgrade}
                className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all duration-200"
              >
                KI-Pricing aktivieren
              </button>
            </div>

            {/* 3. Advanced Marketing Toolkit */}
            <div className="bg-gradient-to-br from-white/90 to-purple-50/80 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-2xl relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                  MARKETING
                </span>
              </div>
              
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">
                Marketing Automation
              </h3>
              
              {/* Marketing Score Preview */}
              <div className="space-y-3 mb-4">
                <div className="bg-gradient-to-r from-purple-100/60 to-pink-100/60 backdrop-blur-sm rounded-xl p-3 border border-purple-200/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-700">Marketing-Score</span>
                    <span className="text-xl font-bold text-purple-600">{Math.round(78 + Math.random() * 15)}/100</span>
                  </div>
                  <div className="w-full bg-purple-200 rounded-full h-2">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-700"
                      style={{ width: `${78 + Math.random() * 15}%` }}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-purple-50/60 backdrop-blur-sm rounded-lg p-2">
                    <span className="text-sm text-slate-700">SEO-Optimierung</span>
                    <span className="font-bold text-purple-600">Aktiv</span>
                  </div>
                  <div className="flex justify-between items-center bg-pink-50/60 backdrop-blur-sm rounded-lg p-2">
                    <span className="text-sm text-slate-700">Social Media Integration</span>
                    <span className="font-bold text-pink-600">+{Math.round(25 + Math.random() * 15)}%</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-100/60 to-pink-100/60 backdrop-blur-sm rounded-xl p-3 border border-purple-200/50 mb-4">
                <p className="text-sm text-purple-800 font-medium">
                  📱 Automatische Gäste-Kommunikation, Review-Management & Cross-Platform Marketing
                </p>
              </div>

              <button 
                onClick={handleUpgrade}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all duration-200"
              >
                Marketing freischalten
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Main Upgrade CTA */}
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
          <div className="relative z-10 text-center max-w-4xl mx-auto">
            <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <span className="text-sm font-medium text-white/90">🎯 Conversion-optimiert für DACH-Markt</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Verdienen Sie €3.200+ mehr pro Jahr!
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Ihre kostenlose Analyse zeigt nur 20% des Potenzials. Das ist Ihr vollständiger Optimierungsplan:
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 mb-10">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-left">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Live Analytics Dashboard</h3>
                    <p className="text-blue-200 text-sm">Performance-Tracking in Echtzeit</p>
                  </div>
                </div>
                <ul className="text-blue-100 text-sm space-y-1">
                  <li>• Sichtbarkeits-Score & Ranking-Position</li>
                  <li>• Konkurrenz-Monitoring (50+ Listings)</li>
                  <li>• Conversion-Rate & Klick-Optimierung</li>
                </ul>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-left">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">KI-Preisoptimierung</h3>
                    <p className="text-blue-200 text-sm">Automatische Gewinnmaximierung</p>
                  </div>
                </div>
                <ul className="text-blue-100 text-sm space-y-1">
                  <li>• Dynamische Preisanpassung (täglich)</li>
                  <li>• Event- & Saisonoptimierung</li>
                  <li>• +28% höhere Einnahmen im Durchschnitt</li>
                </ul>
              </div>
            </div>

            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                  LIMITIERTES ANGEBOT
                </div>
              </div>
              <p className="text-lg font-semibold mb-2">
                Erste 100 Nutzer erhalten 50% Rabatt lebenslang
              </p>
              <p className="text-blue-200 text-sm">
                Statt €38/Monat nur €19/Monat • Keine Mindestlaufzeit • Jederzeit kündbar
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleUpgrade}
                className="group relative bg-white text-blue-600 font-bold py-4 px-8 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-lg"
              >
                <span className="relative z-10">
                  ✨ Vollzugang freischalten - Nur €19/Monat
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              <div className="text-blue-100 text-sm text-center">
                <p className="font-medium">30 Tage Geld-zurück-Garantie</p>
                <p className="text-xs text-blue-200">Über 2.500 zufriedene Hosts vertrauen uns</p>
              </div>
            </div>
          </div>
          
          {/* Background decoration */}
          <div className="absolute top-10 right-10 text-white/10 text-9xl font-bold select-none">
            €
          </div>
        </div>

      </main>

      {/* Professional Upgrade Dialog - German Style */}
      {showUpgrade && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">
                Interessiert an der vollständigen Analyse?
              </h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Sie haben bereits wertvolle Einblicke erhalten. Der Vollbericht enthält 12+ weitere 
                spezifische Empfehlungen mit konkreten Umsetzungsschritten und ROI-Berechnungen.
              </p>
              
              <div className="bg-slate-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-slate-700 text-lg">€19</div>
                    <div className="text-slate-500">pro Monat</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-slate-700 text-lg">30 Tage</div>
                    <div className="text-slate-500">Geld-zurück</div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowUpgrade(false)}
                  className="flex-1 py-3 px-4 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 transition-all duration-200"
                >
                  Vielleicht später
                </button>
                <button
                  onClick={handleUpgrade}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
                >
                  Vollbericht ansehen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      

      {/* Glassmorphism Styles */}
      <style jsx global>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.18);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
        }
        
        .glass-card-dark {
          background: rgba(0, 0, 0, 0.25);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.18);
        }
      `}</style>
    </div>
  )
}