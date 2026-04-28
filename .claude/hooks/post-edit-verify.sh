#!/usr/bin/env bash
set -euo pipefail
input=$(cat)
file=$(printf '%s' "$input" | /usr/bin/python3 -c 'import sys,json;d=json.load(sys.stdin);print(d.get("tool_input",{}).get("file_path",""))')
[ -z "$file" ] && exit 0
case "$file" in *.ts|*.tsx) ;; *) exit 0 ;; esac

repo=$(git -C "$(dirname "$file")" rev-parse --show-toplevel 2>/dev/null || pwd)
cd "$repo"
errs=""

if ! out=$(npx --no eslint "$file" 2>&1); then
  errs+=$'ESLint failed:\n'"$out"$'\n'
fi

rel="${file#"$repo/"}"
if [[ "$rel" == src/* ]]; then
  base="${rel#src/}"
  for cand in "src/__tests__/${base%.tsx}.test.tsx" "src/__tests__/${base%.ts}.test.ts"; do
    if [ -f "$cand" ]; then
      if ! out=$(npx --no jest "$cand" --silent 2>&1); then
        errs+=$'\nJest ('"$cand"$') failed:\n'"$out"$'\n'
      fi
      break
    fi
  done
fi

if [ -n "$errs" ]; then
  printf '%s\nRule: .claude/rules/typescript.md, .claude/rules/tdd.md\n' "$errs" >&2
  exit 2
fi
