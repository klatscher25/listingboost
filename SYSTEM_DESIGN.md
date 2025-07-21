# ListingBoost Pro - System Design Documentation

## 📋 Document Overview

**Document Type**: Technical System Design Specification  
**Version**: 1.0  
**Created**: 2025-01-20  
**Last Updated**: 2025-01-20  
**Status**: Final Design  
**Target Audience**: Development Team, Technical Stakeholders  

---

## 🎯 System Overview

### Project Summary
ListingBoost Pro is a comprehensive SaaS platform for Airbnb listing optimization using AI-powered analysis. The system provides automated listing scoring (0-1000 points), AI-generated optimization recommendations, performance monitoring, and competitor tracking through a tiered subscription model.

### Core Value Proposition
- **Automated Analysis**: 1000-point scoring system across 10 categories
- **AI Recommendations**: Actionable optimization suggestions
- **Market Intelligence**: Competitor analysis and benchmarking
- **Performance Tracking**: Real-time analytics and monitoring

### Technical Constraints
- **File Size Limit**: 400 lines maximum per file
- **Performance**: <2s page load, <500ms API response
- **Architecture**: Modular monolith with Next.js 15
- **Security**: Supabase RLS, GDPR compliance
- **Scalability**: Serverless-first with background processing

---

## 🏗️ System Architecture

### Architecture Decision: Modular Monolith

**Selected Approach**: Modular Monolith with Event-Driven Patterns  
**Alternative Approaches Considered**:
1. Pure Monolith (rejected: scalability concerns)
2. Microservices (rejected: complexity for MVP)

**Justification**:
- Balance between development speed and scalability
- Clear separation of concerns within single deployment
- Easy to refactor into microservices later
- Optimal for team size and complexity

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    LISTINGBOOST PRO ARCHITECTURE               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │ FRONTEND    │    │ API LAYER   │    │ SERVICES    │         │
│  │ Next.js 15  │───▶│ REST + WS   │───▶│ Business    │         │
│  │ React TSX   │    │ Rate Limit  │    │ Logic       │         │
│  │ Tailwind v4 │    │ Auth Guard  │    │ Scoring     │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │ EXTERNAL    │    │ DATABASE    │    │ BACKGROUND  │         │
│  │ SERVICES    │───▶│ Supabase    │◀───│ WORKERS     │         │
│  │ Apify       │    │ PostgreSQL  │    │ Vercel Cron │         │
│  │ Gemini AI   │    │ RLS + Cache │    │ Queue Mgmt  │         │
│  │ Stripe      │    │ Real-time   │    │ Webhooks    │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

#### 1. Presentation Layer (Next.js 15)
- **Framework**: Next.js 15 with App Router
- **Components**: React Server Components + Client Components
- **Styling**: Tailwind CSS v4 (zero-config)
- **UI Library**: shadcn/ui v2 (React 19 compatible)
- **State Management**: React useState + Server State
- **Validation**: Zod schemas

#### 2. API Layer (REST + WebSocket)
- **Routing**: Next.js API Routes (/app/api)
- **Authentication**: JWT-based with Supabase Auth
- **Rate Limiting**: Tier-based (per subscription plan)
- **Validation**: Zod input/output validation
- **Error Handling**: Standardized error responses
- **Real-time**: WebSocket for live updates

#### 3. Service Layer (Business Logic)
- **Scoring Engine**: 1000-point calculation system
- **Integration Services**: Apify, Gemini, Stripe clients
- **Background Jobs**: Queue management and processing
- **Caching Strategy**: Redis for sessions, memory for calculations
- **Event System**: Internal event bus for decoupling

#### 4. Data Layer (Supabase)
- **Database**: PostgreSQL with advanced features
- **Security**: Row Level Security (RLS) policies
- **Real-time**: Supabase subscriptions
- **Migrations**: Version-controlled schema changes
- **Backup**: Automated with point-in-time recovery

---

## 📊 Database Design

### Schema Overview
The database follows a multi-tenant SaaS pattern with clear separation between user data and system data.

### Core Entity Relationships

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  profiles   │────│ listings    │────│listing_     │
│             │    │             │    │scores       │
│ - id        │    │ - id        │    │             │
│ - email     │    │ - user_id   │    │ - listing_id│
│ - full_name │    │ - airbnb_id │    │ - score     │
└─────────────┘    │ - title     │    │ - analyzed  │
                   │ - location  │    └─────────────┘
                   └─────────────┘
                          │
                   ┌─────────────┐
                   │listing_     │
                   │reviews      │
                   │             │
                   │ - id        │
                   │ - listing_id│
                   │ - rating    │
                   │ - sentiment │
                   └─────────────┘
```

### Key Tables

#### Core Business Tables
- **listings**: Primary Airbnb listing data
- **listing_reviews**: Individual reviews for sentiment analysis
- **listing_images**: Photo analysis and scoring
- **listing_availability**: 365-day availability calendar
- **location_competitors**: Market analysis data
- **listing_scores**: AI scoring results and recommendations

#### SaaS Infrastructure Tables
- **profiles**: User management and preferences
- **organizations**: Team features and collaboration
- **subscriptions**: Stripe billing integration
- **payments**: Transaction history and invoicing
- **usage_tracking**: Plan limits and fair usage
- **api_keys**: Pro plan API access management

### Row Level Security (RLS) Policies

```sql
-- Example: Users can only access their own listings
CREATE POLICY "Users can view own listings" ON listings
    FOR SELECT USING (auth.uid() = user_id);

-- Example: Organization members can view shared listings
CREATE POLICY "Org members can view shared listings" ON listings
    FOR SELECT USING (
        user_id IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = (
                SELECT organization_id FROM organization_members 
                WHERE user_id = auth.uid()
            )
        )
    );
```

---

## 🔌 API Design Specification

### API Architecture Principles
- **RESTful Design**: Standard HTTP verbs and status codes
- **Versioning**: URL-based versioning (/api/v1/)
- **Consistency**: Standardized request/response formats
- **Security**: Authentication and authorization on all endpoints
- **Performance**: Caching, rate limiting, and pagination

### API Endpoint Structure

```
/api/v1/
├── auth/
│   ├── login              POST
│   ├── logout             POST
│   ├── refresh            POST
│   └── profile            GET, PUT
├── listings/
│   ├── /                  GET, POST
│   ├── /{id}             GET, PUT, DELETE
│   ├── /{id}/analyze     POST
│   ├── /{id}/score       GET
│   └── /{id}/export      GET
├── organizations/
│   ├── /                  GET, POST
│   ├── /{id}             GET, PUT, DELETE
│   └── /{id}/members     GET, POST, DELETE
├── subscriptions/
│   ├── /                  GET
│   ├── /plans            GET
│   ├── /checkout         POST
│   └── /portal           GET
└── webhooks/
    ├── apify             POST
    ├── stripe            POST
    └── gemini            POST
```

### Request/Response Format Standards

#### Success Response Format
```json
{
  "success": true,
  "data": {
    // Response payload
  },
  "meta": {
    "timestamp": "2025-01-20T10:00:00Z",
    "version": "v1",
    "pagination": {
      "page": 1,
      "per_page": 20,
      "total": 100,
      "total_pages": 5
    }
  }
}
```

#### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Validation failed",
    "details": {
      "field": "airbnb_url",
      "issue": "Invalid URL format"
    }
  },
  "meta": {
    "timestamp": "2025-01-20T10:00:00Z",
    "version": "v1",
    "request_id": "req_12345"
  }
}
```

### Authentication & Authorization

#### JWT Token Structure
```json
{
  "sub": "user_uuid",
  "email": "user@example.com",
  "role": "user",
  "plan": "growth",
  "org_id": "org_uuid",
  "exp": 1642636800,
  "iat": 1642550400
}
```

#### Rate Limiting Strategy
- **Free Plan**: 10 requests/hour
- **Starter Plan**: 100 requests/hour  
- **Growth Plan**: 1000 requests/hour
- **Pro Plan**: 10000 requests/hour

---

## 🧩 Component Architecture

### Component Hierarchy

```
App
├── Layouts/
│   ├── RootLayout              # Global layout with providers
│   ├── DashboardLayout         # Protected dashboard layout
│   └── PublicLayout           # Marketing pages layout
├── Pages/
│   ├── LandingPage            # Marketing and conversion
│   ├── DashboardPage          # Main application interface
│   ├── AnalysisPage           # Listing analysis interface
│   └── SettingsPage           # User and org settings
├── Features/
│   ├── Auth/
│   │   ├── LoginForm          # Authentication forms
│   │   ├── SignupForm         # User registration
│   │   └── AuthGuard          # Route protection
│   ├── Listings/
│   │   ├── ListingCard        # Individual listing display
│   │   ├── ListingTable       # Tabular listing view
│   │   ├── AnalysisForm       # URL input and validation
│   │   └── ScoreDisplay       # Score visualization
│   ├── Dashboard/
│   │   ├── MetricsOverview    # KPI cards and charts
│   │   ├── RecentActivity     # Activity feed
│   │   └── QuickActions       # Common user actions
│   └── Billing/
│       ├── PlanSelector       # Subscription plans
│       ├── PaymentForm        # Stripe integration
│       └── BillingHistory     # Invoice management
└── Shared/
    ├── UI/                    # shadcn/ui components
    ├── Forms/                 # Reusable form components
    ├── Charts/                # Data visualization
    └── Layout/                # Layout utilities
```

### Component Design Patterns

#### 1. Server Components (Default)
```typescript
// app/dashboard/page.tsx
export default async function DashboardPage() {
  const listings = await getListings();
  
  return (
    <div className="space-y-6">
      <MetricsOverview />
      <ListingTable listings={listings} />
    </div>
  );
}
```

#### 2. Client Components (Interactive)
```typescript
// components/features/listings/AnalysisForm.tsx
'use client';

export function AnalysisForm() {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    await analyzeListingAction(url);
    setIsAnalyzing(false);
  };
  
  return (
    <form onSubmit={handleAnalyze}>
      {/* Form implementation */}
    </form>
  );
}
```

#### 3. Compound Components
```typescript
// components/features/listings/ScoreDisplay.tsx
export function ScoreDisplay({ score }: { score: number }) {
  return (
    <ScoreCard>
      <ScoreCard.Header>
        <ScoreCard.Title>Overall Score</ScoreCard.Title>
        <ScoreCard.Badge tier={getScoreTier(score)} />
      </ScoreCard.Header>
      <ScoreCard.Body>
        <ScoreCard.Chart value={score} max={1000} />
        <ScoreCard.Breakdown categories={score.categories} />
      </ScoreCard.Body>
    </ScoreCard>
  );
}
```

---

## 🔄 Data Flow & Integration Patterns

### Data Flow Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   USER      │───▶│   FRONTEND  │───▶│   API       │
│   ACTION    │    │   FORM      │    │   ROUTE     │
└─────────────┘    └─────────────┘    └─────────────┘
                                               │
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  DATABASE   │◀───│   SERVICE   │◀───│ VALIDATION  │
│  UPDATE     │    │   LAYER     │    │   LAYER     │
└─────────────┘    └─────────────┘    └─────────────┘
                           │
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  RESPONSE   │◀───│ BACKGROUND  │───▶│  EXTERNAL   │
│  TO USER    │    │    JOBS     │    │  SERVICES   │
└─────────────┘    └─────────────┘    └─────────────┘
```

### Integration Patterns

#### 1. Listing Analysis Flow
```
User Submits URL
        │
        ▼
    Validate URL
        │
        ▼
   Queue Analysis Job
        │
        ▼
    Apify Scrapers (4x)
        │
        ▼
    Store Raw Data
        │
        ▼
    AI Analysis (Gemini)
        │
        ▼
   Calculate 1000-Point Score
        │
        ▼
    Generate Recommendations
        │
        ▼
   Update UI (WebSocket)
```

#### 2. Background Processing Pattern
```typescript
// lib/services/background-jobs.ts
export class BackgroundJobProcessor {
  async processListingAnalysis(listingId: string) {
    try {
      // 1. Update status to "analyzing"
      await updateListingStatus(listingId, 'analyzing');
      
      // 2. Run scrapers in parallel
      const [listing, reviews, availability, competitors] = await Promise.all([
        apifyService.scrapeListing(url),
        apifyService.scrapeReviews(url),
        apifyService.scrapeAvailability(url),
        apifyService.scrapeCompetitors(location)
      ]);
      
      // 3. Store raw data
      await storeScrapedData(listingId, { listing, reviews, availability, competitors });
      
      // 4. Run AI analysis
      const aiAnalysis = await geminiService.analyzeContent(listing, reviews);
      
      // 5. Calculate score
      const score = await scoringService.calculateScore(listingId);
      
      // 6. Generate recommendations
      const recommendations = await recommendationService.generate(score);
      
      // 7. Update status to "completed"
      await updateListingStatus(listingId, 'completed');
      
      // 8. Notify user via WebSocket
      await notifyUser(userId, 'analysis_complete', { listingId, score });
      
    } catch (error) {
      await updateListingStatus(listingId, 'failed');
      await notifyUser(userId, 'analysis_failed', { listingId, error });
    }
  }
}
```

#### 3. Event-Driven Communication
```typescript
// lib/events/event-bus.ts
export class EventBus {
  private listeners: Map<string, Function[]> = new Map();
  
  emit(event: string, data: any) {
    const handlers = this.listeners.get(event) || [];
    handlers.forEach(handler => handler(data));
  }
  
  on(event: string, handler: Function) {
    const handlers = this.listeners.get(event) || [];
    handlers.push(handler);
    this.listeners.set(event, handlers);
  }
}

// Usage in services
eventBus.on('listing:analyzed', async (data) => {
  await updateDashboardMetrics(data.userId);
  await sendAnalysisCompleteEmail(data.userId, data.listingId);
});
```

---

## 🔐 Security Architecture

### Security Principles
- **Defense in Depth**: Multiple security layers
- **Principle of Least Privilege**: Minimal access rights
- **Zero Trust**: Verify everything, trust nothing
- **Data Encryption**: At rest and in transit
- **Audit Logging**: Complete activity tracking

### Authentication & Authorization Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   CLIENT    │───▶│  SUPABASE   │───▶│ JWT TOKEN   │
│   LOGIN     │    │    AUTH     │    │  GENERATION │
└─────────────┘    └─────────────┘    └─────────────┘
                                               │
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   RLS       │◀───│  DATABASE   │◀───│  API CALL   │
│  POLICIES   │    │   ACCESS    │    │ WITH TOKEN  │
└─────────────┘    └─────────────┘    └─────────────┘
```

### Row Level Security Implementation

```sql
-- Enable RLS on all user data tables
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own data
CREATE POLICY "user_own_data" ON listings
    FOR ALL USING (auth.uid() = user_id);

-- Policy: Organization members can view shared data
CREATE POLICY "org_shared_data" ON listings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organization_members om1
            JOIN organization_members om2 ON om1.organization_id = om2.organization_id
            WHERE om1.user_id = auth.uid() AND om2.user_id = listings.user_id
        )
    );

-- Policy: Admin access for support
CREATE POLICY "admin_access" ON listings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
```

### API Security Measures

#### 1. Input Validation
```typescript
// lib/validation/schemas.ts
export const analyzeListingSchema = z.object({
  url: z.string().url().refine(
    (url) => url.includes('airbnb.com'),
    'Must be a valid Airbnb URL'
  ),
  priority: z.enum(['low', 'normal', 'high']).default('normal')
});

// app/api/v1/listings/analyze/route.ts
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = analyzeListingSchema.parse(body);
    
    // Process valid data
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', details: error.errors } },
        { status: 400 }
      );
    }
    throw error;
  }
}
```

#### 2. Rate Limiting
```typescript
// lib/security/rate-limit.ts
export class RateLimiter {
  private redis: Redis;
  
  async checkLimit(key: string, limit: number, window: number): Promise<boolean> {
    const current = await this.redis.incr(key);
    
    if (current === 1) {
      await this.redis.expire(key, window);
    }
    
    return current <= limit;
  }
  
  async getRemainingRequests(key: string, limit: number): Promise<number> {
    const current = await this.redis.get(key) || 0;
    return Math.max(0, limit - parseInt(current.toString()));
  }
}

// Middleware usage
export async function rateLimitMiddleware(request: Request, userId: string) {
  const userPlan = await getUserPlan(userId);
  const limit = RATE_LIMITS[userPlan];
  const key = `rate_limit:${userId}:${Date.now() / (1000 * 60 * 60)}`; // hourly
  
  const allowed = await rateLimiter.checkLimit(key, limit, 3600);
  
  if (!allowed) {
    throw new Error('Rate limit exceeded');
  }
}
```

---

## ⚡ Performance Architecture

### Performance Strategy
- **Frontend**: Server-side rendering, code splitting, lazy loading
- **API**: Caching, database optimization, background processing
- **Database**: Indexing, query optimization, read replicas
- **External Services**: Request batching, result caching, fallbacks

### Caching Strategy

```
┌─────────────────────────────────────────────────────────┐
│                    CACHING LAYERS                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │   BROWSER   │    │   VERCEL    │    │   REDIS     │  │
│  │   CACHE     │    │    EDGE     │    │   CACHE     │  │
│  │             │    │   CACHE     │    │             │  │
│  │ Static      │    │ Static      │    │ Session     │  │
│  │ Assets      │    │ Pages       │    │ Data        │  │
│  │ Images      │    │ API Routes  │    │ Queries     │  │
│  └─────────────┘    └─────────────┘    └─────────────┘  │
│                                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │  DATABASE   │    │ APPLICATION │    │  EXTERNAL   │  │
│  │   CACHE     │    │   MEMORY    │    │  SERVICE    │  │
│  │             │    │   CACHE     │    │   CACHE     │  │
│  │ Query       │    │ Component   │    │ API         │  │
│  │ Results     │    │ State       │    │ Responses   │  │
│  │ Indexes     │    │ Computed    │    │ Rate Limits │  │
│  └─────────────┘    └─────────────┘    └─────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Database Optimization

#### 1. Indexing Strategy
```sql
-- Core business indexes
CREATE INDEX idx_listings_user_id ON listings(user_id);
CREATE INDEX idx_listings_airbnb_id ON listings(airbnb_id);
CREATE INDEX idx_listings_created_at ON listings(created_at DESC);

-- Scoring and analytics indexes
CREATE INDEX idx_listing_scores_overall_score ON listing_scores(overall_score DESC);
CREATE INDEX idx_listing_scores_analyzed_at ON listing_scores(analyzed_at DESC);

-- Review analysis indexes
CREATE INDEX idx_listing_reviews_sentiment ON listing_reviews(sentiment_score);
CREATE INDEX idx_listing_reviews_created ON listing_reviews(created_at_airbnb DESC);

-- Composite indexes for common queries
CREATE INDEX idx_listings_user_status ON listings(user_id, analysis_status);
CREATE INDEX idx_scores_listing_version ON listing_scores(listing_id, scoring_version DESC);
```

#### 2. Query Optimization
```typescript
// lib/db/queries/listings.ts
export class ListingQueries {
  // Optimized query with selective fields and joins
  async getUserListingsWithScores(userId: string, limit = 20, offset = 0) {
    return supabase
      .from('listings')
      .select(`
        id,
        title,
        airbnb_url,
        created_at,
        analysis_status,
        listing_scores!inner(
          overall_score,
          analyzed_at
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
  }
  
  // Paginated query with performance optimization
  async getListingsWithPagination(userId: string, page = 1, pageSize = 20) {
    const offset = (page - 1) * pageSize;
    
    const [data, count] = await Promise.all([
      this.getUserListingsWithScores(userId, pageSize, offset),
      this.getListingsCount(userId)
    ]);
    
    return {
      data: data.data,
      pagination: {
        page,
        pageSize,
        total: count,
        totalPages: Math.ceil(count / pageSize)
      }
    };
  }
}
```

### Background Processing Optimization

```typescript
// lib/services/queue-manager.ts
export class QueueManager {
  private queues = {
    high: new Array<Job>(),
    normal: new Array<Job>(),
    low: new Array<Job>()
  };
  
  async processQueue() {
    // Process high priority first
    while (this.queues.high.length > 0) {
      const job = this.queues.high.shift()!;
      await this.processJob(job);
    }
    
    // Process normal priority
    while (this.queues.normal.length > 0) {
      const job = this.queues.normal.shift()!;
      await this.processJob(job);
    }
    
    // Process low priority (rate limited)
    if (this.queues.low.length > 0) {
      const job = this.queues.low.shift()!;
      await this.processJob(job);
      await this.delay(1000); // Rate limit low priority
    }
  }
  
  private async processJob(job: Job) {
    try {
      await job.handler(job.data);
      await this.markJobComplete(job.id);
    } catch (error) {
      await this.markJobFailed(job.id, error);
      await this.scheduleRetry(job);
    }
  }
}
```

---

## 🚀 Deployment Architecture

### Infrastructure Overview

```
┌─────────────────────────────────────────────────────────┐
│                 PRODUCTION INFRASTRUCTURE               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │   VERCEL    │    │  SUPABASE   │    │   EXTERNAL  │  │
│  │             │    │             │    │  SERVICES   │  │
│  │ Next.js App │    │ PostgreSQL  │    │             │  │
│  │ Serverless  │    │ Auth        │    │ Apify       │  │
│  │ Functions   │    │ Real-time   │    │ Gemini AI   │  │
│  │ Edge Cache  │    │ Storage     │    │ Stripe      │  │
│  └─────────────┘    └─────────────┘    │ Cloudinary  │  │
│                                        │ Brevo       │  │
│  ┌─────────────┐    ┌─────────────┐    └─────────────┘  │
│  │   REDIS     │    │ MONITORING  │                     │
│  │             │    │             │                     │
│  │ Session     │    │ Vercel      │                     │
│  │ Cache       │    │ Analytics   │                     │
│  │ Queue       │    │ Sentry      │                     │
│  │ Rate Limit  │    │ LogRocket   │                     │
│  └─────────────┘    └─────────────┘                     │
└─────────────────────────────────────────────────────────┘
```

### Environment Configuration

#### 1. Environment Variables
```bash
# Database
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# External Services
APIFY_API_TOKEN=xxx
GOOGLE_GEMINI_API_KEY=xxx
STRIPE_SECRET_KEY=xxx
STRIPE_WEBHOOK_SECRET=xxx

# Cache & Queue
REDIS_URL=redis://xxx
REDIS_TOKEN=xxx

# Monitoring
SENTRY_DSN=xxx
VERCEL_ANALYTICS_ID=xxx

# Feature Flags
FEATURE_AI_ANALYSIS=true
FEATURE_COMPETITOR_TRACKING=true
FEATURE_API_ACCESS=true
```

#### 2. Deployment Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm run type-check
      - run: pnpm run lint
      - run: pnpm run test
      - run: pnpm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### Monitoring & Observability

#### 1. Application Monitoring
```typescript
// lib/monitoring/analytics.ts
export class ApplicationMonitoring {
  async trackEvent(event: string, properties: Record<string, any>) {
    // Vercel Analytics
    await analytics.track(event, properties);
    
    // Custom metrics
    await this.recordMetric(`event.${event}`, 1, properties);
  }
  
  async trackPerformance(operation: string, duration: number) {
    await this.recordMetric(`performance.${operation}`, duration, {
      timestamp: new Date().toISOString()
    });
  }
  
  async trackError(error: Error, context: Record<string, any>) {
    // Sentry error tracking
    Sentry.captureException(error, { extra: context });
    
    // Custom error metrics
    await this.recordMetric('error.count', 1, {
      error: error.message,
      stack: error.stack,
      ...context
    });
  }
}
```

#### 2. Health Checks
```typescript
// app/api/health/route.ts
export async function GET() {
  const checks = await Promise.allSettled([
    checkDatabase(),
    checkRedis(),
    checkExternalServices()
  ]);
  
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      database: checks[0].status === 'fulfilled' ? 'healthy' : 'unhealthy',
      redis: checks[1].status === 'fulfilled' ? 'healthy' : 'unhealthy',
      external: checks[2].status === 'fulfilled' ? 'healthy' : 'unhealthy'
    }
  };
  
  const overallHealthy = Object.values(health.checks).every(status => status === 'healthy');
  
  return NextResponse.json(health, {
    status: overallHealthy ? 200 : 503
  });
}
```

---

## 📋 Implementation Checklist

### Phase 1: Foundation ✅
- [ ] Initialize Next.js 15 project with TypeScript
- [ ] Configure Tailwind CSS v4 and shadcn/ui v2
- [ ] Set up project structure with file size limits
- [ ] Deploy Supabase database with complete schema
- [ ] Implement Row Level Security policies
- [ ] Create authentication system with OAuth
- [ ] Build basic protected route middleware
- [ ] Set up development environment and tooling

### Phase 2: Core Features 🔄
- [ ] Implement Apify scraper integrations (4 scrapers)
- [ ] Build Google Gemini AI analysis pipeline
- [ ] Create 1000-point scoring system (10 categories)
- [ ] Develop recommendation engine
- [ ] Build dashboard with real-time updates
- [ ] Implement listing analysis workflow
- [ ] Create background job processing system
- [ ] Add webhook handlers for external services

### Phase 3: SaaS Features 📋
- [ ] Integrate Stripe payment processing
- [ ] Build subscription management system
- [ ] Implement usage tracking and limits
- [ ] Create API access for Pro plans
- [ ] Build billing portal and invoicing
- [ ] Add organization and team features
- [ ] Implement plan upgrade/downgrade flows
- [ ] Create admin dashboard and tools

### Phase 4: Production Ready 🚀
- [ ] Implement comprehensive error handling
- [ ] Add monitoring and alerting systems
- [ ] Optimize database queries and indexing
- [ ] Set up caching strategies (Redis, Edge)
- [ ] Configure security hardening measures
- [ ] Implement GDPR compliance features
- [ ] Set up backup and disaster recovery
- [ ] Conduct load testing and optimization

### Phase 5: Launch & Scale 🎯
- [ ] Deploy to production environment
- [ ] Configure CI/CD pipeline automation
- [ ] Set up monitoring and analytics
- [ ] Create user documentation and guides
- [ ] Implement customer support systems
- [ ] Plan scaling and infrastructure growth
- [ ] Launch marketing and user acquisition
- [ ] Monitor metrics and iterate based on feedback

---

## 📚 Technical Reference

### Code Quality Standards
- **TypeScript**: Strict mode, no `any` types
- **File Size**: Maximum 400 lines per file
- **Function Size**: Maximum 100 lines, 5 parameters
- **Error Handling**: Comprehensive try-catch blocks
- **Testing**: Minimum 80% coverage requirement
- **Documentation**: JSDoc comments for all public functions

### Development Tools
- **Package Manager**: pnpm for fast, reliable installs
- **Code Quality**: ESLint + Prettier for consistency
- **Type Checking**: TypeScript strict mode
- **Testing**: Jest + React Testing Library
- **E2E Testing**: Playwright for critical user flows
- **Git Hooks**: Pre-commit validation with Husky

### External Service Limits
- **Apify**: 1000 requests/month (free tier)
- **Gemini AI**: 60 requests/minute rate limit
- **Stripe**: Standard webhook retry policies
- **Vercel**: Function timeout limits (10s hobby, 60s pro)
- **Supabase**: Connection pooling and query limits

---

**Document Status**: ✅ Complete  
**Next Actions**: Begin Phase 1 implementation  
**Review Schedule**: Weekly during development phases  
**Maintenance**: Update with architectural changes and decisions