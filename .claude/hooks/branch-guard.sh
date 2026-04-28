#!/usr/bin/env bash
set -euo pipefail
input=$(cat)
file=$(printf '%s' "$input" | /usr/bin/python3 -c 'import sys,json;d=json.load(sys.stdin);print(d.get("tool_input",{}).get("file_path",""))')
[ -z "$file" ] && exit 0

repo=$(git -C "$(dirname "$file")" rev-parse --show-toplevel 2>/dev/null || exit 0)
branch=$(git -C "$repo" rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")
rel="${file#"$repo/"}"

allow() { exit 0; }
deny() {
  printf 'Branch "%s" cannot edit %s.\nAllowed paths: %s\nRule: CLAUDE.md "3 sub-agent architecture"\n' "$branch" "$rel" "$1" >&2
  exit 2
}

case "$rel" in .claude/*) allow ;; esac

case "$branch" in
  db)
    case "$rel" in
      prisma/*|src/lib/prisma/*|src/types/*) allow ;;
      *) deny "prisma/, src/lib/prisma/, src/types/, .claude/" ;;
    esac
    ;;
  backend)
    case "$rel" in
      src/app/api/*|src/lib/*|src/middleware.ts) allow ;;
      *) deny "src/app/api/, src/lib/, src/middleware.ts, .claude/" ;;
    esac
    ;;
  frontend)
    case "$rel" in
      src/app/api/*) deny "src/app/ (excl api), src/components/, src/styles/, tailwind.config.ts, src/app/globals.css, .claude/" ;;
      src/app/*|src/components/*|src/styles/*|tailwind.config.ts|src/app/globals.css) allow ;;
      *) deny "src/app/ (excl api), src/components/, src/styles/, tailwind.config.ts, src/app/globals.css, .claude/" ;;
    esac
    ;;
  *) allow ;;
esac
