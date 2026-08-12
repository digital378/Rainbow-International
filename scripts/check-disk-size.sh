#!/usr/bin/env bash
# check-disk-size.sh
# Reports total workspace disk usage and warns when it approaches the 8 GiB
# Replit publishing hard limit.  Run before publishing to catch bloat early.
#
# Usage:  npm run disk:check
#         bash scripts/check-disk-size.sh

WARN_GIB=6          # warn threshold in GiB
LIMIT_GIB=8         # hard publish limit in GiB
WARN_BYTES=$(( WARN_GIB * 1024 * 1024 * 1024 ))

WORKSPACE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo ""
echo "=== Workspace Disk Usage Check ==="
echo "Root: $WORKSPACE_ROOT"
echo ""

# Top-10 largest directories (excluding .git internals for readability)
echo "--- Top 10 largest directories ---"
du -sh "$WORKSPACE_ROOT"/*/  2>/dev/null \
  | sort -rh \
  | head -10
echo ""

# Also show attached_assets explicitly if it exists
if [ -d "$WORKSPACE_ROOT/attached_assets" ]; then
  ASSETS_SIZE=$(du -sh "$WORKSPACE_ROOT/attached_assets" 2>/dev/null | cut -f1)
  echo "attached_assets/ size: $ASSETS_SIZE"
  echo ""
fi

# Total size (excluding .git to match what the image builder sees roughly)
TOTAL_BYTES=$(du -sb --exclude='.git' "$WORKSPACE_ROOT" 2>/dev/null | tail -1 | awk '{print $1}')

if [ -z "$TOTAL_BYTES" ]; then
  # fallback: du without --exclude (busybox / macOS)
  TOTAL_BYTES=$(du -sk "$WORKSPACE_ROOT" 2>/dev/null | awk '{print $1 * 1024}')
fi

TOTAL_GIB=$(awk "BEGIN { printf \"%.2f\", $TOTAL_BYTES / (1024*1024*1024) }")
echo "--- Total workspace size (excl. .git): ${TOTAL_GIB} GiB ---"
echo ""

if [ "$TOTAL_BYTES" -ge "$WARN_BYTES" ] 2>/dev/null; then
  echo "⚠️  WARNING: workspace is ${TOTAL_GIB} GiB — approaching the ${LIMIT_GIB} GiB publish limit."
  echo ""
  echo "   Before publishing, move large binary files to Replit Object Storage"
  echo "   (see 'Large file uploads' section in replit.md) and delete them from"
  echo "   attached_assets/ to bring the workspace below ${WARN_GIB} GiB."
  echo ""
  exit 1
else
  echo "✅  OK: workspace is ${TOTAL_GIB} GiB — under the ${WARN_GIB} GiB warning threshold."
  echo ""
  exit 0
fi
