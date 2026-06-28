-- Invitation-gated signup + parent display name
-- REQUIRES: run 001_initial_schema.sql first (creates parent_accounts and auth trigger).
-- Supabase SQL Editor: paste and run 001, then run this file.

ALTER TABLE parent_accounts
  ADD COLUMN IF NOT EXISTS display_name TEXT NOT NULL DEFAULT '';

CREATE TABLE invitation_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  max_uses INT,
  use_count INT NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE invitation_redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitation_code_id UUID NOT NULL REFERENCES invitation_codes(id) ON DELETE RESTRICT,
  account_id UUID NOT NULL REFERENCES parent_accounts(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invitation_redemptions_account ON invitation_redemptions(account_id);
CREATE INDEX idx_invitation_redemptions_code ON invitation_redemptions(invitation_code_id);

ALTER TABLE invitation_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_redemptions ENABLE ROW LEVEL SECURITY;
-- No client policies — service role only

INSERT INTO invitation_codes (code, max_uses)
VALUES ('TRYWONDERREEL', NULL)
ON CONFLICT (code) DO NOTHING;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO parent_accounts (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
