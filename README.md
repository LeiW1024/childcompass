# ChildCompass

> Discover trusted childcare activities for your child — ages 0 to 6.

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

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Auth + Storage | Supabase |
| ORM | Prisma 5 |
| Database | PostgreSQL (via Supabase) |
| Styling | Tailwind CSS + CSS variables |

## Project Structure

```
app/
├── page.tsx                        # Landing page
├── listings/
│   ├── page.tsx                    # Searchable directory (filter by age + category)
│   └── [id]/page.tsx               # Listing detail + booking CTA
├── dashboard/
│   ├── page.tsx                    # Smart redirect → parent or provider
│   ├── parent/page.tsx             # Parent: booking overview
│   └── provider/
│       ├── page.tsx                # Provider: listings + pending requests
│       ├── listings/               # CRUD for listings
│       └── bookings/               # Respond to booking requests
├── auth/
│   ├── login/                      # Email + Google login
│   └── register/                   # Role selector + signup
├── api/
│   ├── listings/                   # GET (public) / POST / PATCH / DELETE
│   └── bookings/                   # POST (create) / PATCH (update status)
prisma/
└── schema.prisma                   # Profile · ProviderProfile · Child · Listing · Booking
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
