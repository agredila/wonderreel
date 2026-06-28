# Supabase database setup

Run migrations **in order** in the Supabase Dashboard → **SQL Editor**.

## Fresh project (nothing applied yet)

1. Open [`migrations/001_initial_schema.sql`](migrations/001_initial_schema.sql)
2. Copy the full file → **New query** → **Run**
3. Open [`migrations/002_invitation_auth.sql`](migrations/002_invitation_auth.sql)
4. Copy the full file → **New query** → **Run**

Or run the combined script once:

- [`migrations/apply_all.sql`](migrations/apply_all.sql)

Then run (if not already applied):

- [`migrations/003_quota_default.sql`](migrations/003_quota_default.sql)
- [`migrations/004_signup_trigger_fix.sql`](migrations/004_signup_trigger_fix.sql) — **required if signup returns "Database error creating new user"**

## Error: `relation "parent_accounts" does not exist`

You ran **002 before 001**. Migration 002 only adds invitation tables and alters `parent_accounts`; it does not create the base schema.

**Fix:** Run `001_initial_schema.sql` first, then run `002_invitation_auth.sql` again.

## After migrations

1. **Authentication** → **Providers** → **Email** → enable email sign-up with password
2. Set backend env: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
3. Set web env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Default invitation code (seeded in 002): **`TRYWONDERREEL`**
