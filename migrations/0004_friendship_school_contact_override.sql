ALTER TABLE friendship_schools
  ADD COLUMN IF NOT EXISTS contact_override boolean NOT NULL DEFAULT false;
