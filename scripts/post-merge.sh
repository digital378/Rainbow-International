#!/bin/bash
set -e

# The post-merge environment does not reliably put node/npm on PATH, which
# fails the script with "npm: command not found". Resolve a usable Node
# toolchain before doing anything else.
#
# Version matters: Node 20.11 ships a crypto module that breaks the Vite build
# with "crypto.hash is not a function", so prefer >= 20.12 and never fall back
# to an arbitrary interpreter from the Nix store.
ensure_node_on_path() {
  if command -v npm >/dev/null 2>&1 && command -v node >/dev/null 2>&1; then
    return 0
  fi

  # Prefer the interpreter the running app is already using, if any.
  local running
  running="$(pgrep -f 'node .*tsx|tsx server' 2>/dev/null | head -1)"
  if [ -n "$running" ]; then
    local exe_dir
    exe_dir="$(dirname "$(readlink -f "/proc/$running/exe" 2>/dev/null)" 2>/dev/null)"
    if [ -n "$exe_dir" ] && [ -x "$exe_dir/npm" ]; then
      PATH="$exe_dir:$PATH"
      export PATH
      return 0
    fi
  fi

  # Otherwise pick the newest Node >= 20.12 that ships npm.
  local best_dir="" best_ver=0 dir ver major minor num
  for dir in /nix/store/*-nodejs-2[0-9]*/bin; do
    [ -x "$dir/node" ] && [ -x "$dir/npm" ] || continue
    ver="$("$dir/node" -v 2>/dev/null)" || continue
    ver="${ver#v}"
    major="${ver%%.*}"
    minor="${ver#*.}"; minor="${minor%%.*}"
    [ -n "$major" ] && [ -n "$minor" ] || continue
    num=$((major * 1000 + minor))
    [ "$num" -ge 20012 ] || continue
    if [ "$num" -gt "$best_ver" ]; then
      best_ver=$num
      best_dir=$dir
    fi
  done

  if [ -n "$best_dir" ]; then
    PATH="$best_dir:$PATH"
    export PATH
    return 0
  fi

  echo "[post-merge] ERROR: could not locate a Node >= 20.12 toolchain with npm." >&2
  return 1
}
ensure_node_on_path
echo "[post-merge] Using node $(node -v) / npm $(npm -v)"

echo "[post-merge] Installing dependencies…"
install_dependencies() {
  if npm install --no-audit --no-fund; then
    return 0
  fi

  # npm can leave a hidden temporary package directory behind when another
  # install is interrupted. On the next install, its rename then fails with
  # ENOTEMPTY (for example, node_modules/three -> node_modules/.three-XXXX).
  # Remove only npm-style hidden temp directories, never regular packages.
  echo "[post-merge] Retrying dependency install after cleaning npm temp directories…"
  if [ -d node_modules ]; then
    find node_modules \
      -mindepth 1 -maxdepth 1 \
      -type d -name '.*-*' \
      -print -exec rm -rf -- {} +
  fi
  npm install --no-audit --no-fund
}
install_dependencies

echo "[post-merge] Pushing database schema…"
npm run db:push -- --force

echo "[post-merge] Ensuring walkin brand sequences exist…"
node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query(\`
  CREATE SEQUENCE IF NOT EXISTS walkin_ris_seq START WITH 1 INCREMENT BY 1;
  CREATE SEQUENCE IF NOT EXISTS walkin_rps_seq START WITH 1 INCREMENT BY 1;
\`)
.then(() => pool.query(\`
  SELECT brand, COALESCE(MAX(brand_seq_num), 0) AS max_seq
  FROM walkin_leads WHERE brand IN ('RIS','RPS') GROUP BY brand
\`))
.then(r => Promise.all(r.rows.map(row => {
  const seq = row.brand === 'RIS' ? 'walkin_ris_seq' : 'walkin_rps_seq';
  return pool.query('SELECT setval(\$1, \$2, false)', [seq, parseInt(row.max_seq) + 1]);
})))
.then(() => { console.log('[post-merge] Walkin sequences ready.'); pool.end(); })
.catch(e => { console.error('[post-merge] Sequence setup failed:', e.message); pool.end(); process.exit(1); });
"

echo "[post-merge] Done."
