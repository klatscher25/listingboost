# AI Workflow Rules - ListingBoost Assistant Guide

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