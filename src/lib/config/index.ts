// Configuration System for ZuboPlay Backend
import { z } from 'zod';

// Environment validation schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  
  // Database
  DATABASE_URL: z.string().url(),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  
  // Authentication
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  REFRESH_TOKEN_SECRET: z.string().min(32),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('30d'),
  
  // CORS
  ALLOWED_ORIGINS: z.string().default('*'),
  
  // Rate Limiting
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('60000'),
  
  // Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  LOG_TO_FILE: z.string().transform(val => val === 'true').default('false'),
  LOG_TO_REMOTE: z.string().transform(val => val === 'true').default('false'),
  LOG_REMOTE_ENDPOINT: z.string().url().optional(),
  
  // Analytics
  ANALYTICS_ENABLED: z.string().transform(val => val === 'true').default('true'),
  ANALYTICS_BATCH_SIZE: z.string().transform(Number).default('100'),
  ANALYTICS_FLUSH_INTERVAL: z.string().transform(Number).default('5000'),
  
  // Game Settings
  GAME_MAX_USERS: z.string().transform(Number).default('10000'),
  GAME_DEFAULT_SPEED: z.string().transform(Number).default('5'),
  GAME_SOUND_ENABLED: z.string().transform(val => val === 'true').default('true'),
  GAME_MUSIC_ENABLED: z.string().transform(val => val === 'true').default('true'),
  
  // Admin Settings
  ADMIN_EMAIL: z.string().email().default('admin@zuboplay.com'),
  ADMIN_PASSWORD: z.string().min(8).default('admin123'),
  
  // Security
  BCRYPT_ROUNDS: z.string().transform(Number).default('12'),
  SESSION_SECRET: z.string().min(32),
  COOKIE_SECURE: z.string().transform(val => val === 'true').default('false'),
  COOKIE_SAME_SITE: z.enum(['strict', 'lax', 'none']).default('lax'),
  
  // Monitoring
  HEALTH_CHECK_INTERVAL: z.string().transform(Number).default('30000'),
  METRICS_ENABLED: z.string().transform(val => val === 'true').default('false'),
  METRICS_PORT: z.string().transform(Number).default('9090'),
  
  // Cache
  REDIS_URL: z.string().url().optional(),
  CACHE_TTL: z.string().transform(Number).default('3600'),
  
  // File Storage
  STORAGE_TYPE: z.enum(['local', 's3', 'gcs']).default('local'),
  STORAGE_BUCKET: z.string().optional(),
  STORAGE_REGION: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  
  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),
  
  // Push Notifications
  FCM_SERVER_KEY: z.string().optional(),
  APNS_KEY_ID: z.string().optional(),
  APNS_TEAM_ID: z.string().optional(),
  APNS_BUNDLE_ID: z.string().optional(),
  
  // Third-party Services
  GOOGLE_ANALYTICS_ID: z.string().optional(),
  SENTRY_DSN: z.string().url().optional(),
  NEW_RELIC_LICENSE_KEY: z.string().optional()
});

// Parse and validate environment variables
const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Environment validation failed:');
      error.errors.forEach(err => {
        console.error(`  ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
};

const env = parseEnv();

// Application configuration
export const config = {
  // Environment
  env: env.NODE_ENV,
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
  
  // Server
  port: env.PORT,
  host: process.env.HOST || '0.0.0.0',
  
  // Database
  database: {
    url: env.DATABASE_URL,
    supabase: {
      url: env.SUPABASE_URL,
      anonKey: env.SUPABASE_ANON_KEY,
      serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY
    }
  },
  
  // Authentication
  auth: {
    jwt: {
      secret: env.JWT_SECRET,
      expiresIn: env.JWT_EXPIRES_IN
    },
    refreshToken: {
      secret: env.REFRESH_TOKEN_SECRET,
      expiresIn: env.REFRESH_TOKEN_EXPIRES_IN
    },
    bcryptRounds: env.BCRYPT_ROUNDS
  },
  
  // CORS
  cors: {
    origins: env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()),
    credentials: true
  },
  
  // Rate Limiting
  rateLimit: {
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
    windowMs: env.RATE_LIMIT_WINDOW_MS
  },
  
  // Logging
  logging: {
    level: env.LOG_LEVEL,
    toFile: env.LOG_TO_FILE,
    toRemote: env.LOG_TO_REMOTE,
    remoteEndpoint: env.LOG_REMOTE_ENDPOINT
  },
  
  // Analytics
  analytics: {
    enabled: env.ANALYTICS_ENABLED,
    batchSize: env.ANALYTICS_BATCH_SIZE,
    flushInterval: env.ANALYTICS_FLUSH_INTERVAL
  },
  
  // Game Settings
  game: {
    maxUsers: env.GAME_MAX_USERS,
    defaultSpeed: env.GAME_DEFAULT_SPEED,
    soundEnabled: env.GAME_SOUND_ENABLED,
    musicEnabled: env.GAME_MUSIC_ENABLED
  },
  
  // Admin Settings
  admin: {
    email: env.ADMIN_EMAIL,
    password: env.ADMIN_PASSWORD
  },
  
  // Security
  security: {
    sessionSecret: env.SESSION_SECRET,
    cookie: {
      secure: env.COOKIE_SECURE,
      sameSite: env.COOKIE_SAME_SITE
    }
  },
  
  // Monitoring
  monitoring: {
    healthCheckInterval: env.HEALTH_CHECK_INTERVAL,
    metrics: {
      enabled: env.METRICS_ENABLED,
      port: env.METRICS_PORT
    }
  },
  
  // Cache
  cache: {
    redis: env.REDIS_URL,
    ttl: env.CACHE_TTL
  },
  
  // Storage
  storage: {
    type: env.STORAGE_TYPE,
    bucket: env.STORAGE_BUCKET,
    region: env.STORAGE_REGION,
    aws: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY
    }
  },
  
  // Email
  email: {
    smtp: {
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      user: env.SMTP_USER,
      pass: env.SMTP_PASS
    },
    from: env.EMAIL_FROM
  },
  
  // Push Notifications
  push: {
    fcm: {
      serverKey: env.FCM_SERVER_KEY
    },
    apns: {
      keyId: env.APNS_KEY_ID,
      teamId: env.APNS_TEAM_ID,
      bundleId: env.APNS_BUNDLE_ID
    }
  },
  
  // Third-party Services
  services: {
    googleAnalytics: env.GOOGLE_ANALYTICS_ID,
    sentry: env.SENTRY_DSN,
    newRelic: env.NEW_RELIC_LICENSE_KEY
  }
};

// Configuration validation
export const validateConfig = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Required fields for production
  if (config.isProduction) {
    if (!config.database.supabase.serviceRoleKey) {
      errors.push('SUPABASE_SERVICE_ROLE_KEY is required in production');
    }
    
    if (!config.security.sessionSecret || config.security.sessionSecret.length < 32) {
      errors.push('SESSION_SECRET must be at least 32 characters in production');
    }
    
    if (!config.security.cookie.secure) {
      errors.push('COOKIE_SECURE should be true in production');
    }
  }
  
  // Validate URLs
  try {
    new URL(config.database.url);
  } catch {
    errors.push('DATABASE_URL is not a valid URL');
  }
  
  try {
    new URL(config.database.supabase.url);
  } catch {
    errors.push('SUPABASE_URL is not a valid URL');
  }
  
  // Validate email configuration if provided
  if (config.email.smtp.host && !config.email.smtp.port) {
    errors.push('SMTP_PORT is required when SMTP_HOST is provided');
  }
  
  // Validate storage configuration
  if (config.storage.type === 's3' && !config.storage.aws.accessKeyId) {
    errors.push('AWS_ACCESS_KEY_ID is required for S3 storage');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// Get configuration for specific environment
export const getConfigForEnv = (env: string) => {
  const baseConfig = { ...config };
  
  switch (env) {
    case 'development':
      return {
        ...baseConfig,
        logging: {
          ...baseConfig.logging,
          level: 'debug'
        },
        security: {
          ...baseConfig.security,
          cookie: {
            ...baseConfig.security.cookie,
            secure: false
          }
        }
      };
      
    case 'production':
      return {
        ...baseConfig,
        logging: {
          ...baseConfig.logging,
          level: 'info'
        },
        security: {
          ...baseConfig.security,
          cookie: {
            ...baseConfig.security.cookie,
            secure: true
          }
        }
      };
      
    case 'test':
      return {
        ...baseConfig,
        database: {
          ...baseConfig.database,
          url: 'postgresql://test:test@localhost:5432/zuboplay_test'
        },
        logging: {
          ...baseConfig.logging,
          level: 'error'
        }
      };
      
    default:
      return baseConfig;
  }
};

// Export configuration and utilities
export default config;
export { validateConfig, getConfigForEnv };
