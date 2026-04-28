# ChildCompass — Claude Code Hooks

Harness-level enforcement of the rules in `CLAUDE.md` and `.claude/rules/*.md`. Configured in `.claude/settings.json`. Scripts live in `.claude/hooks/`.

## Summary

| Hook event | Script | What it does | Blocks? |
|---|---|---|---|
| `SessionStart` | `branch-info.sh` | Prints the active agent scope based on git branch | No (informational) |
| `PreToolUse` (Edit/Write/MultiEdit) | `branch-guard.sh` | Rejects edits outside the branch's allowed paths | Yes |
| `PostToolUse` (Edit/Write/MultiEdit) | `post-edit-verify.sh` | Runs `eslint` on the changed file + matching jest test | Yes |
| `Stop` | `stop-verify.sh` | Runs `npm run lint` + `npm run test` before turn ends | Yes |

All blocking hooks exit 2 with a stderr message naming the rule and the rule file path.

## `branch-info.sh` — SessionStart

Reads `git rev-parse --abbrev-ref HEAD` and prints the matching agent scope into the session's startup context:

| Branch | Scope printed |
|---|---|
| `db` | DB Agent — owns `prisma/`, `src/lib/prisma/`, `src/types/`. Rules: `prisma.md`, `tdd.md` |
| `backend` | Backend Agent — owns `src/app/api/`, `src/lib/`, `src/middleware.ts`. Rules: `api-routes.md`, `project-quality.md`, `typescript.md`, `tdd.md` |
| `frontend` | Frontend Agent — owns `src/app/` (excl. api), `src/components/`, `src/styles/`. Rules: `components.md`, `design-system.md`, `tdd.md` |
| anything else | "no agent ownership boundary enforced" |

## `branch-guard.sh` — PreToolUse on Edit / Write / MultiEdit

Rejects file edits outside the active branch's ownership boundary. `.claude/**` is always allowed (so hooks and rules can be tweaked from any branch). Branches not in the table below impose no restriction.

| Branch | Allowed paths |
|---|---|
| `db` | `prisma/**`, `src/lib/prisma/**`, `src/types/**`, `.claude/**` |
| `backend` | `src/app/api/**`, `src/lib/**`, `src/middleware.ts`, `.claude/**` |
| `frontend` | `src/app/**` *except* `src/app/api/**`, `src/components/**`, `src/styles/**`, `tailwind.config.ts`, `src/app/globals.css`, `.claude/**` |

Block message names the offending path, the allowed paths, and points at `CLAUDE.md` "3 sub-agent architecture".

## `post-edit-verify.sh` — PostToolUse on Edit / Write / MultiEdit

Runs after any successful edit. Skips non-`.ts` / `.tsx` files silently.

1. **ESLint scoped to the changed file**: `npx eslint <file>`
2. **Matching jest test**: if `src/__tests__/<mirrored-path>.test.{ts,tsx}` exists, run `npx jest <test> --silent`. Mirrored path = source path with `src/` stripped, dropped under `src/__tests__/`. If no test file exists, this step is skipped.

Project-wide `tsc --noEmit` is intentionally **not** run here (5–15 s per edit). The `Stop` hook catches type errors via `npm run lint`.

Block message references `typescript.md` and `tdd.md`.

## `stop-verify.sh` — Stop

Runs before the assistant ends a turn:

1. `npm run lint --silent`
2. `npm run test --silent`

Either failing exits 2 with the failure output. Includes a `stop_hook_active` recursion guard — if the hook fires again on the next stop attempt, it exits 0 to avoid infinite loops.

Block message references `tdd.md` ("Run `npm run test` before marking any task complete").

## Settings file

`.claude/settings.json` (committed) contains the hook registrations. `.claude/settings.local.json` (gitignored) is unchanged and continues to hold per-machine permissions.

```json
{
  "hooks": {
    "SessionStart": [{ "hooks": [{ "type": "command", "command": ".claude/hooks/branch-info.sh" }] }],
    "PreToolUse":   [{ "matcher": "Edit|Write|MultiEdit", "hooks": [{ "type": "command", "command": ".claude/hooks/branch-guard.sh" }] }],
    "PostToolUse":  [{ "matcher": "Edit|Write|MultiEdit", "hooks": [{ "type": "command", "command": ".claude/hooks/post-edit-verify.sh" }] }],
    "Stop":         [{ "hooks": [{ "type": "command", "command": ".claude/hooks/stop-verify.sh" }] }]
  }
}
```

## Dependencies

- `bash`, `git`, `npm`, `npx` — always present in the dev environment
- `/usr/bin/python3` — Apple-stock Python used to parse hook stdin JSON (avoids a `jq` install requirement)

## Activation

Hooks load at session start. After editing `.claude/settings.json` or any script under `.claude/hooks/`, **restart Claude Code** from inside the project for changes to take effect. New hook scripts must also be `chmod +x`.

## Disabling temporarily

- Single hook: remove its block from `.claude/settings.json` and restart.
- All hooks for a session: rename `.claude/settings.json` aside (e.g. `settings.json.off`) and restart.
- Bypass the `Stop` gate intentionally: complete all required work — there is no opt-out flag, by design.
