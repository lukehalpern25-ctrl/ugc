-- Gymdex Creator Onboarding Pipeline — Database Schema
-- Run this in your new Supabase project's SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── CREATOR PROFILES ────────────────────────────────────────────────
CREATE TABLE creator_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  legal_name TEXT NOT NULL,
  contract_signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  contract_ip_address INET,
  contract_user_agent TEXT,
  contract_version TEXT DEFAULT 'v1',

  email TEXT,
  phone TEXT,
  payment_method TEXT CHECK (payment_method IN ('paypal', 'sideshift')),
  payment_handle TEXT,

  tiktok_username TEXT,
  tiktok_url TEXT,
  instagram_username TEXT,
  instagram_url TEXT,

  current_phase TEXT NOT NULL DEFAULT 'setup' CHECK (current_phase IN ('setup', 'warmup', 'posting', 'active')),

  warmup_started_at TIMESTAMPTZ,
  warmup_day1_completed_at TIMESTAMPTZ,
  warmup_day2_completed_at TIMESTAMPTZ,
  warmup_day3_completed_at TIMESTAMPTZ,

  xp INT NOT NULL DEFAULT 0,
  level INT NOT NULL DEFAULT 1,
  current_streak INT NOT NULL DEFAULT 0,
  longest_streak INT NOT NULL DEFAULT 0,
  last_post_date DATE,

  performance_tier TEXT NOT NULL DEFAULT 'standard' CHECK (performance_tier IN ('standard', 'rising', 'top_performer', 'elite')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique email constraint (only where email is not null)
CREATE UNIQUE INDEX idx_creator_profiles_email ON creator_profiles (email) WHERE email IS NOT NULL;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_creator_profiles_updated_at
  BEFORE UPDATE ON creator_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ─── CREATOR PROGRESS ────────────────────────────────────────────────
CREATE TABLE creator_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
  phase TEXT NOT NULL,
  step_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(creator_id, phase, step_id)
);

CREATE INDEX idx_creator_progress_creator ON creator_progress(creator_id);

-- ─── WARMUP DAILY TASKS ─────────────────────────────────────────────
CREATE TABLE warmup_daily_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
  day_number INT NOT NULL CHECK (day_number BETWEEN 1 AND 3),
  task_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(creator_id, day_number, task_id)
);

CREATE INDEX idx_warmup_tasks_creator ON warmup_daily_tasks(creator_id);

-- ─── CREATOR POSTS ───────────────────────────────────────────────────
CREATE TABLE creator_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('tiktok', 'instagram')),
  post_url TEXT,
  posted_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_creator_posts_creator ON creator_posts(creator_id);
CREATE INDEX idx_creator_posts_date ON creator_posts(creator_id, posted_at);

-- ─── XP EVENTS ───────────────────────────────────────────────────────
CREATE TABLE xp_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  reason TEXT NOT NULL,
  source_type TEXT,
  source_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_xp_events_creator ON xp_events(creator_id);

-- ─── CREATOR BADGES ──────────────────────────────────────────────────
CREATE TABLE creator_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(creator_id, badge_id)
);

CREATE INDEX idx_creator_badges_creator ON creator_badges(creator_id);

-- ─── CREATOR EARNINGS ────────────────────────────────────────────────
CREATE TABLE creator_earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  base_amount NUMERIC NOT NULL DEFAULT 250,
  bonus_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  UNIQUE(creator_id, month)
);

CREATE INDEX idx_creator_earnings_creator ON creator_earnings(creator_id);

-- ─── NOTIFICATIONS SENT ─────────────────────────────────────────────
CREATE TABLE notifications_sent (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB
);

CREATE INDEX idx_notifications_creator ON notifications_sent(creator_id);
CREATE INDEX idx_notifications_type ON notifications_sent(creator_id, notification_type);
