CREATE TABLE IF NOT EXISTS walkin_sync_leases (
  lease_name text PRIMARY KEY,
  owner_id text NOT NULL,
  expires_at timestamp NOT NULL,
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS walkin_sync_leases_expires_at_idx
  ON walkin_sync_leases (expires_at);

CREATE TABLE IF NOT EXISTS walkin_sync_reconciliations (
  scope text PRIMARY KEY,
  updated_at timestamp NOT NULL DEFAULT now()
);