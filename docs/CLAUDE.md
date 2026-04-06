# ChildCompass — CLAUDE.md

> AI development reference. Next.js 14 · Supabase · Prisma · Mapbox · Tailwind

---

## Project Overview

Childcare marketplace for parents in Erfurt, Germany. Children ages 0–6. Parents discover and book activities. Providers publish listings. Admins seed data via AI scraping tools.

---

## AI Development Workflow

3 specialized subagents — each reads only its own context file:

| Agent | Context File | Owns |
|---|---|---|
| DB Agent | `docs/agents/db-agent.md` | `prisma/schema.prisma`, migrations, `repositories.ts` |
| Backend Agent | `docs/agents/backend-agent.md` | `src/app/api/**`, `src/lib/supabase/`, `middleware.ts` |
| Frontend Agent | `docs/agents/frontend-agent.md` | `src/app/**/page.tsx`, `src/components/**`, `globals.css` |

**Branch strategy:** `main` → `db` / `backend` / `frontend` — one domain per PR.
See `docs/agents/WORKFLOW.md` for how to run features across agents.

---

## Tech Stack

### Frontend
| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 14.2.5 |
| Styling | Tailwind CSS + CSS Variables | 3.4.1 |
| UI Components | Radix UI | @radix-ui/react-* |
| Maps | Mapbox GL JS | 2.15.0 |
| Forms | react-hook-form + Zod | 7.52.1 / 3.23.8 |
| Icons | Lucide React | 0.408.0 |
| Font | Plus Jakarta Sans | — |

### Backend
| Layer | Technology | Version |
|---|---|---|
| Auth | Supabase Auth | ^2.43.5 |
| ORM | Prisma | 5.16.1 |
| Database | PostgreSQL (Supabase) | — |
| AI Scraper | Anthropic Claude API | — |
| Support Chat | n8n + Google Gemini | — |

---

## Folder Structure

```
childcompass/
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Landing page
│   │   ├── auth/                     # Login, register, error
│   │   ├── listings/                 # Directory + detail + ListingsClient
│   │   ├── dashboard/parent|provider # Role dashboards
│   │   ├── api/                      # All API route handlers
│   │   ├── admin/                    # Admin tools
│   │   └── claim/[token]/            # Provider claim flow
│   ├── components/
│   │   ├── layout/                   # Navbar, Footer
│   │   ├── forms/                    # LoginForm, RegisterForm
│   │   ├── ui/                       # Radix wrappers, LanguageSwitcher
│   │   └── chat/                     # ChatWidget
│   ├── lib/
│   │   ├── prisma/                   # client, repositories, getOrCreateProfile
│   │   ├── supabase/                 # browser client, server client, middleware
│   │   └── utils/                    # cn, dates
│   ├── types/index.ts                # Enums, label maps, formatAgeRange()
│   └── middleware.ts                 # Route protection
├── prisma/
│   ├── schema.prisma
│   ├── seed.mjs                      # 17 providers + 32 listings
│   └── migrations/
├── docs/
│   ├── agents/                       # db-agent, backend-agent, frontend-agent, WORKFLOW
│   └── rules/                        # routes, design-system, known-issues
└── .claude/rules/project-quality.md  # Coding standards (security, API, TypeScript)
```

---

## Scripts

```bash
npm run dev          # localhost:3000
npm run build        # Production build
npm run db:generate  # Regenerate Prisma client
npm run db:push      # Sync schema (dev)
npm run db:migrate   # Create migration (prod)
npm run db:studio    # Prisma Studio at localhost:5555
npm run db:seed      # Seed 17 providers + 32 listings
```

---

## Environment Variables

```bash
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_MAPBOX_TOKEN=
SUPABASE_SERVICE_ROLE_KEY=    # server-only
DATABASE_URL=                  # Prisma runtime (Transaction Pooler)
DIRECT_URL=                    # Prisma migrations only
ADMIN_SECRET_KEY=
ANTHROPIC_API_KEY=             # admin scraper
N8N_WEBHOOK_URL=               # support chat
```

---

## Key Patterns

- **Server-first components**: default Server Component, `"use client"` only for state/effects/browser APIs
- **Repository pattern**: all DB queries via `lib/prisma/repositories.ts` — never raw Prisma in routes
- **Auth**: `createClient()` → `supabase.auth.getUser()` at top of every protected route
- **Response shape**: all API routes return `{ data, error }`
- **Prisma upsert**: never use empty `update: {}` — always include `updatedAt: new Date()`
- **i18n**: `useLang()` hook → `"de"` (default) or `"en"` — no external library

---

## Reference Docs

| Topic | File |
|---|---|
| Full routes reference | `.claude/rules/routes.md` |
| Design system | `.claude/rules/design-system.md` |
| Known issues & MVP scope | `.claude/rules/known-issues.md` |
| Coding standards & security | `.claude/rules/project-quality.md` |
| DB schema & Prisma rules | `docs/agents/db-agent.md` |
| API patterns | `docs/agents/backend-agent.md` |
| Component patterns | `docs/agents/frontend-agent.md` |
| Subagent workflow | `docs/agents/WORKFLOW.md` |
