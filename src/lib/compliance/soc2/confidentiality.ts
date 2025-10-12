// SOC 2 Confidentiality Controls for ZuboPlay
import { logger } from '../../logging/logger';

export interface ConfidentialityEvent {
  id: string;
  timestamp: string;
  eventType: 'data_access' | 'data_export' | 'data_import' | 'data_encryption' | 'data_decryption' | 'access_granted' | 'access_revoked';
  userId: string;
  resource: string;
  dataType: 'personal' | 'financial' | 'health' | 'business' | 'technical';
  sensitivity: 'public' | 'internal' | 'confidential' | 'restricted';
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface DataClassification {
  id: string;
  resource: string;
  dataType: 'personal' | 'financial' | 'health' | 'business' | 'technical';
  sensitivity: 'public' | 'internal' | 'confidential' | 'restricted';
  classificationDate: string;
  classifiedBy: string;
  reviewDate: string;
  isActive: boolean;
}

export interface AccessControl {
  id: string;
  userId: string;
  resource: string;
  permission: 'read' | 'write' | 'delete' | 'admin';
  grantedBy: string;
  grantedAt: string;
  expiresAt?: string;
  isActive: boolean;
  justification: string;
}

export interface DataRetention {
  id: string;
  resource: string;
  dataType: string;
  retentionPeriod: number; // in days
  retentionPolicy: string;
  autoDelete: boolean;
  lastReview: string;
  nextReview: string;
  isActive: boolean;
}

export interface EncryptionKey {
  id: string;
  name: string;
  algorithm: string;
  keySize: number;
  status: 'active' | 'inactive' | 'expired' | 'compromised';
  createdAt: string;
  expiresAt?: string;
  rotationDate?: string;
  usage: string[];
}

export class ConfidentialityControls {
  private events: ConfidentialityEvent[] = [];
  private classifications: DataClassification[] = [];
  private accessControls: AccessControl[] = [];
  private retentionPolicies: DataRetention[] = [];
  private encryptionKeys: EncryptionKey[] = [];

  /**
   * Log confidentiality event
   */
  async logConfidentialityEvent(event: Omit<ConfidentialityEvent, 'id' | 'timestamp'>): Promise<void> {
    const confidentialityEvent: ConfidentialityEvent = {
      id: `conf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...event
    };

    this.events.push(confidentialityEvent);

    logger.logSecurity('confidentiality_event', event.sensitivity, {
      eventType: event.eventType,
      userId: event.userId,
      resource: event.resource,
      dataType: event.dataType,
      sensitivity: event.sensitivity,
      details: event.details
    }, event.userId, event.ipAddress);

    // Alert on high-sensitivity data access
    if (event.sensitivity === 'restricted' || event.sensitivity === 'confidential') {
      await this.handleHighSensitivityAccess(confidentialityEvent);
    }
  }

  /**
   * Handle high sensitivity data access
   */
  private async handleHighSensitivityAccess(event: ConfidentialityEvent): Promise<void> {
    logger.warn('High sensitivity data access detected', {
      eventId: event.id,
      userId: event.userId,
      resource: event.resource,
      dataType: event.dataType,
      sensitivity: event.sensitivity,
      eventType: event.eventType
    });

    // In a real implementation, you would:
    // 1. Send alerts to security team
    // 2. Require additional authentication
    // 3. Log detailed audit trail
    // 4. Trigger compliance reviews
  }

  /**
   * Classify data resource
   */
  async classifyData(
    resource: string,
    dataType: 'personal' | 'financial' | 'health' | 'business' | 'technical',
    sensitivity: 'public' | 'internal' | 'confidential' | 'restricted',
    classifiedBy: string
  ): Promise<DataClassification> {
    const classification: DataClassification = {
      id: `class_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      resource,
      dataType,
      sensitivity,
      classificationDate: new Date().toISOString(),
      classifiedBy,
      reviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
      isActive: true
    };

    this.classifications.push(classification);

    await this.logConfidentialityEvent({
      eventType: 'data_access',
      userId: classifiedBy,
      resource,
      dataType,
      sensitivity,
      details: { action: 'data_classification', classificationId: classification.id }
    });

    logger.info('Data resource classified', {
      classificationId: classification.id,
      resource,
      dataType,
      sensitivity,
      classifiedBy
    });

    return classification;
  }

  /**
   * Get data classification
   */
  getDataClassification(resource: string): DataClassification | null {
    return this.classifications.find(c => c.resource === resource && c.isActive) || null;
  }

  /**
   * Grant access to resource
   */
  async grantAccess(
    userId: string,
    resource: string,
    permission: string,
    grantedBy: string,
    justification: string,
    expiresAt?: string
  ): Promise<AccessControl> {
    const accessControl: AccessControl = {
      id: `access_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      resource,
      permission: permission as any,
      grantedBy,
      grantedAt: new Date().toISOString(),
      expiresAt,
      isActive: true,
      justification
    };

    this.accessControls.push(accessControl);

    await this.logConfidentialityEvent({
      eventType: 'access_granted',
      userId: grantedBy,
      resource,
      dataType: 'business',
      sensitivity: 'internal',
      details: {
        action: 'access_granted',
        targetUser: userId,
        permission,
        justification
      }
    });

    logger.info('Access granted to resource', {
      accessControlId: accessControl.id,
      userId,
      resource,
      permission,
      grantedBy,
      justification
    });

    return accessControl;
  }

  /**
   * Revoke access to resource
   */
  async revokeAccess(userId: string, resource: string, revokedBy: string): Promise<boolean> {
    const accessControl = this.accessControls.find(
      ac => ac.userId === userId && ac.resource === resource && ac.isActive
    );

    if (!accessControl) {
      return false;
    }

    accessControl.isActive = false;

    await this.logConfidentialityEvent({
      eventType: 'access_revoked',
      userId: revokedBy,
      resource,
      dataType: 'business',
      sensitivity: 'internal',
      details: {
        action: 'access_revoked',
        targetUser: userId,
        originalGrantedBy: accessControl.grantedBy
      }
    });

    logger.info('Access revoked from resource', {
      accessControlId: accessControl.id,
      userId,
      resource,
      revokedBy
    });

    return true;
  }

  /**
   * Check user access to resource
   */
  async checkAccess(userId: string, resource: string, permission: string): Promise<{
    hasAccess: boolean;
    accessLevel: string;
    expiresAt?: string;
  }> {
    const classification = this.getDataClassification(resource);
    const accessControl = this.accessControls.find(
      ac => ac.userId === userId && 
            ac.resource === resource && 
            ac.permission === permission && 
            ac.isActive &&
            (!ac.expiresAt || new Date(ac.expiresAt) > new Date())
    );

    const hasAccess = !!accessControl;
    const accessLevel = classification?.sensitivity || 'public';

    if (hasAccess) {
      await this.logConfidentialityEvent({
        eventType: 'data_access',
        userId,
        resource,
        dataType: classification?.dataType || 'business',
        sensitivity: accessLevel as any,
        details: {
          action: 'data_access_check',
          permission,
          accessLevel
        }
      });
    }

    return {
      hasAccess,
      accessLevel,
      expiresAt: accessControl?.expiresAt
    };
  }

  /**
   * Create data retention policy
   */
  async createRetentionPolicy(
    resource: string,
    dataType: string,
    retentionPeriod: number,
    retentionPolicy: string,
    autoDelete: boolean = false
  ): Promise<DataRetention> {
    const retention: DataRetention = {
      id: `retention_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      resource,
      dataType,
      retentionPeriod,
      retentionPolicy,
      autoDelete,
      lastReview: new Date().toISOString(),
      nextReview: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
      isActive: true
    };

    this.retentionPolicies.push(retention);

    logger.info('Data retention policy created', {
      retentionId: retention.id,
      resource,
      dataType,
      retentionPeriod,
      autoDelete
    });

    return retention;
  }

  /**
   * Check data retention compliance
   */
  async checkRetentionCompliance(): Promise<{
    compliant: boolean;
    violations: string[];
    recommendations: string[];
  }> {
    const violations: string[] = [];
    const recommendations: string[] = [];

    // Check for expired data
    const now = new Date();
    for (const policy of this.retentionPolicies) {
      if (policy.isActive && policy.autoDelete) {
        const expirationDate = new Date(policy.lastReview);
        expirationDate.setDate(expirationDate.getDate() + policy.retentionPeriod);
        
        if (now > expirationDate) {
          violations.push(`Data retention policy violated for ${policy.resource}: data should have been deleted`);
        }
      }
    }

    // Check for overdue reviews
    for (const policy of this.retentionPolicies) {
      if (policy.isActive && new Date(policy.nextReview) < now) {
        violations.push(`Retention policy review overdue for ${policy.resource}`);
      }
    }

    // Generate recommendations
    if (violations.length > 0) {
      recommendations.push('Review and update data retention policies');
      recommendations.push('Implement automated data deletion processes');
    }

    const compliant = violations.length === 0;

    return {
      compliant,
      violations,
      recommendations
    };
  }

  /**
   * Create encryption key
   */
  async createEncryptionKey(
    name: string,
    algorithm: string,
    keySize: number,
    usage: string[]
  ): Promise<EncryptionKey> {
    const key: EncryptionKey = {
      id: `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      algorithm,
      keySize,
      status: 'active',
      createdAt: new Date().toISOString(),
      usage
    };

    this.encryptionKeys.push(key);

    await this.logConfidentialityEvent({
      eventType: 'data_encryption',
      userId: 'system',
      resource: 'encryption_key',
      dataType: 'technical',
      sensitivity: 'confidential',
      details: {
        action: 'encryption_key_created',
        keyId: key.id,
        algorithm,
        keySize
      }
    });

    logger.info('Encryption key created', {
      keyId: key.id,
      name,
      algorithm,
      keySize,
      usage
    });

    return key;
  }

  /**
   * Rotate encryption key
   */
  async rotateEncryptionKey(keyId: string, newKey: EncryptionKey): Promise<boolean> {
    const key = this.encryptionKeys.find(k => k.id === keyId);
    if (!key) {
      return false;
    }

    key.status = 'inactive';
    key.rotationDate = new Date().toISOString();

    this.encryptionKeys.push(newKey);

    await this.logConfidentialityEvent({
      eventType: 'data_encryption',
      userId: 'system',
      resource: 'encryption_key',
      dataType: 'technical',
      sensitivity: 'confidential',
      details: {
        action: 'encryption_key_rotated',
        oldKeyId: keyId,
        newKeyId: newKey.id
      }
    });

    logger.info('Encryption key rotated', {
      oldKeyId: keyId,
      newKeyId: newKey.id,
      algorithm: newKey.algorithm,
      keySize: newKey.keySize
    });

    return true;
  }

  /**
   * Get confidentiality report
   */
  async getConfidentialityReport(startDate: string, endDate: string): Promise<{
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsBySensitivity: Record<string, number>;
    accessControls: number;
    retentionPolicies: number;
    encryptionKeys: number;
    complianceScore: number;
    recommendations: string[];
  }> {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const eventsInRange = this.events.filter(
      event => new Date(event.timestamp) >= start && new Date(event.timestamp) <= end
    );

    const eventsByType = eventsInRange.reduce((acc, event) => {
      acc[event.eventType] = (acc[event.eventType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const eventsBySensitivity = eventsInRange.reduce((acc, event) => {
      acc[event.sensitivity] = (acc[event.sensitivity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const activeAccessControls = this.accessControls.filter(ac => ac.isActive).length;
    const activeRetentionPolicies = this.retentionPolicies.filter(rp => rp.isActive).length;
    const activeEncryptionKeys = this.encryptionKeys.filter(ek => ek.status === 'active').length;

    // Calculate compliance score
    const retentionCompliance = await this.checkRetentionCompliance();
    const complianceScore = retentionCompliance.compliant ? 100 : 75;

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (eventsBySensitivity['restricted'] > 0) {
      recommendations.push('Monitor restricted data access more closely');
    }
    
    if (eventsBySensitivity['confidential'] > 0) {
      recommendations.push('Review confidential data access patterns');
    }
    
    if (!retentionCompliance.compliant) {
      recommendations.push('Address data retention policy violations');
    }
    
    if (activeEncryptionKeys === 0) {
      recommendations.push('Implement encryption for sensitive data');
    }

    return {
      totalEvents: eventsInRange.length,
      eventsByType,
      eventsBySensitivity,
      accessControls: activeAccessControls,
      retentionPolicies: activeRetentionPolicies,
      encryptionKeys: activeEncryptionKeys,
      complianceScore,
      recommendations
    };
  }

  /**
   * Get access controls for user
   */
  getUserAccessControls(userId: string): AccessControl[] {
    return this.accessControls.filter(ac => ac.userId === userId && ac.isActive);
  }

  /**
   * Get all access controls
   */
  getAllAccessControls(): AccessControl[] {
    return [...this.accessControls];
  }

  /**
   * Get encryption keys
   */
  getEncryptionKeys(): EncryptionKey[] {
    return [...this.encryptionKeys];
  }

  /**
   * Get retention policies
   */
  getRetentionPolicies(): DataRetention[] {
    return [...this.retentionPolicies];
  }
}

// Export singleton instance
export const confidentialityControls = new ConfidentialityControls();
export default confidentialityControls;
