#!/bin/bash
set -e

echo "[post-merge] Installing dependencies…"
npm install --no-audit --no-fund

echo "[post-merge] Pushing database schema…"
npm run db:push -- --force

echo "[post-merge] Done."
