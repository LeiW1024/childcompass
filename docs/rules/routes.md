# ChildCompass — Routes Reference

## Public Routes

| Route | Description |
|---|---|
| `/` | Landing page |
| `/listings` | Directory with Mapbox map + filters |
| `/listings/[id]` | Activity detail + booking modal |
| `/auth/login` | Email login |
| `/auth/register` | Multi-step signup (role → profile → children/company → privacy → verify) |
| `/claim/[token]` | Provider claim link |

## Protected Routes

| Route | Access | Description |
|---|---|---|
| `/dashboard` | Both | Redirects to parent or provider dashboard |
| `/dashboard/parent` | PARENT | Bookings + children management |
| `/dashboard/provider` | PROVIDER | Listings + booking request management |
| `/dashboard/provider/listings/new` | PROVIDER | Create listing |
| `/dashboard/provider/listings/[id]` | PROVIDER | Edit listing |
| `/dashboard/provider/bookings` | PROVIDER | Respond to requests |

## Admin Routes (`ADMIN_SECRET_KEY` required)

| Route | Description |
|---|---|
| `/admin` | Admin dashboard |
| `/admin/listings` | All listings management |
| `/admin/import` | Bulk import (XLSX/CSV) |
| `/admin/scraper` | Anthropic-powered web scraper |
| `/admin/geocode` | Address → lat/lng via Mapbox |

## API Routes

### Public
| Route | Method | Description |
|---|---|---|
| `/api/listings` | GET | List published listings |
| `/api/listings/[id]` | GET | Single listing detail |
| `/api/listings/search` | GET | Search listings |

### Protected
| Route | Method | Description |
|---|---|---|
| `/api/bookings` | POST | Create booking request |
| `/api/bookings/[id]` | PATCH | Update booking status |
| `/api/bookings/[id]` | DELETE | Delete booking |
| `/api/children` | GET/POST | List/create children |
| `/api/children/[id]` | PATCH/DELETE | Update/delete child |
| `/api/providers` | GET/PATCH | Get/update provider profile |
| `/api/providers/listings` | GET/POST | Provider listings |
| `/api/providers/listings/[id]` | PATCH/DELETE | Edit/delete listing |
| `/api/claim/[token]` | POST | Claim unclaimed provider |
| `/api/support/chat` | POST | Forward to n8n → Gemini |
| `/api/auth/callback` | GET | Supabase OAuth callback |

### Admin
| Route | Method | Description |
|---|---|---|
| `/api/admin/scrape` | POST | Claude API + web_search |
| `/api/admin/geocode` | POST | Address → lat/lng |
| `/api/admin/import` | POST | Bulk import |
| `/api/admin/listings/[id]` | PATCH/DELETE | Admin listing management |
| `/api/admin/auth` | POST | Admin login |
