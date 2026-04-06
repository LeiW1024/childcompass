# TDD Rules

Follow red-green-refactor for every feature and bugfix. Write the test first — always.

## The Cycle

1. **Red** — write a failing test that describes the expected behavior
2. **Green** — write the minimum code to make the test pass
3. **Refactor** — clean up without breaking the test

Never write implementation code before a test exists for it.

## What Each Agent Tests

### DB Agent → Repository tests
File: `src/__tests__/repositories/[name].test.ts`

Test that repo methods return the correct shape and respect filters:
```typescript
it('findPublished returns only published listings', async () => {
  const listings = await listingRepo.findPublished({})
  expect(listings.every(l => l.isPublished)).toBe(true)
})
```

### Backend Agent → API route tests
File: `src/__tests__/api/[route].test.ts`

Test auth, authorization, input validation, and response shape:
```typescript
it('POST /api/bookings returns 401 without auth', async () => {
  const res = await POST(mockRequest({}))
  expect(res.status).toBe(401)
})

it('returns { data, error } shape on success', async () => {
  const res = await POST(mockRequest(validPayload))
  const body = await res.json()
  expect(body).toHaveProperty('data')
  expect(body).toHaveProperty('error')
})
```

### Frontend Agent → Component tests
File: `src/__tests__/components/[name].test.tsx`

Test rendering, user interactions, and conditional display:
```typescript
it('renders booking button when listing is published', () => {
  render(<ListingCard listing={mockListing} />)
  expect(screen.getByRole('button', { name: /book/i })).toBeInTheDocument()
})
```

## Rules

- One test file per module — mirrors the source file path under `src/__tests__/`
- Test behavior, not implementation — assert on outputs and side effects, not internal calls
- Mock external services (Supabase, Prisma, n8n) — never hit real APIs in tests
- Each test must be independent — no shared state between tests
- Run `npm run test` before marking any task complete

## Commands

```bash
npm run test           # run all tests
npm run test -- --watch          # watch mode
npm run test -- src/__tests__/api # run specific folder
```
