# AGENT PROTOCOLS - Mandatory Task Synchronization

## 🚨 CRITICAL AGENT RULES - NEVER VIOLATE

### 1. TODO.md SYNCHRONIZATION PROTOCOL
**EVERY spawn agent MUST follow this sequence:**

```bash
# BEFORE starting ANY work:
1. Read TODO.md
2. Identify current sprint and dependencies  
3. Create TodoWrite entries for new tasks
4. Mark current task as "in_progress"

# DURING work:
5. Update TodoWrite every 30 minutes
6. Update TODO.md after major milestones

# AFTER completing work:
7. Mark TodoWrite tasks as "completed" 
8. Update TODO.md with completed status
9. Add new tasks for next sprint if identified
10. Commit changes with descriptive message
```

### 2. MANDATORY AGENT STARTUP CHECKLIST
```markdown
- [ ] Read TODO.md current state
- [ ] Check dependencies from previous sprints
- [ ] Create TodoWrite for this session
- [ ] Announce planned tasks to user
- [ ] Confirm task scope before starting
```

### 3. TASK STATE SYNCHRONIZATION
**Two-layer system:**
- **TodoWrite**: Session-level progress tracking
- **TODO.md**: Cross-session project state

### 4. AGENT HANDOFF PROTOCOL
When spawning new agents:
```bash
# Current agent MUST:
1. Update TODO.md with current status
2. Mark completed tasks as [✅]
3. Add [🔄] for in-progress handoffs
4. Document blockers or dependencies
5. Suggest next agent type needed

# New agent MUST:
1. Read updated TODO.md
2. Verify handoff completeness  
3. Confirm scope understanding
4. Update status to "active"
```

### 5. QUALITY GATES
No agent can mark tasks complete without:
- [ ] Code compiles successfully
- [ ] Tests pass (if applicable)
- [ ] Documentation updated
- [ ] TODO.md reflects true status
- [ ] Dependencies for next tasks documented

### 6. EMERGENCY RECOVERY
If TODO.md gets out of sync:
```bash
1. STOP all work immediately
2. Audit actual vs documented state
3. Update TODO.md to reflect reality
4. Re-align TodoWrite with TODO.md
5. Resume work only after sync confirmed
```

---

## 🎯 AGENT-SPECIFIC PROTOCOLS

### Auth-Agent
- Update AUTH-XXX tasks in TODO.md
- Track Supabase integration progress
- Document auth flow completeness

### API-Agent  
- Update API-XXX tasks in TODO.md
- Track endpoint implementation
- Document API schema changes

### UI-Agent
- Update UI-XXX tasks in TODO.md
- Track component library progress
- Document design system evolution

### Scraper-Agent
- Update SCRAPER-XXX tasks in TODO.md
- Track Apify integration progress
- Document data collection status

### Payment-Agent
- Update PAY-XXX tasks in TODO.md
- Track Stripe integration progress
- Document subscription flow status

### AI-Agent
- Update AI-XXX tasks in TODO.md
- Track Gemini integration progress
- Document scoring system implementation

---

## 🔒 ENFORCEMENT MECHANISMS

### 1. Pre-commit Hook Enhancement
```javascript
// Add to .husky/pre-commit
const todos = checkTodoSync()
if (!todos.synced) {
  console.error('❌ TODO.md out of sync with actual state')
  exit(1)
}
```

### 2. Agent Spawn Validation
```bash
# Before spawning new agent:
1. Validate TODO.md is current
2. Confirm no orphaned tasks
3. Verify clear handoff documentation
```

### 3. Session Continuity Check
```bash
# At start of each session:
1. Compare TODO.md vs actual codebase state
2. Identify and resolve discrepancies
3. Update status before proceeding
```

---

**Last Updated**: 2025-07-20 17:50:00
**Status**: 🔴 CRITICAL - Must be implemented before next spawn