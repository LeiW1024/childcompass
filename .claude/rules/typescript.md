# TypeScript Rules

- No `any` — use proper types, `unknown` with narrowing, or `Record<string, string>` for index access
- `as unknown as TargetType` only as last resort — never bare `as any`
- Catch blocks: `catch (err)` or `catch {}` — never `catch (err: any)`
- Check error properties with `instanceof` or `in` operator
- Cast API query params to their Prisma enum type (e.g. `as ListingCategory`), not `as any`
- Translation keys: use `LabelKey` union type with `t()` for compile-time safety
- Remove unused imports, props, and variables
