# ChildCompass — Subagent Workflow

## Why 3 Agents Instead of 1

A single agent holding the entire codebase in context causes:
- Context pollution (frontend rules mixing with DB rules)
- Hallucinations from unrelated code
- Slower, less accurate responses

**Solution:** Each agent gets only the context it needs for its layer.

---

## The 3 Agents

| Agent | Context File | Touches |
|---|---|---|
| DB Agent | `docs/agents/db-agent.md` | `prisma/schema.prisma`, migrations, `repositories.ts` |
| Backend Agent | `docs/agents/backend-agent.md` | `src/app/api/**`, `src/lib/supabase/`, `src/middleware.ts` |
| Frontend Agent | `docs/agents/frontend-agent.md` | `src/app/**/page.tsx`, `src/components/**`, `globals.css` |

---

## How to Run a Feature

### End-to-end feature (needs all 3 layers) → run in sequence

Each step follows TDD: write failing test first → implement → test passes.

```
Step 1: DB Agent  (branch: db)
  Context: docs/agents/db-agent.md + .claude/rules/tdd.md
  Task: "Write repo test → add schema/field → implement repo method → test passes"

Step 2: Backend Agent  (branch: backend)
  Context: docs/agents/backend-agent.md + .claude/rules/tdd.md
  Task: "Write API route test → implement route → test passes"

Step 3: Frontend Agent  (branch: frontend)
  Context: docs/agents/frontend-agent.md + .claude/rules/tdd.md
  Task: "Write component test → build UI → test passes"
```

### Independent tasks → run in parallel

```
Parallel:
  Frontend Agent → "Fix map zoom behavior on mobile"
  Backend Agent  → "Add pagination to /api/listings"
```

These don't share code — run them at the same time.

### CI gate — runs automatically on every PR

```
PR (db / backend / frontend → main)
  ↓
GitHub Actions (.github/workflows/ci.yml)
  1. npm run lint
  2. npm run type-check
  3. npm run test
  ↓
Merge to main → Vercel auto-deploys
```

PRs that fail lint, type-check, or tests cannot merge.

---

## Practical Example

**Feature:** Email notification when a booking is confirmed

```
DB Agent:      No schema change needed (Booking model already has status + respondedAt)

Backend Agent: Update PATCH /api/bookings/[id] to send email via Resend
               when status changes to CONFIRMED or DECLINED

Frontend Agent: No UI change needed
```

→ Only Backend Agent runs. DB and Frontend are skipped.

---

## Rules

- **DB Agent** never touches API routes or components
- **Backend Agent** never touches Prisma schema directly — it calls repo methods only
- **Frontend Agent** never writes business logic — it calls existing API routes only
- Always run DB Agent before Backend Agent when a schema change is needed
- Always run Backend Agent before Frontend Agent when a new API route is needed
