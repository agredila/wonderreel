-- Signup is handled by backend POST /api/auth/signup (inserts parent_accounts after createUser).
-- Drop the auth.users trigger if it causes "Database error creating new user".
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Keep function for manual use / optional re-enable with search_path fix:
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.parent_accounts (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = COALESCE(NULLIF(EXCLUDED.display_name, ''), parent_accounts.display_name);
  RETURN NEW;
END;
$$;
