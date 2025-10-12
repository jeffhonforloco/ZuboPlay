// SOC 2 Processing Integrity Controls for ZuboPlay
import { logger } from '../../logging/logger';

export interface ProcessingAudit {
  id: string;
  timestamp: string;
  userId: string;
  action: string;
  resource: string;
  beforeState: Record<string, any>;
  afterState: Record<string, any>;
  changes: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

export interface DataIntegrityCheck {
  id: string;
  timestamp: string;
  table: string;
  recordId: string;
  checksum: string;
  status: 'valid' | 'invalid' | 'corrupted';
  details: Record<string, any>;
}

export interface ProcessingRule {
  id: string;
  name: string;
  description: string;
  condition: string;
  action: 'allow' | 'deny' | 'alert' | 'transform';
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DataValidation {
  id: string;
  field: string;
  value: any;
  validationType: 'format' | 'range' | 'required' | 'custom';
  isValid: boolean;
  errorMessage?: string;
  timestamp: string;
}

export interface ProcessingMetrics {
  id: string;
  timestamp: string;
  operation: string;
  duration: number;
  success: boolean;
  errorRate: number;
  throughput: number;
  resourceUsage: {
    cpu: number;
    memory: number;
    disk: number;
  };
}

export class ProcessingIntegrityControls {
  private audits: ProcessingAudit[] = [];
  private integrityChecks: DataIntegrityCheck[] = [];
  private processingRules: ProcessingRule[] = [];
  private validations: DataValidation[] = [];
  private metrics: ProcessingMetrics[] = [];

  /**
   * Record processing audit
   */
  async recordAudit(audit: Omit<ProcessingAudit, 'id' | 'timestamp'>): Promise<void> {
    const processingAudit: ProcessingAudit = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...audit
    };

    this.audits.push(processingAudit);

    logger.info('Processing audit recorded', {
      auditId: processingAudit.id,
      userId: processingAudit.userId,
      action: processingAudit.action,
      resource: processingAudit.resource,
      changes: Object.keys(processingAudit.changes).length
    });
  }

  /**
   * Validate data integrity
   */
  async validateDataIntegrity(table: string, recordId: string, data: Record<string, any>): Promise<DataIntegrityCheck> {
    const checksum = this.calculateChecksum(data);
    
    const integrityCheck: DataIntegrityCheck = {
      id: `integrity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      table,
      recordId,
      checksum,
      status: 'valid', // In a real implementation, you would compare with stored checksum
      details: {
        dataSize: JSON.stringify(data).length,
        fieldCount: Object.keys(data).length,
        validationRules: this.getValidationRules(table)
      }
    };

    this.integrityChecks.push(integrityCheck);

    if (integrityCheck.status === 'invalid') {
      logger.error('Data integrity check failed', {
        table,
        recordId,
        checksum,
        details: integrityCheck.details
      });
    }

    return integrityCheck;
  }

  /**
   * Calculate data checksum
   */
  private calculateChecksum(data: Record<string, any>): string {
    const dataString = JSON.stringify(data, Object.keys(data).sort());
    let hash = 0;
    
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(16);
  }

  /**
   * Get validation rules for table
   */
  private getValidationRules(table: string): string[] {
    const rules: Record<string, string[]> = {
      profiles: ['username:required,min:3,max:20', 'email:required,email', 'role:required,enum:user,admin,moderator'],
      games: ['score:required,min:0', 'duration:required,min:0', 'user_id:required,uuid'],
      zubo_designs: ['name:required,min:1,max:50', 'design_data:required,object', 'user_id:required,uuid']
    };
    
    return rules[table] || [];
  }

  /**
   * Validate data against rules
   */
  async validateData(field: string, value: any, validationType: string): Promise<DataValidation> {
    const validation: DataValidation = {
      id: `validation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      field,
      value,
      validationType: validationType as any,
      isValid: true,
      timestamp: new Date().toISOString()
    };

    // Perform validation based on type
    switch (validationType) {
      case 'required':
        validation.isValid = value !== null && value !== undefined && value !== '';
        if (!validation.isValid) {
          validation.errorMessage = 'Field is required';
        }
        break;
        
      case 'email':
        validation.isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        if (!validation.isValid) {
          validation.errorMessage = 'Invalid email format';
        }
        break;
        
      case 'min':
        const minValue = parseInt(validationType.split(':')[1]);
        validation.isValid = typeof value === 'number' ? value >= minValue : value.length >= minValue;
        if (!validation.isValid) {
          validation.errorMessage = `Value must be at least ${minValue}`;
        }
        break;
        
      case 'max':
        const maxValue = parseInt(validationType.split(':')[1]);
        validation.isValid = typeof value === 'number' ? value <= maxValue : value.length <= maxValue;
        if (!validation.isValid) {
          validation.errorMessage = `Value must be no more than ${maxValue}`;
        }
        break;
        
      case 'uuid':
        validation.isValid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
        if (!validation.isValid) {
          validation.errorMessage = 'Invalid UUID format';
        }
        break;
        
      default:
        validation.isValid = true;
    }

    this.validations.push(validation);

    if (!validation.isValid) {
      logger.warn('Data validation failed', {
        field,
        value,
        validationType,
        errorMessage: validation.errorMessage
      });
    }

    return validation;
  }

  /**
   * Record processing metrics
   */
  async recordProcessingMetrics(metrics: Omit<ProcessingMetrics, 'id' | 'timestamp'>): Promise<void> {
    const processingMetrics: ProcessingMetrics = {
      id: `metrics_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...metrics
    };

    this.metrics.push(processingMetrics);

    logger.logPerformance('processing_metrics', metrics.duration, 'ms', {
      operation: metrics.operation,
      success: metrics.success,
      errorRate: metrics.errorRate,
      throughput: metrics.throughput
    });
  }

  /**
   * Create processing rule
   */
  async createProcessingRule(rule: Omit<ProcessingRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProcessingRule> {
    const processingRule: ProcessingRule = {
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...rule
    };

    this.processingRules.push(processingRule);

    logger.info('Processing rule created', {
      ruleId: processingRule.id,
      name: processingRule.name,
      condition: processingRule.condition,
      action: processingRule.action,
      priority: processingRule.priority
    });

    return processingRule;
  }

  /**
   * Apply processing rules
   */
  async applyProcessingRules(data: Record<string, any>, context: Record<string, any>): Promise<{
    allowed: boolean;
    transformed: Record<string, any>;
    alerts: string[];
  }> {
    const activeRules = this.processingRules
      .filter(rule => rule.isActive)
      .sort((a, b) => b.priority - a.priority);

    let allowed = true;
    let transformed = { ...data };
    const alerts: string[] = [];

    for (const rule of activeRules) {
      try {
        // Evaluate rule condition
        const conditionMet = this.evaluateCondition(rule.condition, { data, context });
        
        if (conditionMet) {
          switch (rule.action) {
            case 'allow':
              allowed = true;
              break;
              
            case 'deny':
              allowed = false;
              break;
              
            case 'alert':
              alerts.push(`Rule ${rule.name}: ${rule.description}`);
              break;
              
            case 'transform':
              transformed = this.applyTransformation(transformed, rule.condition);
              break;
          }
        }
      } catch (error) {
        logger.error('Error applying processing rule', {
          ruleId: rule.id,
          ruleName: rule.name,
          error: (error as Error).message
        });
      }
    }

    return { allowed, transformed, alerts };
  }

  /**
   * Evaluate rule condition
   */
  private evaluateCondition(condition: string, context: Record<string, any>): boolean {
    // Simple condition evaluation
    // In a real implementation, you would use a proper expression evaluator
    try {
      // Replace variables in condition with actual values
      let evaluatedCondition = condition;
      for (const [key, value] of Object.entries(context)) {
        evaluatedCondition = evaluatedCondition.replace(new RegExp(`\\$${key}`, 'g'), JSON.stringify(value));
      }
      
      // Evaluate the condition (simplified)
      return eval(evaluatedCondition);
    } catch (error) {
      logger.error('Error evaluating condition', {
        condition,
        context,
        error: (error as Error).message
      });
      return false;
    }
  }

  /**
   * Apply data transformation
   */
  private applyTransformation(data: Record<string, any>, transformation: string): Record<string, any> {
    // Simple transformation logic
    // In a real implementation, you would use a proper transformation engine
    const transformed = { ...data };
    
    if (transformation.includes('uppercase')) {
      for (const [key, value] of Object.entries(transformed)) {
        if (typeof value === 'string') {
          transformed[key] = value.toUpperCase();
        }
      }
    }
    
    if (transformation.includes('trim')) {
      for (const [key, value] of Object.entries(transformed)) {
        if (typeof value === 'string') {
          transformed[key] = value.trim();
        }
      }
    }
    
    return transformed;
  }

  /**
   * Get processing integrity report
   */
  async getProcessingIntegrityReport(startDate: string, endDate: string): Promise<{
    totalAudits: number;
    integrityChecks: number;
    validIntegrityChecks: number;
    invalidIntegrityChecks: number;
    validationFailures: number;
    processingMetrics: ProcessingMetrics[];
    recommendations: string[];
  }> {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const auditsInRange = this.audits.filter(
      audit => new Date(audit.timestamp) >= start && new Date(audit.timestamp) <= end
    );

    const integrityChecksInRange = this.integrityChecks.filter(
      check => new Date(check.timestamp) >= start && new Date(check.timestamp) <= end
    );

    const validationsInRange = this.validations.filter(
      validation => new Date(validation.timestamp) >= start && new Date(validation.timestamp) <= end
    );

    const metricsInRange = this.metrics.filter(
      metric => new Date(metric.timestamp) >= start && new Date(metric.timestamp) <= end
    );

    const validIntegrityChecks = integrityChecksInRange.filter(check => check.status === 'valid').length;
    const invalidIntegrityChecks = integrityChecksInRange.filter(check => check.status === 'invalid').length;
    const validationFailures = validationsInRange.filter(validation => !validation.isValid).length;

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (invalidIntegrityChecks > 0) {
      recommendations.push(`${invalidIntegrityChecks} data integrity checks failed. Review data validation processes.`);
    }
    
    if (validationFailures > 0) {
      recommendations.push(`${validationFailures} data validation failures occurred. Review input validation rules.`);
    }
    
    const failedOperations = metricsInRange.filter(metric => !metric.success).length;
    if (failedOperations > 0) {
      recommendations.push(`${failedOperations} processing operations failed. Review error handling and retry mechanisms.`);
    }

    return {
      totalAudits: auditsInRange.length,
      integrityChecks: integrityChecksInRange.length,
      validIntegrityChecks,
      invalidIntegrityChecks,
      validationFailures,
      processingMetrics: metricsInRange,
      recommendations
    };
  }

  /**
   * Get audit trail
   */
  getAuditTrail(filters?: {
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: string;
    endDate?: string;
  }): ProcessingAudit[] {
    let audits = [...this.audits];

    if (filters) {
      if (filters.userId) {
        audits = audits.filter(audit => audit.userId === filters.userId);
      }
      if (filters.action) {
        audits = audits.filter(audit => audit.action === filters.action);
      }
      if (filters.resource) {
        audits = audits.filter(audit => audit.resource === filters.resource);
      }
      if (filters.startDate) {
        audits = audits.filter(audit => new Date(audit.timestamp) >= new Date(filters.startDate!));
      }
      if (filters.endDate) {
        audits = audits.filter(audit => new Date(audit.timestamp) <= new Date(filters.endDate!));
      }
    }

    return audits.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Get processing rules
   */
  getProcessingRules(): ProcessingRule[] {
    return [...this.processingRules];
  }

  /**
   * Update processing rule
   */
  async updateProcessingRule(ruleId: string, updates: Partial<ProcessingRule>): Promise<ProcessingRule | null> {
    const rule = this.processingRules.find(r => r.id === ruleId);
    if (!rule) {
      return null;
    }

    Object.assign(rule, updates, { updatedAt: new Date().toISOString() });

    logger.info('Processing rule updated', {
      ruleId: rule.id,
      name: rule.name,
      updates
    });

    return rule;
  }

  /**
   * Delete processing rule
   */
  async deleteProcessingRule(ruleId: string): Promise<boolean> {
    const index = this.processingRules.findIndex(r => r.id === ruleId);
    if (index === -1) {
      return false;
    }

    this.processingRules.splice(index, 1);

    logger.info('Processing rule deleted', {
      ruleId
    });

    return true;
  }
}

// Export singleton instance
export const processingIntegrityControls = new ProcessingIntegrityControls();
export default processingIntegrityControls;
