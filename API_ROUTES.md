# ListingBoost Pro - Complete API Routes Specification

## 🎯 **API Overview**

**Base URL**: `/api/v1`  
**Authentication**: Bearer JWT Token  
**Rate Limiting**: Plan-based (10/100/1000/10000 req/hour)  
**Versioning**: URL-based (/v1/)  

---

## 🔐 **Authentication Routes**

### **POST /api/v1/auth/login**
```typescript
// Email + Password Login
Request: {
  email: string;
  password: string;
}
Response: {
  success: true;
  data: {
    user: User;
    session: Session;
    access_token: string;
    refresh_token: string;
  }
}
```

### **POST /api/v1/auth/oauth**
```typescript
// OAuth Providers (Google, GitHub)
Request: {
  provider: 'google' | 'github';
  code: string;
  redirect_uri: string;
}
Response: {
  success: true;
  data: {
    user: User;
    session: Session;
    access_token: string;
  }
}
```

### **POST /api/v1/auth/refresh**
```typescript
// Token Refresh
Request: {
  refresh_token: string;
}
Response: {
  success: true;
  data: {
    access_token: string;
    expires_in: number;
  }
}
```

### **POST /api/v1/auth/logout**
```typescript
// Logout & Invalidate Session
Request: {} // Headers: Authorization Bearer
Response: {
  success: true;
  message: "Logged out successfully"
}
```

---

## 📊 **Listings Management**

### **GET /api/v1/listings**
```typescript
// Get User's Listings with Pagination
Query: {
  page?: number;          // Default: 1
  limit?: number;         // Default: 20, Max: 100
  status?: 'pending' | 'analyzing' | 'completed' | 'failed';
  sort?: 'created_at' | 'score' | 'title';
  order?: 'asc' | 'desc'; // Default: desc
}
Response: {
  success: true;
  data: {
    listings: Listing[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
    }
  }
}
```

### **POST /api/v1/listings**
```typescript
// Create New Listing for Analysis
Request: {
  airbnb_url: string;     // Required: Valid Airbnb URL
  priority?: 'low' | 'normal' | 'high'; // Default: normal
  notify_email?: boolean; // Default: true
}
Response: {
  success: true;
  data: {
    listing: Listing;
    analysis_job_id: string;
    estimated_completion: string; // ISO timestamp
  }
}
```

### **GET /api/v1/listings/{listing_id}**
```typescript
// Get Single Listing Details
Response: {
  success: true;
  data: {
    listing: Listing;
    scores?: ListingScore;
    images?: ListingImage[];
    recent_reviews?: ListingReview[];
  }
}
```

### **PUT /api/v1/listings/{listing_id}**
```typescript
// Update Listing (Title, Notes, etc.)
Request: {
  title?: string;
  notes?: string;
  tags?: string[];
  archived?: boolean;
}
Response: {
  success: true;
  data: {
    listing: Listing;
  }
}
```

### **DELETE /api/v1/listings/{listing_id}**
```typescript
// Delete Listing (Soft Delete)
Response: {
  success: true;
  message: "Listing deleted successfully"
}
```

---

## 🎯 **Analysis & Scoring**

### **POST /api/v1/listings/{listing_id}/analyze**
```typescript
// Trigger Re-analysis of Existing Listing
Request: {
  force_refresh?: boolean;    // Skip cache, force new scraping
  include_competitors?: boolean; // Include competitor analysis
  analysis_type?: 'quick' | 'full'; // Default: full
}
Response: {
  success: true;
  data: {
    analysis_job_id: string;
    status: 'queued' | 'processing';
    estimated_completion: string;
  }
}
```

### **GET /api/v1/listings/{listing_id}/score**
```typescript
// Get Latest Score & Analysis
Response: {
  success: true;
  data: {
    overall_score: number;        // 0-1000
    category_scores: {
      host_performance: number;   // 0-180
      guest_satisfaction: number; // 0-200
      content_optimization: number; // 0-180
      visual_presentation: number; // 0-120
      amenities_features: number;  // 0-140
      pricing_strategy: number;    // 0-100
      availability_booking: number; // 0-80
      location_market: number;     // 0-60
      business_performance: number; // 0-40
      trust_safety: number;       // 0-40
    };
    analyzed_at: string;
    recommendations: Recommendation[];
    competitor_comparison?: CompetitorAnalysis;
  }
}
```

### **GET /api/v1/listings/{listing_id}/recommendations**
```typescript
// Get Improvement Recommendations
Response: {
  success: true;
  data: {
    recommendations: {
      category: string;
      priority: 'high' | 'medium' | 'low';
      current_score: number;
      max_score: number;
      issue: string;
      suggestion: string;
      impact: string;        // e.g., "+25 points"
      difficulty: 'easy' | 'medium' | 'hard';
      estimated_hours?: number;
    }[];
    total_potential_increase: number;
  }
}
```

---

## 📈 **Analytics & Reporting**

### **GET /api/v1/analytics/dashboard**
```typescript
// Dashboard Overview Metrics
Query: {
  period?: '7d' | '30d' | '90d' | '1y'; // Default: 30d
}
Response: {
  success: true;
  data: {
    summary: {
      total_listings: number;
      average_score: number;
      completed_analyses: number;
      pending_analyses: number;
    };
    score_distribution: {
      range: string;    // e.g., "800-900"
      count: number;
    }[];
    recent_activity: Activity[];
    top_performing_listings: Listing[];
  }
}
```

### **GET /api/v1/analytics/performance**
```typescript
// Performance Trends Over Time
Query: {
  listing_id?: string;    // Specific listing or all
  metric?: 'score' | 'bookings' | 'reviews';
  period?: '7d' | '30d' | '90d' | '1y';
}
Response: {
  success: true;
  data: {
    metrics: {
      date: string;
      value: number;
    }[];
    trends: {
      change_percentage: number;
      trend_direction: 'up' | 'down' | 'stable';
    };
  }
}
```

---

## 💳 **Billing & Subscriptions**

### **GET /api/v1/subscriptions/plans**
```typescript
// Available Subscription Plans
Response: {
  success: true;
  data: {
    plans: {
      id: string;
      name: string;         // "freemium", "starter", "growth", "pro"
      price_cents: number;  // Monthly price in cents
      currency: string;     // "EUR"
      features: string[];
      limits: {
        max_listings: number;
        max_api_calls: number;
        max_dashboard_refreshes: number;
      };
    }[];
  }
}
```

### **POST /api/v1/subscriptions/checkout**
```typescript
// Create Stripe Checkout Session
Request: {
  plan_id: string;
  billing_cycle: 'monthly' | 'yearly';
  success_url: string;
  cancel_url: string;
}
Response: {
  success: true;
  data: {
    checkout_url: string;   // Stripe checkout URL
    session_id: string;
  }
}
```

### **GET /api/v1/subscriptions/current**
```typescript
// Get Current Subscription Details
Response: {
  success: true;
  data: {
    subscription: {
      id: string;
      plan_name: string;
      status: string;
      current_period_end: string;
      cancel_at_period_end: boolean;
    };
    usage: {
      listings_used: number;
      api_calls_used: number;
      dashboard_refreshes_used: number;
    };
    limits: {
      max_listings: number;
      max_api_calls: number;
      max_dashboard_refreshes: number;
    };
  }
}
```

### **POST /api/v1/subscriptions/portal**
```typescript
// Create Stripe Customer Portal Session
Response: {
  success: true;
  data: {
    portal_url: string;    // Stripe customer portal URL
  }
}
```

---

## 👥 **Organizations & Teams**

### **GET /api/v1/organizations**
```typescript
// Get User's Organizations
Response: {
  success: true;
  data: {
    organizations: {
      id: string;
      name: string;
      role: 'owner' | 'admin' | 'member';
      member_count: number;
      created_at: string;
    }[];
  }
}
```

### **POST /api/v1/organizations**
```typescript
// Create New Organization
Request: {
  name: string;
  slug: string;    // URL-friendly identifier
}
Response: {
  success: true;
  data: {
    organization: Organization;
  }
}
```

### **GET /api/v1/organizations/{org_id}/members**
```typescript
// Get Organization Members
Response: {
  success: true;
  data: {
    members: {
      id: string;
      full_name: string;
      email: string;
      role: 'owner' | 'admin' | 'member';
      joined_at: string;
      last_active: string;
    }[];
  }
}
```

### **POST /api/v1/organizations/{org_id}/invites**
```typescript
// Invite Team Member
Request: {
  email: string;
  role: 'admin' | 'member';
  message?: string;
}
Response: {
  success: true;
  data: {
    invite_id: string;
    expires_at: string;
  }
}
```

---

## 🔗 **Integration & Automation**

### **GET /api/v1/listings/{listing_id}/data**
```typescript
// Get Listing Analysis Data for API Integration
Query: {
  format: 'json';
  include_images?: boolean;
  include_recommendations?: boolean;
}
Response: {
  success: true;
  data: {
    listing: ListingData;
    analysis: AnalysisResults;
    recommendations?: RecommendationData;
  }
}
```

---

## 🔗 **Webhooks**

### **POST /api/webhooks/apify**
```typescript
// Apify Scraper Completion Webhook
Request: {
  job_id: string;
  status: 'success' | 'failed';
  data?: any;           // Scraped data if successful
  error?: string;       // Error message if failed
}
Response: { success: true }
```

### **POST /api/webhooks/stripe**
```typescript
// Stripe Billing Webhooks
Request: {
  type: string;         // Event type
  data: any;           // Stripe event data
}
Response: { success: true }
```

---

## ⚠️ **Error Responses**

### **Standard Error Format**
```typescript
{
  success: false;
  error: {
    code: string;       // Machine-readable error code
    message: string;    // Human-readable message
    details?: any;      // Additional error context
  };
  meta: {
    timestamp: string;
    request_id: string;
    version: string;
  }
}
```

### **Common Error Codes**
```yaml
VALIDATION_ERROR:     400 - Invalid request data
UNAUTHORIZED:         401 - Invalid or missing token  
FORBIDDEN:           403 - Insufficient permissions
NOT_FOUND:           404 - Resource not found
RATE_LIMITED:        429 - Rate limit exceeded
PLAN_LIMIT_EXCEEDED: 402 - Subscription limit reached
INTERNAL_ERROR:      500 - Server error
SERVICE_UNAVAILABLE: 503 - External service down
```

---

## 🔧 **Development Notes**

### **File Organization**
```
app/api/v1/
├── auth/
│   ├── login/route.ts
│   ├── oauth/route.ts
│   └── refresh/route.ts
├── listings/
│   ├── route.ts
│   └── [id]/
│       ├── route.ts
│       ├── analyze/route.ts
│       └── score/route.ts
├── subscriptions/
│   ├── plans/route.ts
│   └── checkout/route.ts
└── webhooks/
    ├── apify/route.ts
    └── stripe/route.ts
```

### **Middleware Stack**
1. **CORS Headers**
2. **Rate Limiting** (by user + plan)
3. **Authentication** (JWT validation)
4. **Authorization** (RLS + permissions)
5. **Input Validation** (Zod schemas)
6. **Request Logging**
7. **Error Handling**

### **Response Time Targets**
- **Simple Queries**: <100ms
- **Complex Queries**: <500ms  
- **Analysis Jobs**: <2s (async)
- **File Exports**: <5s