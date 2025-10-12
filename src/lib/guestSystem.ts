// Guest restriction and marketing data collection system
import { supabase } from "@/integrations/supabase/client";

export interface GuestSession {
  id: string;
  playCount: number;
  maxPlays: number;
  lastPlayed: string;
  deviceInfo: DeviceInfo;
  gameData: GameData;
  marketingData: MarketingData;
}

export interface DeviceInfo {
  userAgent: string;
  platform: string;
  language: string;
  timezone: string;
  screenResolution: string;
  isMobile: boolean;
}

export interface GameData {
  totalScore: number;
  highestLevel: number;
  totalPlayTime: number;
  favoriteZuboDesign: any;
  achievements: string[];
  powerUpsUsed: number;
  coinsCollected: number;
}

export interface MarketingData {
  source: string; // 'direct', 'social', 'search', 'referral'
  campaign?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  landingPage: string;
  sessionDuration: number;
  pagesViewed: number;
}

export class GuestSystem {
  private static readonly MAX_GUEST_PLAYS = 3;
  private static readonly STORAGE_KEY = 'zuboplay_guest_session';
  
  // Initialize guest session
  static initializeGuestSession(): GuestSession {
    const existingSession = this.getGuestSession();
    if (existingSession) {
      return existingSession;
    }

    const newSession: GuestSession = {
      id: this.generateSessionId(),
      playCount: 0,
      maxPlays: this.MAX_GUEST_PLAYS,
      lastPlayed: new Date().toISOString(),
      deviceInfo: this.collectDeviceInfo(),
      gameData: {
        totalScore: 0,
        highestLevel: 1,
        totalPlayTime: 0,
        favoriteZuboDesign: null,
        achievements: [],
        powerUpsUsed: 0,
        coinsCollected: 0
      },
      marketingData: this.collectMarketingData()
    };

    this.saveGuestSession(newSession);
    return newSession;
  }

  // Check if guest can play
  static canGuestPlay(): boolean {
    const session = this.getGuestSession();
    return session ? session.playCount < session.maxPlays : true;
  }

  // Increment play count
  static incrementPlayCount(): void {
    const session = this.getGuestSession();
    if (session) {
      session.playCount += 1;
      session.lastPlayed = new Date().toISOString();
      this.saveGuestSession(session);
    }
  }

  // Update game data
  static updateGameData(gameData: Partial<GameData>): void {
    const session = this.getGuestSession();
    if (session) {
      session.gameData = { ...session.gameData, ...gameData };
      this.saveGuestSession(session);
    }
  }

  // Get guest session
  static getGuestSession(): GuestSession | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  // Save guest session
  private static saveGuestSession(session: GuestSession): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('Failed to save guest session:', error);
    }
  }

  // Generate unique session ID
  private static generateSessionId(): string {
    return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Collect device information
  private static collectDeviceInfo(): DeviceInfo {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenResolution: `${screen.width}x${screen.height}`,
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    };
  }

  // Collect marketing data
  private static collectMarketingData(): MarketingData {
    const urlParams = new URLSearchParams(window.location.search);
    const referrer = document.referrer;
    
    return {
      source: this.determineSource(referrer, urlParams),
      campaign: urlParams.get('utm_campaign') || undefined,
      referrer: referrer || undefined,
      utm_source: urlParams.get('utm_source') || undefined,
      utm_medium: urlParams.get('utm_medium') || undefined,
      utm_campaign: urlParams.get('utm_campaign') || undefined,
      landingPage: window.location.pathname,
      sessionDuration: 0,
      pagesViewed: 1
    };
  }

  // Determine traffic source
  private static determineSource(referrer: string, urlParams: URLSearchParams): string {
    if (urlParams.get('utm_source')) return 'utm';
    if (referrer.includes('facebook.com') || referrer.includes('instagram.com')) return 'social';
    if (referrer.includes('google.com') || referrer.includes('bing.com')) return 'search';
    if (referrer) return 'referral';
    return 'direct';
  }

  // Convert guest to user
  static async convertGuestToUser(userId: string): Promise<void> {
    const session = this.getGuestSession();
    if (!session) return;

    try {
      // Save marketing data
      await supabase.from('marketing_data').insert({
        user_id: userId,
        session_id: session.id,
        source: session.marketingData.source,
        campaign: session.marketingData.campaign,
        referrer: session.marketingData.referrer,
        utm_source: session.marketingData.utm_source,
        utm_medium: session.marketingData.utm_medium,
        utm_campaign: session.marketingData.utm_campaign,
        landing_page: session.marketingData.landingPage,
        device_info: session.deviceInfo,
        session_duration: session.marketingData.sessionDuration,
        pages_viewed: session.marketingData.pagesViewed,
        created_at: new Date().toISOString()
      });

      // Save game data
      await supabase.from('user_progress').insert({
        user_id: userId,
        total_score: session.gameData.totalScore,
        highest_level: session.gameData.highestLevel,
        total_play_time: session.gameData.totalPlayTime,
        favorite_zubo_design: session.gameData.favoriteZuboDesign,
        achievements: session.gameData.achievements,
        power_ups_used: session.gameData.powerUpsUsed,
        coins_collected: session.gameData.coinsCollected,
        guest_session_id: session.id,
        created_at: new Date().toISOString()
      });

      // Clear guest session
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to convert guest to user:', error);
    }
  }

  // Get remaining plays
  static getRemainingPlays(): number {
    const session = this.getGuestSession();
    return session ? Math.max(0, session.maxPlays - session.playCount) : this.MAX_GUEST_PLAYS;
  }

  // Check if should show signup prompt
  static shouldShowSignupPrompt(): boolean {
    const session = this.getGuestSession();
    return session ? session.playCount >= session.maxPlays - 1 : false;
  }
}
