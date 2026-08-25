CREATE TABLE IF NOT EXISTS google_oauth_credentials (
  provider text PRIMARY KEY,
  encrypted_refresh_token text NOT NULL,
  iv text NOT NULL,
  auth_tag text NOT NULL,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);