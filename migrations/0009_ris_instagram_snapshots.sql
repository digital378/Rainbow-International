CREATE TABLE IF NOT EXISTS ris_instagram_snapshots (
  day date PRIMARY KEY,
  posts integer NOT NULL CHECK (posts >= 0),
  views integer NOT NULL CHECK (views >= 0),
  captured_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ris_instagram_lease (
  name text PRIMARY KEY,
  owner text NOT NULL,
  expires_at timestamptz NOT NULL
);