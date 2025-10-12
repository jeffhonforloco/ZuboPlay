-- Enhanced Backend Schema for ZuboPlay
-- This migration creates a comprehensive database structure

-- Create enum types for better data integrity
CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator');
CREATE TYPE game_status AS ENUM ('active', 'paused', 'completed', 'abandoned');
CREATE TYPE content_type AS ENUM ('color', 'sound', 'feature', 'announcement');
CREATE TYPE notification_type AS ENUM ('email', 'push', 'in_app');

-- Enhanced profiles table with additional fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'user',
ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS last_active_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS total_play_time integer DEFAULT 0, -- in seconds
ADD COLUMN IF NOT EXISTS best_score integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS level integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS experience_points integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_premium boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS achievements jsonb DEFAULT '[]';

-- Create games table for tracking individual game sessions
CREATE TABLE IF NOT EXISTS public.games (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  score integer NOT NULL DEFAULT 0,
  duration integer NOT NULL DEFAULT 0, -- in seconds
  level_reached integer NOT NULL DEFAULT 1,
  coins_collected integer NOT NULL DEFAULT 0,
  obstacles_avoided integer NOT NULL DEFAULT 0,
  status game_status DEFAULT 'active',
  game_data jsonb DEFAULT '{}', -- store game-specific data
  created_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone
);

-- Create game_sessions table for tracking play sessions
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_start timestamp with time zone DEFAULT now(),
  session_end timestamp with time zone,
  total_games integer DEFAULT 0,
  total_score integer DEFAULT 0,
  total_duration integer DEFAULT 0, -- in seconds
  device_info jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text
);

-- Create zubo_designs table for storing user-created Zubo designs
CREATE TABLE IF NOT EXISTS public.zubo_designs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  design_data jsonb NOT NULL, -- store the actual design configuration
  is_public boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  download_count integer DEFAULT 0,
  rating numeric(3,2) DEFAULT 0.0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create game_content table for managing game assets
CREATE TABLE IF NOT EXISTS public.game_content (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  type content_type NOT NULL,
  value text NOT NULL,
  metadata jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  is_premium boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text NOT NULL,
  icon text,
  criteria jsonb NOT NULL, -- conditions for unlocking
  reward jsonb DEFAULT '{}', -- rewards for unlocking
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Create user_achievements junction table
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}',
  is_read boolean DEFAULT false,
  is_sent boolean DEFAULT false,
  scheduled_at timestamp with time zone DEFAULT now(),
  sent_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Create system_settings table
CREATE TABLE IF NOT EXISTS public.system_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL,
  description text,
  is_public boolean DEFAULT false,
  updated_at timestamp with time zone DEFAULT now(),
  updated_by uuid REFERENCES public.profiles(id)
);

-- Create analytics_events table for tracking user behavior
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}',
  session_id text,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Create leaderboards table for caching leaderboard data
CREATE TABLE IF NOT EXISTS public.leaderboards (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL, -- 'daily', 'weekly', 'monthly', 'all_time'
  period_start timestamp with time zone NOT NULL,
  period_end timestamp with time zone NOT NULL,
  data jsonb NOT NULL, -- leaderboard data
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON public.profiles(last_active_at);
CREATE INDEX IF NOT EXISTS idx_games_user_id ON public.games(user_id);
CREATE INDEX IF NOT EXISTS idx_games_created_at ON public.games(created_at);
CREATE INDEX IF NOT EXISTS idx_games_score ON public.games(score);
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON public.game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_zubo_designs_user_id ON public.zubo_designs(user_id);
CREATE INDEX IF NOT EXISTS idx_zubo_designs_public ON public.zubo_designs(is_public);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at);

-- Enable Row Level Security on all tables
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zubo_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboards ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for games table
CREATE POLICY "Users can view their own games"
  ON public.games FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own games"
  ON public.games FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own games"
  ON public.games FOR UPDATE
  USING (auth.uid() = user_id);

-- Create RLS policies for game_sessions table
CREATE POLICY "Users can view their own game sessions"
  ON public.game_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own game sessions"
  ON public.game_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for zubo_designs table
CREATE POLICY "Users can view public designs or their own"
  ON public.zubo_designs FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own designs"
  ON public.zubo_designs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own designs"
  ON public.zubo_designs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own designs"
  ON public.zubo_designs FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for game_content table
CREATE POLICY "Anyone can view active game content"
  ON public.game_content FOR SELECT
  USING (is_active = true);

-- Create RLS policies for achievements table
CREATE POLICY "Anyone can view active achievements"
  ON public.achievements FOR SELECT
  USING (is_active = true);

-- Create RLS policies for user_achievements table
CREATE POLICY "Users can view their own achievements"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for notifications table
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Create RLS policies for system_settings table
CREATE POLICY "Anyone can view public settings"
  ON public.system_settings FOR SELECT
  USING (is_public = true);

-- Create RLS policies for analytics_events table
CREATE POLICY "Users can insert their own analytics events"
  ON public.analytics_events FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Create RLS policies for leaderboards table
CREATE POLICY "Anyone can view leaderboards"
  ON public.leaderboards FOR SELECT
  USING (true);

-- Create functions for common operations

-- Function to update user statistics after a game
CREATE OR REPLACE FUNCTION public.update_user_stats_after_game(
  p_user_id uuid,
  p_score integer,
  p_duration integer,
  p_level_reached integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET 
    total_games_played = total_games_played + 1,
    total_play_time = total_play_time + p_duration,
    best_score = GREATEST(best_score, p_score),
    last_active_at = now(),
    updated_at = now()
  WHERE id = p_user_id;
END;
$$;

-- Function to check and unlock achievements
CREATE OR REPLACE FUNCTION public.check_achievements(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_stats RECORD;
  achievement RECORD;
BEGIN
  -- Get user statistics
  SELECT * INTO user_stats FROM public.profiles WHERE id = p_user_id;
  
  -- Check each achievement
  FOR achievement IN 
    SELECT * FROM public.achievements 
    WHERE is_active = true 
    AND id NOT IN (
      SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id
    )
  LOOP
    -- Check if achievement criteria are met
    -- This is a simplified example - you'd implement specific logic for each achievement
    IF (achievement.criteria->>'min_games' IS NULL OR user_stats.total_games_played >= (achievement.criteria->>'min_games')::integer)
    AND (achievement.criteria->>'min_score' IS NULL OR user_stats.best_score >= (achievement.criteria->>'min_score')::integer)
    THEN
      -- Unlock achievement
      INSERT INTO public.user_achievements (user_id, achievement_id)
      VALUES (p_user_id, achievement.id)
      ON CONFLICT (user_id, achievement_id) DO NOTHING;
      
      -- Send notification
      INSERT INTO public.notifications (user_id, type, title, message, data)
      VALUES (
        p_user_id, 
        'in_app', 
        'Achievement Unlocked!', 
        'You unlocked: ' || achievement.name,
        jsonb_build_object('achievement_id', achievement.id)
      );
    END IF;
  END LOOP;
END;
$$;

-- Function to get leaderboard data
CREATE OR REPLACE FUNCTION public.get_leaderboard(
  p_type text DEFAULT 'all_time',
  p_limit integer DEFAULT 10
)
RETURNS TABLE (
  rank bigint,
  user_id uuid,
  username text,
  score integer,
  games_played integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROW_NUMBER() OVER (ORDER BY p.best_score DESC, p.total_games_played DESC) as rank,
    p.id as user_id,
    p.username,
    p.best_score as score,
    p.total_games_played as games_played
  FROM public.profiles p
  WHERE p.total_games_played > 0
  ORDER BY p.best_score DESC, p.total_games_played DESC
  LIMIT p_limit;
END;
$$;

-- Create triggers for automatic updates
CREATE OR REPLACE FUNCTION public.handle_zubo_design_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_zubo_design_updated
  BEFORE UPDATE ON public.zubo_designs
  FOR EACH ROW EXECUTE FUNCTION public.handle_zubo_design_updated_at();

-- Insert default system settings
INSERT INTO public.system_settings (key, value, description, is_public) VALUES
('maintenance_mode', 'false', 'Whether the system is in maintenance mode', true),
('registration_enabled', 'true', 'Whether new user registration is enabled', true),
('max_users', '10000', 'Maximum number of users allowed', false),
('game_speed', '5', 'Default game speed multiplier', true),
('sound_enabled', 'true', 'Whether sound effects are enabled by default', true),
('music_enabled', 'true', 'Whether background music is enabled by default', true),
('analytics_enabled', 'true', 'Whether analytics collection is enabled', false)
ON CONFLICT (key) DO NOTHING;

-- Insert default achievements
INSERT INTO public.achievements (name, description, icon, criteria, reward) VALUES
('First Steps', 'Play your first game', '🎮', '{"min_games": 1}', '{"coins": 10}'),
('Score Master', 'Achieve a score of 1000', '⭐', '{"min_score": 1000}', '{"coins": 50}'),
('Dedicated Player', 'Play 10 games', '🏆', '{"min_games": 10}', '{"coins": 100}'),
('High Scorer', 'Achieve a score of 5000', '💎', '{"min_score": 5000}', '{"coins": 200}'),
('Veteran Player', 'Play 50 games', '👑', '{"min_games": 50}', '{"coins": 500}')
ON CONFLICT (name) DO NOTHING;

-- Insert default game content
INSERT INTO public.game_content (name, description, type, value, is_active) VALUES
('Neon Pink', 'Bright neon pink color', 'color', '#FF1493', true),
('Electric Blue', 'Vibrant electric blue color', 'color', '#00BFFF', true),
('Jump Sound', 'Default jump sound effect', 'sound', 'jump_default.wav', true),
('Coin Sound', 'Coin collection sound effect', 'sound', 'coin_collect.wav', true),
('Double Jump', 'Allow players to double jump', 'feature', 'enabled', false),
('Welcome Message', 'Welcome new players', 'announcement', 'Welcome to ZuboPlay!', true)
ON CONFLICT DO NOTHING;
