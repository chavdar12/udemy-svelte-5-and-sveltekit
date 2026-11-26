#!/usr/bin/env bash
# CI for this repo, run from its root by .github/workflows/ci.yml:
#   bash ci.sh build node
#   bash ci.sh format prettier
# Optional env (set in the workflow): SETUP
set -uo pipefail
mode=$1; shift
TMP=${RUNNER_TEMP:-$(mktemp -d)}
group() { [ -n "${GITHUB_ACTIONS:-}" ] && echo "::group::$1" || echo "== $1"; }
endgroup() { [ -n "${GITHUB_ACTIONS:-}" ] && echo "::endgroup::" || true; }
fail() { echo "${GITHUB_ACTIONS:+::error::}$1 failed"; status=1; }
# top-most folders holding one of the given marker files (nested ones are built by their parent)
tops() { find . \( -name node_modules -o -name build -o -name .git -o -name .venv \) -prune -o \( "$@" \) -print \
  | xargs -n1 dirname | sort -u | awk '{ for (i in top) if (index($0 "/", top[i] "/") == 1) next; top[NR] = $0; print }'; }
status=0

if [ -n "${SETUP:-}" ] && [ "$mode" = build ]; then RUNNER_TEMP=$TMP bash -ec "$SETUP" || exit 1; fi

for kind in "$@"; do case "$mode:$kind" in
build:node)
  has() { node -e "process.exit(require('./package.json').scripts?.['$1'] ? 0 : 1)"; }
  for dir in $(tops -name package.json); do
    group "$dir"
    (
      set -e; cd "$dir"
      if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; else npm install --no-audit --no-fund; fi
      find . -mindepth 2 -maxdepth 2 -name package.json -not -path "*/node_modules/*" -execdir npm install --no-audit --no-fund \;
      for s in lint typecheck check; do if has $s; then npm run $s; fi; done
      # Playwright end-to-end tests need their app running; skipped here as in the shared CI
      if has test && ! node -e "process.exit(/^\\s*(npx )?playwright/.test(require('./package.json').scripts.test) ? 0 : 1)"; then
        if node -e "process.exit(/\bng test\b/.test(require('./package.json').scripts.test) ? 0 : 1)"; then CI=true npm test -- --watch=false; else CI=true npm test; fi
      fi
      if has build; then npm run build; fi
    ) || fail "$dir"
    endgroup
  done ;;
format:prettier) npx --yes prettier@3.9.10 --check . || fail prettier ;;
*) echo "unknown $mode kind: $kind" >&2; exit 2 ;;
esac; done
exit $status
