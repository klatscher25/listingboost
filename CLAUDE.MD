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

### Database & API Rules
```typescript
// Use transactions, always set limits, rate limiting
supabase.rpc('transaction_wrapper', {...}).select('*').limit(100)
const rateLimiter = { apify: 10, gemini: 60, stripe: 100 } // per minute
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

**Last Updated**: 2025-01-20 | **Current Sprint**: German Localization