#!/usr/bin/env bash
set -euo pipefail
input=$(cat)
active=$(printf '%s' "$input" | /usr/bin/python3 -c 'import sys,json;print(json.load(sys.stdin).get("stop_hook_active",False))')
if [ "$active" = "True" ]; then
  exit 0
fi

cd "$(dirname "$0")/../.."

errs=""
if ! out=$(npm run lint --silent 2>&1); then errs+=$'lint failed:\n'"$out"$'\n'; fi
if ! out=$(npm run test --silent 2>&1); then errs+=$'\ntests failed:\n'"$out"$'\n'; fi

if [ -n "$errs" ]; then
  printf 'Stop blocked — fix before completing:\n%s\nRule: .claude/rules/tdd.md\n' "$errs" >&2
  exit 2
fi
