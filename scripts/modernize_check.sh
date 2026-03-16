#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="/home/auri/.openclaw/workspace/AuriBot-modern"
LOG_DIR="/home/auri/.openclaw/workspace/memory/modernize-logs"
TS="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
LOG_FILE="$LOG_DIR/$TS.log"

mkdir -p "$LOG_DIR"

{
  echo "[$TS] AuriBot-modern scheduled check"
  echo "repo: $REPO_DIR"
  echo

  cd "$REPO_DIR"

  echo "== frontend: npm ci + lint + build =="
  cd "$REPO_DIR/frontend"
  if command -v npm >/dev/null 2>&1; then
    npm ci
    npm run lint
    npm run build
  else
    echo "SKIP: npm not found"
  fi
  echo

  echo "== backend: gradle build =="
  cd "$REPO_DIR/backend"
  if command -v java >/dev/null 2>&1; then
    ./gradlew build
  else
    echo "SKIP: java not found"
  fi
  echo

  echo "DONE"
} |& tee "$LOG_FILE"
