// Analytics Service Layer
import { apiClient } from '../api/client';
import type { 
  AnalyticsEvent, 
  AnalyticsFilters, 
  ApiResponse 
} from '../api/types';

export class AnalyticsService {
  /**
   * Track a custom event
   */
  async trackEvent(eventType: string, eventData: Record<string, any> = {}): Promise<ApiResponse<void>> {
    return await apiClient.trackEvent(eventType, eventData);
  }

  /**
   * Track game start event
   */
  async trackGameStart(gameData: Record<string, any> = {}): Promise<ApiResponse<void>> {
    return await this.trackEvent('game_start', {
      timestamp: new Date().toISOString(),
      ...gameData
    });
  }

  /**
   * Track game end event
   */
  async trackGameEnd(gameData: Record<string, any> = {}): Promise<ApiResponse<void>> {
    return await this.trackEvent('game_end', {
      timestamp: new Date().toISOString(),
      ...gameData
    });
  }

  /**
   * Track user registration
   */
  async trackUserRegistration(userData: Record<string, any> = {}): Promise<ApiResponse<void>> {
    return await this.trackEvent('user_registration', {
      timestamp: new Date().toISOString(),
      ...userData
    });
  }

  /**
   * Track user login
   */
  async trackUserLogin(userData: Record<string, any> = {}): Promise<ApiResponse<void>> {
    return await this.trackEvent('user_login', {
      timestamp: new Date().toISOString(),
      ...userData
    });
  }

  /**
   * Track page view
   */
  async trackPageView(page: string, additionalData: Record<string, any> = {}): Promise<ApiResponse<void>> {
    return await this.trackEvent('page_view', {
      page,
      timestamp: new Date().toISOString(),
      ...additionalData
    });
  }

  /**
   * Track button click
   */
  async trackButtonClick(buttonName: string, additionalData: Record<string, any> = {}): Promise<ApiResponse<void>> {
    return await this.trackEvent('button_click', {
      button: buttonName,
      timestamp: new Date().toISOString(),
      ...additionalData
    });
  }

  /**
   * Track feature usage
   */
  async trackFeatureUsage(feature: string, additionalData: Record<string, any> = {}): Promise<ApiResponse<void>> {
    return await this.trackEvent('feature_usage', {
      feature,
      timestamp: new Date().toISOString(),
      ...additionalData
    });
  }

  /**
   * Track error
   */
  async trackError(error: string, errorData: Record<string, any> = {}): Promise<ApiResponse<void>> {
    return await this.trackEvent('error', {
      error,
      timestamp: new Date().toISOString(),
      ...errorData
    });
  }

  /**
   * Track performance metrics
   */
  async trackPerformance(metrics: Record<string, any>): Promise<ApiResponse<void>> {
    return await this.trackEvent('performance', {
      timestamp: new Date().toISOString(),
      ...metrics
    });
  }

  /**
   * Get analytics events with filtering
   */
  async getAnalytics(filters: AnalyticsFilters = {}): Promise<ApiResponse<AnalyticsEvent[]>> {
    return await apiClient.getAnalytics(filters);
  }

  /**
   * Get analytics summary
   */
  async getAnalyticsSummary(
    startDate?: string, 
    endDate?: string
  ): Promise<ApiResponse<any>> {
    const filters: AnalyticsFilters = {};
    if (startDate) filters.date_from = startDate;
    if (endDate) filters.date_to = endDate;

    const result = await this.getAnalytics(filters);
    
    if (!result.success) {
      return result;
    }

    const events = result.data || [];
    
    // Calculate summary statistics
    const eventTypes = events.reduce((acc, event) => {
      acc[event.event_type] = (acc[event.event_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const uniqueUsers = new Set(events.map(e => e.user_id).filter(Boolean)).size;
    const totalEvents = events.length;

    // Events by hour
    const eventsByHour = events.reduce((acc, event) => {
      const hour = new Date(event.created_at).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    // Events by day
    const eventsByDay = events.reduce((acc, event) => {
      const day = new Date(event.created_at).toLocaleDateString();
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      success: true,
      data: {
        totalEvents,
        uniqueUsers,
        eventTypes,
        eventsByHour,
        eventsByDay,
        dateRange: {
          start: startDate,
          end: endDate
        }
      }
    };
  }

  /**
   * Get user behavior analytics
   */
  async getUserBehaviorAnalytics(userId: string): Promise<ApiResponse<any>> {
    const result = await this.getAnalytics({ user_id: userId });
    
    if (!result.success) {
      return result;
    }

    const events = result.data || [];
    
    // Calculate user behavior metrics
    const sessionEvents = events.filter(e => e.event_type === 'game_start' || e.event_type === 'game_end');
    const totalSessions = sessionEvents.filter(e => e.event_type === 'game_start').length;
    
    const pageViews = events.filter(e => e.event_type === 'page_view');
    const uniquePages = new Set(pageViews.map(e => e.event_data?.page)).size;
    
    const featureUsage = events.filter(e => e.event_type === 'feature_usage');
    const featuresUsed = new Set(featureUsage.map(e => e.event_data?.feature)).size;

    return {
      success: true,
      data: {
        totalEvents: events.length,
        totalSessions,
        uniquePages,
        featuresUsed,
        recentActivity: events.slice(0, 10)
      }
    };
  }

  /**
   * Get conversion funnel analytics
   */
  async getConversionFunnel(): Promise<ApiResponse<any>> {
    const result = await this.getAnalytics({});
    
    if (!result.success) {
      return result;
    }

    const events = result.data || [];
    
    // Calculate conversion funnel
    const pageViews = events.filter(e => e.event_type === 'page_view').length;
    const userRegistrations = events.filter(e => e.event_type === 'user_registration').length;
    const gameStarts = events.filter(e => e.event_type === 'game_start').length;
    const gameEnds = events.filter(e => e.event_type === 'game_end').length;

    const conversionRates = {
      registration: pageViews > 0 ? (userRegistrations / pageViews) * 100 : 0,
      gameStart: userRegistrations > 0 ? (gameStarts / userRegistrations) * 100 : 0,
      gameCompletion: gameStarts > 0 ? (gameEnds / gameStarts) * 100 : 0
    };

    return {
      success: true,
      data: {
        funnel: {
          pageViews,
          userRegistrations,
          gameStarts,
          gameEnds
        },
        conversionRates
      }
    };
  }

  /**
   * Get real-time analytics
   */
  async getRealTimeAnalytics(): Promise<ApiResponse<any>> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const result = await this.getAnalytics({
      date_from: oneHourAgo.toISOString(),
      date_to: now.toISOString()
    });
    
    if (!result.success) {
      return result;
    }

    const events = result.data || [];
    
    return {
      success: true,
      data: {
        eventsLastHour: events.length,
        activeUsers: new Set(events.map(e => e.user_id).filter(Boolean)).size,
        topEvents: this.getTopEvents(events),
        recentEvents: events.slice(0, 5)
      }
    };
  }

  /**
   * Helper method to get top events
   */
  private getTopEvents(events: AnalyticsEvent[]): Record<string, number> {
    return events.reduce((acc, event) => {
      acc[event.event_type] = (acc[event.event_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
export default analyticsService;
