#!/bin/bash
set -e

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
