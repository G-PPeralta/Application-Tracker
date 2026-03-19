-- Auth.js required tables (pg-adapter schema)

CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  "emailVerified" TIMESTAMPTZ,
  image TEXT
);

CREATE TABLE IF NOT EXISTS accounts (
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  PRIMARY KEY (provider, "providerAccountId")
);

-- Note: `sessions` and `verification_tokens` tables are intentionally omitted.
-- We use JWT session strategy (no DB session lookups) and have no email/password flow.

-- Add user_id to applications (nullable initially for existing data)
ALTER TABLE applications ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);

-- Index for filtering applications by user
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications (user_id);
