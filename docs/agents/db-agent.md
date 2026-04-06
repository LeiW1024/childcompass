# ChildCompass — DB Agent Context

> Use this file when working on: schema changes, migrations, seed scripts, Prisma queries.
> This agent ONLY touches: `prisma/schema.prisma`, `prisma/migrations/`, `prisma/seed.mjs`, `src/lib/prisma/repositories.ts`, `src/lib/prisma/client.ts`

---

## Project Overview

ChildCompass is a childcare marketplace for Erfurt, Germany. Parents discover and book activities for children ages 0–6. Providers publish listings.

---

## Database: PostgreSQL via Supabase

- ORM: Prisma 5.16.1
- Connection pooling: PgBouncer (Transaction Pooler) — use `DATABASE_URL` for Prisma runtime
- Direct connection: use `DIRECT_URL` for migrations only

```bash
npm run db:generate   # Regenerate Prisma client after schema change
npm run db:push       # Sync schema to DB (no migration file, use for dev)
npm run db:migrate    # Create and run migration (use for production changes)
npm run db:studio     # Prisma Studio at localhost:5555
npm run db:seed       # Seed 17 providers + 32 listings
```

---

## Schema: Current Models

### Profile
```prisma
model Profile {
  id          String          @id @default(uuid())
  supabaseId  String          @unique
  email       String          @unique
  fullName    String?
  avatarUrl   String?
  role        UserRole        @default(PARENT)
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
  children    Child[]
  bookings    Booking[]
  provider    ProviderProfile?
}
```

### ProviderProfile
```prisma
model ProviderProfile {
  id            String    @id @default(uuid())
  profileId     String?   @unique   // null = unclaimed
  businessName  String
  description   String?
  address       String?
  city          String?
  phone         String?
  website       String?
  logoUrl       String?
  isVerified    Boolean   @default(false)
  isClaimed     Boolean   @default(false)
  claimToken    String?   @unique
  sourceUrl     String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  profile       Profile?  @relation(fields: [profileId], references: [id])
  listings      Listing[]
}
```

### Child
```prisma
model Child {
  id          String    @id @default(uuid())
  parentId    String
  firstName   String
  lastName    String?
  dateOfBirth DateTime
  avatarUrl   String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  parent      Profile   @relation(fields: [parentId], references: [id])
  bookings    Booking[]
}
```

### Listing
```prisma
model Listing {
  id                String          @id @default(uuid())
  providerProfileId String
  title             String
  description       String
  descriptionDe     String?
  category          ListingCategory
  ageMinMonths      Int
  ageMaxMonths      Int
  price             Float
  pricePer          PricePer
  address           String?
  city              String?
  scheduleNotes     String?
  spotsTotal        Int?
  imageUrl          String?
  isPublished       Boolean         @default(false)
  isAdminSeeded     Boolean         @default(false)
  latitude          Float?
  longitude         Float?
  maxParticipants   Int?
  datePeriods       String?
  availableTimes    String?
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  providerProfile   ProviderProfile @relation(fields: [providerProfileId], references: [id])
  bookings          Booking[]
  @@index([category])
  @@index([isPublished])
  @@index([ageMinMonths, ageMaxMonths])
}
```

### Booking
```prisma
model Booking {
  id          String        @id @default(uuid())
  listingId   String
  parentId    String
  childId     String
  status      BookingStatus @default(REQUESTED)
  message     String?
  respondedAt DateTime?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  listing     Listing       @relation(fields: [listingId], references: [id])
  parent      Profile       @relation(fields: [parentId], references: [id])
  child       Child         @relation(fields: [childId], references: [id])
  @@unique([listingId, childId])
  @@index([parentId, status])
  @@index([listingId, status])
}
```

---

## Enums

```prisma
enum UserRole        { PARENT PROVIDER ADMIN }
enum ListingCategory { DAYCARE PLAYGROUP SPORTS ARTS_CRAFTS MUSIC LANGUAGE SWIMMING NATURE EDUCATION OTHER }
enum PricePer        { SESSION MONTH WEEK YEAR }
enum BookingStatus   { REQUESTED CONFIRMED DECLINED CANCELLED }
```

---

## Repository Pattern

All queries live in `src/lib/prisma/repositories.ts`. Never query Prisma directly in API routes or pages when a repo method exists.

```typescript
// Example repo methods available:
profileRepo.findBySupabaseId(supabaseId)
profileRepo.upsert({ supabaseId, email, fullName, role })

listingRepo.findPublished({ category?, ageMonths?, city? })
listingRepo.findById(id)
listingRepo.create(data)
listingRepo.update(id, data)

bookingRepo.findByParent(parentId)
bookingRepo.findByListing(listingId)
bookingRepo.create(data)
bookingRepo.updateStatus(id, status)

providerRepo.findById(id)
providerRepo.findByProfileId(profileId)
providerRepo.upsert(data)
```

When adding a new model field that pages consume, update the repo's `select`/`include` to expose it.

---

## Critical Rules

- **Never use empty `update: {}`** in Prisma upserts — always include `updatedAt: new Date()`
- **Never import `prisma` directly** in page or route files — use `repositories.ts`
- After any schema change: run `npm run db:generate` before anything else
- Use `db:push` for local dev, `db:migrate` for production-ready changes
- Indexes: add `@@index` for any field used in WHERE clauses or ORDER BY
- `UNIQUE([listingId, childId])` on Booking — one booking per child per listing, enforced at DB level

---

## When Adding a New Model

1. Add model to `prisma/schema.prisma`
2. Add required enums if needed
3. Run `npm run db:generate && npm run db:push`
4. Add repo methods to `src/lib/prisma/repositories.ts`
5. Hand off to **Backend Agent** with the new model name and repo method signatures
