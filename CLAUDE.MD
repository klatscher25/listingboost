# Claude.md - AI Assistant Operating Instructions

## 🤖 MANDATORY AI BEHAVIOR RULES

### BEFORE EVERY ACTION:
1. **READ** the current state in `TODO.md`
2. **VERIFY** which task is marked as `[CURRENT]` or assigned to your agent
3. **CHECK** prerequisites and dependencies from previous agents
4. **CREATE** TodoWrite entries that mirror TODO.md structure
5. **ANNOUNCE** what you're about to do and confirm scope

### DURING EVERY SESSION:
1. **UPDATE** TodoWrite every 30 minutes with real progress
2. **SYNC** TODO.md after major milestones (never let it get >2 hours out of sync)
3. **VALIDATE** actual codebase state matches documented state
4. **COMMUNICATE** blockers or scope changes immediately
5. **TRUST** auto-commit system for regular synchronization (every 6 hours)

### AFTER EVERY ACTION:
1. **UPDATE** `TODO.md` with completed status [✅] or [🔄] for handoffs
2. **MARK** all TodoWrite tasks as completed
3. **DOCUMENT** next dependencies and suggested next agent
4. **COMMIT** changes with descriptive message including TODO sync
5. **VERIFY** next agent can pick up cleanly from TODO.md state
6. **RELY** on automated Git workflows for continuous synchronization

### AGENT HANDOFF RULES:
- **NEVER** mark tasks complete in TODO.md unless they're 100% working
- **ALWAYS** test that next agent can start from TODO.md documentation alone
- **DOCUMENT** any environment setup or dependencies for next agent
- **LEAVE** clear breadcrumbs in TODO.md for what comes next

---

## 📚 PROJECT DOCUMENTATION HIERARCHY

**ALWAYS consult these files in this order:**
1. `TODO.md` - Current sprint status and tasks
2. `ProjectSpecification.md` - Core project requirements
3. `DatabaseSchema.md` - For any database-related work
4. `ScoringSystem.md` - For scoring logic implementation
5. `ApifyScraper.md` - For scraper integrations

---

## 🎯 CORE DIRECTIVES FOR CLAUDE CODE

### 1. Task Management Protocol
```bash
# Before starting ANY work:
1. cat TODO.md
2. Identify the [CURRENT] task
3. Ask: "I see the current task is X. Should I proceed with this?"
4. Wait for confirmation or redirection
```

### 2. File Creation Protocol
```bash
# When creating new files:
1. Check if file already exists
2. If exists, ask: "File X exists. Should I update or create new?"
3. Create with proper header comment:

/**
 * @file [filename]
 * @description [what this file does]
 * @created [date]
 * @modified [date]
 * @todo [reference to TODO.md task]
 */
```

### 3. Progress Tracking Format
Every task in `TODO.md` must follow this structure:
```markdown
- [ ] Task Name
  - Status: [Not Started | In Progress | Blocked | Complete]
  - Started: [timestamp]
  - Blocker: [if any]
  - Files affected: [list]
  - Subtasks:
    - [x] Subtask 1 (completed at: timestamp)
    - [ ] Subtask 2
```

---

## 🛡️ SECURITY RULES - NEVER VIOLATE

1. **NEVER commit sensitive data**
   ```bash
   # Always check before committing:
   - No API keys in code
   - No passwords
   - No real user data
   - Use .env.local.example as template
   ```

2. **ALWAYS validate inputs**
   ```typescript
   // Every API endpoint MUST have:
   - Zod schema validation
   - User authentication check
   - Rate limiting
   - Error boundaries
   ```

3. **Database queries MUST use RLS**
   ```typescript
   // NEVER use service role in client code
   // ALWAYS check user ownership
   ```

---

## 📏 CODING STANDARDS - ENFORCE STRICTLY

### File Size Rules
- **400 lines maximum** per file
- **100 lines maximum** per function
- **5 parameters maximum** per function
- **3 levels maximum** nesting depth

### When limit exceeded:
```bash
# AI must:
1. Stop immediately
2. Announce: "File exceeds 400 line limit"
3. Propose file split structure
4. Wait for approval
```

### Naming Conventions
```typescript
// Components: PascalCase
components/UserDashboard.tsx ✅
components/userDashboard.tsx ❌

// Functions: camelCase
function calculateScore() ✅
function CalculateScore() ❌

// Constants: UPPER_SNAKE_CASE
const MAX_RETRIES = 3 ✅
const maxRetries = 3 ❌

// Files: kebab-case for routes, camelCase for utils
app/api/analyze-listing/route.ts ✅
lib/utils/formatCurrency.ts ✅
```

---

## 🤖 AUTOMATED GIT WORKFLOW INTEGRATION

### AUTO-COMMIT SYSTEM - PRODUCTION-GRADE AUTOMATION

**🕒 Schedule**: Every 6 hours (6:00, 12:00, 18:00, 00:00 CET)  
**🎯 Purpose**: Maintain continuous project synchronization and documentation

#### How Auto-Commit Works:
```yaml
Automated Process:
1. 📅 Update TODO.md timestamp automatically  
2. 🔍 Run comprehensive validation (8-phase pre-commit system)
3. 🤖 Analyze changes intelligently (code vs docs vs mixed)
4. 💾 Create contextual commit messages
5. 🚀 Push to GitHub with security validation
6. 📊 Generate summary reports
```

#### AI Integration Rules:
```markdown
✅ DO:
- Trust auto-commit for regular synchronization
- Continue development knowing changes will be preserved
- Update TODO.md manually for immediate needs
- Commit major milestones manually for important checkpoints

❌ DON'T:  
- Worry about losing work between sessions
- Manually commit every small change
- Override auto-commit timestamps
- Disable auto-commit system without coordination
```

#### Auto-Commit Message Intelligence:
```bash
# Code + Documentation Changes
feat(development): development progress with TODO.md sync

# Documentation Only  
docs(todo): TODO.md synchronization and progress update

# Code Only
feat(development): automated development progress  

# Maintenance
chore(auto-sync): automated maintenance
```

#### Validation Phases (All Auto-Checked):
1. **🔒 Security**: API token exposure prevention
2. **📋 TODO.md**: Synchronization and timestamp validation  
3. **📏 File Size**: 400-line limit enforcement (CLAUDE.md compliance)
4. **🎯 Code Quality**: Debug statements, error handling, TypeScript strict mode
5. **🇩🇪 Localization**: German UI text compliance 
6. **📦 Dependencies**: package.json/lock synchronization
7. **🗄️ Database**: Migration naming and safety checks
8. **🎨 Formatting**: Prettier, ESLint, and code standards

#### Manual Override When Needed:
```bash
# Emergency commit (bypasses some checks)
git commit --no-verify -m "emergency: critical hotfix"

# Manual trigger auto-commit workflow
# GitHub → Actions → "ListingBoost Auto-Commit & Sync System" → Run workflow
```

---

## 🚨 ERROR HANDLING PROTOCOL

### Every function MUST have:
```typescript
try {
  // Main logic
} catch (error) {
  // 1. Log error with context
  console.error(`[FunctionName] Error:`, {
    error,
    context: { /* relevant data */ },
    timestamp: new Date().toISOString()
  })
  
  // 2. User-friendly error
  throw new AppError(
    'User-friendly message',
    'ERROR_CODE',
    originalError
  )
}
```

### API Response Format
```typescript
// Success
{
  success: true,
  data: { /* response data */ },
  meta: { timestamp, version }
}

// Error
{
  success: false,
  error: {
    code: 'ERROR_CODE',
    message: 'User-friendly message',
    details: { /* if in dev mode */ }
  }
}
```

---

## 🔄 DEVELOPMENT WORKFLOW

### Before Writing Code:
1. **Check** existing similar implementations
2. **Plan** the module structure
3. **Write** interface/types first
4. **Implement** with tests in mind

### Git Commit Rules:
```bash
# Format: type(scope): message

feat(auth): add Google OAuth login
fix(dashboard): resolve score calculation bug
docs(readme): update setup instructions
refactor(api): split analyze endpoint
test(scoring): add unit tests for calculator
style(ui): update button hover states
chore(deps): upgrade Next.js to v15
```

### Code Review: No console.logs, JSDoc comments, error handling, input validation, tests, no hardcoded values

---

## 🎯 SPECIFIC PROJECT RULES

### 🚀 FREEMIUM LEAD-GENERATION SYSTEM - PRODUCTION-READY

**COMPLETED FEATURES (Ready for Launch)**:
```typescript
// Core System Architecture:
- Enhanced Analysis Duration: 35s → 18s (47% performance improvement)
- Real Apify URL Scraper Integration with 60s timeout
- Graceful Fallback System: Real Data → Enhanced Fake Data
- DATABASE INTEGRATION: All data saved to listings table for reuse
- Modern Glassmorphic Dashboard with Real Listing Images
- Strategic Conversion Optimization with Locked Premium Features
- Live Data Indicator (Real vs Demo Mode)
- German Localization throughout entire freemium flow
- FIXED: Progress bar jumping issues (dependency array + calculation logic)

// API Endpoints:
- POST /api/freemium/analyze - Real data integration with DB persistence
- GET /api/freemium/dashboard/[token] - Fast DB loading for dashboard
- Comprehensive error handling and timeout management
- Production-ready caching, DB storage, and performance optimization
```

**FREEMIUM SYSTEM RULES - ENFORCE STRICTLY**:
```typescript
// Real Data Integration + DB Persistence
- ALWAYS attempt Apify URL scraping first (production only)
- Background API call during fake analysis step 3 (12s into 18s flow)
- All scraped data SAVED TO LISTINGS TABLE for reuse in premium features
- Graceful fallback to enhanced fake data on timeout/failure
- Display data source indicator (Live Analysis vs Demo Mode)

// User Experience Optimization  
- Analysis duration: EXACTLY 18 seconds (smooth progress bar)
- FIXED: Progress bar jumping issues (dependency array + calculation)
- Real listing images as dashboard background for credibility
- Strategic upgrade CTAs with locked premium features
- Conversion-optimized UI with glassmorphic design

// Performance Requirements & Architecture
- API timeout: 60 seconds maximum for scraping (increased reliability)
- Dashboard loads from DB first (instant), falls back to cache/API
- DB persistence: freemium_token stored in raw_scraped_data field
- Fallback chain: DB → Cache → API call (performance optimization)
- Error handling: Never expose internal errors to users
```

### 🇩🇪 GERMAN LANGUAGE REQUIREMENT - MANDATORY

**ALL user-facing content MUST be in German (DACH market focus):**

```typescript
// Frontend Pages & Components
- All UI text, labels, buttons: German
- Error messages: German
- Success notifications: German
- Form placeholders: German
- Tooltips and help text: German

// Email Templates
- All email subjects: German
- Email body content: German
- Automated notifications: German
- Welcome emails: German
- Invoice emails: German

// Database Content
- Product descriptions: German
- Category names: German
- Default settings: German locale

// API Responses
- User-facing error messages: German
- Validation error messages: German
- Status messages: German
```

**Translation Standards:**
```typescript
// Use consistent translations:
"Sign In" → "Anmelden"
"Sign Up" → "Registrieren"
"Dashboard" → "Dashboard"
"Settings" → "Einstellungen"
"Profile" → "Profil"
"Logout" → "Abmelden"
"Save" → "Speichern"
"Cancel" → "Abbrechen"
"Delete" → "Löschen"
"Edit" → "Bearbeiten"
"Loading..." → "Wird geladen..."
"Error" → "Fehler"
"Success" → "Erfolgreich"
```

**Localization Rules:**
```typescript
// Date format: DD.MM.YYYY
const dateFormatter = new Intl.DateTimeFormat('de-DE')

// Currency: EUR with German formatting
const currencyFormatter = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR'
})

// Number format: German decimal separator
const numberFormatter = new Intl.NumberFormat('de-DE')
```

### 🎨 CSS FRAMEWORK RULES - TAILWIND V4 REQUIRED

**MANDATORY**: Use Tailwind CSS v4.x+ with new configuration

```typescript
// Package requirements
"tailwindcss": "^4.1.11",
"@tailwindcss/postcss": "^4.1.11",
"@tailwindcss/node": "^4.1.11"

// globals.css MUST contain:
@import "tailwindcss";

// postcss.config.js MUST contain:
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}

// tailwind.config.js MUST include v4 syntax:
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // ... rest of config
}
```

**FORBIDDEN**:
- Using Tailwind v3 syntax (@import "tailwindcss/base")
- Missing @tailwindcss/postcss plugin
- Mixing v3/v4 configurations

### 🎯 FREEMIUM LEAD-GENERATION SYSTEM RULES

**MANDATORY**: Freemium is the PRIMARY lead-generation route (not secondary)

```typescript
// Freemium Flow Implementation Rules:
1. Homepage "Kostenlose Analyse starten" → /freemium (NOT /auth/register)
2. Freemium flow: URL input → fake analysis (18s) → email → DB-powered dashboard → upsell
3. All freemium UI MUST be German-localized
4. Test bypass ONLY in development environment (process.env.NODE_ENV === 'development')
5. Token-based dashboard access with localStorage persistence
6. Fake analysis with 5 steps (18 seconds total) + background real scraping
7. Strong upsell CTAs throughout free dashboard experience

// Freemium Routing Rules:
- /freemium → URL input with Airbnb validation
- /freemium/analyze → Fake analysis simulation 
- /freemium/email → Email collection (with test bypass for dev)
- /freemium/dashboard/[token] → Free results with upgrade prompts

// Freemium Design Standards:
- Glassmorphic design with animated backgrounds
- Professional German UI text
- Progressive enhancement UX
- Mobile-first responsive design
- Strong conversion optimization focus
```

**Freemium Translation Standards:**
```typescript
"Free Analysis" → "Kostenlose Analyse"
"Start Analysis" → "Analyse starten" 
"Enter Airbnb URL" → "Airbnb-URL eingeben"
"Send Analysis" → "Analyse zusenden"
"Upgrade Now" → "Jetzt upgraden"
"Limited Results" → "Eingeschränkte Ergebnisse"
"Full Report" → "Vollbericht"
```

### Database & API Rules
```typescript
// Use transactions, always set limits, rate limiting
supabase.rpc('transaction_wrapper', {...}).select('*').limit(100)
const rateLimiter = { apify: 10, gemini: 60, stripe: 100 } // per minute

// Freemium-specific DB rules (UPDATED):
- Real Apify calls in background during fake analysis (data reuse)
- All analysis data saved to listings table with freemium_token
- Token generation: 'freemium_' + random + timestamp
- Email collection for lead generation (not authentication)
- localStorage for session persistence across freemium flow
- Dashboard loads from listings table first (performance)
```

---

## 🚫 FORBIDDEN ACTIONS & QUALITY STANDARDS

**NEVER:**
- Delete without confirmation
- Skip error handling "for now" 
- Use `any` type - use `unknown` instead
- Commit commented-out code
- Expose internal errors to users

**QUALITY METRICS:**
- TypeScript Coverage: 100% (no any types)
- File Size: No file over 400 lines
- Response Time: API responses < 500ms

**PRIORITIES:**
1. Security over convenience
2. Maintainability over cleverness  
3. User Experience over developer experience

---

---

## 🔧 RECENT MAJOR FIXES & UPDATES (2025-07-22)

### **CRITICAL ISSUE RESOLVED: Freemium Progress Bar & Performance**

**Problems Identified:**
1. **Progress Bar Jumping**: Erratic movement back and forth due to dependency array + calculation errors
2. **Slow Dashboard Loading**: Dashboard making new API calls instead of loading from DB
3. **Data Loss**: Background API calls not persisted to database
4. **Race Conditions**: Fake analysis vs real API calls conflicting

**Solutions Implemented:**
```typescript
// ✅ FIX 1: Progress Bar Stability
- Moved analysisSteps outside component (prevents recreation)
- Fixed useEffect dependency array (removed analysisSteps reference)
- Improved progress calculation logic (time-based instead of increment-based)
- Result: Smooth 0-100% progress without jumping

// ✅ FIX 2: Database Integration & Performance
- Background API calls now save to listings table (data reuse)
- Created GET /api/freemium/dashboard/[token] endpoint (DB loading)
- Dashboard load hierarchy: DB → Cache → API (performance optimization)
- freemium_token stored in raw_scraped_data field for linking
- Result: Dashboard loads instantly from DB, falls back gracefully

// ✅ FIX 3: Architecture Optimization
- Increased Apify timeout: 25s → 60s (better success rate)
- Real data now persisted for premium feature reuse
- Performance monitoring and diagnostics enhanced
- German localization maintained throughout
- Result: Production-ready freemium system with data persistence
```

**Performance Improvements:**
- Dashboard loading: ~10s → <1s (when data in DB)
- Progress bar: Stable, no more jumping
- Data reuse: All freemium analysis saved for premium upgrades
- Reliability: Better timeout handling and fallback chains

**Technical Details:**
- New API endpoint: `/api/freemium/dashboard/[token]`
- DB integration: All scraped data saved to `listings` table
- Background processing: API calls during fake analysis step 3
- Fallback chain: DB → localStorage cache → fresh API call

**Last Updated Build Logs**: 
- **Critical Deployment Log Added**: Log from Vercel build on a recent build, which showed environment validation and build errors

---

**Last Updated**: 2025-07-22 | **Current Sprint**: Enhanced Freemium System with Real Data Integration & Performance Fixes