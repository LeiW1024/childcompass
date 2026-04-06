# Prisma Rules

- Never use empty `update: {}` in upserts — always include `updatedAt: new Date()`
- All queries go through `lib/prisma/repositories.ts` — never import `prisma` directly in page or route files when a repo method exists
- When adding a field consumed by a page, update the relevant repo's `select`/`include` to expose it
- After any schema change: run `npm run db:generate` before anything else
- Use `db:push` for local dev, `db:migrate` for production-ready changes
