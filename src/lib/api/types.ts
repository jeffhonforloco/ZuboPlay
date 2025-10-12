// API Types and Interfaces for ZuboPlay Backend

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// User Types
export interface User {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  role: 'user' | 'admin' | 'moderator';
  email_verified: boolean;
  last_active_at: string;
  total_games_played: number;
  total_play_time: number;
  best_score: number;
  level: number;
  experience_points: number;
  is_premium: boolean;
  preferences: Record<string, any>;
  achievements: Achievement[];
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  username: string;
  avatar_url?: string;
  total_games_played: number;
  best_score: number;
  level: number;
  is_premium: boolean;
  created_at: string;
}

// Game Types
export interface Game {
  id: string;
  user_id: string;
  score: number;
  duration: number;
  level_reached: number;
  coins_collected: number;
  obstacles_avoided: number;
  status: 'active' | 'paused' | 'completed' | 'abandoned';
  game_data: Record<string, any>;
  created_at: string;
  completed_at?: string;
}

export interface GameSession {
  id: string;
  user_id: string;
  session_start: string;
  session_end?: string;
  total_games: number;
  total_score: number;
  total_duration: number;
  device_info: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

export interface GameStats {
  total_games: number;
  total_score: number;
  best_score: number;
  average_score: number;
  total_play_time: number;
  level: number;
  experience_points: number;
}

// Zubo Design Types
export interface ZuboDesign {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  design_data: Record<string, any>;
  is_public: boolean;
  is_featured: boolean;
  download_count: number;
  rating: number;
  created_at: string;
  updated_at: string;
}

// Achievement Types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon?: string;
  criteria: Record<string, any>;
  reward: Record<string, any>;
  is_active: boolean;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  achievement: Achievement;
}

// Content Types
export interface GameContent {
  id: string;
  name: string;
  description?: string;
  type: 'color' | 'sound' | 'feature' | 'announcement';
  value: string;
  metadata: Record<string, any>;
  is_active: boolean;
  is_premium: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// Notification Types
export interface Notification {
  id: string;
  user_id: string;
  type: 'email' | 'push' | 'in_app';
  title: string;
  message: string;
  data: Record<string, any>;
  is_read: boolean;
  is_sent: boolean;
  scheduled_at: string;
  sent_at?: string;
  created_at: string;
}

// System Settings Types
export interface SystemSetting {
  id: string;
  key: string;
  value: any;
  description?: string;
  is_public: boolean;
  updated_at: string;
  updated_by?: string;
}

// Analytics Types
export interface AnalyticsEvent {
  id: string;
  user_id?: string;
  event_type: string;
  event_data: Record<string, any>;
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Leaderboard Types
export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  score: number;
  games_played: number;
}

export interface Leaderboard {
  id: string;
  type: string;
  period_start: string;
  period_end: string;
  data: LeaderboardEntry[];
  created_at: string;
  updated_at: string;
}

// Request/Response Types
export interface CreateGameRequest {
  score: number;
  duration: number;
  level_reached: number;
  coins_collected: number;
  obstacles_avoided: number;
  game_data?: Record<string, any>;
}

export interface UpdateUserRequest {
  username?: string;
  avatar_url?: string;
  preferences?: Record<string, any>;
}

export interface CreateZuboDesignRequest {
  name: string;
  description?: string;
  design_data: Record<string, any>;
  is_public?: boolean;
}

export interface CreateNotificationRequest {
  user_id: string;
  type: 'email' | 'push' | 'in_app';
  title: string;
  message: string;
  data?: Record<string, any>;
  scheduled_at?: string;
}

// Filter and Query Types
export interface UserFilters {
  role?: string;
  is_premium?: boolean;
  search?: string;
  sort_by?: 'created_at' | 'last_active_at' | 'total_games_played' | 'best_score';
  sort_order?: 'asc' | 'desc';
}

export interface GameFilters {
  user_id?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  min_score?: number;
  max_score?: number;
  sort_by?: 'created_at' | 'score' | 'duration';
  sort_order?: 'asc' | 'desc';
}

export interface AnalyticsFilters {
  event_type?: string;
  user_id?: string;
  date_from?: string;
  date_to?: string;
  session_id?: string;
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Validation Types
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}
