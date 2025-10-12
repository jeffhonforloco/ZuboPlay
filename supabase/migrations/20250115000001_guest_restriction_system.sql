-- Guest restriction and marketing data collection system
-- This migration creates tables for guest sessions, marketing data, user progression, and feature unlocks

-- Marketing data table
CREATE TABLE IF NOT EXISTS marketing_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('direct', 'social', 'search', 'referral', 'utm')),
  campaign TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  landing_page TEXT NOT NULL,
  device_info JSONB NOT NULL,
  session_duration INTEGER DEFAULT 0,
  pages_viewed INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_score INTEGER DEFAULT 0,
  highest_level INTEGER DEFAULT 1,
  total_play_time INTEGER DEFAULT 0, -- in seconds
  favorite_zubo_design JSONB,
  achievements TEXT[] DEFAULT '{}',
  power_ups_used INTEGER DEFAULT 0,
  coins_collected INTEGER DEFAULT 0,
  daily_streak INTEGER DEFAULT 0,
  last_play_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  guest_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feature unlocks table
CREATE TABLE IF NOT EXISTS feature_unlocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  required_level INTEGER NOT NULL,
  required_score INTEGER NOT NULL,
  required_achievements TEXT[] DEFAULT '{}',
  is_premium BOOLEAN DEFAULT FALSE,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feature unlock logs
CREATE TABLE IF NOT EXISTS feature_unlock_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_id UUID REFERENCES feature_unlocks(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily rewards table
CREATE TABLE IF NOT EXISTS daily_rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  day INTEGER NOT NULL,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('coins', 'power_up', 'zubo_skin', 'special')),
  reward_value INTEGER NOT NULL,
  reward_name TEXT NOT NULL,
  description TEXT NOT NULL,
  is_claimed BOOLEAN DEFAULT FALSE,
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User power-ups inventory
CREATE TABLE IF NOT EXISTS user_power_ups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  power_up_type TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  obtained_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Zubo skins collection
CREATE TABLE IF NOT EXISTS user_zubo_skins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  skin_name TEXT NOT NULL,
  obtained_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User analytics table
CREATE TABLE IF NOT EXISTS user_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default feature unlocks
INSERT INTO feature_unlocks (name, description, icon, required_level, required_score, required_achievements, is_premium) VALUES
('Double Jump', 'Unlock the ability to double jump in mid-air', '🦘', 2, 100, '{}', false),
('Obstacle Destruction', 'Destroy obstacles with your powerful jump', '💥', 3, 250, '{}', false),
('Power-up Magnet', 'Automatically collect nearby coins', '🧲', 4, 500, '{}', false),
('Shield Protection', 'Temporary invincibility power-up', '🛡️', 5, 750, '{}', false),
('Speed Boost', 'Temporary speed increase power-up', '⚡', 6, 1000, '{}', false),
('Premium Skins', 'Unlock exclusive Zubo character skins', '🎨', 7, 1500, '{}', true),
('Daily Rewards', 'Claim daily rewards and bonuses', '🎁', 8, 2000, '{}', false),
('Leaderboards', 'Compete on global leaderboards', '🏆', 9, 2500, '{}', false),
('Custom Music', 'Unlock custom background music tracks', '🎵', 10, 3000, '{}', true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_marketing_data_user_id ON marketing_data(user_id);
CREATE INDEX IF NOT EXISTS idx_marketing_data_created_at ON marketing_data(created_at);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_unlock_logs_user_id ON feature_unlock_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_rewards_user_id ON daily_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_event_type ON user_analytics(event_type);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for user_progress updated_at
CREATE TRIGGER handle_user_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- RLS Policies
ALTER TABLE marketing_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_unlock_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_power_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_zubo_skins ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;

-- Marketing data policies
CREATE POLICY "Users can view their own marketing data" ON marketing_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own marketing data" ON marketing_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User progress policies
CREATE POLICY "Users can view their own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON user_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" ON user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Feature unlock logs policies
CREATE POLICY "Users can view their own feature unlocks" ON feature_unlock_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feature unlocks" ON feature_unlock_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Daily rewards policies
CREATE POLICY "Users can view their own daily rewards" ON daily_rewards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily rewards" ON daily_rewards
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily rewards" ON daily_rewards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User achievements policies
CREATE POLICY "Users can view their own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" ON user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User power-ups policies
CREATE POLICY "Users can view their own power-ups" ON user_power_ups
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own power-ups" ON user_power_ups
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own power-ups" ON user_power_ups
  FOR UPDATE USING (auth.uid() = user_id);

-- User Zubo skins policies
CREATE POLICY "Users can view their own skins" ON user_zubo_skins
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own skins" ON user_zubo_skins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User analytics policies
CREATE POLICY "Users can view their own analytics" ON user_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics" ON user_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Feature unlocks are public (no RLS needed)
-- Users can view all feature unlocks
CREATE POLICY "Anyone can view feature unlocks" ON feature_unlocks
  FOR SELECT USING (true);
