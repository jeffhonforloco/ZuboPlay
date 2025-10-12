// User progression and feature unlock system
import { supabase } from "@/integrations/supabase/client";

export interface UserProgress {
  id: string;
  user_id: string;
  total_score: number;
  highest_level: number;
  total_play_time: number;
  favorite_zubo_design: any;
  achievements: string[];
  power_ups_used: number;
  coins_collected: number;
  daily_streak: number;
  last_play_date: string;
  created_at: string;
  updated_at: string;
}

export interface FeatureUnlock {
  id: string;
  name: string;
  description: string;
  icon: string;
  required_level: number;
  required_score: number;
  required_achievements: string[];
  is_premium: boolean;
  unlocked_at?: string;
}

export interface DailyReward {
  id: string;
  day: number;
  reward_type: 'coins' | 'power_up' | 'zubo_skin' | 'special';
  reward_value: number;
  reward_name: string;
  description: string;
  is_claimed: boolean;
  claimed_at?: string;
}

export class UserProgression {
  // Get user progress
  static async getUserProgress(userId: string): Promise<UserProgress | null> {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to get user progress:', error);
      return null;
    }
  }

  // Update user progress
  static async updateUserProgress(userId: string, progressData: Partial<UserProgress>): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: userId,
          ...progressData,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to update user progress:', error);
    }
  }

  // Check and unlock features
  static async checkFeatureUnlocks(userId: string): Promise<FeatureUnlock[]> {
    const progress = await this.getUserProgress(userId);
    if (!progress) return [];

    try {
      const { data: features, error } = await supabase
        .from('feature_unlocks')
        .select('*')
        .or(`required_level.lte.${progress.highest_level},required_score.lte.${progress.total_score}`)
        .is('unlocked_at', null);

      if (error) throw error;

      const unlockedFeatures: FeatureUnlock[] = [];
      
      for (const feature of features || []) {
        const isUnlocked = this.checkFeatureRequirements(feature, progress);
        if (isUnlocked) {
          await this.unlockFeature(userId, feature.id);
          unlockedFeatures.push(feature);
        }
      }

      return unlockedFeatures;
    } catch (error) {
      console.error('Failed to check feature unlocks:', error);
      return [];
    }
  }

  // Check feature requirements
  private static checkFeatureRequirements(feature: FeatureUnlock, progress: UserProgress): boolean {
    if (feature.required_level > progress.highest_level) return false;
    if (feature.required_score > progress.total_score) return false;
    
    for (const achievement of feature.required_achievements) {
      if (!progress.achievements.includes(achievement)) return false;
    }

    return true;
  }

  // Unlock feature
  private static async unlockFeature(userId: string, featureId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('feature_unlocks')
        .update({
          unlocked_at: new Date().toISOString()
        })
        .eq('id', featureId);

      if (error) throw error;

      // Log feature unlock
      await supabase.from('feature_unlock_logs').insert({
        user_id: userId,
        feature_id: featureId,
        unlocked_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to unlock feature:', error);
    }
  }

  // Get daily rewards
  static async getDailyRewards(userId: string): Promise<DailyReward[]> {
    try {
      const { data, error } = await supabase
        .from('daily_rewards')
        .select('*')
        .eq('user_id', userId)
        .order('day', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get daily rewards:', error);
      return [];
    }
  }

  // Claim daily reward
  static async claimDailyReward(userId: string, rewardId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('daily_rewards')
        .update({
          is_claimed: true,
          claimed_at: new Date().toISOString()
        })
        .eq('id', rewardId)
        .eq('user_id', userId);

      if (error) throw error;

      // Update user progress with reward
      const { data: reward } = await supabase
        .from('daily_rewards')
        .select('*')
        .eq('id', rewardId)
        .single();

      if (reward) {
        await this.applyDailyReward(userId, reward);
      }

      return true;
    } catch (error) {
      console.error('Failed to claim daily reward:', error);
      return false;
    }
  }

  // Apply daily reward
  private static async applyDailyReward(userId: string, reward: DailyReward): Promise<void> {
    const progress = await this.getUserProgress(userId);
    if (!progress) return;

    switch (reward.reward_type) {
      case 'coins':
        await this.updateUserProgress(userId, {
          coins_collected: progress.coins_collected + reward.reward_value
        });
        break;
      case 'power_up':
        // Add power-up to user inventory
        await supabase.from('user_power_ups').insert({
          user_id: userId,
          power_up_type: reward.reward_name,
          quantity: reward.reward_value,
          obtained_at: new Date().toISOString()
        });
        break;
      case 'zubo_skin':
        // Add skin to user collection
        await supabase.from('user_zubo_skins').insert({
          user_id: userId,
          skin_name: reward.reward_name,
          obtained_at: new Date().toISOString()
        });
        break;
    }
  }

  // Get user achievements
  static async getUserAchievements(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievements (
            name,
            description,
            icon,
            points
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get user achievements:', error);
      return [];
    }
  }

  // Unlock achievement
  static async unlockAchievement(userId: string, achievementId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_id: achievementId,
          unlocked_at: new Date().toISOString()
        });

      if (error) throw error;

      // Update user progress
      const progress = await this.getUserProgress(userId);
      if (progress && !progress.achievements.includes(achievementId)) {
        await this.updateUserProgress(userId, {
          achievements: [...progress.achievements, achievementId]
        });
      }
    } catch (error) {
      console.error('Failed to unlock achievement:', error);
    }
  }

  // Get user statistics
  static async getUserStats(userId: string): Promise<any> {
    try {
      const progress = await this.getUserProgress(userId);
      if (!progress) return null;

      const achievements = await this.getUserAchievements(userId);
      const dailyRewards = await this.getDailyRewards(userId);
      const features = await this.checkFeatureUnlocks(userId);

      return {
        progress,
        achievements: achievements.length,
        dailyRewards: dailyRewards.filter(r => r.is_claimed).length,
        unlockedFeatures: features.length,
        level: progress.highest_level,
        totalScore: progress.total_score,
        playTime: progress.total_play_time,
        coins: progress.coins_collected,
        streak: progress.daily_streak
      };
    } catch (error) {
      console.error('Failed to get user stats:', error);
      return null;
    }
  }

  // Update daily streak
  static async updateDailyStreak(userId: string): Promise<void> {
    const progress = await this.getUserProgress(userId);
    if (!progress) return;

    const lastPlayDate = new Date(progress.last_play_date);
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - lastPlayDate.getTime()) / (1000 * 60 * 60 * 24));

    let newStreak = progress.daily_streak;
    if (daysDiff === 1) {
      newStreak += 1;
    } else if (daysDiff > 1) {
      newStreak = 1;
    }

    await this.updateUserProgress(userId, {
      daily_streak: newStreak,
      last_play_date: today.toISOString()
    });
  }
}
