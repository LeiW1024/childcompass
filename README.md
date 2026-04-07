# ChildCompass 🧭

**Digital Wayfinding for Families** — Childcare & Kids Activity Marketplace for Erfurt, Germany

> Built entirely through conversational AI development with Claude Code, deployed to production, serving real families in Erfurt.

🌐 **Live app:** https://childcompass.vercel.app
📊 **Presentation:** https://leiw1024.github.io/childcompass/docs/presentation/ChildCompass_Final_Presentation.html

---

## Overview

ChildCompass helps parents of children aged 0–6 discover, filter, and book trusted local activities. Providers publish listings and manage booking requests. Admins seed and grow the catalogue via AI-powered scraping tools.

---

## MVP Features

| Feature | Status |
|---|---|
| Activity discovery + Mapbox map with filters | ✅ Live |
| Listing detail pages (age, price, schedule, location) | ✅ Live |
| Booking request flow (request → confirm/decline/cancel) | ✅ Live |
| Email notifications via Resend (provider + parent) | ✅ Live |
| Provider dashboard (listings + booking management) | ✅ Live |
| Provider onboarding wizard | ✅ Live |
| Parent dashboard (booking status + child management) | ✅ Live |
| Multi-step registration (role → profile → children/company) | ✅ Live |
| Google OAuth + email auth via Supabase | ✅ Live |
| Provider listing create / edit / publish + auto-geocoding | ✅ Live |
| Provider claim flow (unclaimed provider → owner) | ✅ Live |
| Admin scraper (Claude `web_search` → 134 real listings) | ✅ Live |
| Admin bulk import (XLSX/CSV) | ✅ Live |
| AI support chatbot (n8n + Google Gemini) | ✅ Live |
| Bilingual UI (German / English) | ✅ Live |

---

## User Roles

| Role | Access |
|---|---|
| `PARENT` | Browse listings, request bookings, manage children, track status |
| `PROVIDER` | Publish listings, manage bookings, onboarding wizard |
| `ADMIN` | Full access — scraper, bulk import, geocoder, listing management |

---

## Tech Stack

### Frontend
| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 14.2.5 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS + CSS Variables | 3.4.1 |
| UI Components | Radix UI (Dialog, Dropdown, Select, Toast, Avatar, Tabs, Label, Slot) | @radix-ui/react-* |
| Maps | Mapbox GL JS | 2.15.0 |
| Forms | react-hook-form + @hookform/resolvers + Zod | 7.52.1 / 3.9.0 / 3.23.8 |
| State Management | Zustand | 4.5.4 |
| Icons | Lucide React | 0.408.0 |
| Font | Plus Jakarta Sans | — |

### Backend
| Layer | Technology | Version |
|---|---|---|
| Runtime | Node.js via Next.js API Routes | — |
| Auth | Supabase Auth | ^2.43.5 |
| ORM | Prisma | 5.16.1 |
| Database | PostgreSQL (Supabase) | — |
| Email | Resend | — |
| Admin Scraper | Anthropic Claude API + `web_search` tool | — |
| AI Chatbot | n8n webhook + Google Gemini AI | — |
| Deploy | Vercel | — |

---

## AI Workflow

This project was built using a **3 sub-agent architecture** in Claude Code:

| Agent | Branch | Owns |
|---|---|---|
| DB Agent | `db` | `prisma/schema.prisma`, `migrations/`, `repositories.ts`, `seed.mjs` |
| Backend Agent | `backend` | `src/app/api/**`, `lib/email.ts`, `lib/geocode.ts`, `middleware.ts` |
| Frontend Agent | `frontend` | `src/app/**/page.tsx`, `src/components/**`, `globals.css` |

Each agent follows strict boundary rules (defined in `.claude/rules/`) and writes tests first (TDD). Independent tasks run in parallel across branches; full-stack features run sequentially DB → Backend → Frontend.

---

## Folder Structure

```
childcompass/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── page.tsx                      # Landing page
│   │   ├── auth/login|register|error/
│   │   ├── listings/                     # Directory + detail pages
│   │   ├── dashboard/
│   │   │   ├── parent/                   # Bookings + children tabs
│   │   │   └── provider/                 # Listings + booking requests
│   │   │       └── setup/                # Onboarding wizard
│   │   ├── admin/                        # Scraper, importer, geocoder
│   │   ├── claim/[token]/
│   │   └── api/                          # All route handlers
│   ├── components/
│   │   ├── layout/Navbar + Footer
│   │   ├── forms/LoginForm + RegisterForm
│   │   ├── ui/LanguageSwitcher + SignOutButton
│   │   ├── ChatWidget.tsx                # n8n AI support chat
│   │   └── BookingModal.tsx
│   ├── lib/
│   │   ├── prisma/client.ts
│   │   ├── prisma/repositories.ts
│   │   ├── prisma/getOrCreateProfile.ts
│   │   ├── email.ts                      # Resend email helpers
│   │   ├── geocode.ts                    # Mapbox geocoding
│   │   ├── supabase/client|server|middleware
│   │   └── utils/
│   ├── types/index.ts                    # Enums, labels, icons
│   └── __tests__/                        # API + component tests
├── prisma/
│   ├── schema.prisma
│   ├── seed.mjs                          # 17 providers + 32 listings
│   └── migrations/
├── docs/
│   ├── agents/                           # Sub-agent workflow rules
│   └── presentation/                     # Final portfolio presentation
└── .claude/rules/                        # 9 AI coding rule files
```

---

## Setup

```bash
npm install
cp .env.example .env.local
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Open http://localhost:3000

---

## Post-MVP Roadmap

| Phase | Feature |
|---|---|
| Phase 1 | Reviews & ratings with AI moderation |
| Phase 2 | Provider analytics dashboard |
| Phase 3 | Stripe integrated payments |
| Long-term | Multi-city expansion across Germany + mobile app |
