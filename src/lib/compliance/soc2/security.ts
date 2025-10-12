// SOC 2 Security Controls for ZuboPlay
import { logger } from '../../logging/logger';
import { ErrorHandler, ErrorCode } from '../../errors/errorHandler';

export interface SecurityEvent {
  id: string;
  timestamp: string;
  eventType: 'login' | 'logout' | 'access_denied' | 'privilege_escalation' | 'data_access' | 'configuration_change';
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface AccessControl {
  userId: string;
  resource: string;
  permission: 'read' | 'write' | 'delete' | 'admin';
  grantedAt: string;
  grantedBy: string;
  expiresAt?: string;
  isActive: boolean;
}

export interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  category: 'access_control' | 'data_protection' | 'incident_response' | 'system_monitoring';
  rules: SecurityRule[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SecurityRule {
  id: string;
  condition: string;
  action: 'allow' | 'deny' | 'alert' | 'block';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

export class SecurityControls {
  private securityEvents: SecurityEvent[] = [];
  private accessControls: AccessControl[] = [];
  private securityPolicies: SecurityPolicy[] = [];

  /**
   * Log security event
   */
  async logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): Promise<void> {
    const securityEvent: SecurityEvent = {
      id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...event
    };

    this.securityEvents.push(securityEvent);
    
    // Log to system logger
    logger.logSecurity(event.eventType, event.severity, event.details, event.userId, event.ipAddress);

    // Alert on critical events
    if (event.severity === 'critical') {
      await this.handleCriticalSecurityEvent(securityEvent);
    }
  }

  /**
   * Handle critical security events
   */
  private async handleCriticalSecurityEvent(event: SecurityEvent): Promise<void> {
    logger.fatal('Critical security event detected', {
      eventId: event.id,
      eventType: event.eventType,
      userId: event.userId,
      ipAddress: event.ipAddress,
      details: event.details
    });

    // In a real implementation, you would:
    // 1. Send alerts to security team
    // 2. Block suspicious IPs
    // 3. Disable compromised accounts
    // 4. Trigger incident response procedures
  }

  /**
   * Check user access permissions
   */
  async checkAccess(userId: string, resource: string, permission: string): Promise<boolean> {
    const accessControl = this.accessControls.find(
      ac => ac.userId === userId && 
            ac.resource === resource && 
            ac.permission === permission && 
            ac.isActive &&
            (!ac.expiresAt || new Date(ac.expiresAt) > new Date())
    );

    if (!accessControl) {
      await this.logSecurityEvent({
        eventType: 'access_denied',
        userId,
        details: { resource, permission },
        severity: 'medium'
      });
      return false;
    }

    await this.logSecurityEvent({
      eventType: 'data_access',
      userId,
      details: { resource, permission },
      severity: 'low'
    });

    return true;
  }

  /**
   * Grant access to user
   */
  async grantAccess(
    userId: string, 
    resource: string, 
    permission: string, 
    grantedBy: string,
    expiresAt?: string
  ): Promise<void> {
    const accessControl: AccessControl = {
      userId,
      resource,
      permission: permission as any,
      grantedAt: new Date().toISOString(),
      grantedBy,
      expiresAt,
      isActive: true
    };

    this.accessControls.push(accessControl);

    await this.logSecurityEvent({
      eventType: 'configuration_change',
      userId: grantedBy,
      details: { 
        action: 'grant_access',
        targetUser: userId,
        resource,
        permission
      },
      severity: 'medium'
    });
  }

  /**
   * Revoke access from user
   */
  async revokeAccess(userId: string, resource: string, revokedBy: string): Promise<void> {
    const accessControl = this.accessControls.find(
      ac => ac.userId === userId && ac.resource === resource && ac.isActive
    );

    if (accessControl) {
      accessControl.isActive = false;

      await this.logSecurityEvent({
        eventType: 'configuration_change',
        userId: revokedBy,
        details: { 
          action: 'revoke_access',
          targetUser: userId,
          resource
        },
        severity: 'medium'
      });
    }
  }

  /**
   * Validate password strength
   */
  validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    requirements: string[];
  } {
    const requirements: string[] = [];
    let score = 0;

    // Length requirement
    if (password.length >= 8) {
      score += 1;
    } else {
      requirements.push('Password must be at least 8 characters long');
    }

    // Uppercase requirement
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      requirements.push('Password must contain at least one uppercase letter');
    }

    // Lowercase requirement
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      requirements.push('Password must contain at least one lowercase letter');
    }

    // Number requirement
    if (/\d/.test(password)) {
      score += 1;
    } else {
      requirements.push('Password must contain at least one number');
    }

    // Special character requirement
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
    } else {
      requirements.push('Password must contain at least one special character');
    }

    // Complexity requirement
    if (password.length >= 12 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
    }

    return {
      isValid: requirements.length === 0,
      score,
      requirements
    };
  }

  /**
   * Check for suspicious login patterns
   */
  async checkSuspiciousLogin(userId: string, ipAddress: string, userAgent: string): Promise<{
    isSuspicious: boolean;
    reasons: string[];
  } {
    const reasons: string[] = [];
    
    // Check for multiple failed login attempts
    const recentFailedAttempts = this.securityEvents.filter(
      event => event.eventType === 'access_denied' && 
               event.userId === userId && 
               new Date(event.timestamp) > new Date(Date.now() - 15 * 60 * 1000) // Last 15 minutes
    );

    if (recentFailedAttempts.length >= 5) {
      reasons.push('Multiple failed login attempts');
    }

    // Check for unusual IP address
    const userLoginHistory = this.securityEvents.filter(
      event => event.eventType === 'login' && event.userId === userId
    );

    const uniqueIPs = new Set(userLoginHistory.map(event => event.ipAddress));
    if (uniqueIPs.size > 10) {
      reasons.push('Login from unusual IP address');
    }

    // Check for unusual user agent
    const userAgents = userLoginHistory.map(event => event.userAgent);
    const currentUserAgent = userAgent;
    if (userAgents.length > 0 && !userAgents.includes(currentUserAgent)) {
      reasons.push('Login with unusual user agent');
    }

    return {
      isSuspicious: reasons.length > 0,
      reasons
    };
  }

  /**
   * Implement account lockout policy
   */
  async handleAccountLockout(userId: string, reason: string): Promise<void> {
    await this.logSecurityEvent({
      eventType: 'access_denied',
      userId,
      details: { 
        action: 'account_lockout',
        reason
      },
      severity: 'high'
    });

    // In a real implementation, you would:
    // 1. Lock the user account
    // 2. Send notification to user
    // 3. Alert security team
    // 4. Log the incident
  }

  /**
   * Monitor data access patterns
   */
  async monitorDataAccess(userId: string, resource: string, action: string): Promise<void> {
    const recentAccess = this.securityEvents.filter(
      event => event.eventType === 'data_access' && 
               event.userId === userId && 
               new Date(event.timestamp) > new Date(Date.now() - 60 * 60 * 1000) // Last hour
    );

    // Check for excessive data access
    if (recentAccess.length > 100) {
      await this.logSecurityEvent({
        eventType: 'data_access',
        userId,
        details: { 
          resource,
          action,
          warning: 'excessive_data_access',
          accessCount: recentAccess.length
        },
        severity: 'high'
      });
    }
  }

  /**
   * Implement data encryption controls
   */
  async encryptSensitiveData(data: string, keyId: string): Promise<string> {
    // In a real implementation, you would use proper encryption
    // For now, we'll simulate encryption
    const encrypted = Buffer.from(data).toString('base64');
    
    await this.logSecurityEvent({
      eventType: 'configuration_change',
      details: { 
        action: 'data_encryption',
        keyId,
        dataLength: data.length
      },
      severity: 'low'
    });

    return encrypted;
  }

  /**
   * Implement data decryption controls
   */
  async decryptSensitiveData(encryptedData: string, keyId: string, userId: string): Promise<string> {
    // In a real implementation, you would use proper decryption
    // For now, we'll simulate decryption
    const decrypted = Buffer.from(encryptedData, 'base64').toString();
    
    await this.logSecurityEvent({
      eventType: 'data_access',
      userId,
      details: { 
        action: 'data_decryption',
        keyId,
        dataLength: decrypted.length
      },
      severity: 'low'
    });

    return decrypted;
  }

  /**
   * Generate security report
   */
  async generateSecurityReport(startDate: string, endDate: string): Promise<{
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsBySeverity: Record<string, number>;
    topUsers: Array<{ userId: string; eventCount: number }>;
    criticalEvents: SecurityEvent[];
  }> {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const eventsInRange = this.securityEvents.filter(
      event => new Date(event.timestamp) >= start && new Date(event.timestamp) <= end
    );

    const eventsByType = eventsInRange.reduce((acc, event) => {
      acc[event.eventType] = (acc[event.eventType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const eventsBySeverity = eventsInRange.reduce((acc, event) => {
      acc[event.severity] = (acc[event.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const userEventCounts = eventsInRange.reduce((acc, event) => {
      if (event.userId) {
        acc[event.userId] = (acc[event.userId] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const topUsers = Object.entries(userEventCounts)
      .map(([userId, eventCount]) => ({ userId, eventCount }))
      .sort((a, b) => b.eventCount - a.eventCount)
      .slice(0, 10);

    const criticalEvents = eventsInRange.filter(event => event.severity === 'critical');

    return {
      totalEvents: eventsInRange.length,
      eventsByType,
      eventsBySeverity,
      topUsers,
      criticalEvents
    };
  }

  /**
   * Get security events
   */
  getSecurityEvents(filters?: {
    userId?: string;
    eventType?: string;
    severity?: string;
    startDate?: string;
    endDate?: string;
  }): SecurityEvent[] {
    let events = [...this.securityEvents];

    if (filters) {
      if (filters.userId) {
        events = events.filter(event => event.userId === filters.userId);
      }
      if (filters.eventType) {
        events = events.filter(event => event.eventType === filters.eventType);
      }
      if (filters.severity) {
        events = events.filter(event => event.severity === filters.severity);
      }
      if (filters.startDate) {
        events = events.filter(event => new Date(event.timestamp) >= new Date(filters.startDate!));
      }
      if (filters.endDate) {
        events = events.filter(event => new Date(event.timestamp) <= new Date(filters.endDate!));
      }
    }

    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}

// Export singleton instance
export const securityControls = new SecurityControls();
export default securityControls;
