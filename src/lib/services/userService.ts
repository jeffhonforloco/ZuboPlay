// User Service Layer
import { apiClient } from '../api/client';
import type { User, UpdateUserRequest, UserFilters, ApiResponse, PaginatedResponse } from '../api/types';

export class UserService {
  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return await apiClient.getCurrentUser();
  }

  /**
   * Update user profile
   */
  async updateUser(userId: string, updates: UpdateUserRequest): Promise<ApiResponse<User>> {
    return await apiClient.updateUser(userId, updates);
  }

  /**
   * Get users with filtering and pagination
   */
  async getUsers(filters: UserFilters = {}, page = 1, limit = 10): Promise<PaginatedResponse<User>> {
    return await apiClient.getUsers(filters, page, limit);
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<ApiResponse<User>> {
    const { data, error } = await apiClient.getUsers({}, 1, 1);
    
    if (error) {
      return { success: false, error };
    }

    const user = data?.find(u => u.id === userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    return { success: true, data: user };
  }

  /**
   * Update user preferences
   */
  async updatePreferences(userId: string, preferences: Record<string, any>): Promise<ApiResponse<User>> {
    return await this.updateUser(userId, { preferences });
  }

  /**
   * Update user avatar
   */
  async updateAvatar(userId: string, avatarUrl: string): Promise<ApiResponse<User>> {
    return await this.updateUser(userId, { avatar_url: avatarUrl });
  }

  /**
   * Update username
   */
  async updateUsername(userId: string, username: string): Promise<ApiResponse<User>> {
    return await this.updateUser(userId, { username });
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string): Promise<ApiResponse<any>> {
    return await apiClient.getGameStats(userId);
  }

  /**
   * Search users by username or email
   */
  async searchUsers(query: string, limit = 10): Promise<ApiResponse<User[]>> {
    const result = await apiClient.getUsers({ search: query }, 1, limit);
    return {
      success: result.success,
      data: result.data || [],
      error: result.error
    };
  }

  /**
   * Get active users (users who have played games)
   */
  async getActiveUsers(page = 1, limit = 10): Promise<PaginatedResponse<User>> {
    return await apiClient.getUsers({}, page, limit);
  }

  /**
   * Get premium users
   */
  async getPremiumUsers(page = 1, limit = 10): Promise<PaginatedResponse<User>> {
    return await apiClient.getUsers({ is_premium: true }, page, limit);
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: 'user' | 'admin' | 'moderator', page = 1, limit = 10): Promise<PaginatedResponse<User>> {
    return await apiClient.getUsers({ role }, page, limit);
  }

  /**
   * Get recently active users
   */
  async getRecentlyActiveUsers(page = 1, limit = 10): Promise<PaginatedResponse<User>> {
    return await apiClient.getUsers({ 
      sort_by: 'last_active_at', 
      sort_order: 'desc' 
    }, page, limit);
  }

  /**
   * Get top players by score
   */
  async getTopPlayers(page = 1, limit = 10): Promise<PaginatedResponse<User>> {
    return await apiClient.getUsers({ 
      sort_by: 'best_score', 
      sort_order: 'desc' 
    }, page, limit);
  }

  /**
   * Get most active players
   */
  async getMostActivePlayers(page = 1, limit = 10): Promise<PaginatedResponse<User>> {
    return await apiClient.getUsers({ 
      sort_by: 'total_games_played', 
      sort_order: 'desc' 
    }, page, limit);
  }
}

// Export singleton instance
export const userService = new UserService();
export default userService;
