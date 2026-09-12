CREATE TABLE IF NOT EXISTS ganesh_gallery_downloads (
  asset_id text PRIMARY KEY,
  download_count integer NOT NULL DEFAULT 0,
  updated_at timestamp NOT NULL DEFAULT now()
);