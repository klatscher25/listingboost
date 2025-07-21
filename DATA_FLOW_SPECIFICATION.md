# ListingBoost Pro - Data Flow Specification

## 📋 Document Overview

**Document Type**: Data Architecture and Flow Specification  
**Version**: 1.0  
**Created**: 2025-01-20  
**Last Updated**: 2025-01-20  
**Status**: Design Phase  
**Target Systems**: Backend Services, Frontend State, External Integrations  

---

## 🌊 Data Flow Architecture

### Core Principles
- **Event-Driven**: Asynchronous processing with event notifications
- **Immutable Data**: State changes through events, not mutations
- **Real-Time Updates**: WebSocket connections for live data sync
- **Fault Tolerance**: Graceful degradation and retry mechanisms
- **Scalable Processing**: Queue-based background job processing

### High-Level Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    LISTINGBOOST PRO DATA FLOW                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │    USER     │───▶│  FRONTEND   │───▶│    API      │         │
│  │   ACTION    │    │    STATE    │    │   LAYER     │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                             │                   │               │
│                             ▼                   ▼               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │ WEBSOCKET   │◀───│  DATABASE   │◀───│  SERVICE    │         │
│  │  UPDATES    │    │  SUPABASE   │    │   LAYER     │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                                                 │               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │ BACKGROUND  │◀───│    QUEUE    │◀───│ EXTERNAL    │         │
│  │   WORKERS   │    │   SYSTEM    │    │ SERVICES    │         │
│  │             │    │             │    │ Apify+AI    │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Core Data Flows

### 1. Listing Analysis Flow

#### Complete Analysis Workflow
```
User Submits URL
        │
        ▼
┌───────────────────┐
│   URL Validation  │
│                   │
│ • Airbnb format   │
│ • URL reachable   │
│ • Not duplicate   │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  Create Listing   │
│                   │
│ • Generate UUID   │
│ • Set status      │
│ • Queue analysis  │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ Background Queue  │
│                   │
│ • Priority based  │
│ • Rate limiting   │
│ • Retry logic    │
└───────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│              Apify Scrapers             │
│                                         │
│  ┌─────────────┐  ┌─────────────────┐   │
│  │ URL Scraper │  │ Review Scraper  │   │
│  │             │  │                 │   │
│  │ • Basic     │  │ • Individual    │   │
│  │   details   │  │   reviews       │   │
│  │ • Host info │  │ • Ratings       │   │
│  │ • Amenities │  │ • Sentiment     │   │
│  └─────────────┘  └─────────────────┘   │
│                                         │
│  ┌─────────────┐  ┌─────────────────┐   │
│  │Availability │  │ Location        │   │
│  │Scraper      │  │ Scraper         │   │
│  │             │  │                 │   │
│  │ • 365 days  │  │ • Competitors   │   │
│  │ • Pricing   │  │ • Market data   │   │
│  │ • Calendar  │  │ • Benchmarks    │   │
│  └─────────────┘  └─────────────────┘   │
└─────────────────────────────────────────┘
        │
        ▼
┌───────────────────┐
│   Data Storage    │
│                   │
│ • Raw data        │
│ • Normalized      │
│ • Relationships   │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│   AI Analysis     │
│                   │
│ • Gemini API      │
│ • Text analysis   │
│ • Sentiment       │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  Score Engine     │
│                   │
│ • 10 categories   │
│ • 1000 points     │
│ • Recommendations │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│   Update Status   │
│                   │
│ • Mark complete   │
│ • Store results   │
│ • Notify user     │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  Real-time UI     │
│                   │
│ • WebSocket push  │
│ • State update    │
│ • Notifications   │
└───────────────────┘
```

#### Data Transformation Pipeline
```typescript
// lib/data-flow/analysis-pipeline.ts
export class AnalysisPipeline {
  async processListing(listingId: string): Promise<void> {
    const pipeline = [
      this.validateInput,
      this.runScrapers,
      this.storeRawData,
      this.runAIAnalysis,
      this.calculateScore,
      this.generateRecommendations,
      this.updateDatabase,
      this.notifyUser
    ]

    let context = { listingId, data: {}, metadata: {} }

    for (const step of pipeline) {
      try {
        context = await step(context)
        await this.recordProgress(listingId, step.name, 'completed')
      } catch (error) {
        await this.recordProgress(listingId, step.name, 'failed', error)
        throw error
      }
    }
  }

  private async validateInput(context: PipelineContext): Promise<PipelineContext> {
    const listing = await this.db.listings.findById(context.listingId)
    
    if (!listing || !listing.airbnb_url) {
      throw new Error('Invalid listing or missing URL')
    }

    return {
      ...context,
      data: { listing }
    }
  }

  private async runScrapers(context: PipelineContext): Promise<PipelineContext> {
    const { listing } = context.data
    
    // Run all scrapers in parallel
    const [urlData, reviewsData, availabilityData, competitorData] = await Promise.all([
      this.apifyService.scrapeURL(listing.airbnb_url),
      this.apifyService.scrapeReviews(listing.airbnb_url),
      this.apifyService.scrapeAvailability(listing.airbnb_url),
      this.apifyService.scrapeCompetitors(listing.location)
    ])

    return {
      ...context,
      data: {
        ...context.data,
        scraped: { urlData, reviewsData, availabilityData, competitorData }
      }
    }
  }

  private async storeRawData(context: PipelineContext): Promise<PipelineContext> {
    const { scraped } = context.data
    
    // Store normalized data in database
    await Promise.all([
      this.storeListingData(context.listingId, scraped.urlData),
      this.storeReviewsData(context.listingId, scraped.reviewsData),
      this.storeAvailabilityData(context.listingId, scraped.availabilityData),
      this.storeCompetitorData(context.listingId, scraped.competitorData)
    ])

    return context
  }

  private async runAIAnalysis(context: PipelineContext): Promise<PipelineContext> {
    const { scraped } = context.data
    
    const aiAnalysis = await this.geminiService.analyzeContent({
      title: scraped.urlData.title,
      description: scraped.urlData.description,
      reviews: scraped.reviewsData.reviews,
      amenities: scraped.urlData.amenities
    })

    return {
      ...context,
      data: {
        ...context.data,
        aiAnalysis
      }
    }
  }

  private async calculateScore(context: PipelineContext): Promise<PipelineContext> {
    const score = await this.scoringEngine.calculate(context.listingId, {
      scraped: context.data.scraped,
      aiAnalysis: context.data.aiAnalysis
    })

    return {
      ...context,
      data: {
        ...context.data,
        score
      }
    }
  }
}
```

### 2. Real-Time Data Synchronization

#### WebSocket Event System
```typescript
// lib/data-flow/websocket-manager.ts
export class WebSocketManager {
  private connections = new Map<string, WebSocket>()
  private channels = new Map<string, Set<string>>()

  async broadcastToUser(userId: string, event: string, data: any) {
    const userConnections = this.getUserConnections(userId)
    
    userConnections.forEach(connection => {
      if (connection.readyState === WebSocket.OPEN) {
        connection.send(JSON.stringify({
          type: event,
          data,
          timestamp: new Date().toISOString()
        }))
      }
    })
  }

  async subscribeToListing(userId: string, listingId: string) {
    const channel = `listing:${listingId}`
    
    if (!this.channels.has(channel)) {
      this.channels.set(channel, new Set())
    }
    
    this.channels.get(channel)!.add(userId)
    
    // Set up database triggers for this listing
    await this.setupListingTriggers(listingId)
  }

  private async setupListingTriggers(listingId: string) {
    // Supabase real-time subscription
    supabase
      .channel(`listing:${listingId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'listings',
        filter: `id=eq.${listingId}`
      }, (payload) => {
        this.handleListingUpdate(listingId, payload.new)
      })
      .subscribe()
  }

  private async handleListingUpdate(listingId: string, data: any) {
    const channel = `listing:${listingId}`
    const subscribedUsers = this.channels.get(channel)

    if (subscribedUsers) {
      subscribedUsers.forEach(userId => {
        this.broadcastToUser(userId, 'listing.updated', {
          listingId,
          status: data.analysis_status,
          score: data.overall_score,
          updated_at: data.updated_at
        })
      })
    }
  }
}
```

#### Frontend Real-Time State Management
```typescript
// hooks/use-real-time-listings.ts
export function useRealTimeListings(userId: string) {
  const [listings, setListings] = useState<Listing[]>([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/listings`)
    
    ws.onopen = () => {
      setIsConnected(true)
      ws.send(JSON.stringify({
        type: 'authenticate',
        token: getAuthToken()
      }))
    }

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data)
      
      switch (message.type) {
        case 'listing.updated':
          handleListingUpdate(message.data)
          break
        case 'listing.analyzed':
          handleListingAnalyzed(message.data)
          break
        case 'listing.failed':
          handleListingFailed(message.data)
          break
      }
    }

    ws.onclose = () => {
      setIsConnected(false)
      // Implement reconnection logic
      setTimeout(() => {
        // Retry connection
      }, 5000)
    }

    return () => {
      ws.close()
    }
  }, [userId])

  const handleListingUpdate = (data: any) => {
    setListings(prev => prev.map(listing => 
      listing.id === data.listingId 
        ? { ...listing, status: data.status, updated_at: data.updated_at }
        : listing
    ))
  }

  const handleListingAnalyzed = (data: any) => {
    setListings(prev => prev.map(listing => 
      listing.id === data.listingId 
        ? { 
            ...listing, 
            status: 'completed',
            score: data.score,
            analyzed_at: data.analyzed_at
          }
        : listing
    ))

    // Show success notification
    toast.success(`Analysis completed for ${data.listing_title}`)
  }

  return {
    listings,
    isConnected,
    subscribe: (listingId: string) => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'subscribe',
          listingId
        }))
      }
    }
  }
}
```

### 3. Background Job Processing

#### Queue Management System
```typescript
// lib/data-flow/queue-manager.ts
export class QueueManager {
  private queues = {
    high: new Array<Job>(),
    normal: new Array<Job>(),
    low: new Array<Job>()
  }
  
  private processing = false
  private maxConcurrent = 3
  private currentJobs = new Set<string>()

  async addJob(job: Job) {
    const priority = this.determinePriority(job)
    this.queues[priority].push({
      ...job,
      id: generateId(),
      created_at: new Date(),
      attempts: 0,
      max_attempts: 3
    })

    if (!this.processing) {
      this.startProcessing()
    }
  }

  private async startProcessing() {
    this.processing = true
    
    while (this.hasJobs() || this.currentJobs.size > 0) {
      if (this.currentJobs.size < this.maxConcurrent && this.hasJobs()) {
        const job = this.getNextJob()
        if (job) {
          this.processJob(job)
        }
      }
      
      await this.sleep(100) // Small delay to prevent busy waiting
    }
    
    this.processing = false
  }

  private async processJob(job: Job) {
    this.currentJobs.add(job.id)
    
    try {
      await this.executeJob(job)
      await this.markJobComplete(job)
    } catch (error) {
      await this.handleJobError(job, error)
    } finally {
      this.currentJobs.delete(job.id)
    }
  }

  private async executeJob(job: Job) {
    switch (job.type) {
      case 'listing_analysis':
        await this.analysisService.processListing(job.data.listingId)
        break
      case 'competitor_refresh':
        await this.competitorService.refreshData(job.data.location)
        break
      case 'email_notification':
        await this.emailService.sendNotification(job.data)
        break
      default:
        throw new Error(`Unknown job type: ${job.type}`)
    }
  }

  private async handleJobError(job: Job, error: Error) {
    job.attempts++
    job.last_error = error.message
    job.last_attempt = new Date()

    if (job.attempts < job.max_attempts) {
      // Exponential backoff
      const delay = Math.pow(2, job.attempts) * 1000
      setTimeout(() => {
        this.queues.normal.push(job) // Retry with normal priority
      }, delay)
    } else {
      await this.markJobFailed(job, error)
    }
  }

  private determinePriority(job: Job): 'high' | 'normal' | 'low' {
    if (job.user_plan === 'professional') return 'high'
    if (job.priority === 'high') return 'high'
    if (job.type === 'email_notification') return 'high'
    if (job.user_plan === 'growth') return 'normal'
    return 'low'
  }
}
```

### 4. Data Validation and Transformation

#### Input Validation Pipeline
```typescript
// lib/data-flow/validation-pipeline.ts
export class ValidationPipeline {
  private validators = new Map<string, Validator[]>()

  constructor() {
    this.setupValidators()
  }

  private setupValidators() {
    // Airbnb URL validation
    this.validators.set('airbnb_url', [
      this.validateURL,
      this.validateAirbnbDomain,
      this.validateListingID,
      this.checkDuplicates
    ])

    // Scraped data validation
    this.validators.set('scraped_data', [
      this.validateDataStructure,
      this.validateRequiredFields,
      this.validateDataTypes,
      this.sanitizeContent
    ])

    // Score calculation validation
    this.validators.set('score_calculation', [
      this.validateScoreRange,
      this.validateCategoryTotals,
      this.validateRecommendations
    ])
  }

  async validate(type: string, data: any): Promise<ValidationResult> {
    const validators = this.validators.get(type) || []
    const errors: ValidationError[] = []
    let transformedData = data

    for (const validator of validators) {
      try {
        const result = await validator(transformedData)
        if (result.isValid) {
          transformedData = result.data
        } else {
          errors.push(...result.errors)
        }
      } catch (error) {
        errors.push({
          field: 'unknown',
          message: error.message,
          code: 'VALIDATION_ERROR'
        })
      }
    }

    return {
      isValid: errors.length === 0,
      data: transformedData,
      errors
    }
  }

  private async validateURL(data: any): Promise<ValidationResult> {
    const { airbnb_url } = data
    
    try {
      new URL(airbnb_url)
      return { isValid: true, data, errors: [] }
    } catch {
      return {
        isValid: false,
        data,
        errors: [{
          field: 'airbnb_url',
          message: 'Invalid URL format',
          code: 'INVALID_URL'
        }]
      }
    }
  }

  private async validateAirbnbDomain(data: any): Promise<ValidationResult> {
    const { airbnb_url } = data
    const url = new URL(airbnb_url)
    
    if (!url.hostname.includes('airbnb.com')) {
      return {
        isValid: false,
        data,
        errors: [{
          field: 'airbnb_url',
          message: 'URL must be from airbnb.com',
          code: 'INVALID_DOMAIN'
        }]
      }
    }
    
    return { isValid: true, data, errors: [] }
  }

  private async checkDuplicates(data: any): Promise<ValidationResult> {
    const { airbnb_url, user_id } = data
    
    const existing = await this.db.listings.findFirst({
      where: {
        airbnb_url,
        user_id,
        NOT: { status: 'deleted' }
      }
    })
    
    if (existing) {
      return {
        isValid: false,
        data,
        errors: [{
          field: 'airbnb_url',
          message: 'This listing has already been analyzed',
          code: 'DUPLICATE_LISTING'
        }]
      }
    }
    
    return { isValid: true, data, errors: [] }
  }
}
```

---

## 📊 State Management

### Frontend State Architecture

#### Global State with Zustand
```typescript
// stores/listings-store.ts
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

interface ListingsState {
  // State
  listings: Listing[]
  selectedListing: Listing | null
  filters: ListingFilters
  loading: boolean
  error: string | null
  
  // Actions
  addListing: (listing: Listing) => void
  updateListing: (id: string, updates: Partial<Listing>) => void
  removeListing: (id: string) => void
  setSelectedListing: (listing: Listing | null) => void
  setFilters: (filters: Partial<ListingFilters>) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Async actions
  fetchListings: () => Promise<void>
  createListing: (data: CreateListingData) => Promise<void>
  analyzeListing: (id: string) => Promise<void>
}

export const useListingsStore = create<ListingsState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    listings: [],
    selectedListing: null,
    filters: {
      status: 'all',
      sort: 'created_at',
      order: 'desc',
      search: ''
    },
    loading: false,
    error: null,

    // Actions
    addListing: (listing) => 
      set((state) => ({ 
        listings: [listing, ...state.listings] 
      })),

    updateListing: (id, updates) =>
      set((state) => ({
        listings: state.listings.map(listing =>
          listing.id === id ? { ...listing, ...updates } : listing
        )
      })),

    removeListing: (id) =>
      set((state) => ({
        listings: state.listings.filter(listing => listing.id !== id)
      })),

    setSelectedListing: (listing) => 
      set({ selectedListing: listing }),

    setFilters: (filters) =>
      set((state) => ({
        filters: { ...state.filters, ...filters }
      })),

    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),

    // Async actions
    fetchListings: async () => {
      set({ loading: true, error: null })
      
      try {
        const response = await api.listings.list(get().filters)
        set({ listings: response.data, loading: false })
      } catch (error) {
        set({ 
          error: error.message, 
          loading: false 
        })
      }
    },

    createListing: async (data) => {
      set({ loading: true, error: null })
      
      try {
        const response = await api.listings.create(data)
        get().addListing(response.data)
        set({ loading: false })
      } catch (error) {
        set({ 
          error: error.message, 
          loading: false 
        })
        throw error
      }
    },

    analyzeListing: async (id) => {
      try {
        await api.listings.analyze(id)
        get().updateListing(id, { status: 'analyzing' })
      } catch (error) {
        get().updateListing(id, { status: 'failed' })
        throw error
      }
    }
  }))
)

// Real-time subscriptions
useListingsStore.subscribe(
  (state) => state.listings,
  (listings) => {
    // Sync with localStorage
    localStorage.setItem('listings-cache', JSON.stringify(listings))
  }
)
```

#### Server State with TanStack Query
```typescript
// hooks/use-listings-query.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useListingsQuery(filters: ListingFilters) {
  return useQuery({
    queryKey: ['listings', filters],
    queryFn: () => api.listings.list(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useListingQuery(id: string) {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: () => api.listings.get(id),
    enabled: !!id,
  })
}

export function useCreateListingMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.listings.create,
    onSuccess: (newListing) => {
      // Optimistic update
      queryClient.setQueryData(['listings'], (old: any) => ({
        ...old,
        data: [newListing, ...old.data]
      }))
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['listings'] })
    },
    onError: (error) => {
      toast.error('Failed to create listing')
    }
  })
}

export function useAnalyzeListingMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, priority }: { id: string, priority: string }) =>
      api.listings.analyze(id, { priority }),
    onMutate: async ({ id }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['listing', id] })
      
      // Snapshot previous value
      const previousListing = queryClient.getQueryData(['listing', id])
      
      // Optimistically update
      queryClient.setQueryData(['listing', id], (old: any) => ({
        ...old,
        status: 'analyzing'
      }))
      
      return { previousListing }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(
        ['listing', variables.id], 
        context?.previousListing
      )
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ 
        queryKey: ['listing', variables.id] 
      })
    }
  })
}
```

### Database State Management

#### Supabase Real-Time Integration
```typescript
// lib/database/real-time-manager.ts
export class RealTimeManager {
  private subscriptions = new Map<string, RealtimeChannel>()

  subscribeToListings(userId: string, callback: (listing: Listing) => void) {
    const channel = supabase
      .channel(`user:${userId}:listings`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'listings',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        this.handleListingChange(payload, callback)
      })
      .subscribe()

    this.subscriptions.set(`listings:${userId}`, channel)
    
    return () => {
      channel.unsubscribe()
      this.subscriptions.delete(`listings:${userId}`)
    }
  }

  subscribeToListingScores(listingId: string, callback: (score: Score) => void) {
    const channel = supabase
      .channel(`listing:${listingId}:scores`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'listing_scores',
        filter: `listing_id=eq.${listingId}`
      }, (payload) => {
        callback(payload.new as Score)
      })
      .subscribe()

    this.subscriptions.set(`scores:${listingId}`, channel)
    
    return () => {
      channel.unsubscribe()
      this.subscriptions.delete(`scores:${listingId}`)
    }
  }

  private handleListingChange(
    payload: any, 
    callback: (listing: Listing) => void
  ) {
    switch (payload.eventType) {
      case 'INSERT':
        callback({ ...payload.new, _action: 'created' })
        break
      case 'UPDATE':
        callback({ ...payload.new, _action: 'updated' })
        break
      case 'DELETE':
        callback({ ...payload.old, _action: 'deleted' })
        break
    }
  }

  unsubscribeAll() {
    this.subscriptions.forEach(channel => {
      channel.unsubscribe()
    })
    this.subscriptions.clear()
  }
}
```

---

## 🔄 Event System

### Event-Driven Architecture

#### Event Bus Implementation
```typescript
// lib/events/event-bus.ts
export class EventBus {
  private listeners = new Map<string, Set<EventListener>>()
  private eventHistory = new Array<EventRecord>()
  private maxHistorySize = 1000

  emit<T = any>(event: string, data: T, metadata?: EventMetadata): void {
    const eventRecord: EventRecord = {
      id: generateId(),
      event,
      data,
      metadata: {
        timestamp: new Date(),
        source: metadata?.source || 'unknown',
        userId: metadata?.userId,
        ...metadata
      }
    }

    // Store in history
    this.eventHistory.push(eventRecord)
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift()
    }

    // Notify listeners
    const listeners = this.listeners.get(event) || new Set()
    listeners.forEach(listener => {
      try {
        listener(eventRecord)
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error)
      }
    })

    // Log for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`Event emitted: ${event}`, eventRecord)
    }
  }

  on(event: string, listener: EventListener): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    
    this.listeners.get(event)!.add(listener)
    
    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(listener)
    }
  }

  once(event: string, listener: EventListener): void {
    const unsubscribe = this.on(event, (eventRecord) => {
      listener(eventRecord)
      unsubscribe()
    })
  }

  getEventHistory(filter?: EventFilter): EventRecord[] {
    if (!filter) return [...this.eventHistory]
    
    return this.eventHistory.filter(record => {
      if (filter.event && record.event !== filter.event) return false
      if (filter.userId && record.metadata.userId !== filter.userId) return false
      if (filter.since && record.metadata.timestamp < filter.since) return false
      return true
    })
  }
}

// Global event bus instance
export const eventBus = new EventBus()
```

#### Domain Events
```typescript
// lib/events/domain-events.ts
export class ListingEvents {
  static LISTING_CREATED = 'listing.created'
  static LISTING_ANALYZING = 'listing.analyzing'
  static LISTING_ANALYZED = 'listing.analyzed'
  static LISTING_FAILED = 'listing.failed'
  static LISTING_DELETED = 'listing.deleted'

  static emitListingCreated(listing: Listing) {
    eventBus.emit(this.LISTING_CREATED, {
      listingId: listing.id,
      userId: listing.user_id,
      airbnb_url: listing.airbnb_url,
      status: listing.status
    })
  }

  static emitListingAnalyzed(listing: Listing, score: Score) {
    eventBus.emit(this.LISTING_ANALYZED, {
      listingId: listing.id,
      userId: listing.user_id,
      score: score.overall_score,
      tier: score.tier,
      analyzed_at: score.analyzed_at
    })
  }
}

export class UserEvents {
  static USER_REGISTERED = 'user.registered'
  static USER_SUBSCRIBED = 'user.subscribed'
  static USER_UPGRADED = 'user.upgraded'
  static USER_CANCELED = 'user.canceled'

  static emitUserRegistered(user: User) {
    eventBus.emit(this.USER_REGISTERED, {
      userId: user.id,
      email: user.email,
      plan: user.plan,
      registered_at: user.created_at
    })
  }
}

export class SystemEvents {
  static SCRAPER_COMPLETED = 'scraper.completed'
  static SCRAPER_FAILED = 'scraper.failed'
  static AI_ANALYSIS_COMPLETED = 'ai.analysis.completed'
  static QUEUE_PROCESSING_STARTED = 'queue.processing.started'
  static QUEUE_PROCESSING_COMPLETED = 'queue.processing.completed'
}
```

#### Event Handlers
```typescript
// lib/events/event-handlers.ts
export class EventHandlers {
  constructor(
    private emailService: EmailService,
    private notificationService: NotificationService,
    private analyticsService: AnalyticsService,
    private webhookService: WebhookService
  ) {
    this.setupEventListeners()
  }

  private setupEventListeners() {
    // Listing events
    eventBus.on(ListingEvents.LISTING_ANALYZED, this.handleListingAnalyzed.bind(this))
    eventBus.on(ListingEvents.LISTING_FAILED, this.handleListingFailed.bind(this))
    
    // User events
    eventBus.on(UserEvents.USER_REGISTERED, this.handleUserRegistered.bind(this))
    eventBus.on(UserEvents.USER_SUBSCRIBED, this.handleUserSubscribed.bind(this))
    
    // System events
    eventBus.on(SystemEvents.SCRAPER_COMPLETED, this.handleScraperCompleted.bind(this))
  }

  private async handleListingAnalyzed(event: EventRecord) {
    const { listingId, userId, score, tier } = event.data

    // Send notification to user
    await this.notificationService.create({
      user_id: userId,
      type: 'listing_analyzed',
      title: 'Analysis Complete',
      message: `Your listing analysis is ready with a score of ${score}/1000`,
      data: { listingId, score, tier }
    })

    // Send email if user has notifications enabled
    const user = await this.getUserPreferences(userId)
    if (user.email_notifications) {
      await this.emailService.sendAnalysisComplete({
        to: user.email,
        listing_id: listingId,
        score,
        tier
      })
    }

    // Track analytics
    await this.analyticsService.track('listing_analyzed', {
      user_id: userId,
      listing_id: listingId,
      score,
      tier,
      analysis_duration: this.calculateAnalysisDuration(listingId)
    })

    // Trigger external webhooks if configured
    await this.webhookService.triggerUserWebhooks(userId, {
      event: 'listing.analyzed',
      data: { listingId, score, tier }
    })
  }

  private async handleListingFailed(event: EventRecord) {
    const { listingId, userId, error } = event.data

    // Create failure notification
    await this.notificationService.create({
      user_id: userId,
      type: 'listing_failed',
      title: 'Analysis Failed',
      message: 'Your listing analysis encountered an error. Please try again.',
      data: { listingId, error }
    })

    // Log for support team
    await this.analyticsService.track('listing_analysis_failed', {
      user_id: userId,
      listing_id: listingId,
      error_message: error,
      error_timestamp: event.metadata.timestamp
    })
  }

  private async handleUserRegistered(event: EventRecord) {
    const { userId, email } = event.data

    // Send welcome email
    await this.emailService.sendWelcome({
      to: email,
      user_id: userId
    })

    // Create onboarding tasks
    await this.createOnboardingTasks(userId)

    // Track registration
    await this.analyticsService.track('user_registered', {
      user_id: userId,
      registration_source: event.metadata.source
    })
  }
}
```

---

## 📈 Performance Optimization

### Caching Strategy

#### Multi-Layer Caching
```typescript
// lib/cache/cache-manager.ts
export class CacheManager {
  private redis: Redis
  private memoryCache = new Map<string, CacheEntry>()
  private maxMemoryEntries = 1000

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL)
  }

  async get<T>(key: string): Promise<T | null> {
    // Check memory cache first
    const memoryEntry = this.memoryCache.get(key)
    if (memoryEntry && !this.isExpired(memoryEntry)) {
      return memoryEntry.data
    }

    // Check Redis cache
    const redisData = await this.redis.get(key)
    if (redisData) {
      const parsed = JSON.parse(redisData)
      
      // Update memory cache
      this.setMemoryCache(key, parsed.data, parsed.expiresAt)
      
      return parsed.data
    }

    return null
  }

  async set<T>(key: string, data: T, ttl: number = 3600): Promise<void> {
    const expiresAt = new Date(Date.now() + ttl * 1000)
    
    // Set in Redis
    await this.redis.setex(key, ttl, JSON.stringify({
      data,
      expiresAt: expiresAt.toISOString()
    }))

    // Set in memory cache
    this.setMemoryCache(key, data, expiresAt)
  }

  async invalidate(pattern: string): Promise<void> {
    // Invalidate Redis keys
    const keys = await this.redis.keys(pattern)
    if (keys.length > 0) {
      await this.redis.del(...keys)
    }

    // Invalidate memory cache
    for (const key of this.memoryCache.keys()) {
      if (this.matchesPattern(key, pattern)) {
        this.memoryCache.delete(key)
      }
    }
  }

  private setMemoryCache<T>(key: string, data: T, expiresAt: Date): void {
    // Limit memory cache size
    if (this.memoryCache.size >= this.maxMemoryEntries) {
      const firstKey = this.memoryCache.keys().next().value
      this.memoryCache.delete(firstKey)
    }

    this.memoryCache.set(key, {
      data,
      expiresAt,
      createdAt: new Date()
    })
  }
}

// Cache strategies for different data types
export class ListingCacheService {
  private cache = new CacheManager()

  async getListingScore(listingId: string): Promise<Score | null> {
    return this.cache.get(`listing:${listingId}:score`)
  }

  async setListingScore(listingId: string, score: Score): Promise<void> {
    // Cache for 1 hour
    await this.cache.set(`listing:${listingId}:score`, score, 3600)
  }

  async getCompetitorData(location: string): Promise<Competitor[] | null> {
    return this.cache.get(`competitors:${location}`)
  }

  async setCompetitorData(location: string, data: Competitor[]): Promise<void> {
    // Cache for 24 hours
    await this.cache.set(`competitors:${location}`, data, 86400)
  }

  async invalidateListingCache(listingId: string): Promise<void> {
    await this.cache.invalidate(`listing:${listingId}:*`)
  }
}
```

### Database Query Optimization

#### Query Builder with Caching
```typescript
// lib/database/query-builder.ts
export class OptimizedQueryBuilder {
  private cache = new CacheManager()

  async getListingsWithScores(
    userId: string, 
    filters: ListingFilters,
    options: QueryOptions = {}
  ): Promise<ListingWithScore[]> {
    const cacheKey = `listings:${userId}:${JSON.stringify(filters)}`
    
    // Try cache first
    if (!options.skipCache) {
      const cached = await this.cache.get<ListingWithScore[]>(cacheKey)
      if (cached) return cached
    }

    // Build optimized query
    let query = supabase
      .from('listings')
      .select(`
        id,
        title,
        airbnb_url,
        location,
        status,
        created_at,
        updated_at,
        listing_scores!inner(
          overall_score,
          tier,
          analyzed_at
        )
      `)
      .eq('user_id', userId)

    // Apply filters
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,location.ilike.%${filters.search}%`)
    }

    // Apply sorting
    query = query.order(filters.sort || 'created_at', {
      ascending: filters.order === 'asc'
    })

    // Apply pagination
    const offset = ((filters.page || 1) - 1) * (filters.per_page || 20)
    query = query.range(offset, offset + (filters.per_page || 20) - 1)

    const { data, error } = await query

    if (error) throw error

    const results = data || []

    // Cache results for 5 minutes
    await this.cache.set(cacheKey, results, 300)

    return results
  }

  async getListingAnalytics(
    userId: string,
    period: string = '30d'
  ): Promise<AnalyticsData> {
    const cacheKey = `analytics:${userId}:${period}`
    
    const cached = await this.cache.get<AnalyticsData>(cacheKey)
    if (cached) return cached

    // Complex analytics query with multiple aggregations
    const { data, error } = await supabase.rpc('get_user_analytics', {
      p_user_id: userId,
      p_period: period
    })

    if (error) throw error

    // Cache for 1 hour
    await this.cache.set(cacheKey, data, 3600)

    return data
  }
}
```

---

## 📋 Data Flow Implementation Checklist

### ✅ Core Flows
- [ ] Listing analysis pipeline implemented
- [ ] Real-time data synchronization working
- [ ] Background job processing system
- [ ] Event-driven communication
- [ ] Data validation and transformation
- [ ] Error handling and retry logic
- [ ] Performance monitoring and optimization

### 🔄 State Management
- [ ] Frontend state architecture (Zustand + TanStack Query)
- [ ] Backend state synchronization
- [ ] Real-time updates via WebSocket
- [ ] Optimistic UI updates
- [ ] Cache invalidation strategies
- [ ] State persistence and recovery

### 📊 Performance
- [ ] Multi-layer caching implemented
- [ ] Database query optimization
- [ ] Background processing optimization
- [ ] Real-time connection pooling
- [ ] Memory usage monitoring
- [ ] Load testing completed

### 🔒 Security & Validation
- [ ] Input validation pipelines
- [ ] Data sanitization
- [ ] Rate limiting implementation
- [ ] Authentication integration
- [ ] Audit logging
- [ ] Error boundary implementation

---

**Document Status**: ✅ Complete  
**Implementation Phase**: Phase 2-3 (Data Integration & Core Logic)  
**Dependencies**: Database schema, API endpoints, service layer  
**Review Schedule**: After each major flow implementation  
**Performance Targets**: <500ms API response, <2s UI updates, 99.9% reliability