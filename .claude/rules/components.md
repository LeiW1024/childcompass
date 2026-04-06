# Component Rules

## Server vs Client
- Default to Server Components — add `"use client"` only for state, effects, or browser APIs
- Hybrid pattern: server shell fetches data → passes props to client child
- Wrap any component using `useSearchParams()` in `<Suspense>`
- Serialize Prisma objects before passing to client: `JSON.parse(JSON.stringify(...))`

## Client-Side API Calls
- Always check `res.ok` before using response data
- Show user-friendly translated error messages — never raw `err.message` or API error strings
- Use `catch (err)` or `catch {}` — never `catch (err: any)`

## Security
- Never use `innerHTML` with user content — use `textContent` or `escapeHtml()`
- Validate redirect URLs: must start with `/` and not `//` (open redirect prevention)
- Applies to both server-side callbacks and client-side `router.push()` with query params
