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

### AFTER EVERY ACTION:
1. **UPDATE** `TODO.md` with completed status [✅] or [🔄] for handoffs
2. **MARK** all TodoWrite tasks as completed
3. **DOCUMENT** next dependencies and suggested next agent
4. **COMMIT** changes with descriptive message including TODO sync
5. **VERIFY** next agent can pick up cleanly from TODO.md state

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

### Code Review Checklist:
- [ ] No console.logs in production code
- [ ] All functions have JSDoc comments
- [ ] Error handling implemented
- [ ] Input validation present
- [ ] Tests written/updated
- [ ] No hardcoded values
- [ ] Follows file size limits

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

### Database Operations
```typescript
// ALWAYS use transactions for multiple operations
const { data, error } = await supabase.rpc('transaction_wrapper', {
  operations: [...]
})

// NEVER fetch without limits
.select('*')
.limit(100) // Always set a limit
```

### API Rate Limiting
```typescript
// Implement for all external APIs:
const rateLimiter = {
  apify: 10, // requests per minute
  gemini: 60, // requests per minute
  stripe: 100 // requests per minute
}
```

### State Management
```typescript
// Prefer server state over client state
// Use React Server Components where possible
// Client state only for UI interactions
```

---

## 📋 DAILY CHECKLIST FOR AI

### Start of Session:
- [ ] Load all .md files
- [ ] Check TODO.md for current sprint
- [ ] Verify branch is correct
- [ ] Check for any blockers

### During Development:
- [ ] Update TODO.md every 30 minutes
- [ ] Commit atomic changes
- [ ] Run type checks before commits
- [ ] Keep terminal output clean

### End of Session:
- [ ] Update all task statuses
- [ ] Document any decisions made
- [ ] List tomorrow's priorities
- [ ] Commit all changes

---

## 🚫 FORBIDDEN ACTIONS

1. **NEVER** delete without confirmation
2. **NEVER** modify core configs without discussion
3. **NEVER** skip error handling "for now"
4. **NEVER** use `any` type - use `unknown` instead
5. **NEVER** commit commented-out code
6. **NEVER** use force push
7. **NEVER** expose internal errors to users

---

## 💡 WHEN STUCK

1. **Re-read** the task requirements
2. **Check** similar implementations in codebase
3. **Consult** the documentation files
4. **Ask** for clarification with specific questions
5. **Propose** 2-3 alternative approaches

---

## 📊 QUALITY METRICS TO MAINTAIN

- **TypeScript Coverage**: 100% (no any types)
- **Error Handling**: 100% try-catch coverage
- **Code Comments**: All public functions documented
- **File Size**: No file over 400 lines
- **Response Time**: API responses < 500ms
- **Bundle Size**: Monitor with next-bundle-analyzer

---

## 🔔 REMEMBER

**You are building a production-grade SaaS application. Every line of code matters. Every decision has consequences. Always prioritize:**

1. **Security** over convenience
2. **Maintainability** over cleverness  
3. **User Experience** over developer experience
4. **Performance** over premature optimization
5. **Clarity** over brevity

---

**Last Updated**: 2025-01-20
**Current Sprint**: DACH Market Focus - German Localization
**Active Branch**: main