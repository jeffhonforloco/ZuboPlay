// Game Service Layer
import { apiClient } from '../api/client';
import type { 
  Game, 
  GameSession, 
  CreateGameRequest, 
  GameFilters, 
  ApiResponse, 
  PaginatedResponse 
} from '../api/types';

export class GameService {
  /**
   * Create a new game record
   */
  async createGame(gameData: CreateGameRequest): Promise<ApiResponse<Game>> {
    return await apiClient.createGame(gameData);
  }

  /**
   * Get games with filtering and pagination
   */
  async getGames(filters: GameFilters = {}, page = 1, limit = 10): Promise<PaginatedResponse<Game>> {
    return await apiClient.getGames(filters, page, limit);
  }

  /**
   * Get user's games
   */
  async getUserGames(userId: string, page = 1, limit = 10): Promise<PaginatedResponse<Game>> {
    return await this.getGames({ user_id: userId }, page, limit);
  }

  /**
   * Get user's game statistics
   */
  async getUserGameStats(userId: string): Promise<ApiResponse<any>> {
    return await apiClient.getGameStats(userId);
  }

  /**
   * Get recent games
   */
  async getRecentGames(limit = 10): Promise<ApiResponse<Game[]>> {
    const result = await this.getGames({}, 1, limit);
    return {
      success: result.success,
      data: result.data || [],
      error: result.error
    };
  }

  /**
   * Get high score games
   */
  async getHighScoreGames(limit = 10): Promise<ApiResponse<Game[]>> {
    const result = await this.getGames({ 
      sort_by: 'score', 
      sort_order: 'desc' 
    }, 1, limit);
    return {
      success: result.success,
      data: result.data || [],
      error: result.error
    };
  }

  /**
   * Get games by date range
   */
  async getGamesByDateRange(
    startDate: string, 
    endDate: string, 
    page = 1, 
    limit = 10
  ): Promise<PaginatedResponse<Game>> {
    return await this.getGames({ 
      date_from: startDate, 
      date_to: endDate 
    }, page, limit);
  }

  /**
   * Get games by score range
   */
  async getGamesByScoreRange(
    minScore: number, 
    maxScore: number, 
    page = 1, 
    limit = 10
  ): Promise<PaginatedResponse<Game>> {
    return await this.getGames({ 
      min_score: minScore, 
      max_score: maxScore 
    }, page, limit);
  }

  /**
   * Get completed games
   */
  async getCompletedGames(page = 1, limit = 10): Promise<PaginatedResponse<Game>> {
    return await this.getGames({ status: 'completed' }, page, limit);
  }

  /**
   * Get active games
   */
  async getActiveGames(page = 1, limit = 10): Promise<PaginatedResponse<Game>> {
    return await this.getGames({ status: 'active' }, page, limit);
  }

  /**
   * Get games by level
   */
  async getGamesByLevel(level: number, page = 1, limit = 10): Promise<PaginatedResponse<Game>> {
    // This would require a custom query since level_reached is not in the filters
    // For now, we'll get all games and filter client-side
    const result = await this.getGames({}, page, limit);
    if (result.success && result.data) {
      const filteredGames = result.data.filter(game => game.level_reached >= level);
      return {
        ...result,
        data: filteredGames
      };
    }
    return result;
  }

  /**
   * Get game analytics data
   */
  async getGameAnalytics(userId?: string): Promise<ApiResponse<any>> {
    const filters: GameFilters = {};
    if (userId) {
      filters.user_id = userId;
    }

    const result = await this.getGames(filters, 1, 1000); // Get a large number for analytics
    
    if (!result.success) {
      return result;
    }

    const games = result.data || [];
    
    // Calculate analytics
    const totalGames = games.length;
    const totalScore = games.reduce((sum, game) => sum + game.score, 0);
    const averageScore = totalGames > 0 ? totalScore / totalGames : 0;
    const bestScore = Math.max(...games.map(game => game.score), 0);
    const totalPlayTime = games.reduce((sum, game) => sum + game.duration, 0);
    const averagePlayTime = totalGames > 0 ? totalPlayTime / totalGames : 0;

    // Score distribution
    const scoreRanges = {
      '0-100': games.filter(g => g.score >= 0 && g.score <= 100).length,
      '101-500': games.filter(g => g.score >= 101 && g.score <= 500).length,
      '501-1000': games.filter(g => g.score >= 501 && g.score <= 1000).length,
      '1001-5000': games.filter(g => g.score >= 1001 && g.score <= 5000).length,
      '5000+': games.filter(g => g.score >= 5001).length,
    };

    // Games by day of week
    const gamesByDay = games.reduce((acc, game) => {
      const day = new Date(game.created_at).toLocaleDateString('en-US', { weekday: 'long' });
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      success: true,
      data: {
        totalGames,
        totalScore,
        averageScore: Math.round(averageScore),
        bestScore,
        totalPlayTime,
        averagePlayTime: Math.round(averagePlayTime),
        scoreRanges,
        gamesByDay,
        recentGames: games.slice(0, 10)
      }
    };
  }

  /**
   * Get leaderboard data
   */
  async getLeaderboard(type = 'all_time', limit = 10): Promise<ApiResponse<any[]>> {
    return await apiClient.getLeaderboard(type, limit);
  }

  /**
   * Start a new game session
   */
  async startGameSession(): Promise<ApiResponse<GameSession>> {
    // This would create a new game session
    // For now, we'll return a mock session
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('session_id', sessionId);
    
    return {
      success: true,
      data: {
        id: sessionId,
        user_id: '', // Will be set when user is authenticated
        session_start: new Date().toISOString(),
        total_games: 0,
        total_score: 0,
        total_duration: 0,
        device_info: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language
        }
      } as GameSession
    };
  }

  /**
   * End a game session
   */
  async endGameSession(sessionId: string): Promise<ApiResponse<void>> {
    // This would update the game session with end time
    sessionStorage.removeItem('session_id');
    
    return { success: true };
  }
}

// Export singleton instance
export const gameService = new GameService();
export default gameService;
