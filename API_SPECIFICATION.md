# ListingBoost Pro - API Specification

## 📋 Document Overview

**Document Type**: RESTful API Specification  
**Version**: 1.0  
**Created**: 2025-01-20  
**Last Updated**: 2025-01-20  
**Status**: Design Phase  
**Base URL**: `https://api.listingboost.pro/v1`  

---

## 🔧 API Architecture

### Design Principles
- **RESTful Design**: Standard HTTP verbs and resource-based URLs
- **Consistent Structure**: Standardized request/response formats
- **Versioning Strategy**: URL-based versioning (`/v1/`, `/v2/`)
- **Security First**: Authentication required on all endpoints
- **Performance Optimized**: Caching, pagination, and rate limiting
- **Developer Friendly**: Comprehensive documentation and examples

### Base URL Structure
```
https://api.listingboost.pro/v1/
├── auth/                    # Authentication endpoints
├── listings/                # Listing management
├── organizations/           # Team and organization management
├── subscriptions/           # Billing and subscription management
├── analytics/               # Performance analytics
├── webhooks/                # External service webhooks
└── admin/                   # Administrative endpoints
```

---

## 🔐 Authentication

### Authentication Methods
- **JWT Bearer Tokens**: Primary authentication method
- **API Keys**: Pro plan programmatic access
- **OAuth 2.0**: Third-party integrations (future)

### Authentication Flow
```
1. User Login → Supabase Auth → JWT Token
2. Include in requests: Authorization: Bearer <token>
3. Token validation → RLS policy enforcement
4. Resource access granted/denied
```

### API Key Authentication (Pro Plans)
```http
GET /v1/listings
Authorization: ApiKey sk_live_xxx...
Content-Type: application/json
```

### JWT Token Structure
```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "role": "user",
  "plan": "growth",
  "org_id": "org_12345",
  "exp": 1642636800,
  "iat": 1642550400
}
```

---

## 📊 Request/Response Format

### Standard Response Format

#### Success Response
```json
{
  "success": true,
  "data": {
    // Response payload specific to endpoint
  },
  "meta": {
    "timestamp": "2025-01-20T10:00:00Z",
    "version": "v1",
    "request_id": "req_12345abcde",
    "pagination": {  // Only for paginated endpoints
      "page": 1,
      "per_page": 20,
      "total": 150,
      "total_pages": 8,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

#### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The provided data failed validation",
    "details": {
      "field": "airbnb_url",
      "issue": "Must be a valid Airbnb listing URL",
      "received": "https://example.com"
    }
  },
  "meta": {
    "timestamp": "2025-01-20T10:00:00Z",
    "version": "v1",
    "request_id": "req_12345abcde"
  }
}
```

### HTTP Status Codes
- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation failed
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

---

## 🔗 API Endpoints

### Authentication Endpoints

#### POST /auth/login
Login with email/password or OAuth provider.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "rt_...",
    "expires_in": 3600,
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "full_name": "John Doe",
      "plan": "growth",
      "created_at": "2024-01-15T10:00:00Z"
    }
  }
}
```

#### POST /auth/refresh
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refresh_token": "rt_abc123..."
}
```

#### POST /auth/logout
Invalidate current session and tokens.

#### GET /auth/profile
Get current user profile information.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "full_name": "John Doe",
    "avatar_url": "https://cloudinary.com/...",
    "plan": "growth",
    "organization": {
      "id": "org_12345",
      "name": "Acme Properties",
      "role": "owner"
    },
    "usage": {
      "listings_analyzed": 25,
      "api_calls_this_month": 150,
      "plan_limits": {
        "max_listings": 100,
        "max_api_calls": 1000
      }
    }
  }
}
```

---

### Listing Management Endpoints

#### GET /listings
Retrieve user's listings with optional filtering and pagination.

**Query Parameters:**
- `page` (int): Page number (default: 1)
- `per_page` (int): Items per page (default: 20, max: 100)
- `status` (string): Filter by analysis status (`pending`, `analyzing`, `completed`, `failed`)
- `sort` (string): Sort field (`created_at`, `score`, `title`)
- `order` (string): Sort order (`asc`, `desc`)
- `search` (string): Search in title or URL

**Example Request:**
```http
GET /v1/listings?page=1&per_page=20&status=completed&sort=score&order=desc
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "lst_12345",
      "airbnb_id": "721435506304471257",
      "title": "Modern Apartment in City Center",
      "airbnb_url": "https://www.airbnb.com/rooms/721435506304471257",
      "location": "Munich, Germany",
      "status": "completed",
      "score": {
        "overall": 847,
        "categories": {
          "host_performance": 165,
          "guest_satisfaction": 180,
          "content_optimization": 145,
          "visual_presentation": 98,
          "amenities": 120,
          "pricing": 85,
          "availability": 70,
          "location": 55,
          "business_performance": 35,
          "trust_safety": 34
        },
        "tier": "high_performer",
        "analyzed_at": "2025-01-20T08:30:00Z"
      },
      "metrics": {
        "reviews_count": 87,
        "overall_rating": 4.89,
        "price_per_night": 12500, // in cents
        "occupancy_rate": 0.78
      },
      "created_at": "2025-01-18T10:00:00Z",
      "updated_at": "2025-01-20T08:30:00Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "per_page": 20,
      "total": 45,
      "total_pages": 3,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

#### POST /listings
Create a new listing for analysis.

**Request Body:**
```json
{
  "airbnb_url": "https://www.airbnb.com/rooms/721435506304471257",
  "priority": "normal", // "low", "normal", "high"
  "notify_when_complete": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "lst_12345",
    "airbnb_url": "https://www.airbnb.com/rooms/721435506304471257",
    "status": "pending",
    "estimated_completion": "2025-01-20T11:30:00Z",
    "created_at": "2025-01-20T10:00:00Z"
  }
}
```

#### GET /listings/{id}
Get detailed information about a specific listing.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "lst_12345",
    "airbnb_id": "721435506304471257",
    "title": "Modern Apartment in City Center",
    "description": "Beautiful 2-bedroom apartment...",
    "airbnb_url": "https://www.airbnb.com/rooms/721435506304471257",
    "status": "completed",
    "property_details": {
      "property_type": "Entire apartment",
      "bedrooms": 2,
      "bathrooms": 1,
      "guests": 4,
      "location": {
        "city": "Munich",
        "country": "Germany",
        "latitude": 48.1351,
        "longitude": 11.5820
      }
    },
    "host_info": {
      "name": "Maria",
      "is_superhost": true,
      "response_rate": "100%",
      "response_time": "within an hour"
    },
    "score": {
      "overall": 847,
      "tier": "high_performer",
      "categories": {
        "host_performance": {
          "score": 165,
          "max_score": 180,
          "breakdown": {
            "superhost_status": 40,
            "response_rate": 30,
            "response_time": 25,
            "verification": 20,
            "experience": 25,
            "host_rating": 18,
            "profile_completeness": 7
          }
        }
        // ... other categories
      },
      "analyzed_at": "2025-01-20T08:30:00Z"
    },
    "recommendations": [
      {
        "category": "content_optimization",
        "priority": "high",
        "current_score": 145,
        "max_score": 180,
        "issue": "Title could include more location keywords",
        "suggestion": "Add 'Zentral' and 'U-Bahn' to highlight central location",
        "estimated_impact": "+15 points",
        "difficulty": "easy"
      }
    ],
    "competitor_analysis": {
      "market_position": "top_25_percent",
      "price_competitiveness": "competitive",
      "similar_listings_count": 23,
      "average_competitor_score": 652
    }
  }
}
```

#### PUT /listings/{id}
Update listing information or trigger re-analysis.

**Request Body:**
```json
{
  "trigger_reanalysis": true,
  "priority": "high"
}
```

#### DELETE /listings/{id}
Delete a listing and all associated data.

#### POST /listings/{id}/analyze
Trigger analysis for a specific listing.

**Request Body:**
```json
{
  "priority": "high",
  "include_competitors": true,
  "force_refresh": false
}
```

#### GET /listings/{id}/score
Get detailed scoring breakdown for a listing.

**Response:**
```json
{
  "success": true,
  "data": {
    "overall_score": 847,
    "tier": "high_performer",
    "percentile": 85,
    "categories": {
      "host_performance": {
        "score": 165,
        "max_score": 180,
        "weight": 0.18,
        "subcategories": {
          "superhost_status": {
            "score": 40,
            "max_score": 40,
            "description": "Active Superhost status",
            "data_source": "apify_scraper"
          },
          "response_rate": {
            "score": 30,
            "max_score": 30,
            "description": "100% response rate",
            "data_source": "apify_scraper"
          }
          // ... more subcategories
        }
      }
      // ... other categories
    },
    "scoring_metadata": {
      "version": "v1.0",
      "analyzed_at": "2025-01-20T08:30:00Z",
      "data_freshness": {
        "listing_data": "2025-01-20T08:00:00Z",
        "reviews_data": "2025-01-20T08:15:00Z",
        "competitor_data": "2025-01-19T22:00:00Z"
      }
    }
  }
}
```

#### GET /listings/{id}/recommendations
Get AI-generated recommendations for listing improvement.

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "id": "rec_001",
        "category": "content_optimization",
        "priority": "high",
        "current_score": 145,
        "potential_score": 160,
        "impact": "+15 points",
        "title": "Optimize listing title",
        "description": "Your title is missing key location indicators that guests search for",
        "suggestion": "Add 'Zentral' and 'U-Bahn' to highlight central location and transport access",
        "difficulty": "easy",
        "implementation_time": "5 minutes",
        "examples": [
          "Modern Zentral Apartment Near U-Bahn",
          "City Center Apartment with U-Bahn Access"
        ]
      },
      {
        "id": "rec_002",
        "category": "visual_presentation",
        "priority": "medium",
        "current_score": 98,
        "potential_score": 115,
        "impact": "+17 points",
        "title": "Add more photos",
        "description": "Listings with 25+ photos perform significantly better",
        "suggestion": "Add photos of bathroom, kitchen details, neighborhood views, and evening ambiance",
        "difficulty": "medium",
        "implementation_time": "2 hours",
        "photo_gaps": [
          "bathroom_detail",
          "kitchen_appliances",
          "neighborhood_view",
          "evening_lighting"
        ]
      }
    ],
    "summary": {
      "total_recommendations": 2,
      "potential_score_increase": 32,
      "quick_wins": 1,
      "estimated_ranking_improvement": "15-20 positions"
    }
  }
}
```

#### GET /listings/{id}/export
Export listing analysis as PDF report.

**Query Parameters:**
- `format` (string): Export format (`pdf`, `json`)
- `include_recommendations` (boolean): Include recommendations section
- `include_competitors` (boolean): Include competitor analysis

**Response:**
```json
{
  "success": true,
  "data": {
    "export_url": "https://cdn.listingboost.pro/exports/lst_12345_report.pdf",
    "expires_at": "2025-01-21T10:00:00Z",
    "file_size": 2048576,
    "format": "pdf"
  }
}
```

---

### Organization Management Endpoints

#### GET /organizations
Get user's organizations.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "org_12345",
      "name": "Acme Properties",
      "slug": "acme-properties",
      "role": "owner",
      "member_count": 5,
      "listing_count": 47,
      "plan": "professional",
      "created_at": "2024-12-01T10:00:00Z"
    }
  ]
}
```

#### POST /organizations
Create a new organization.

**Request Body:**
```json
{
  "name": "Acme Properties",
  "slug": "acme-properties"
}
```

#### GET /organizations/{id}
Get organization details.

#### PUT /organizations/{id}
Update organization information.

#### DELETE /organizations/{id}
Delete organization (owner only).

#### GET /organizations/{id}/members
Get organization members.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user_12345",
      "email": "john@acme.com",
      "full_name": "John Doe",
      "role": "owner",
      "joined_at": "2024-12-01T10:00:00Z",
      "last_active": "2025-01-20T09:30:00Z"
    },
    {
      "id": "user_67890",
      "email": "jane@acme.com",
      "full_name": "Jane Smith",
      "role": "member",
      "joined_at": "2024-12-05T14:20:00Z",
      "last_active": "2025-01-19T16:45:00Z"
    }
  ]
}
```

#### POST /organizations/{id}/members
Invite new member to organization.

**Request Body:**
```json
{
  "email": "newmember@acme.com",
  "role": "member"
}
```

#### DELETE /organizations/{id}/members/{user_id}
Remove member from organization.

---

### Subscription Management Endpoints

#### GET /subscriptions
Get current user's subscription information.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "sub_12345",
    "status": "active",
    "plan": {
      "id": "growth",
      "name": "Growth Plan",
      "price": 1900, // in cents
      "currency": "EUR",
      "interval": "month",
      "features": [
        "unlimited_listings",
        "competitor_tracking",
        "priority_support",
        "pdf_exports"
      ],
      "limits": {
        "listings_per_month": 100,
        "api_calls_per_month": 1000,
        "team_members": 5
      }
    },
    "current_period": {
      "start": "2025-01-01T00:00:00Z",
      "end": "2025-02-01T00:00:00Z"
    },
    "usage": {
      "listings_analyzed": 25,
      "api_calls_used": 150,
      "team_members": 3
    },
    "cancel_at_period_end": false,
    "next_billing_date": "2025-02-01T00:00:00Z"
  }
}
```

#### GET /subscriptions/plans
Get available subscription plans.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "freemium",
      "name": "Free",
      "price": 0,
      "currency": "EUR",
      "interval": null,
      "description": "Perfect for trying out ListingBoost",
      "features": [
        "1_listing_analysis",
        "basic_scoring",
        "email_support"
      ],
      "limits": {
        "listings_per_month": 1,
        "api_calls_per_month": 0,
        "team_members": 1
      }
    },
    {
      "id": "growth",
      "name": "Growth",
      "price": 1900,
      "currency": "EUR", 
      "interval": "month",
      "description": "For growing property management businesses",
      "features": [
        "unlimited_listings",
        "competitor_tracking",
        "priority_support",
        "pdf_exports",
        "team_collaboration"
      ],
      "limits": {
        "listings_per_month": 100,
        "api_calls_per_month": 1000,
        "team_members": 5
      },
      "popular": true
    }
  ]
}
```

#### POST /subscriptions/checkout
Create checkout session for plan upgrade.

**Request Body:**
```json
{
  "plan_id": "growth",
  "success_url": "https://app.listingboost.pro/success",
  "cancel_url": "https://app.listingboost.pro/billing"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "checkout_url": "https://checkout.stripe.com/pay/cs_...",
    "session_id": "cs_test_123..."
  }
}
```

#### POST /subscriptions/cancel
Cancel current subscription.

#### GET /subscriptions/portal
Get Stripe customer portal URL for billing management.

**Response:**
```json
{
  "success": true,
  "data": {
    "portal_url": "https://billing.stripe.com/session/...",
    "expires_at": "2025-01-20T11:00:00Z"
  }
}
```

---

### Analytics Endpoints

#### GET /analytics/overview
Get dashboard analytics overview.

**Query Parameters:**
- `period` (string): Time period (`7d`, `30d`, `90d`, `1y`)
- `timezone` (string): User timezone (default: UTC)

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_listings": 47,
      "average_score": 742,
      "score_trend": "+12", // change from previous period
      "top_performer_count": 8,
      "listings_needing_attention": 5
    },
    "score_distribution": {
      "elite_performer": 3,
      "high_performer": 12,
      "good_performer": 20,
      "average_performer": 8,
      "below_average": 4
    },
    "category_performance": {
      "host_performance": 158,
      "guest_satisfaction": 172,
      "content_optimization": 145,
      "visual_presentation": 108,
      "amenities": 125,
      "pricing": 89,
      "availability": 72,
      "location": 54,
      "business_performance": 32,
      "trust_safety": 35
    },
    "recent_activity": [
      {
        "type": "listing_analyzed",
        "listing_id": "lst_12345",
        "listing_title": "Modern Apartment",
        "score": 847,
        "timestamp": "2025-01-20T08:30:00Z"
      }
    ]
  }
}
```

#### GET /analytics/trends
Get performance trends over time.

**Query Parameters:**
- `period` (string): Time period (`7d`, `30d`, `90d`, `1y`)
- `metric` (string): Metric to track (`overall_score`, `bookings`, `ratings`)

**Response:**
```json
{
  "success": true,
  "data": {
    "metric": "overall_score",
    "period": "30d",
    "data_points": [
      {
        "date": "2025-01-01",
        "value": 725,
        "listings_count": 45
      },
      {
        "date": "2025-01-02", 
        "value": 728,
        "listings_count": 45
      }
      // ... more data points
    ],
    "trend": {
      "direction": "up",
      "change": 17,
      "change_percent": 2.4
    }
  }
}
```

#### GET /analytics/competitors
Get competitor analysis data.

**Response:**
```json
{
  "success": true,
  "data": {
    "market_position": {
      "your_average_score": 742,
      "market_average": 658,
      "percentile": 78,
      "top_10_percent_threshold": 820
    },
    "price_analysis": {
      "your_average_price": 12500,
      "market_average_price": 11200,
      "price_position": "above_average",
      "price_competitiveness": "good"
    },
    "performance_gaps": [
      {
        "category": "visual_presentation",
        "your_score": 108,
        "market_leader_score": 145,
        "gap": 37,
        "improvement_potential": "high"
      }
    ]
  }
}
```

---

### Webhook Endpoints

#### POST /webhooks/apify
Handle Apify scraper completion webhooks.

**Request Body:**
```json
{
  "status": "SUCCEEDED",
  "actorRunId": "run_12345",
  "userId": "user_67890",
  "startedAt": "2025-01-20T08:00:00Z",
  "finishedAt": "2025-01-20T08:05:00Z",
  "defaultDatasetId": "dataset_12345"
}
```

#### POST /webhooks/stripe
Handle Stripe billing webhooks.

**Request Body:**
```json
{
  "id": "evt_12345",
  "type": "invoice.payment_succeeded",
  "data": {
    "object": {
      "id": "in_12345",
      "customer": "cus_12345",
      "subscription": "sub_12345",
      "amount_paid": 1900,
      "currency": "eur"
    }
  }
}
```

---

## 🚦 Rate Limiting

### Rate Limit Tiers

| Plan | Requests/Hour | Burst Limit | Analysis/Month |
|------|---------------|-------------|----------------|
| Free | 10 | 20 | 1 |
| Starter | 100 | 200 | 10 |
| Growth | 1,000 | 2,000 | 100 |
| Professional | 10,000 | 20,000 | Unlimited |

### Rate Limit Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 995
X-RateLimit-Reset: 1642550400
X-RateLimit-Retry-After: 3600
```

### Rate Limit Response
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "details": {
      "limit": 1000,
      "remaining": 0,
      "reset_at": "2025-01-20T11:00:00Z"
    }
  }
}
```

---

## 🔍 Error Codes

### Authentication Errors
- `AUTH_REQUIRED`: Authentication token required
- `AUTH_INVALID`: Invalid or expired token
- `AUTH_FORBIDDEN`: Insufficient permissions
- `API_KEY_INVALID`: Invalid API key
- `API_KEY_SUSPENDED`: API key suspended

### Validation Errors
- `VALIDATION_ERROR`: Request validation failed
- `INVALID_URL`: Invalid Airbnb URL format
- `MISSING_FIELD`: Required field missing
- `INVALID_FORMAT`: Invalid data format
- `VALUE_OUT_OF_RANGE`: Value exceeds allowed range

### Resource Errors
- `RESOURCE_NOT_FOUND`: Requested resource not found
- `RESOURCE_CONFLICT`: Resource conflict (e.g., duplicate)
- `RESOURCE_DELETED`: Resource has been deleted
- `RESOURCE_ARCHIVED`: Resource is archived

### Business Logic Errors
- `PLAN_LIMIT_EXCEEDED`: Subscription plan limit exceeded
- `ANALYSIS_IN_PROGRESS`: Analysis already in progress
- `ANALYSIS_FAILED`: Analysis processing failed
- `INSUFFICIENT_CREDITS`: Not enough credits for operation

### External Service Errors
- `EXTERNAL_SERVICE_ERROR`: External service unavailable
- `SCRAPER_TIMEOUT`: Scraper operation timed out
- `AI_SERVICE_ERROR`: AI analysis service error
- `PAYMENT_ERROR`: Payment processing error

---

## 📖 Example Usage

### Complete Listing Analysis Workflow

```javascript
// 1. Authenticate
const authResponse = await fetch('/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});
const { access_token } = await authResponse.json();

// 2. Create listing for analysis
const createResponse = await fetch('/v1/listings', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    airbnb_url: 'https://www.airbnb.com/rooms/12345',
    priority: 'normal'
  })
});
const { data: listing } = await createResponse.json();

// 3. Poll for completion (or use WebSocket)
let analysisComplete = false;
while (!analysisComplete) {
  const statusResponse = await fetch(`/v1/listings/${listing.id}`, {
    headers: { 'Authorization': `Bearer ${access_token}` }
  });
  const { data: currentListing } = await statusResponse.json();
  
  if (currentListing.status === 'completed') {
    analysisComplete = true;
  } else if (currentListing.status === 'failed') {
    throw new Error('Analysis failed');
  } else {
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
}

// 4. Get detailed score breakdown
const scoreResponse = await fetch(`/v1/listings/${listing.id}/score`, {
  headers: { 'Authorization': `Bearer ${access_token}` }
});
const { data: scoreData } = await scoreResponse.json();

// 5. Get recommendations
const recsResponse = await fetch(`/v1/listings/${listing.id}/recommendations`, {
  headers: { 'Authorization': `Bearer ${access_token}` }
});
const { data: recommendations } = await recsResponse.json();

console.log('Analysis complete!', {
  score: scoreData.overall_score,
  tier: scoreData.tier,
  recommendations: recommendations.recommendations.length
});
```

### Bulk Operations for Pro Plans

```javascript
// Using API key for bulk operations
const apiKey = 'sk_live_...';

// Analyze multiple listings
const listings = [
  'https://www.airbnb.com/rooms/12345',
  'https://www.airbnb.com/rooms/67890',
  'https://www.airbnb.com/rooms/54321'
];

const analysisPromises = listings.map(url => 
  fetch('/v1/listings', {
    method: 'POST',
    headers: {
      'Authorization': `ApiKey ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ airbnb_url: url, priority: 'high' })
  })
);

const results = await Promise.all(analysisPromises);
console.log('Bulk analysis started for', results.length, 'listings');
```

---

## 🚀 SDK Examples

### JavaScript/TypeScript SDK

```typescript
import { ListingBoostAPI } from '@listingboost/sdk';

const client = new ListingBoostAPI({
  apiKey: 'sk_live_...',
  baseURL: 'https://api.listingboost.pro/v1'
});

// Type-safe API calls
const listings = await client.listings.list({
  page: 1,
  per_page: 20,
  status: 'completed'
});

const analysis = await client.listings.analyze({
  airbnb_url: 'https://www.airbnb.com/rooms/12345'
});

// WebSocket support for real-time updates
client.on('listing.analyzed', (event) => {
  console.log('Analysis complete:', event.listing_id);
});
```

### Python SDK

```python
from listingboost import ListingBoostAPI

client = ListingBoostAPI(api_key='sk_live_...')

# Analyze listing
analysis = client.listings.analyze(
    airbnb_url='https://www.airbnb.com/rooms/12345',
    priority='high'
)

# Get recommendations
recommendations = client.listings.get_recommendations(analysis.id)

# Export report
report_url = client.listings.export(
    analysis.id,
    format='pdf',
    include_recommendations=True
)
```

---

**Document Status**: ✅ Complete  
**Implementation Status**: Design Phase  
**Next Steps**: Begin API endpoint implementation  
**Review Required**: Before Phase 2 development begins