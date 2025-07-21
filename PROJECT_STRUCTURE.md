# ListingBoost Pro - Project Structure & File Organization

## 🎯 **File Size Enforcement Rules**

**MANDATORY LIMITS**:
- ✅ **400 lines maximum** per file
- ✅ **100 lines maximum** per function
- ✅ **5 parameters maximum** per function
- ✅ **3 levels maximum** nesting depth

**Enforcement Strategy**:
- ESLint rules for automated checking
- Pre-commit hooks block oversized files
- Agents must split files before reaching limits

---

## 📁 **Complete Directory Structure**

```
listingboost/
├── 📄 package.json
├── 📄 next.config.js
├── 📄 tailwind.config.js
├── 📄 tsconfig.json
├── 📄 .env.local.example
├── 📄 .gitignore
├── 📄 README.md
├── 📄 CLAUDE.md
├── 📄 .eslintrc.json
├── 📄 .prettierrc
├── 📄 docker-compose.yml (optional)
│
├── 📁 .github/
│   ├── 📁 workflows/
│   │   ├── ci.yml
│   │   ├── deploy.yml
│   │   └── test.yml
│   └── 📁 ISSUE_TEMPLATE/
│
├── 📁 app/                          # Next.js 15 App Router
│   ├── 📄 layout.tsx               # Root layout (< 100 lines)
│   ├── 📄 page.tsx                 # Landing page (< 200 lines)
│   ├── 📄 globals.css              # Global styles
│   ├── 📄 loading.tsx              # Global loading UI
│   ├── 📄 error.tsx                # Global error UI
│   ├── 📄 not-found.tsx            # 404 page
│   │
│   ├── 📁 (auth)/                  # Auth routes group
│   │   ├── 📄 layout.tsx           # Auth layout (< 150 lines)
│   │   ├── 📁 login/
│   │   │   └── 📄 page.tsx         # Login page (< 300 lines)
│   │   ├── 📁 signup/
│   │   │   └── 📄 page.tsx         # Signup page (< 300 lines)
│   │   └── 📁 reset-password/
│   │       └── 📄 page.tsx         # Password reset (< 200 lines)
│   │
│   ├── 📁 (dashboard)/             # Protected routes group
│   │   ├── 📄 layout.tsx           # Dashboard layout (< 200 lines)
│   │   ├── 📁 dashboard/
│   │   │   ├── 📄 page.tsx         # Dashboard overview (< 400 lines)
│   │   │   └── 📄 loading.tsx      # Dashboard loading
│   │   ├── 📁 listings/
│   │   │   ├── 📄 page.tsx         # Listings list (< 400 lines)
│   │   │   ├── 📁 new/
│   │   │   │   └── 📄 page.tsx     # Add listing (< 300 lines)
│   │   │   └── 📁 [id]/
│   │   │       ├── 📄 page.tsx     # Listing details (< 400 lines)
│   │   │       ├── 📁 analyze/
│   │   │       │   └── 📄 page.tsx # Analysis view (< 400 lines)
│   │   │       └── 📁 edit/
│   │   │           └── 📄 page.tsx # Edit listing (< 300 lines)
│   │   ├── 📁 analytics/
│   │   │   └── 📄 page.tsx         # Analytics dashboard (< 400 lines)
│   │   ├── 📁 billing/
│   │   │   ├── 📄 page.tsx         # Billing overview (< 400 lines)
│   │   │   └── 📁 plans/
│   │   │       └── 📄 page.tsx     # Plan selection (< 300 lines)
│   │   └── 📁 settings/
│   │       ├── 📄 page.tsx         # General settings (< 300 lines)
│   │       ├── 📁 profile/
│   │       │   └── 📄 page.tsx     # Profile settings (< 300 lines)
│   │       ├── 📁 team/
│   │       │   └── 📄 page.tsx     # Team management (< 400 lines)
│   │       └── 📁 api-keys/
│   │           └── 📄 page.tsx     # API key management (< 300 lines)
│   │
│   └── 📁 api/                     # API Routes
│       └── 📁 v1/
│           ├── 📁 auth/
│           │   ├── 📁 login/
│           │   │   └── 📄 route.ts         # Login endpoint (< 200 lines)
│           │   ├── 📁 oauth/
│           │   │   └── 📄 route.ts         # OAuth endpoint (< 250 lines)
│           │   ├── 📁 refresh/
│           │   │   └── 📄 route.ts         # Token refresh (< 150 lines)
│           │   └── 📁 logout/
│           │       └── 📄 route.ts         # Logout endpoint (< 100 lines)
│           ├── 📁 listings/
│           │   ├── 📄 route.ts             # GET/POST listings (< 300 lines)
│           │   └── 📁 [id]/
│           │       ├── 📄 route.ts         # GET/PUT/DELETE listing (< 250 lines)
│           │       ├── 📁 analyze/
│           │       │   └── 📄 route.ts     # Analysis endpoint (< 200 lines)
│           │       ├── 📁 score/
│           │       │   └── 📄 route.ts     # Score endpoint (< 200 lines)
│           │       └── 📁 export/
│           │           └── 📄 route.ts     # Export endpoint (< 200 lines)
│           ├── 📁 analytics/
│           │   ├── 📁 dashboard/
│           │   │   └── 📄 route.ts         # Dashboard data (< 300 lines)
│           │   └── 📁 performance/
│           │       └── 📄 route.ts         # Performance data (< 300 lines)
│           ├── 📁 subscriptions/
│           │   ├── 📁 plans/
│           │   │   └── 📄 route.ts         # Plans endpoint (< 200 lines)
│           │   ├── 📁 checkout/
│           │   │   └── 📄 route.ts         # Checkout endpoint (< 300 lines)
│           │   ├── 📁 current/
│           │   │   └── 📄 route.ts         # Current subscription (< 200 lines)
│           │   └── 📁 portal/
│           │       └── 📄 route.ts         # Billing portal (< 150 lines)
│           ├── 📁 organizations/
│           │   ├── 📄 route.ts             # GET/POST orgs (< 250 lines)
│           │   └── 📁 [id]/
│           │       ├── 📄 route.ts         # GET/PUT/DELETE org (< 200 lines)
│           │       ├── 📁 members/
│           │       │   └── 📄 route.ts     # Member management (< 300 lines)
│           │       └── 📁 invites/
│           │           └── 📄 route.ts     # Invite management (< 200 lines)
│           └── 📁 webhooks/
│               ├── 📁 apify/
│               │   └── 📄 route.ts         # Apify webhooks (< 300 lines)
│               └── 📁 stripe/
│                   └── 📄 route.ts         # Stripe webhooks (< 400 lines)
│
├── 📁 components/                   # React Components
│   ├── 📁 ui/                      # shadcn/ui base components
│   │   ├── 📄 button.tsx           # Button component (< 150 lines)
│   │   ├── 📄 input.tsx            # Input component (< 100 lines)
│   │   ├── 📄 card.tsx             # Card component (< 200 lines)
│   │   ├── 📄 dialog.tsx           # Dialog component (< 300 lines)
│   │   ├── 📄 table.tsx            # Table component (< 400 lines)
│   │   ├── 📄 form.tsx             # Form component (< 300 lines)
│   │   ├── 📄 toast.tsx            # Toast notifications (< 200 lines)
│   │   ├── 📄 dropdown-menu.tsx    # Dropdown component (< 300 lines)
│   │   ├── 📄 sheet.tsx            # Sheet component (< 250 lines)
│   │   ├── 📄 badge.tsx            # Badge component (< 100 lines)
│   │   ├── 📄 progress.tsx         # Progress component (< 150 lines)
│   │   └── 📄 chart.tsx            # Chart components (< 400 lines)
│   │
│   ├── 📁 layout/                  # Layout components
│   │   ├── 📄 header.tsx           # Main header (< 300 lines)
│   │   ├── 📄 sidebar.tsx          # Dashboard sidebar (< 400 lines)
│   │   ├── 📄 footer.tsx           # Footer component (< 200 lines)
│   │   ├── 📄 navigation.tsx       # Navigation menu (< 300 lines)
│   │   └── 📄 breadcrumbs.tsx      # Breadcrumb navigation (< 150 lines)
│   │
│   ├── 📁 features/                # Feature-specific components
│   │   ├── 📁 auth/
│   │   │   ├── 📄 login-form.tsx           # Login form (< 300 lines)
│   │   │   ├── 📄 signup-form.tsx          # Signup form (< 300 lines)
│   │   │   ├── 📄 oauth-buttons.tsx        # OAuth buttons (< 200 lines)
│   │   │   ├── 📄 password-reset-form.tsx  # Password reset (< 250 lines)
│   │   │   └── 📄 auth-guard.tsx           # Route protection (< 200 lines)
│   │   ├── 📁 listings/
│   │   │   ├── 📄 listing-card.tsx         # Listing card (< 300 lines)
│   │   │   ├── 📄 listing-table.tsx        # Listings table (< 400 lines)
│   │   │   ├── 📄 listing-form.tsx         # Add/edit listing (< 400 lines)
│   │   │   ├── 📄 analysis-progress.tsx    # Analysis progress (< 200 lines)
│   │   │   ├── 📄 score-display.tsx        # Score visualization (< 400 lines)
│   │   │   ├── 📄 recommendations.tsx      # Recommendations list (< 400 lines)
│   │   │   ├── 📄 competitor-comparison.tsx # Competitor analysis (< 400 lines)
│   │   │   └── 📄 export-dialog.tsx        # Export functionality (< 300 lines)
│   │   ├── 📁 dashboard/
│   │   │   ├── 📄 metrics-overview.tsx     # KPI cards (< 300 lines)
│   │   │   ├── 📄 recent-activity.tsx      # Activity feed (< 400 lines)
│   │   │   ├── 📄 quick-actions.tsx        # Quick actions (< 250 lines)
│   │   │   ├── 📄 performance-chart.tsx    # Performance charts (< 400 lines)
│   │   │   └── 📄 score-distribution.tsx   # Score distribution (< 300 lines)
│   │   ├── 📁 billing/
│   │   │   ├── 📄 plan-selector.tsx        # Plan selection (< 400 lines)
│   │   │   ├── 📄 payment-form.tsx         # Payment form (< 300 lines)
│   │   │   ├── 📄 billing-history.tsx      # Invoice history (< 400 lines)
│   │   │   ├── 📄 usage-meter.tsx          # Usage display (< 250 lines)
│   │   │   └── 📄 upgrade-dialog.tsx       # Upgrade prompts (< 300 lines)
│   │   ├── 📁 teams/
│   │   │   ├── 📄 team-members.tsx         # Members list (< 400 lines)
│   │   │   ├── 📄 invite-dialog.tsx        # Invite members (< 300 lines)
│   │   │   ├── 📄 role-selector.tsx        # Role management (< 200 lines)
│   │   │   └── 📄 organization-settings.tsx # Org settings (< 400 lines)
│   │   └── 📁 analytics/
│   │       ├── 📄 analytics-charts.tsx     # Analytics charts (< 400 lines)
│   │       ├── 📄 date-range-picker.tsx    # Date selector (< 200 lines)
│   │       ├── 📄 metric-filters.tsx       # Filter options (< 300 lines)
│   │       └── 📄 export-analytics.tsx     # Analytics export (< 250 lines)
│   │
│   └── 📁 common/                  # Shared components
│       ├── 📄 loading-spinner.tsx  # Loading states (< 100 lines)
│       ├── 📄 error-boundary.tsx   # Error boundaries (< 200 lines)
│       ├── 📄 confirmation-dialog.tsx # Confirm dialogs (< 200 lines)
│       ├── 📄 data-table.tsx       # Reusable table (< 400 lines)
│       ├── 📄 file-upload.tsx      # File upload (< 300 lines)
│       ├── 📄 search-input.tsx     # Search component (< 200 lines)
│       ├── 📄 pagination.tsx       # Pagination (< 200 lines)
│       └── 📄 empty-state.tsx      # Empty states (< 150 lines)
│
├── 📁 lib/                         # Utility libraries
│   ├── 📁 services/                # External service integrations
│   │   ├── 📄 supabase.ts          # Supabase client (< 200 lines)
│   │   ├── 📄 apify.ts             # Apify integration (< 400 lines)
│   │   ├── 📄 gemini.ts            # Google Gemini AI (< 300 lines)
│   │   ├── 📄 stripe.ts            # Stripe integration (< 300 lines)
│   │   ├── 📄 cloudinary.ts        # Image service (< 200 lines)
│   │   ├── 📄 email.ts             # Email service (< 250 lines)
│   │   └── 📄 redis.ts             # Redis caching (< 200 lines)
│   │
│   ├── 📁 scoring/                 # Scoring engine
│   │   ├── 📄 calculator.ts        # Main calculator (< 400 lines)
│   │   ├── 📄 host-performance.ts  # Host scoring (< 300 lines)
│   │   ├── 📄 guest-satisfaction.ts # Review scoring (< 300 lines)
│   │   ├── 📄 content-optimization.ts # Content scoring (< 300 lines)
│   │   ├── 📄 visual-presentation.ts # Photo scoring (< 250 lines)
│   │   ├── 📄 amenities-features.ts # Amenities scoring (< 300 lines)
│   │   ├── 📄 pricing-strategy.ts  # Pricing scoring (< 250 lines)
│   │   ├── 📄 availability-booking.ts # Booking scoring (< 200 lines)
│   │   ├── 📄 location-market.ts   # Location scoring (< 250 lines)
│   │   ├── 📄 business-performance.ts # Performance scoring (< 200 lines)
│   │   ├── 📄 trust-safety.ts      # Safety scoring (< 200 lines)
│   │   └── 📄 recommendations.ts   # Recommendation engine (< 400 lines)
│   │
│   ├── 📁 auth/                    # Authentication utilities
│   │   ├── 📄 middleware.ts        # Auth middleware (< 300 lines)
│   │   ├── 📄 session.ts           # Session management (< 250 lines)
│   │   ├── 📄 permissions.ts       # Permission checks (< 200 lines)
│   │   └── 📄 providers.ts         # OAuth providers (< 300 lines)
│   │
│   ├── 📁 database/                # Database utilities
│   │   ├── 📄 queries.ts           # Database queries (< 400 lines)
│   │   ├── 📄 migrations.ts        # Migration helpers (< 300 lines)
│   │   ├── 📄 types.ts             # Database types (< 400 lines)
│   │   └── 📄 rls-policies.ts      # RLS policy helpers (< 200 lines)
│   │
│   ├── 📁 jobs/                    # Background jobs
│   │   ├── 📄 queue.ts             # Job queue manager (< 400 lines)
│   │   ├── 📄 analysis-job.ts      # Analysis job handler (< 400 lines)
│   │   ├── 📄 email-job.ts         # Email job handler (< 200 lines)
│   │   ├── 📄 cleanup-job.ts       # Cleanup jobs (< 200 lines)
│   │   └── 📄 scheduler.ts         # Job scheduler (< 300 lines)
│   │
│   ├── 📁 validation/              # Input validation
│   │   ├── 📄 schemas.ts           # Zod schemas (< 400 lines)
│   │   ├── 📄 auth-schemas.ts      # Auth validation (< 200 lines)
│   │   ├── 📄 listing-schemas.ts   # Listing validation (< 300 lines)
│   │   ├── 📄 billing-schemas.ts   # Billing validation (< 200 lines)
│   │   └── 📄 api-schemas.ts       # API validation (< 300 lines)
│   │
│   ├── 📁 utils/                   # Utility functions
│   │   ├── 📄 format.ts            # Formatting utils (< 200 lines)
│   │   ├── 📄 date.ts              # Date utilities (< 200 lines)
│   │   ├── 📄 url.ts               # URL utilities (< 150 lines)
│   │   ├── 📄 analytics.ts         # Analytics helpers (< 250 lines)
│   │   ├── 📄 cache.ts             # Caching utilities (< 200 lines)
│   │   ├── 📄 error.ts             # Error handling (< 200 lines)
│   │   ├── 📄 rate-limit.ts        # Rate limiting (< 300 lines)
│   │   └── 📄 constants.ts         # App constants (< 200 lines)
│   │
│   └── 📁 hooks/                   # React hooks
│       ├── 📄 use-auth.ts          # Auth hook (< 200 lines)
│       ├── 📄 use-listings.ts      # Listings hook (< 300 lines)
│       ├── 📄 use-subscription.ts  # Billing hook (< 200 lines)
│       ├── 📄 use-analytics.ts     # Analytics hook (< 250 lines)
│       ├── 📄 use-websocket.ts     # WebSocket hook (< 300 lines)
│       ├── 📄 use-debounce.ts      # Debounce hook (< 100 lines)
│       └── 📄 use-local-storage.ts # Local storage hook (< 150 lines)
│
├── 📁 types/                       # TypeScript type definitions
│   ├── 📄 database.ts              # Database types (< 400 lines)
│   ├── 📄 api.ts                   # API types (< 400 lines)
│   ├── 📄 auth.ts                  # Auth types (< 200 lines)
│   ├── 📄 listing.ts               # Listing types (< 300 lines)
│   ├── 📄 scoring.ts               # Scoring types (< 300 lines)
│   ├── 📄 billing.ts               # Billing types (< 200 lines)
│   ├── 📄 analytics.ts             # Analytics types (< 200 lines)
│   └── 📄 common.ts                # Common types (< 200 lines)
│
├── 📁 styles/                      # Styling files
│   ├── 📄 globals.css              # Global styles (< 300 lines)
│   ├── 📄 components.css           # Component styles (< 400 lines)
│   └── 📄 utilities.css            # Utility styles (< 200 lines)
│
├── 📁 public/                      # Static assets
│   ├── 📁 images/
│   │   ├── logo.svg
│   │   ├── hero-bg.jpg
│   │   └── icons/
│   ├── 📁 icons/
│   │   ├── favicon.ico
│   │   ├── apple-touch-icon.png
│   │   └── manifest.json
│   └── 📄 robots.txt
│
├── 📁 docs/                        # Documentation
│   ├── 📄 api.md                   # API documentation
│   ├── 📄 deployment.md            # Deployment guide
│   ├── 📄 development.md           # Development setup
│   └── 📁 components/              # Component documentation
│
├── 📁 tests/                       # Test files
│   ├── 📁 __mocks__/               # Test mocks
│   ├── 📁 e2e/                     # End-to-end tests
│   │   ├── 📄 auth.spec.ts         # Auth E2E tests (< 400 lines)
│   │   ├── 📄 listings.spec.ts     # Listings E2E tests (< 400 lines)
│   │   └── 📄 billing.spec.ts      # Billing E2E tests (< 400 lines)
│   ├── 📁 integration/             # Integration tests
│   │   ├── 📄 api.test.ts          # API integration tests (< 400 lines)
│   │   └── 📄 database.test.ts     # Database tests (< 400 lines)
│   ├── 📁 unit/                    # Unit tests
│   │   ├── 📄 scoring.test.ts      # Scoring tests (< 400 lines)
│   │   ├── 📄 utils.test.ts        # Utils tests (< 400 lines)
│   │   └── 📄 components.test.tsx  # Component tests (< 400 lines)
│   ├── 📄 setup.ts                 # Test setup
│   └── 📄 jest.config.js           # Jest configuration
│
├── 📁 scripts/                     # Build/deployment scripts
│   ├── 📄 build.js                 # Build script (< 200 lines)
│   ├── 📄 deploy.js                # Deployment script (< 300 lines)
│   ├── 📄 migrate.js               # Migration script (< 200 lines)
│   └── 📄 seed.js                  # Database seeding (< 300 lines)
│
└── 📁 database/                    # Database files
    ├── 📁 migrations/              # SQL migration files
    │   ├── 📄 001_initial_schema.sql       # Initial schema (< 400 lines)
    │   ├── 📄 002_add_scoring_tables.sql   # Scoring tables (< 300 lines)
    │   ├── 📄 003_add_billing_tables.sql   # Billing tables (< 300 lines)
    │   └── 📄 004_add_team_features.sql    # Team features (< 200 lines)
    ├── 📁 seeds/                   # Seed data files
    │   ├── 📄 dev_users.sql        # Development users (< 200 lines)
    │   ├── 📄 sample_listings.sql  # Sample listings (< 300 lines)
    │   └── 📄 plan_limits.sql      # Plan configurations (< 100 lines)
    └── 📁 functions/               # Database functions
        ├── 📄 rls_policies.sql     # RLS policies (< 400 lines)
        ├── 📄 scoring_functions.sql # Scoring functions (< 400 lines)
        └── 📄 utility_functions.sql # Utility functions (< 300 lines)
```

---

## 🔧 **File Size Monitoring Tools**

### **ESLint Configuration**
```json
// .eslintrc.json
{
  "rules": {
    "max-lines": ["error", { "max": 400, "skipBlankLines": true, "skipComments": true }],
    "max-lines-per-function": ["error", { "max": 100 }],
    "max-params": ["error", 5],
    "max-depth": ["error", 3],
    "complexity": ["error", 10]
  }
}
```

### **Pre-commit Hook**
```bash
#!/bin/sh
# .husky/pre-commit
# Check file sizes before commit

for file in $(git diff --cached --name-only --diff-filter=AM | grep -E '\.(ts|tsx|js|jsx)$'); do
    if [ -f "$file" ]; then
        lines=$(wc -l < "$file")
        if [ "$lines" -gt 400 ]; then
            echo "❌ Error: $file has $lines lines (max 400 allowed)"
            echo "Please split this file before committing."
            exit 1
        fi
    fi
done
```

---

## 📊 **Component Splitting Strategies**

### **When to Split Files:**
1. **React Components > 300 lines**: Split into sub-components
2. **API Routes > 250 lines**: Extract business logic to services
3. **Utility Files > 350 lines**: Group by functionality
4. **Type Files > 300 lines**: Split by domain/feature

### **Splitting Patterns:**
```typescript
// Before: Large component (500+ lines)
components/features/listings/listing-details.tsx

// After: Split components (< 300 lines each)
components/features/listings/
├── listing-details.tsx          // Main component (< 200 lines)
├── listing-header.tsx           // Header section (< 150 lines)
├── listing-gallery.tsx          // Image gallery (< 250 lines)
├── listing-amenities.tsx        // Amenities list (< 200 lines)
└── listing-reviews.tsx          // Reviews section (< 300 lines)
```

---

## ✅ **Agent File Creation Guidelines**

### **Mandatory Checks Before Creating Files:**
1. **Line Count Validation**: Check current lines before adding content
2. **Function Size**: Keep functions under 100 lines
3. **Complexity**: Maximum 3 levels of nesting
4. **Dependencies**: Minimal imports, clear separation of concerns

### **File Naming Conventions:**
- **kebab-case** for routes: `analyze-listing/page.tsx`
- **PascalCase** for components: `ListingCard.tsx`
- **camelCase** for utilities: `formatCurrency.ts`
- **UPPER_SNAKE_CASE** for constants: `API_ENDPOINTS.ts`

---

**🎯 Ready for Agent Deployment with Complete Project Structure! 🚀**