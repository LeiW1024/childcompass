# API Routes Rules

## Response Shape
- Always return `{ data, error }` shape
- Success: `NextResponse.json({ data: <payload>, error: null })`
- Error: `NextResponse.json({ data: null, error: "message" }, { status: <code> })`
- Never expose `err.message` to the client — use generic messages, log server-side

## Authentication
- User routes: `createClient()` → `supabase.auth.getUser()` at the top of every handler
- Admin routes: store HMAC token in cookie (never raw secret), verify with `crypto.timingSafeEqual`
- Middleware protects routes globally — API routes must still independently verify auth

## Authorization
- Every POST/PATCH/DELETE must verify the authenticated user owns the target resource
- Repositories are raw CRUD — authorization is always the route's responsibility

## Input Validation
- Use `ALLOWED_FIELDS` allowlist on every PATCH/PUT to prevent mass assignment
- Always include `updatedAt: new Date()` in update payloads
- Use `Record<string, unknown>` (not `Record<string, any>`) for dynamic field objects

## Error Logging
- Wrap every handler in try-catch
- Every catch block: `console.error("[GET /api/listings]", err)` — use route path as identifier
- Never silently swallow errors
