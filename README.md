## Project Overview

**ChildCompass** is a childcare and kids activity marketplace for parents in Erfurt, Germany. Children ages 0–6. Parents discover, filter, and book trusted activities. Providers publish listings and manage booking requests. Admins seed provider data via scraping tools.

Built entirely through conversational AI development with Claude using a **vertical-slice approach** — one complete feature at a time.

---

## MVP Features

| Feature | Description |
|---|---|
| **Activity Discovery** | Searchable, filterable directory of childcare providers and activities |
| **Listing Detail Pages** | Age range, price, schedule, location, provider info |
| **Booking Request Flow** | Parents request spots; providers confirm or decline |
| **Provider Dashboard** | Create/edit listings, manage incoming requests |
| **Parent Dashboard** | Track booking status (Requested / Confirmed / Declined) |

## User Roles

| Role | Access |
|---|---|
| `PARENT` | Browse listings, request bookings, track status |
| `PROVIDER` | Publish listings, manage bookings |
| `ADMIN` | Full access (future) |

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
| Charts | Recharts | 2.12.7 |
| Theme | next-themes | 0.3.0 |
| Utilities | clsx, tailwind-merge, date-fns | 2.1.1 / 2.4.0 / 3.6.0 |
| Font | Geist Sans + Geist Mono (CSS vars) + Plus Jakarta Sans | — |

### Backend
| Layer | Technology | Version |
|---|---|---|
| Runtime | Node.js via Next.js API Routes | — |
| Auth | Supabase Auth (@supabase/supabase-js + @supabase/ssr) | ^2.43.5 / ^0.4.0 |
| ORM | Prisma | 5.16.1 |
| Database | PostgreSQL (hosted on Supabase) | — |
| Connection Pooling | PgBouncer (via Supabase Transaction Pooler) | — |
| Admin Scraper | Anthropic Claude API (optional) | — |

---

## Folder Structure

```
childcompass/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout, metadata, LangProvider
│   │   ├── globals.css                   # Design system tokens + Tailwind base
│   │   ├── page.tsx                      # Landing page
│   │   ├── auth/login|register|error/    # Auth pages
│   │   ├── listings/                     # Directory page + detail page
│   │   │   ├── page.tsx
│   │   │   ├── ListingsClient.tsx        # Client-side filter + map logic
│   │   │   ├── MapPanel.tsx / MapInner.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── dashboard/
│   │   │   ├── page.tsx                  # Smart redirect (parent vs provider)
│   │   │   ├── parent/                   # Bookings + children tabs
│   │   │   └── provider/                 # Listings + booking requests
│   │   ├── api/                          # All route handlers
│   │   │   ├── auth/callback/route.ts
│   │   │   ├── listings/
│   │   │   ├── bookings/
│   │   │   ├── children/
│   │   │   ├── providers/
│   │   │   ├── claim/
│   │   │   └── admin/
│   │   └── claim/[token]/page.tsx
│   ├── components/
│   │   ├── layout/Navbar.tsx + NavbarClient.tsx + Footer.tsx
│   │   ├── forms/LoginForm.tsx + RegisterForm.tsx + AuthPageWrapper.tsx
│   │   ├── ui/LanguageSwitcher.tsx + SignOutButton.tsx + [Radix wrappers]
│   │   ├── HomeContent.tsx
│   │   └── BookingModal.tsx
│   ├── lib/
│   │   ├── prisma/client.ts              # Singleton Prisma instance
│   │   ├── prisma/repositories.ts        # Query builders (profileRepo, listingRepo, etc.)
│   │   ├── prisma/getOrCreateProfile.ts  # Auth → DB profile sync
│   │   ├── supabase/client.ts            # Browser-side client
│   │   ├── supabase/server.ts            # Server + admin clients
│   │   ├── supabase/middleware.ts        # Session refresh
│   │   └── utils/cn.ts + dates.ts
│   ├── types/
│   │   ├── index.ts                      # All enums, labels, icons, color maps
│   │   └── supabase.ts                   # Auto-generated types
│   ├── styles/                           # Additional stylesheets
│   ├── __tests__/                        # Test files
│   └── middleware.ts                     # Route protection
├── prisma/
│   ├── schema.prisma
│   ├── seed.mjs                      # 17 providers + 32 listings
│   ├── fix-coords.mjs                # Coordinate correction
│   └── migrations/
├── next.config.mjs
├── tailwind.config.ts
└── .env.example
```

## Setup

```bash
npm install
cp .env.example .env.local
cp .env.local .env
npm run db:generate
npm run db:push
npm run dev
```

Open http://localhost:3000
