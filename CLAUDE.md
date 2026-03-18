# ChildCompass — CLAUDE.md

> Reference guide for AI-assisted development. Built with Next.js 14, Supabase, Prisma, and Mapbox.

---

## Project Overview

**ChildCompass** is a childcare and kids activity marketplace for parents in Erfurt, Germany. Children ages 0–6. Parents discover, filter, and book trusted activities. Providers publish listings and manage booking requests. Admins seed provider data via scraping tools.

Built entirely through conversational AI development with Claude using a **vertical-slice approach** — one complete feature at a time.

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

---

## Database Schema

### Models

**Profile** — all user accounts
```
id, supabaseId, email, fullName?, avatarUrl?, role (PARENT|PROVIDER|ADMIN), createdAt, updatedAt
```

**ProviderProfile** — business entities (can be unclaimed)
```
id, profileId? (null = unclaimed), businessName, description?, address?, city?, phone?, website?,
logoUrl?, isVerified, isClaimed, claimToken?, sourceUrl?, createdAt, updatedAt
```

**Child** — parent's registered children
```
id, parentId, firstName, lastName?, dateOfBirth, avatarUrl?, createdAt, updatedAt
```

**Listing** — activity or program
```
id, providerProfileId, title, description, category (enum), ageMinMonths, ageMaxMonths,
price, pricePer (SESSION|MONTH|WEEK|YEAR), address?, city?, scheduleNotes?, spotsTotal?,
imageUrl?, isPublished, isAdminSeeded, latitude?, longitude?, maxParticipants?,
datePeriods?, availableTimes?, createdAt, updatedAt
```

**Booking** — booking request + status
```
id, listingId, parentId, childId, status (REQUESTED|CONFIRMED|DECLINED|CANCELLED),
message?, respondedAt?, createdAt, updatedAt
UNIQUE: [listingId, childId]
```

### Enums
```typescript
UserRole:        PARENT | PROVIDER | ADMIN
ListingCategory: DAYCARE | PLAYGROUP | SPORTS | ARTS_CRAFTS | MUSIC |
                 LANGUAGE | SWIMMING | NATURE | EDUCATION | OTHER
PricePer:        SESSION | MONTH | WEEK | YEAR
BookingStatus:   REQUESTED | CONFIRMED | DECLINED | CANCELLED
```

---

## Environment Variables

```bash
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=<your-mapbox-token>

# Supabase
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>

# Server-only (never expose to client)
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>

# Database (Transaction pooler — use for Prisma in production)
DATABASE_URL="<your-database-url>"

# Database (Direct connection — use for migrations)
DIRECT_URL="<your-direct-database-url>"

# Optional
ANTHROPIC_API_KEY=<for-admin-scraper>
ADMIN_SECRET_KEY=<strong-password>
```

---

## Scripts

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint check
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run interactive migration
npm run db:push      # Sync schema to DB (no migration)
npm run db:studio    # Prisma Studio (localhost:5555)
npm run db:seed      # Seed 17 providers + 32 listings
```

---

## Key Patterns & Conventions

### Server vs Client Components
- **Server Components** (default): Navbar shells, page layouts, direct Prisma queries
- **Client Components** (`"use client"`): Forms, modals, maps, state, language context
- **Hybrid**: Server shell → passes data to Client children (e.g. Navbar → NavbarClient)

### Authentication
- Every protected route: `createClient()` from `lib/supabase/server.ts` → `getUser()`
- Always call `getOrCreateProfile(supabaseId, email, metadata)` to ensure DB Profile exists
- Middleware in `middleware.ts` refreshes session + protects routes
- Admin routes require `ADMIN_SECRET_KEY` cookie or header

### Prisma Upsert Rule
- **Never use empty `update: {}`** — it fails silently
- Always include at least `updatedAt: new Date()` in the update clause
- See `getOrCreateProfile.ts` for the canonical example

### Mapbox
- Must load with `next/dynamic(..., { ssr: false })` — Mapbox uses browser-only APIs
- Token: `NEXT_PUBLIC_MAPBOX_TOKEN`
- Coordinates stored as `latitude` / `longitude` on Listing model
- Admin geocode tool available at `/admin/geocode`

### Booking Uniqueness
- One booking per child per listing — enforced by DB constraint `UNIQUE([listingId, childId])`
- API returns HTTP 409 on duplicate

### Repository Pattern
- Use `lib/prisma/repositories.ts` for all queries
- Exports: `profileRepo`, `providerRepo`, `listingRepo`, `bookingRepo`
- Example: `listingRepo.findPublished({ category, ageMonths, city })`

### Type Helpers (`types/index.ts`)
- `CATEGORY_LABELS["DAYCARE"]` → `"Daycare"`
- `CATEGORY_ICONS["SPORTS"]` → `"⚽"`
- `formatAgeRange(minMonths, maxMonths)` → `"6mo – 5y"`

### Multi-language (i18n)
- No external i18n library — custom context via `LanguageSwitcher.tsx`
- Hook: `useLang()` → returns `"de"` or `"en"`
- Helper: `t(key, lang)` maps keys to German/English strings
- Default language: German (DE)

### API Route Response Pattern
```typescript
// All API routes return:
return NextResponse.json({ data, error: null })        // success
return NextResponse.json({ data: null, error: "msg" }) // error
```

---

## Routes Reference

### Public
| Route | Description |
|---|---|
| `/` | Landing page |
| `/listings` | Directory with Mapbox map + filters |
| `/listings/[id]` | Activity detail + booking modal |
| `/auth/login` | Email login |
| `/auth/register` | Multi-step signup (role → profile → children/company → privacy → verify) |
| `/claim/[token]` | Provider claim link |

### Protected
| Route | Access | Description |
|---|---|---|
| `/dashboard` | Both | Redirects to parent or provider dashboard |
| `/dashboard/parent` | PARENT | Bookings + children management |
| `/dashboard/provider` | PROVIDER | Listings + booking request management |
| `/dashboard/provider/listings/new` | PROVIDER | Create listing |
| `/dashboard/provider/listings/[id]` | PROVIDER | Edit listing |
| `/dashboard/provider/bookings` | PROVIDER | Respond to requests |

### Admin (`ADMIN_SECRET_KEY` required)
| Route | Description |
|---|---|
| `/admin` | Admin dashboard |
| `/admin/listings` | All listings management |
| `/admin/import` | Bulk import (XLSX/CSV) |
| `/admin/scraper` | Anthropic-powered web scraper |
| `/admin/geocode` | Address → lat/lng via Mapbox |

---

## Design System

### Colors
- **Primary (Blue)**: `hsl(221, 83%, 53%)` — CTAs, buttons
- **Accent (Orange)**: `hsl(38, 92%, 60%)` — highlights
- **Card variants**: sky (blue), sunshine (orange), mint (green), coral (red), lavender (purple)

### Typography
- **Font**: Plus Jakarta Sans (Google Fonts)
- **Weights**: 400, 500, 600, 700, 800

### Animations (defined in `tailwind.config.ts`)
- `fade-up` — 0.5s fade + slide up
- `pop` — 0.4s scale bounce
- `float` — infinite gentle bounce
- `slide-in` — slide from left

---

## Known Issues & Fixes

| Bug | Fix |
|---|---|
| Mapbox crashes on SSR | Load with `next/dynamic { ssr: false }` |
| Google OAuth user has no DB profile | `getOrCreateProfile()` with Prisma upsert |
| Bookings disappear after login | Never use empty `update: {}` in Prisma upsert |
| GPS uses IP location instead of real GPS | `enableHighAccuracy: true` |
| Wrong venue coordinates (45km off) | Manual validation via Google Maps / Mapbox |

---

## Seed Data

- **17 real Erfurt providers**: Kitas, sports clubs, music schools, swim schools
- **32 real activity listings**: accurate descriptions, prices, schedules, coordinates
- Run: `npm run db:seed`
- Coordinate corrections: `prisma/fix-coords.mjs` (updates live DB without re-seeding)

---

## Coding Requirements

Standards enforced across the codebase, discovered during systematic code review.

### Security
- **No mass assignment**: Every PATCH/PUT endpoint must define an `ALLOWED_FIELDS` allowlist and only copy those fields from the request body
- **Ownership verification**: Every mutating endpoint (PATCH/DELETE) must verify the authenticated user owns the target resource before modifying it
- **No error leaks**: Never expose `err.message` or stack traces to clients — log server-side with `console.error("[ROUTE]", err)`, return generic `"Internal server error"`
- **XSS prevention**: Never use `innerHTML` with user-generated content — use `textContent` or escape with `escapeHtml()`
- **Open redirect prevention**: Validate redirect URLs start with `/` and not `//`
- **Admin auth**: Store HMAC-derived token in httpOnly cookie, never the raw secret key
- **Timing-safe comparison**: Use `crypto.timingSafeEqual` for secret comparison

### API Routes
- **Response shape**: All routes return `{ data, error }` — success: `{ data: <payload>, error: null }`, error: `{ data: null, error: "message" }`
- **Error handling**: Wrap handler body in try-catch, log with route identifier, return 500 with generic message
- **Validation**: Check required fields exist, verify related resources (e.g. listing exists and is published before creating booking, child belongs to parent)
- **Authorization**: Repositories are raw CRUD — authorization is always the route handler's responsibility

### Components
- **Server-first**: Default to Server Components; only add `"use client"` for state, effects, or browser APIs
- **Suspense boundaries**: Wrap any component using `useSearchParams()` in `<Suspense>`
- **Hybrid pattern**: Server shell fetches data and passes props to client children (e.g. `Navbar` → `NavbarClient`)

### TypeScript
- **No unnecessary `any`**: Use proper types or `unknown` with narrowing
- **Type-safe translations**: Use `LabelKey` union type with `t()` function
- **Clean imports**: Remove unused imports, props, and variables

### Prisma
- **Never use empty `update: {}`** in upserts — always include `updatedAt: new Date()`
- **Repository pattern**: All queries go through `lib/prisma/repositories.ts`

---

## MVP Scope (What's NOT included)

- Payment processing (bookings are requests only, not transactions)
- Email notifications to providers
- Reviews and ratings
- Mobile app
