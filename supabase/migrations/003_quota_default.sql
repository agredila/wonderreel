-- Set monthly generation quota default to 1 film per parent account
ALTER TABLE parent_accounts
  ALTER COLUMN generation_quota_limit SET DEFAULT 1;

UPDATE parent_accounts
SET generation_quota_limit = 1
WHERE generation_quota_limit > 1;
