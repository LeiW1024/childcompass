# ChildCompass — Frontend Agent Context

> Use this file when working on: pages, components, UI, forms, maps, styling.
> This agent ONLY touches: `src/app/**/page.tsx`, `src/app/**/layout.tsx`, `src/components/**`, `src/app/globals.css`, `tailwind.config.ts`

---

## Project Overview

ChildCompass is a childcare marketplace for Erfurt, Germany. Parents discover and book activities for children ages 0–6. Frontend is Next.js 14 App Router + Tailwind CSS + Radix UI.

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js 14 (App Router) | 14.2.5 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS + CSS Variables | 3.4.1 |
| UI Components | Radix UI | @radix-ui/react-* |
| Maps | Mapbox GL JS | 2.15.0 |
| Forms | react-hook-form + Zod | 7.52.1 / 3.23.8 |
| State | Zustand | 4.5.4 |
| Icons | Lucide React | 0.408.0 |
| Charts | Recharts | 2.12.7 |
| Font | Plus Jakarta Sans (Google Fonts) | — |

---

## Server vs Client Components

**Default: Server Component.** Only add `"use client"` when you need state, effects, or browser APIs.

```typescript
// Server Component (default) — fetches data directly
export default async function ListingsPage() {
  const listings = await listingRepo.findPublished()
  return <ListingsClient listings={listings} />
}

// Client Component — handles interaction
'use client'
export function ListingsClient({ listings }) {
  const [filter, setFilter] = useState(...)
}
```

**Hybrid pattern:** Server shell fetches data → passes props to Client child.

When passing Prisma objects to Client Components:
```typescript
// Serialize to avoid "non-serializable" errors
const data = JSON.parse(JSON.stringify(prismaResult))
```

Wrap any component using `useSearchParams()` in `<Suspense>`.

---

## Design System

### Colors (defined in `globals.css` as CSS variables)
```css
--primary:   hsl(221, 83%, 53%)   /* blue — CTAs, buttons */
--accent:    hsl(38, 92%, 60%)    /* orange — highlights */
```

### Card color variants
| Name | Usage |
|---|---|
| `sky` | Blue card accent |
| `sunshine` | Orange card accent |
| `mint` | Green card accent |
| `coral` | Red card accent |
| `lavender` | Purple card accent |

### Typography
- Font: **Plus Jakarta Sans** (weights: 400, 500, 600, 700, 800)
- Applied via `font-sans` Tailwind class or `var(--font-plus-jakarta-sans)`

### Animations (defined in `tailwind.config.ts`)
- `animate-fade-up` — fade + slide up (0.5s)
- `animate-pop` — scale bounce (0.4s)
- `animate-float` — infinite gentle bounce
- `animate-slide-in` — slide from left

---

## Component Conventions

### Classnames
```typescript
import { cn } from '@/lib/utils/cn'

// Merge conditional classes safely
<div className={cn('base-classes', condition && 'conditional-class')} />
```

### Radix UI wrappers
Available in `src/components/ui/`:
- Dialog, Dropdown Menu, Select, Tabs, Toast, Avatar, Label, Slot

### Forms
```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({ email: z.string().email() })
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema)
})
```

### Maps (Mapbox)
Must load with dynamic import — Mapbox uses browser-only APIs:
```typescript
const MapComponent = dynamic(() => import('./MapInner'), { ssr: false })
```
Token: `process.env.NEXT_PUBLIC_MAPBOX_TOKEN`

---

## Multi-language (i18n)

No external library — custom context via `LanguageSwitcher.tsx`.

```typescript
import { useLang } from '@/components/ui/LanguageSwitcher'

export function MyComponent() {
  const lang = useLang()
  return <p>{lang === 'de' ? 'Hallo' : 'Hello'}</p>
}
```

Default language: German (`de`). Always provide both `de` and `en` strings.

Type-safe translation keys with `LabelKey` union type from `src/types/index.ts`.

---

## Type Helpers (`src/types/index.ts`)

```typescript
CATEGORY_LABELS['DAYCARE']          // → "Daycare"
CATEGORY_ICONS['SPORTS']            // → "⚽"
CATEGORY_COLORS['MUSIC']            // → Tailwind color class
formatAgeRange(minMonths, maxMonths) // → "6mo – 5y"
BOOKING_STATUS_LABELS['CONFIRMED']  // → "Confirmed"
```

---

## Client-Side API Calls

```typescript
const res = await fetch('/api/bookings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
})
if (!res.ok) {
  // use friendly translated message, never res.statusText
  setError(lang === 'de' ? 'Fehler beim Speichern' : 'Failed to save')
  return
}
const { data, error } = await res.json()
```

Always check `res.ok` before using response data. Never expose raw `error.message` to users.

---

## Security Rules

- **No `innerHTML`** with user content — use `textContent` or `escapeHtml()`
- **Redirect validation**: redirect URLs must start with `/` and not `//`
- **Error messages**: show user-friendly translated strings, never raw API error messages

---

## Existing Pages

### Public
| Route | File | Description |
|---|---|---|
| `/` | `app/page.tsx` | Landing page |
| `/listings` | `app/listings/page.tsx` + `ListingsClient.tsx` | Directory + map |
| `/listings/[id]` | `app/listings/[id]/page.tsx` | Detail + booking modal |
| `/auth/login` | `app/auth/login/page.tsx` | Login |
| `/auth/register` | `app/auth/register/page.tsx` | Multi-step signup |
| `/claim/[token]` | `app/claim/[token]/page.tsx` | Provider claim |

### Protected
| Route | File | Description |
|---|---|---|
| `/dashboard` | `app/dashboard/page.tsx` | Redirects by role |
| `/dashboard/parent` | `app/dashboard/parent/page.tsx` | Bookings + children tabs |
| `/dashboard/provider` | `app/dashboard/provider/page.tsx` | Listings + booking requests |

### Admin
| Route | Description |
|---|---|
| `/admin` | Admin dashboard |
| `/admin/scraper` | AI scraper tool |
| `/admin/import` | Bulk import |
| `/admin/geocode` | Geocoding tool |

---

## When Adding a New Page or Component

1. Default to Server Component unless state/effects needed
2. Use `cn()` for conditional classnames
3. Provide both `de` and `en` strings for all user-facing text
4. Wrap `useSearchParams()` in `<Suspense>`
5. Serialize Prisma data before passing to Client Components
6. Follow Tailwind design tokens — never hardcode colors or sizes
