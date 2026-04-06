# ChildCompass — Known Issues & Fixes

| Bug | Fix |
|---|---|
| Mapbox crashes on SSR | Load with `next/dynamic({ ssr: false })` |
| Google OAuth user has no DB profile | Call `getOrCreateProfile()` with Prisma upsert after login |
| Bookings disappear after login | Never use empty `update: {}` in Prisma upsert — always include `updatedAt: new Date()` |
| GPS uses IP location instead of real GPS | Pass `enableHighAccuracy: true` to `navigator.geolocation` |
| Wrong venue coordinates (45km off) | Manual validation via Google Maps / Mapbox before seeding |

## MVP Scope — Not Included

| Feature | Reason |
|---|---|
| Payment processing | Bookings are requests only, not transactions |
| Email notifications | Requires email provider (Resend / Sendgrid) |
| Reviews & ratings | Post-MVP |
| Mobile app | Web-only; responsive design covers mobile |
| Onboarding wizard | Placeholder — not yet built |
| Analytics dashboard | Placeholder — not yet built |
