CREATE TABLE IF NOT EXISTS inquiry_abuse_buckets (
  bucket_key text PRIMARY KEY,
  window_started_at timestamp NOT NULL,
  request_count integer NOT NULL DEFAULT 0,
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS inquiry_abuse_buckets_updated_at_idx
  ON inquiry_abuse_buckets (updated_at);