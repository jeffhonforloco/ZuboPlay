// API Client for ZuboPlay Backend
import { supabase } from '@/integrations/supabase/client';
import type { 
  ApiResponse, 
  PaginatedResponse, 
  User, 
  Game, 
  GameSession, 
  ZuboDesign, 
  Achievement, 
  UserAchievement, 
  GameContent, 
  Notification, 
  SystemSetting, 
  AnalyticsEvent, 
  LeaderboardEntry,
  CreateGameRequest,
  UpdateUserRequest,
  CreateZuboDesignRequest,
  CreateNotificationRequest,
  UserFilters,
  GameFilters,
  AnalyticsFilters
} from './types';

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = '/api';
  }

  // Generic API methods
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'An error occurred',
          message: data.message,
        };
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // User API methods
  async getCurrentUser(): Promise<ApiResponse<User>> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  }

  async updateUser(userId: string, updates: UpdateUserRequest): Promise<ApiResponse<User>> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  }

  async getUsers(filters: UserFilters = {}, page = 1, limit = 10): Promise<PaginatedResponse<User>> {
    let query = supabase.from('profiles').select('*');

    // Apply filters
    if (filters.role) {
      query = query.eq('role', filters.role);
    }
    if (filters.is_premium !== undefined) {
      query = query.eq('is_premium', filters.is_premium);
    }
    if (filters.search) {
      query = query.or(`username.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }

    // Apply sorting
    const sortBy = filters.sort_by || 'created_at';
    const sortOrder = filters.sort_order || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      return { 
        success: false, 
        error: error.message,
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0 }
      };
    }

    return {
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    };
  }

  // Game API methods
  async createGame(gameData: CreateGameRequest): Promise<ApiResponse<Game>> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data, error } = await supabase
      .from('games')
      .insert({
        user_id: user.id,
        ...gameData,
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Update user statistics
    await supabase.rpc('update_user_stats_after_game', {
      p_user_id: user.id,
      p_score: gameData.score,
      p_duration: gameData.duration,
      p_level_reached: gameData.level_reached
    });

    // Check for new achievements
    await supabase.rpc('check_achievements', { p_user_id: user.id });

    return { success: true, data };
  }

  async getGames(filters: GameFilters = {}, page = 1, limit = 10): Promise<PaginatedResponse<Game>> {
    let query = supabase.from('games').select('*');

    // Apply filters
    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from);
    }
    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to);
    }
    if (filters.min_score) {
      query = query.gte('score', filters.min_score);
    }
    if (filters.max_score) {
      query = query.lte('score', filters.max_score);
    }

    // Apply sorting
    const sortBy = filters.sort_by || 'created_at';
    const sortOrder = filters.sort_order || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      return { 
        success: false, 
        error: error.message,
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0 }
      };
    }

    return {
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    };
  }

  async getGameStats(userId: string): Promise<ApiResponse<any>> {
    const { data, error } = await supabase
      .from('profiles')
      .select('total_games_played, total_play_time, best_score, level, experience_points')
      .eq('id', userId)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  }

  // Zubo Design API methods
  async createZuboDesign(designData: CreateZuboDesignRequest): Promise<ApiResponse<ZuboDesign>> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data, error } = await supabase
      .from('zubo_designs')
      .insert({
        user_id: user.id,
        ...designData
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  }

  async getZuboDesigns(publicOnly = false, page = 1, limit = 10): Promise<PaginatedResponse<ZuboDesign>> {
    let query = supabase.from('zubo_designs').select('*');

    if (publicOnly) {
      query = query.eq('is_public', true);
    }

    query = query.order('created_at', { ascending: false });

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      return { 
        success: false, 
        error: error.message,
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0 }
      };
    }

    return {
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    };
  }

  // Achievement API methods
  async getAchievements(): Promise<ApiResponse<Achievement[]>> {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('is_active', true)
      .order('created_at');

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  }

  async getUserAchievements(userId: string): Promise<ApiResponse<UserAchievement[]>> {
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievement:achievements(*)
      `)
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  }

  // Content API methods
  async getGameContent(type?: string): Promise<ApiResponse<GameContent[]>> {
    let query = supabase.from('game_content').select('*').eq('is_active', true);

    if (type) {
      query = query.eq('type', type);
    }

    query = query.order('sort_order').order('created_at');

    const { data, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  }

  // Notification API methods
  async getNotifications(userId: string, unreadOnly = false): Promise<ApiResponse<Notification[]>> {
    let query = supabase.from('notifications').select('*').eq('user_id', userId);

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  }

  async markNotificationAsRead(notificationId: string): Promise<ApiResponse<void>> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  // Analytics API methods
  async trackEvent(eventType: string, eventData: Record<string, any> = {}): Promise<ApiResponse<void>> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        user_id: user?.id,
        event_type: eventType,
        event_data: eventData,
        session_id: sessionStorage.getItem('session_id') || undefined
      });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  async getAnalytics(filters: AnalyticsFilters = {}): Promise<ApiResponse<AnalyticsEvent[]>> {
    let query = supabase.from('analytics_events').select('*');

    if (filters.event_type) {
      query = query.eq('event_type', filters.event_type);
    }
    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }
    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from);
    }
    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to);
    }
    if (filters.session_id) {
      query = query.eq('session_id', filters.session_id);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  }

  // Leaderboard API methods
  async getLeaderboard(type = 'all_time', limit = 10): Promise<ApiResponse<LeaderboardEntry[]>> {
    const { data, error } = await supabase.rpc('get_leaderboard', {
      p_type: type,
      p_limit: limit
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  }

  // System Settings API methods
  async getSystemSettings(publicOnly = true): Promise<ApiResponse<SystemSetting[]>> {
    let query = supabase.from('system_settings').select('*');

    if (publicOnly) {
      query = query.eq('is_public', true);
    }

    const { data, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  }

  async updateSystemSetting(key: string, value: any): Promise<ApiResponse<SystemSetting>> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data, error } = await supabase
      .from('system_settings')
      .update({ 
        value, 
        updated_at: new Date().toISOString(),
        updated_by: user.id
      })
      .eq('key', key)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
