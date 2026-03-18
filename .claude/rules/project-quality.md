# Project Quality Rules

## API Routes

### Response Shape
- Always return `{ data, error }` response shape
- Success: `NextResponse.json({ data: <payload>, error: null })`
- Error: `NextResponse.json({ data: null, error: "message" }, { status: <code> })`
- Never leak internal error messages (e.g. `err.message`) to the client — use generic messages and `console.error` for server-side logging

### Authorization
- Every mutating endpoint (POST/PATCH/DELETE) must verify ownership before modifying data
- Pattern: look up the authenticated user's profile, then confirm the target resource belongs to them
- Repositories expose raw CRUD — authorization is the API route's responsibility, never the repository's

### Input Validation
- Use field allowlists on PATCH/PUT endpoints to prevent mass assignment
- Pattern: define `ALLOWED_FIELDS` array, iterate and pick only those from the request body
- Always set `updatedAt: new Date()` in update payloads

### Authentication
- Admin routes: store HMAC token in cookie (never raw secret), verify with constant-time comparison
- User routes: call `createClient()` → `supabase.auth.getUser()` at the top of every handler
- Middleware handles route protection; API routes must still independently verify auth

## Components

### Server vs Client
- Default to Server Components; add `"use client"` only when needed (state, effects, browser APIs)
- Hybrid pattern: server shell fetches data → passes props to client child
- Wrap components using `useSearchParams()` in `<Suspense>` boundaries

### Security
- Never use `innerHTML` with user content — prefer `textContent` or escape with a dedicated `escapeHtml()` function
- Validate redirect URLs: must start with `/` and not `//` (open redirect prevention)

## TypeScript
- Avoid `any` — use proper types or `unknown` with narrowing
- Translation keys should use union types (e.g. `LabelKey`) for compile-time safety
- Remove unused props, variables, and imports

## Error Handling
- Server components calling external services (Supabase, Prisma) should wrap calls in try-catch to gracefully degrade
- API routes: wrap handler body in try-catch, log with `console.error("[ROUTE]", err)`, return generic error response
