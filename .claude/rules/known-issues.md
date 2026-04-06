# ChildCompass — Known Issues & Fixes

| Bug | Fix |
|---|---|
| Mapbox crashes on SSR | Load with `next/dynamic({ ssr: false })` |
| Google OAuth user has no DB profile | Call `getOrCreateProfile()` with Prisma upsert after login |
| Bookings disappear after login | Never use empty `update: {}` in Prisma upsert — always include `updatedAt: new Date()` |
| GPS uses IP location instead of real GPS | Pass `enableHighAccuracy: true` to `navigator.geolocation` |
| Wrong venue coordinates (45km off) | Manual validation via Google Maps / Mapbox before seeding |
| Admin pages 404 at build time | Add `export const dynamic = "force-dynamic"` to all admin pages |
| Resend throws at build time | Wrap `new Resend()` in a `getResend()` factory — never instantiate at module level |
| GPS denial error blocks map view | Error auto-dismisses after 3s; map still shows all listing pins |

## MVP Scope — Included

| Feature | Status |
|---|---|
| Activity discovery + map | ✅ Live |
| Booking request flow | ✅ Live |
| Provider dashboard (listings + bookings) | ✅ Live |
| Parent dashboard (booking status + delete) | ✅ Live |
| Provider onboarding wizard | ✅ Live |
| Email notifications (Resend) | ✅ Live |
| Provider listing create / edit / publish | ✅ Live |
| Auto-geocoding on publish | ✅ Live |
| Provider claim flow | ✅ Live |
| Admin scraper + importer | ✅ Live |

## MVP Scope — Not Included

| Feature | Reason |
|---|---|
| Payment processing | Bookings are requests only, not transactions |
| Reviews & ratings | Post-MVP |
| Mobile app | Web-only; responsive design covers mobile |
| Analytics dashboard | Post-MVP |
| Logo / image uploads | Requires Supabase Storage setup — post-MVP |
| Custom email domain | Using Resend sandbox sender — upgrade when domain is ready |
