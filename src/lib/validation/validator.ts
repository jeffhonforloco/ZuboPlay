// Validation Utility for ZuboPlay Backend
import { z } from 'zod';
import type { ValidationResult, ValidationError } from './schemas';

export class Validator {
  /**
   * Validate data against a Zod schema
   */
  static validate<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult {
    try {
      schema.parse(data);
      return { valid: true, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: ValidationError[] = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          value: err.input
        }));
        return { valid: false, errors };
      }
      return {
        valid: false,
        errors: [{
          field: 'unknown',
          message: 'Validation failed',
          value: data
        }]
      };
    }
  }

  /**
   * Validate and transform data
   */
  static validateAndTransform<T>(schema: z.ZodSchema<T>, data: unknown): {
    success: boolean;
    data?: T;
    errors?: ValidationError[];
  } {
    try {
      const result = schema.parse(data);
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: ValidationError[] = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          value: err.input
        }));
        return { success: false, errors };
      }
      return {
        success: false,
        errors: [{
          field: 'unknown',
          message: 'Validation failed',
          value: data
        }]
      };
    }
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate username format
   */
  static validateUsername(username: string): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (username.length < 3) {
      errors.push('Username must be at least 3 characters long');
    }
    
    if (username.length > 20) {
      errors.push('Username must be no more than 20 characters long');
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      errors.push('Username can only contain letters, numbers, and underscores');
    }
    
    if (username.startsWith('_') || username.endsWith('_')) {
      errors.push('Username cannot start or end with an underscore');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate URL format
   */
  static validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate UUID format
   */
  static validateUuid(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Validate date format
   */
  static validateDate(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  /**
   * Validate JSON format
   */
  static validateJson(jsonString: string): {
    valid: boolean;
    data?: any;
    error?: string;
  } {
    try {
      const data = JSON.parse(jsonString);
      return { valid: true, data };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Invalid JSON'
      };
    }
  }

  /**
   * Sanitize string input
   */
  static sanitizeString(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/['"]/g, '') // Remove quotes
      .replace(/[;]/g, '') // Remove semicolons
      .substring(0, 1000); // Limit length
  }

  /**
   * Sanitize HTML input
   */
  static sanitizeHtml(input: string): string {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
      .replace(/on\w+="[^"]*"/gi, '') // Remove event handlers
      .replace(/javascript:/gi, ''); // Remove javascript: protocol
  }

  /**
   * Validate pagination parameters
   */
  static validatePagination(page: number, limit: number): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (!Number.isInteger(page) || page < 1) {
      errors.push('Page must be a positive integer');
    }
    
    if (!Number.isInteger(limit) || limit < 1) {
      errors.push('Limit must be a positive integer');
    }
    
    if (limit > 100) {
      errors.push('Limit cannot exceed 100');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate sort parameters
   */
  static validateSort(sortBy: string, sortOrder: string, allowedFields: string[]): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (!allowedFields.includes(sortBy)) {
      errors.push(`Sort field must be one of: ${allowedFields.join(', ')}`);
    }
    
    if (!['asc', 'desc'].includes(sortOrder.toLowerCase())) {
      errors.push('Sort order must be either "asc" or "desc"');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate date range
   */
  static validateDateRange(startDate: string, endDate: string): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (!this.validateDate(startDate)) {
      errors.push('Start date must be a valid date');
    }
    
    if (!this.validateDate(endDate)) {
      errors.push('End date must be a valid date');
    }
    
    if (this.validateDate(startDate) && this.validateDate(endDate)) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start >= end) {
        errors.push('Start date must be before end date');
      }
      
      const daysDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff > 365) {
        errors.push('Date range cannot exceed 365 days');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate score range
   */
  static validateScoreRange(minScore: number, maxScore: number): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (!Number.isInteger(minScore) || minScore < 0) {
      errors.push('Minimum score must be a non-negative integer');
    }
    
    if (!Number.isInteger(maxScore) || maxScore < 0) {
      errors.push('Maximum score must be a non-negative integer');
    }
    
    if (minScore >= maxScore) {
      errors.push('Minimum score must be less than maximum score');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate game data
   */
  static validateGameData(gameData: any): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (typeof gameData !== 'object' || gameData === null) {
      errors.push('Game data must be an object');
      return { valid: false, errors };
    }
    
    // Check for required fields
    const requiredFields = ['score', 'duration', 'level_reached'];
    for (const field of requiredFields) {
      if (!(field in gameData)) {
        errors.push(`Game data must include ${field}`);
      }
    }
    
    // Validate score
    if ('score' in gameData) {
      if (!Number.isInteger(gameData.score) || gameData.score < 0) {
        errors.push('Score must be a non-negative integer');
      }
    }
    
    // Validate duration
    if ('duration' in gameData) {
      if (!Number.isInteger(gameData.duration) || gameData.duration < 0) {
        errors.push('Duration must be a non-negative integer');
      }
    }
    
    // Validate level
    if ('level_reached' in gameData) {
      if (!Number.isInteger(gameData.level_reached) || gameData.level_reached < 1) {
        errors.push('Level reached must be a positive integer');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate Zubo design data
   */
  static validateZuboDesignData(designData: any): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (typeof designData !== 'object' || designData === null) {
      errors.push('Design data must be an object');
      return { valid: false, errors };
    }
    
    // Check for required design components
    const requiredComponents = ['body', 'color', 'accessories'];
    for (const component of requiredComponents) {
      if (!(component in designData)) {
        errors.push(`Design data must include ${component}`);
      }
    }
    
    // Validate body type
    if ('body' in designData) {
      const validBodyTypes = ['sphere', 'cube', 'tube'];
      if (!validBodyTypes.includes(designData.body)) {
        errors.push(`Body type must be one of: ${validBodyTypes.join(', ')}`);
      }
    }
    
    // Validate color
    if ('color' in designData) {
      if (typeof designData.color !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(designData.color)) {
        errors.push('Color must be a valid hex color code');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export default Validator;
