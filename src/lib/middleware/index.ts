// Middleware System for ZuboPlay Backend
import type { ApiResponse } from '../api/types';
import { logger } from '../logging/logger';
import { ErrorHandler, ErrorCode } from '../errors/errorHandler';

export interface MiddlewareContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  [key: string]: any;
}

export interface MiddlewareRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: any;
  query?: Record<string, any>;
  params?: Record<string, any>;
  context: MiddlewareContext;
}

export interface MiddlewareResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: any;
}

export type Middleware = (
  req: MiddlewareRequest,
  next: () => Promise<MiddlewareResponse>
) => Promise<MiddlewareResponse>;

export type MiddlewareStack = Middleware[];

/**
 * Authentication Middleware
 */
export const authMiddleware: Middleware = async (req, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json' },
      body: ErrorHandler.handleAuthError()
    };
  }

  const token = authHeader.substring(7);
  
  try {
    // In a real implementation, you would verify the JWT token here
    // For now, we'll just check if it exists
    if (!token) {
      return {
        statusCode: 401,
        headers: { 'Content-Type': 'application/json' },
        body: ErrorHandler.handleAuthError('Invalid token')
      };
    }

    // Add user info to context
    req.context.userId = 'user_id_from_token'; // Extract from token
    req.context.sessionId = req.headers['x-session-id'] || 'default_session';
    
    return await next();
  } catch (error) {
    logger.error('Authentication failed', { error: (error as Error).message });
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json' },
      body: ErrorHandler.handleAuthError('Token verification failed')
    };
  }
};

/**
 * Admin Authorization Middleware
 */
export const adminAuthMiddleware: Middleware = async (req, next) => {
  // First check if user is authenticated
  const authResult = await authMiddleware(req, async () => ({ statusCode: 200, headers: {}, body: {} }));
  
  if (authResult.statusCode !== 200) {
    return authResult;
  }

  // Check if user is admin
  if (req.context.userId !== 'admin_user_id') { // In real app, check user role
    return {
      statusCode: 403,
      headers: { 'Content-Type': 'application/json' },
      body: ErrorHandler.handleForbiddenError('Admin access required')
    };
  }

  return await next();
};

/**
 * Rate Limiting Middleware
 */
export const rateLimitMiddleware = (maxRequests: number = 100, windowMs: number = 60000): Middleware => {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return async (req, next) => {
    const key = req.context.ipAddress || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean up old entries
    for (const [k, v] of requests.entries()) {
      if (v.resetTime < windowStart) {
        requests.delete(k);
      }
    }

    const current = requests.get(key);
    
    if (!current || current.resetTime < windowStart) {
      requests.set(key, { count: 1, resetTime: now });
    } else if (current.count >= maxRequests) {
      return {
        statusCode: 429,
        headers: { 
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((current.resetTime + windowMs - now) / 1000).toString()
        },
        body: ErrorHandler.handleRateLimitError()
      };
    } else {
      current.count++;
    }

    return await next();
  };
};

/**
 * Request Logging Middleware
 */
export const loggingMiddleware: Middleware = async (req, next) => {
  const startTime = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  req.context.requestId = requestId;
  req.context.timestamp = new Date().toISOString();

  logger.info('Request started', {
    method: req.method,
    url: req.url,
    userId: req.context.userId,
    requestId,
    ipAddress: req.context.ipAddress,
    userAgent: req.context.userAgent
  });

  try {
    const response = await next();
    
    const duration = Date.now() - startTime;
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: response.statusCode,
      duration,
      userId: req.context.userId,
      requestId
    });

    return response;
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Request failed', {
      method: req.method,
      url: req.url,
      duration,
      userId: req.context.userId,
      requestId,
      error: (error as Error).message
    }, error as Error);

    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: ErrorHandler.handleInternalError(error)
    };
  }
};

/**
 * CORS Middleware
 */
export const corsMiddleware: Middleware = async (req, next) => {
  const response = await next();
  
  response.headers = {
    ...response.headers,
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Session-ID',
    'Access-Control-Max-Age': '86400'
  };

  return response;
};

/**
 * Request ID Middleware
 */
export const requestIdMiddleware: Middleware = async (req, next) => {
  const requestId = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  req.context.requestId = requestId;
  
  const response = await next();
  response.headers['X-Request-ID'] = requestId;
  
  return response;
};

/**
 * Security Headers Middleware
 */
export const securityHeadersMiddleware: Middleware = async (req, next) => {
  const response = await next();
  
  response.headers = {
    ...response.headers,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  };

  return response;
};

/**
 * Input Validation Middleware
 */
export const validationMiddleware = (schema: any): Middleware => {
  return async (req, next) => {
    try {
      // Validate request body
      if (req.body) {
        const result = schema.safeParse(req.body);
        if (!result.success) {
          return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json' },
            body: ErrorHandler.handleValidationError(
              result.error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message
              }))
            )
          };
        }
        req.body = result.data;
      }

      return await next();
    } catch (error) {
      logger.error('Validation middleware error', { error: (error as Error).message });
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: ErrorHandler.handleInternalError(error)
      };
    }
  };
};

/**
 * Error Handling Middleware
 */
export const errorHandlingMiddleware: Middleware = async (req, next) => {
  try {
    return await next();
  } catch (error) {
    logger.error('Unhandled error in middleware', {
      method: req.method,
      url: req.url,
      userId: req.context.userId,
      requestId: req.context.requestId,
      error: (error as Error).message
    }, error as Error);

    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: ErrorHandler.handleInternalError(error)
    };
  }
};

/**
 * Performance Monitoring Middleware
 */
export const performanceMiddleware: Middleware = async (req, next) => {
  const startTime = Date.now();
  const startMemory = process.memoryUsage();
  
  const response = await next();
  
  const duration = Date.now() - startTime;
  const endMemory = process.memoryUsage();
  const memoryDelta = endMemory.heapUsed - startMemory.heapUsed;
  
  logger.logPerformance('request_duration', duration, 'ms', {
    method: req.method,
    url: req.url,
    statusCode: response.statusCode
  });
  
  logger.logPerformance('memory_usage', memoryDelta, 'bytes', {
    method: req.method,
    url: req.url
  });

  return response;
};

/**
 * Apply middleware stack to request
 */
export const applyMiddleware = async (
  req: MiddlewareRequest,
  middlewareStack: MiddlewareStack,
  handler: () => Promise<MiddlewareResponse>
): Promise<MiddlewareResponse> => {
  let index = 0;

  const next = async (): Promise<MiddlewareResponse> => {
    if (index >= middlewareStack.length) {
      return await handler();
    }

    const middleware = middlewareStack[index++];
    return await middleware(req, next);
  };

  return await next();
};

/**
 * Create middleware stack for API routes
 */
export const createApiMiddlewareStack = (options: {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  rateLimit?: { maxRequests: number; windowMs: number };
  validation?: any;
} = {}): MiddlewareStack => {
  const stack: MiddlewareStack = [
    errorHandlingMiddleware,
    requestIdMiddleware,
    loggingMiddleware,
    corsMiddleware,
    securityHeadersMiddleware,
    performanceMiddleware
  ];

  if (options.rateLimit) {
    stack.push(rateLimitMiddleware(options.rateLimit.maxRequests, options.rateLimit.windowMs));
  }

  if (options.requireAuth) {
    stack.push(authMiddleware);
  }

  if (options.requireAdmin) {
    stack.push(adminAuthMiddleware);
  }

  if (options.validation) {
    stack.push(validationMiddleware(options.validation));
  }

  return stack;
};

/**
 * Create middleware stack for admin routes
 */
export const createAdminMiddlewareStack = (options: {
  rateLimit?: { maxRequests: number; windowMs: number };
  validation?: any;
} = {}): MiddlewareStack => {
  return createApiMiddlewareStack({
    requireAuth: true,
    requireAdmin: true,
    rateLimit: options.rateLimit,
    validation: options.validation
  });
};

/**
 * Create middleware stack for public routes
 */
export const createPublicMiddlewareStack = (options: {
  rateLimit?: { maxRequests: number; windowMs: number };
  validation?: any;
} = {}): MiddlewareStack => {
  return createApiMiddlewareStack({
    requireAuth: false,
    requireAdmin: false,
    rateLimit: options.rateLimit,
    validation: options.validation
  });
};

export default {
  authMiddleware,
  adminAuthMiddleware,
  rateLimitMiddleware,
  loggingMiddleware,
  corsMiddleware,
  requestIdMiddleware,
  securityHeadersMiddleware,
  validationMiddleware,
  errorHandlingMiddleware,
  performanceMiddleware,
  applyMiddleware,
  createApiMiddlewareStack,
  createAdminMiddlewareStack,
  createPublicMiddlewareStack
};
