# ChildCompass — Office Hours & CEO Review Session
**Date:** 2026-03-23
**Branch:** main
**Mode:** Startup / Pre-product

---

## Project Context

ChildCompass is a childcare and kids activity marketplace for parents in Erfurt, Germany (ages 0-6). Built with Next.js 14, Supabase, Prisma, and Mapbox. Solo developer building with AI assistance.

**Current state:** Feature-complete MVP deployed on Vercel with 17 real Erfurt providers and 32 listings seeded. Core flows working: discovery, filtering, map view, booking requests, provider/parent dashboards, admin tools.

---

## Founder Profile

- **Goal:** Building a startup
- **Stage:** Pre-product (idea stage, no real users yet)
- **Demand evidence:** Personal pain — spends 5+ hours/month finding kids' activities in Erfurt. Has talked to other parents who report the same pain.
- **Domain expertise:** Parent in Erfurt, knows the local childcare landscape from the inside.

---

## Key Diagnostic Findings

### Q1: Demand Reality
- Significant personal time investment (5+ hrs/mo) searching for activities
- Validated with other Erfurt parents — not just a solo pain point
- Real behavior, not hypothetical interest

### Q2: Status Quo (the real competitor)
Parents currently solve this through 3 fragmented channels:
1. **Google + individual websites** — provider by provider, often outdated, German-only
2. **Facebook/WhatsApp groups** — "anyone know a good swim class?" and wait
3. **Word of mouth** — playground conversations

Cost: 5+ hours/month. No single source of truth. Information scattered and mostly in German.

### Q3: Target User
**Primary:** Expat/newcomer working parent in Erfurt with a child aged 0-6.
- Just moved to the city, no social network
- Can't navigate German-only provider websites
- No time to research — working full-time
- Highest pain + tightest community for word-of-mouth

---

## Landscape Research

- 94 childcare discovery startups globally, most focused on **daycare/Kita placement**, not enrichment activities
- Germany's childcare market: $12.5B, demand exceeds supply across all age groups
- Municipal Kita-Planer systems handle daycare spots but **completely ignore enrichment activities**
- Key insight: **Nobody owns the "what should my kid do on Tuesday afternoon?" problem in German cities**
- #1 marketplace failure mode: chicken-and-egg (no supply = no demand)
- #2 failure mode: lack of focus (too many verticals)

---

## Agreed Premises

1. Parents in Erfurt spend 5+ hrs/mo discovering kids' activities due to fragmented information
2. Expat/newcomer working parents are the most underserved segment (no network + language barrier)
3. A centralized, bilingual (DE/EN) directory with map-based discovery can replace the status quo
4. Activity discovery is meaningfully different from Kita placement — no one owns this space
5. Erfurt (215K pop) is viable: small enough to seed manually, large enough to prove the model

---

## Approaches Considered

### A: Go-to-Market First (Minimal Viable)
- SEO, analytics, shareable links. Focus on 50 signups with existing features.
- Effort: S | Risk: Low
- Pro: Tests demand fast. Con: No differentiation.

### B: Notification + Trust Loop (Ideal Architecture)
- Email notifications, verification badges, reviews/ratings.
- Effort: M | Risk: Medium
- Pro: Solves provider engagement. Con: Building before proving demand.

### C: Expat-First Wedge (Creative/Lateral)
- Curated activity bundles, English-first content, community links.
- Effort: M | Risk: Medium
- Pro: Sharply differentiated. Con: Narrows market initially.
- **Deferred, not rejected** — elements folded into recommended approach.

---

## Chosen Approach: D — Findable + Functional Marketplace (Combined A + B)

### Track 1 — Go-to-Market (make it findable)
- SEO-optimized listing pages (DE + EN search terms)
- Shareable provider profiles with Open Graph meta tags
- Plausible analytics integration
- Landing page optimized for local search, mobile-first

### Track 2 — Trust Loop (make it work)
- Email notifications to providers on new bookings (via Resend)
- Email notifications to parents on booking status changes
- Provider verification badges (admin-managed)
- In-app fallback for providers without email

### Phase 2 (after 50 signups + 5 active providers)
- Parent reviews & ratings
- Curated expat activity guides
- Custom analytics dashboard

### Data Model Additions
- `NotificationLog` table (type, recipient, booking, status)
- `ProviderProfile.notificationEmail` field
- `Listing.viewCount` field

### Effort Estimate
- Engineering: M (human: ~2 weeks / CC: ~1.5 hours)
- Go-to-market (manual): ~2 weeks (provider outreach, community posting)
- Total: ~4 weeks calendar time

---

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Email service | Resend | Best Next.js DX, free tier covers early stage |
| Analytics | Plausible | Privacy-friendly, no cookie banner (GDPR), lightweight |
| SEO rendering | SSR with meta tags | ISR premature for 32 listings |
| Reviews | Deferred to Phase 2 | Need active users first |
| Custom analytics dashboard | Deferred to Phase 2 | Plausible sufficient for now |

---

## Success Criteria

1. 50 parent signups within 3 months (via manual outreach, NOT SEO)
2. 5+ providers actively responding to bookings
3. Organic search traffic appearing (long-term indicator)
4. Provider response rate > 50% within 72 hours

---

## The Assignment (before building)

**Contact 5 of the 17 seeded providers in person or by phone.** Show them ChildCompass. Ask:
- "If a parent booked through this, would you respond?"
- "What would make you check this regularly?"

Their answers determine whether email notifications are the right feature.

---

## Open Items for Implementation

1. Resend domain verification (which domain?)
2. Email notification retry policy (3 retries, exponential backoff)
3. Booking rate limiting (max 10 requests/hr per parent)
4. GDPR: privacy policy page, data deletion process, NotificationLog retention (90 days)
5. Email template i18n (separate `translations/emails.json` file)
6. Email respond links require authentication (no unauthenticated state changes)

---

## Design Doc Location

`~/.gstack/projects/LeiW1024-childcompass/macbookpro-main-design-20260323-152537.md`

Status: APPROVED (survived 2 rounds of adversarial review, quality score 7/10)
