// Validation Schemas for ZuboPlay Backend
import { z } from 'zod';

// User validation schemas
export const userRegistrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be no more than 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  avatar_url: z.string().url('Invalid avatar URL').optional()
});

export const userUpdateSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be no more than 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .optional(),
  avatar_url: z.string().url('Invalid avatar URL').optional(),
  preferences: z.record(z.any()).optional()
});

export const userProfileSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  avatar_url: z.string().url().optional(),
  total_games_played: z.number().int().min(0),
  best_score: z.number().int().min(0),
  level: z.number().int().min(1),
  is_premium: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

// Game validation schemas
export const createGameSchema = z.object({
  score: z.number().int().min(0, 'Score must be non-negative'),
  duration: z.number().int().min(0, 'Duration must be non-negative'),
  level_reached: z.number().int().min(1, 'Level must be at least 1'),
  coins_collected: z.number().int().min(0, 'Coins collected must be non-negative'),
  obstacles_avoided: z.number().int().min(0, 'Obstacles avoided must be non-negative'),
  game_data: z.record(z.any()).optional()
});

export const gameSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  score: z.number().int().min(0),
  duration: z.number().int().min(0),
  level_reached: z.number().int().min(1),
  coins_collected: z.number().int().min(0),
  obstacles_avoided: z.number().int().min(0),
  status: z.enum(['active', 'paused', 'completed', 'abandoned']),
  game_data: z.record(z.any()),
  created_at: z.string().datetime(),
  completed_at: z.string().datetime().optional()
});

// Zubo Design validation schemas
export const createZuboDesignSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(50, 'Name must be no more than 50 characters'),
  description: z.string()
    .max(200, 'Description must be no more than 200 characters')
    .optional(),
  design_data: z.record(z.any(), 'Design data is required'),
  is_public: z.boolean().default(false)
});

export const zuboDesignSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  design_data: z.record(z.any()),
  is_public: z.boolean(),
  is_featured: z.boolean(),
  download_count: z.number().int().min(0),
  rating: z.number().min(0).max(5),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

// Achievement validation schemas
export const achievementSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  icon: z.string().optional(),
  criteria: z.record(z.any()),
  reward: z.record(z.any()),
  is_active: z.boolean(),
  created_at: z.string().datetime()
});

export const userAchievementSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  achievement_id: z.string().uuid(),
  unlocked_at: z.string().datetime(),
  achievement: achievementSchema
});

// Content validation schemas
export const gameContentSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  type: z.enum(['color', 'sound', 'feature', 'announcement']),
  value: z.string(),
  metadata: z.record(z.any()),
  is_active: z.boolean(),
  is_premium: z.boolean(),
  sort_order: z.number().int().min(0),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

// Notification validation schemas
export const createNotificationSchema = z.object({
  user_id: z.string().uuid(),
  type: z.enum(['email', 'push', 'in_app']),
  title: z.string().min(1, 'Title is required').max(100, 'Title must be no more than 100 characters'),
  message: z.string().min(1, 'Message is required').max(500, 'Message must be no more than 500 characters'),
  data: z.record(z.any()).optional(),
  scheduled_at: z.string().datetime().optional()
});

export const notificationSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  type: z.enum(['email', 'push', 'in_app']),
  title: z.string(),
  message: z.string(),
  data: z.record(z.any()),
  is_read: z.boolean(),
  is_sent: z.boolean(),
  scheduled_at: z.string().datetime(),
  sent_at: z.string().datetime().optional(),
  created_at: z.string().datetime()
});

// System Settings validation schemas
export const systemSettingSchema = z.object({
  id: z.string().uuid(),
  key: z.string(),
  value: z.any(),
  description: z.string().optional(),
  is_public: z.boolean(),
  updated_at: z.string().datetime(),
  updated_by: z.string().uuid().optional()
});

export const updateSystemSettingSchema = z.object({
  key: z.string(),
  value: z.any(),
  description: z.string().optional()
});

// Analytics validation schemas
export const analyticsEventSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid().optional(),
  event_type: z.string(),
  event_data: z.record(z.any()),
  session_id: z.string().optional(),
  ip_address: z.string().ip().optional(),
  user_agent: z.string().optional(),
  created_at: z.string().datetime()
});

export const trackEventSchema = z.object({
  event_type: z.string().min(1, 'Event type is required'),
  event_data: z.record(z.any()).optional()
});

// Leaderboard validation schemas
export const leaderboardEntrySchema = z.object({
  rank: z.number().int().min(1),
  user_id: z.string().uuid(),
  username: z.string(),
  score: z.number().int().min(0),
  games_played: z.number().int().min(0)
});

export const leaderboardSchema = z.object({
  id: z.string().uuid(),
  type: z.string(),
  period_start: z.string().datetime(),
  period_end: z.string().datetime(),
  data: z.array(leaderboardEntrySchema),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

// Filter validation schemas
export const userFiltersSchema = z.object({
  role: z.enum(['user', 'admin', 'moderator']).optional(),
  is_premium: z.boolean().optional(),
  search: z.string().optional(),
  sort_by: z.enum(['created_at', 'last_active_at', 'total_games_played', 'best_score']).optional(),
  sort_order: z.enum(['asc', 'desc']).optional()
});

export const gameFiltersSchema = z.object({
  user_id: z.string().uuid().optional(),
  status: z.enum(['active', 'paused', 'completed', 'abandoned']).optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  min_score: z.number().int().min(0).optional(),
  max_score: z.number().int().min(0).optional(),
  sort_by: z.enum(['created_at', 'score', 'duration']).optional(),
  sort_order: z.enum(['asc', 'desc']).optional()
});

export const analyticsFiltersSchema = z.object({
  event_type: z.string().optional(),
  user_id: z.string().uuid().optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  session_id: z.string().optional()
});

// Pagination validation schemas
export const paginationSchema = z.object({
  page: z.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(10)
});

// API Response validation schemas
export const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional()
});

export const paginatedResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(z.any()),
  pagination: z.object({
    page: z.number().int().min(1),
    limit: z.number().int().min(1),
    total: z.number().int().min(0),
    totalPages: z.number().int().min(0)
  }),
  error: z.string().optional()
});

// Validation error schema
export const validationErrorSchema = z.object({
  field: z.string(),
  message: z.string(),
  value: z.any().optional()
});

export const validationResultSchema = z.object({
  valid: z.boolean(),
  errors: z.array(validationErrorSchema)
});

// Type exports for TypeScript
export type UserRegistrationInput = z.infer<typeof userRegistrationSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
export type CreateGameInput = z.infer<typeof createGameSchema>;
export type Game = z.infer<typeof gameSchema>;
export type CreateZuboDesignInput = z.infer<typeof createZuboDesignSchema>;
export type ZuboDesign = z.infer<typeof zuboDesignSchema>;
export type Achievement = z.infer<typeof achievementSchema>;
export type UserAchievement = z.infer<typeof userAchievementSchema>;
export type GameContent = z.infer<typeof gameContentSchema>;
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type Notification = z.infer<typeof notificationSchema>;
export type SystemSetting = z.infer<typeof systemSettingSchema>;
export type UpdateSystemSettingInput = z.infer<typeof updateSystemSettingSchema>;
export type AnalyticsEvent = z.infer<typeof analyticsEventSchema>;
export type TrackEventInput = z.infer<typeof trackEventSchema>;
export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>;
export type Leaderboard = z.infer<typeof leaderboardSchema>;
export type UserFilters = z.infer<typeof userFiltersSchema>;
export type GameFilters = z.infer<typeof gameFiltersSchema>;
export type AnalyticsFilters = z.infer<typeof analyticsFiltersSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type ApiResponse<T = any> = z.infer<typeof apiResponseSchema> & { data?: T };
export type PaginatedResponse<T = any> = z.infer<typeof paginatedResponseSchema> & { data: T[] };
export type ValidationError = z.infer<typeof validationErrorSchema>;
export type ValidationResult = z.infer<typeof validationResultSchema>;
