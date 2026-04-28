#!/usr/bin/env bash
set -euo pipefail
branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "?")
case "$branch" in
  db) echo "Active agent: DB. Owns: prisma/, src/lib/prisma/, src/types/. Rules: .claude/rules/prisma.md, tdd.md." ;;
  backend) echo "Active agent: Backend. Owns: src/app/api/, src/lib/, src/middleware.ts. Rules: .claude/rules/api-routes.md, project-quality.md, typescript.md, tdd.md." ;;
  frontend) echo "Active agent: Frontend. Owns: src/app/ (excl api), src/components/, src/styles/. Rules: .claude/rules/components.md, design-system.md, tdd.md." ;;
  *) echo "Branch '$branch' — no agent ownership boundary enforced." ;;
esac
