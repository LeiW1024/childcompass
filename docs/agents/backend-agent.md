# ChildCompass — Backend Agent Context

> Use this file when working on: API routes, auth, repositories, server-side logic.
> This agent ONLY touches: `src/app/api/**`, `src/lib/prisma/repositories.ts`, `src/lib/supabase/`, `src/middleware.ts`

---

## Project Overview

ChildCompass is a childcare marketplace for Erfurt, Germany. Parents discover and book activities for children ages 0–6. Providers publish listings. Backend is Next.js 14 API Routes + Supabase Auth + Prisma ORM.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js via Next.js API Routes |
| Auth | Supabase Auth (supabase-js + @supabase/ssr) |
| ORM | Prisma 5.16.1 |
| Database | PostgreSQL (Supabase) |
| AI Scraper | Anthropic Claude API (`/api/admin/scrape`) |
| Support Chat | n8n webhook → Google Gemini |

---

## Authentication Pattern

Every protected route must verify auth at the top:

```typescript
import { createClient } from '@/lib/supabase/server'
import { getOrCreateProfile } from '@/lib/prisma/getOrCreateProfile'

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })

  const profile = await getOrCreateProfile(user.id, user.email!, user.user_metadata)
  // use profile.id, profile.role going forward
}
```

Admin routes use HMAC token in cookie (never raw secret):
```typescript
const token = cookies().get('admin_token')?.value
// verify with crypto.timingSafeEqual against stored HMAC
```

---

## Response Shape

Every API route returns `{ data, error }`:

```typescript
// Success
return NextResponse.json({ data: payload, error: null })

// Error
return NextResponse.json({ data: null, error: 'message' }, { status: 400 })
```

Never expose `err.message` to the client. Log server-side:
```typescript
catch (err) {
  console.error('[POST /api/bookings]', err)
  return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
}
```

---

## Existing API Routes

### Public
| Route | Method | Description |
|---|---|---|
| `/api/listings` | GET | List published listings (filter: category, ageMonths, city) |
| `/api/listings/[id]` | GET | Single listing detail |
| `/api/listings/search` | GET | Search listings |

### Protected (requires Supabase auth)
| Route | Method | Description |
|---|---|---|
| `/api/bookings` | POST | Create booking request |
| `/api/bookings/[id]` | PATCH | Update booking status (confirm/decline/cancel) |
| `/api/bookings/[id]` | DELETE | Delete booking |
| `/api/children` | GET/POST | List/create children for current parent |
| `/api/children/[id]` | PATCH/DELETE | Update/delete child |
| `/api/providers` | GET/PATCH | Get/update current provider profile |
| `/api/providers/listings` | GET/POST | Provider's own listings |
| `/api/providers/listings/[id]` | PATCH/DELETE | Edit/delete listing |
| `/api/claim/[token]` | POST | Claim unclaimed provider profile |
| `/api/support/chat` | POST | Forward message to n8n webhook → Gemini |
| `/api/auth/callback` | GET | Supabase OAuth callback |

### Admin (ADMIN_SECRET_KEY required)
| Route | Method | Description |
|---|---|---|
| `/api/admin/scrape` | POST | Claude API + web_search → find providers |
| `/api/admin/geocode` | POST | Address → lat/lng via Mapbox |
| `/api/admin/import` | POST | Bulk import listings from XLSX/CSV |
| `/api/admin/listings/[id]` | PATCH/DELETE | Admin listing management |
| `/api/admin/auth` | POST | Admin login |

---

## Authorization Rules

- Every PATCH/DELETE must verify ownership before modifying:
  ```typescript
  const listing = await listingRepo.findById(id)
  if (listing.providerProfile.profileId !== profile.id) {
    return NextResponse.json({ data: null, error: 'Forbidden' }, { status: 403 })
  }
  ```
- Repositories are raw CRUD — authorization is always the route's responsibility
- Never trust client-provided IDs without checking ownership

---

## Input Validation

Use field allowlists on PATCH endpoints to prevent mass assignment:

```typescript
const ALLOWED_FIELDS = ['title', 'description', 'price', 'isPublished']
const updates: Record<string, unknown> = {}
for (const field of ALLOWED_FIELDS) {
  if (field in body) updates[field] = body[field]
}
updates.updatedAt = new Date()
await listingRepo.update(id, updates)
```

---

## Repository Usage

Import from `src/lib/prisma/repositories.ts`:

```typescript
import { listingRepo, bookingRepo, profileRepo, providerRepo } from '@/lib/prisma/repositories'
```

Never import `prisma` directly in route files when a repo method exists.

---

## Environment Variables (Backend-only)

```bash
SUPABASE_SERVICE_ROLE_KEY=   # server-only, never expose to client
DATABASE_URL=                # Prisma runtime (Transaction Pooler)
DIRECT_URL=                  # Prisma migrations only
ADMIN_SECRET_KEY=            # admin routes
ANTHROPIC_API_KEY=           # admin scraper
N8N_WEBHOOK_URL=             # support chat
```

---

## Error Logging Convention

```typescript
catch (err) {
  console.error('[GET /api/listings]', err)   // use route path as identifier
  return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
}
```

---

## When Adding a New API Route

1. Create `src/app/api/<resource>/route.ts`
2. Add auth check at top (unless public)
3. Add ownership verification for mutations
4. Use `ALLOWED_FIELDS` allowlist for PATCH
5. Return `{ data, error }` shape
6. Wrap in try-catch with `console.error`
7. Hand off to **Frontend Agent** with the endpoint path and response shape
