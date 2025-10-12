// Error Handling System for ZuboPlay Backend
import type { ApiResponse } from '../api/types';

export enum ErrorCode {
  // Authentication errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  
  // Resource errors
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',
  
  // Database errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  QUERY_ERROR = 'QUERY_ERROR',
  
  // Business logic errors
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  OPERATION_NOT_ALLOWED = 'OPERATION_NOT_ALLOWED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // System errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  TIMEOUT = 'TIMEOUT',
  
  // Game-specific errors
  GAME_NOT_FOUND = 'GAME_NOT_FOUND',
  GAME_ALREADY_COMPLETED = 'GAME_ALREADY_COMPLETED',
  INVALID_GAME_STATE = 'INVALID_GAME_STATE',
  ACHIEVEMENT_NOT_FOUND = 'ACHIEVEMENT_NOT_FOUND',
  DESIGN_NOT_FOUND = 'DESIGN_NOT_FOUND',
  CONTENT_NOT_FOUND = 'CONTENT_NOT_FOUND'
}

export interface AppError {
  code: ErrorCode;
  message: string;
  details?: Record<string, any>;
  statusCode: number;
  timestamp: string;
  stack?: string;
}

export class ZuboPlayError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: Record<string, any>;
  public readonly timestamp: string;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number = 500,
    details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ZuboPlayError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
    
    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ZuboPlayError);
    }
  }

  toJSON(): AppError {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }
}

export class ErrorHandler {
  /**
   * Create a standardized error response
   */
  static createErrorResponse(
    code: ErrorCode,
    message: string,
    statusCode: number = 500,
    details?: Record<string, any>
  ): ApiResponse {
    return {
      success: false,
      error: message,
      data: {
        code,
        message,
        details,
        statusCode,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Handle validation errors
   */
  static handleValidationError(errors: Array<{ field: string; message: string }>): ApiResponse {
    return this.createErrorResponse(
      ErrorCode.VALIDATION_ERROR,
      'Validation failed',
      400,
      { validationErrors: errors }
    );
  }

  /**
   * Handle authentication errors
   */
  static handleAuthError(message: string = 'Authentication required'): ApiResponse {
    return this.createErrorResponse(
      ErrorCode.UNAUTHORIZED,
      message,
      401
    );
  }

  /**
   * Handle authorization errors
   */
  static handleForbiddenError(message: string = 'Access denied'): ApiResponse {
    return this.createErrorResponse(
      ErrorCode.FORBIDDEN,
      message,
      403
    );
  }

  /**
   * Handle not found errors
   */
  static handleNotFoundError(resource: string = 'Resource'): ApiResponse {
    return this.createErrorResponse(
      ErrorCode.NOT_FOUND,
      `${resource} not found`,
      404
    );
  }

  /**
   * Handle database errors
   */
  static handleDatabaseError(error: any): ApiResponse {
    console.error('Database error:', error);
    
    return this.createErrorResponse(
      ErrorCode.DATABASE_ERROR,
      'Database operation failed',
      500,
      process.env.NODE_ENV === 'development' ? { originalError: error.message } : undefined
    );
  }

  /**
   * Handle rate limit errors
   */
  static handleRateLimitError(retryAfter?: number): ApiResponse {
    return this.createErrorResponse(
      ErrorCode.RATE_LIMIT_EXCEEDED,
      'Rate limit exceeded',
      429,
      retryAfter ? { retryAfter } : undefined
    );
  }

  /**
   * Handle internal server errors
   */
  static handleInternalError(error: any): ApiResponse {
    console.error('Internal error:', error);
    
    return this.createErrorResponse(
      ErrorCode.INTERNAL_ERROR,
      'Internal server error',
      500,
      process.env.NODE_ENV === 'development' ? { originalError: error.message } : undefined
    );
  }

  /**
   * Handle game-specific errors
   */
  static handleGameError(code: ErrorCode, message: string, details?: Record<string, any>): ApiResponse {
    const statusCode = this.getStatusCodeForErrorCode(code);
    return this.createErrorResponse(code, message, statusCode, details);
  }

  /**
   * Get HTTP status code for error code
   */
  private static getStatusCodeForErrorCode(code: ErrorCode): number {
    switch (code) {
      case ErrorCode.UNAUTHORIZED:
      case ErrorCode.INVALID_CREDENTIALS:
      case ErrorCode.TOKEN_EXPIRED:
        return 401;
      
      case ErrorCode.FORBIDDEN:
      case ErrorCode.INSUFFICIENT_PERMISSIONS:
        return 403;
      
      case ErrorCode.NOT_FOUND:
      case ErrorCode.GAME_NOT_FOUND:
      case ErrorCode.ACHIEVEMENT_NOT_FOUND:
      case ErrorCode.DESIGN_NOT_FOUND:
      case ErrorCode.CONTENT_NOT_FOUND:
        return 404;
      
      case ErrorCode.ALREADY_EXISTS:
      case ErrorCode.RESOURCE_CONFLICT:
      case ErrorCode.GAME_ALREADY_COMPLETED:
        return 409;
      
      case ErrorCode.VALIDATION_ERROR:
      case ErrorCode.INVALID_INPUT:
      case ErrorCode.MISSING_REQUIRED_FIELD:
      case ErrorCode.INVALID_FORMAT:
        return 400;
      
      case ErrorCode.RATE_LIMIT_EXCEEDED:
        return 429;
      
      case ErrorCode.SERVICE_UNAVAILABLE:
        return 503;
      
      case ErrorCode.TIMEOUT:
        return 504;
      
      default:
        return 500;
    }
  }

  /**
   * Log error with context
   */
  static logError(error: Error, context?: Record<string, any>): void {
    const logData = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      context
    };

    if (error instanceof ZuboPlayError) {
      console.error('ZuboPlay Error:', {
        ...logData,
        code: error.code,
        statusCode: error.statusCode,
        details: error.details
      });
    } else {
      console.error('Unexpected Error:', logData);
    }
  }

  /**
   * Handle Supabase errors
   */
  static handleSupabaseError(error: any): ApiResponse {
    console.error('Supabase error:', error);

    // Map Supabase error codes to our error codes
    switch (error.code) {
      case 'PGRST116':
        return this.handleNotFoundError('Resource');
      
      case '23505': // Unique constraint violation
        return this.createErrorResponse(
          ErrorCode.ALREADY_EXISTS,
          'Resource already exists',
          409
        );
      
      case '23503': // Foreign key constraint violation
        return this.createErrorResponse(
          ErrorCode.VALIDATION_ERROR,
          'Invalid reference to related resource',
          400
        );
      
      case '42501': // Insufficient privilege
        return this.handleForbiddenError('Insufficient privileges');
      
      default:
        return this.handleDatabaseError(error);
    }
  }

  /**
   * Create success response
   */
  static createSuccessResponse<T>(data: T, message?: string): ApiResponse<T> {
    return {
      success: true,
      data,
      message
    };
  }

  /**
   * Wrap async function with error handling
   */
  static async wrapAsync<T>(
    fn: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    try {
      const result = await fn();
      return this.createSuccessResponse(result);
    } catch (error) {
      this.logError(error as Error, context);
      
      if (error instanceof ZuboPlayError) {
        return this.createErrorResponse(
          error.code,
          error.message,
          error.statusCode,
          error.details
        );
      }
      
      return this.handleInternalError(error);
    }
  }

  /**
   * Validate and handle input
   */
  static validateInput<T>(
    input: unknown,
    validator: (input: unknown) => { valid: boolean; errors: string[] }
  ): { success: boolean; data?: T; errors?: string[] } {
    const result = validator(input);
    
    if (!result.valid) {
      return {
        success: false,
        errors: result.errors
      };
    }
    
    return {
      success: true,
      data: input as T
    };
  }
}

// Export error classes and utilities
export {
  ZuboPlayError,
  ErrorHandler
};

// Export commonly used error creators
export const createError = {
  unauthorized: (message?: string) => new ZuboPlayError(ErrorCode.UNAUTHORIZED, message || 'Authentication required', 401),
  forbidden: (message?: string) => new ZuboPlayError(ErrorCode.FORBIDDEN, message || 'Access denied', 403),
  notFound: (resource?: string) => new ZuboPlayError(ErrorCode.NOT_FOUND, `${resource || 'Resource'} not found`, 404),
  validation: (message: string, details?: Record<string, any>) => new ZuboPlayError(ErrorCode.VALIDATION_ERROR, message, 400, details),
  internal: (message?: string) => new ZuboPlayError(ErrorCode.INTERNAL_ERROR, message || 'Internal server error', 500),
  gameNotFound: () => new ZuboPlayError(ErrorCode.GAME_NOT_FOUND, 'Game not found', 404),
  gameAlreadyCompleted: () => new ZuboPlayError(ErrorCode.GAME_ALREADY_COMPLETED, 'Game already completed', 409),
  invalidGameState: (message?: string) => new ZuboPlayError(ErrorCode.INVALID_GAME_STATE, message || 'Invalid game state', 400)
};
