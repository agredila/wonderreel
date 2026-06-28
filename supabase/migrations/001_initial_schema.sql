-- WonderReel multi-tenant schema (PRD v1.2)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Parent accounts (extends auth.users)
CREATE TABLE parent_accounts (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL DEFAULT '',
  locale TEXT NOT NULL DEFAULT 'en' CHECK (locale IN ('en', 'id', 'zh', 'ar')),
  generation_quota_used INT NOT NULL DEFAULT 0,
  generation_quota_limit INT NOT NULL DEFAULT 1,
  quota_reset_at TIMESTAMPTZ NOT NULL DEFAULT (date_trunc('month', NOW()) + INTERVAL '1 month'),
  parental_pin_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

CREATE TABLE child_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES parent_accounts(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_emoji TEXT NOT NULL DEFAULT '🧒',
  age_band TEXT NOT NULL DEFAULT '3-5' CHECK (age_band IN ('2-4', '3-5', '5-7')),
  allowed_languages TEXT[] NOT NULL DEFAULT ARRAY['en'],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES parent_accounts(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  raw_text TEXT NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('en', 'id', 'zh', 'ar')),
  structure TEXT NOT NULL DEFAULT 'single' CHECK (structure IN ('single', 'three_part')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE moderation_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES parent_accounts(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('input', 'output')),
  target_id UUID NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('pass', 'warn', 'block')),
  reasons JSONB NOT NULL DEFAULT '[]',
  model TEXT NOT NULL DEFAULT 'gemini',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE prompt_builds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES parent_accounts(id) ON DELETE CASCADE,
  english_prompts JSONB NOT NULL DEFAULT '[]',
  style_string TEXT NOT NULL,
  parts JSONB NOT NULL DEFAULT '[]',
  banned_terms_stripped JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE generation_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES parent_accounts(id) ON DELETE CASCADE,
  prompt_build_id UUID REFERENCES prompt_builds(id) ON DELETE SET NULL,
  story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
  pixverse_job_ids JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  result_asset_id UUID,
  error TEXT,
  progress INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE films (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES parent_accounts(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
  generation_job_id UUID REFERENCES generation_jobs(id) ON DELETE SET NULL,
  title JSONB NOT NULL DEFAULT '{"en":"","id":"","zh":"","ar":""}',
  duration_sec INT NOT NULL DEFAULT 30,
  thumbnail_url TEXT,
  video_url TEXT,
  status TEXT NOT NULL DEFAULT 'generating' CHECK (status IN ('generating', 'needs_review', 'approved', 'hidden', 'discarded')),
  is_starter BOOLEAN NOT NULL DEFAULT FALSE,
  approved_by_parent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE film_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  film_id UUID NOT NULL REFERENCES films(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES parent_accounts(id) ON DELETE CASCADE,
  language TEXT NOT NULL CHECK (language IN ('en', 'id', 'zh', 'ar')),
  video_url TEXT,
  captions_url TEXT,
  audio_url TEXT,
  overlay_meta JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE recaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  film_id UUID NOT NULL REFERENCES films(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES parent_accounts(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('tap', 'quiz')),
  items JSONB NOT NULL DEFAULT '[]',
  i18n JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE progress_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES parent_accounts(id) ON DELETE CASCADE,
  film_id UUID NOT NULL REFERENCES films(id) ON DELETE CASCADE,
  event TEXT NOT NULL CHECK (event IN ('started', 'completed', 'recap_done', 'tap_learn')),
  ts TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES parent_accounts(id) ON DELETE CASCADE,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}',
  ts TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_child_profiles_account ON child_profiles(account_id);
CREATE INDEX idx_films_account_child ON films(account_id, child_id);
CREATE INDEX idx_films_status ON films(status);
CREATE INDEX idx_generation_jobs_account ON generation_jobs(account_id);
CREATE INDEX idx_audit_logs_account ON audit_logs(account_id);

-- RLS
ALTER TABLE parent_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE films ENABLE ROW LEVEL SECURITY;
ALTER TABLE film_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE recaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY parent_accounts_own ON parent_accounts
  FOR ALL USING (auth.uid() = id);

CREATE POLICY child_profiles_own ON child_profiles
  FOR ALL USING (account_id = auth.uid());

CREATE POLICY stories_own ON stories
  FOR ALL USING (account_id = auth.uid());

CREATE POLICY moderation_results_own ON moderation_results
  FOR ALL USING (account_id = auth.uid());

CREATE POLICY prompt_builds_own ON prompt_builds
  FOR ALL USING (account_id = auth.uid());

CREATE POLICY generation_jobs_own ON generation_jobs
  FOR ALL USING (account_id = auth.uid());

CREATE POLICY films_own ON films
  FOR ALL USING (account_id = auth.uid());

CREATE POLICY film_assets_own ON film_assets
  FOR ALL USING (account_id = auth.uid());

CREATE POLICY recaps_own ON recaps
  FOR ALL USING (account_id = auth.uid());

CREATE POLICY progress_events_own ON progress_events
  FOR ALL USING (account_id = auth.uid());

CREATE POLICY audit_logs_own ON audit_logs
  FOR SELECT USING (account_id = auth.uid());

CREATE POLICY audit_logs_insert ON audit_logs
  FOR INSERT WITH CHECK (account_id = auth.uid());

-- Auto-create parent account on signup
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
