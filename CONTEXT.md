# Project Context — Zuboplay

## Identity
Project: Zuboplay
Owner: Tarvico Inc.
Status: Pre-launch
Domain: www.zuboplay.com

## Stack
- Frontend: React 18 / TypeScript / Vite / Tailwind CSS / shadcn-ui (Radix UI)
- Backend: Supabase (BaaS) — PostgreSQL + Edge Functions + Supabase Auth
- Database: Supabase (PostgreSQL 13) — hosted at pitriojjczesledugvuq.supabase.co
- Cache: Redis (optional, via REDIS_URL — not yet provisioned)
- Queue: none
- AI: Anthropic SDK (Claude claude-sonnet-4-20250514 primary) — planned, not yet installed
- Auth: Supabase Auth (JWT + refresh tokens, persisted in localStorage)
- Payments: none configured
- File storage: configurable — local / S3 / GCS (via STORAGE_TYPE env var)
- Cloud: Supabase + static hosting (GitHub Pages / CDN via CNAME)
- Functions: Supabase Edge Functions (project: pitriojjczesledugvuq)
- Mobile: Capacitor 7 (iOS + Android targets)
- CI/CD: none configured
- Data fetching: TanStack Query v5
- Validation: Zod + react-hook-form

## Key Paths
```
/src/pages/            ← Route-level page components (Index, Auth, Game, Admin, NotFound)
/src/pages/admin/      ← Admin sub-pages (UserManagement, GameAnalytics, ContentManagement, SystemSettings)
/src/components/       ← UI components (ZuboCreator, Hero, Features, AuthForm, UserDashboard, etc.)
/src/components/ui/    ← shadcn/ui primitives (do not edit directly)
/src/components/compliance/ ← SOC2 dashboard
/src/lib/services/     ← Business logic / service layer (gameService, userService, analyticsService)
/src/lib/api/          ← API client + TypeScript types
/src/lib/compliance/soc2/ ← SOC2 compliance modules (security, privacy, availability, etc.)
/src/lib/config/       ← Environment config validation (Zod schemas)
/src/lib/errors/       ← Error handler
/src/lib/logging/      ← Logger
/src/lib/middleware/   ← Middleware utilities
/src/lib/validation/   ← Input validation schemas + validator
/src/lib/             ← Shared utilities (utils.ts, auth.ts, guestSystem.ts, userProgression.ts)
/src/integrations/supabase/ ← Supabase client + generated DB types
/src/hooks/           ← React hooks (useAuth, use-toast, use-mobile)
/supabase/            ← Supabase project config (config.toml)
```

## Database Schema
**Table: profiles**
- `id` UUID (PK, references auth.users)
- `username` TEXT NOT NULL
- `avatar_url` TEXT
- `total_games_played` INTEGER (default 0)
- `favorite_zubo_design` JSONB
- `created_at` TIMESTAMPTZ
- `updated_at` TIMESTAMPTZ

## Critical Conventions
- Auth: Supabase Auth handles identity — JWT is issued by Supabase, persisted in localStorage
- Guest system: `src/lib/guestSystem.ts` controls unauthenticated access restrictions
- User progression: `src/lib/userProgression.ts` manages game level/XP logic
- Design tokens: use Tailwind CSS vars — no hardcoded colors outside of `tailwind.config.ts`
- shadcn/ui components in `/src/components/ui/` are auto-generated — prefer editing via the CLI, not manually
- API types live in `src/lib/api/types.ts` — keep client + service layer in sync with these
- SOC2 compliance modules in `src/lib/compliance/soc2/` must not be bypassed
- Mobile: all UI changes must be tested against the Capacitor mobile shell (iOS + Android)
- LLM provider priority (planned): Tarvico → anthropic → openai → nemotron → deepseek → llama

## Environment Variables
```
# Supabase (client-side, Vite prefix)
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_SUPABASE_PROJECT_ID

# Database (server/edge)
DATABASE_URL
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

# Auth / Security
JWT_SECRET
JWT_EXPIRES_IN
REFRESH_TOKEN_SECRET
REFRESH_TOKEN_EXPIRES_IN
SESSION_SECRET
BCRYPT_ROUNDS
COOKIE_SECURE
COOKIE_SAME_SITE

# Server
PORT
HOST
ALLOWED_ORIGINS
NODE_ENV

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS
RATE_LIMIT_WINDOW_MS

# Logging
LOG_LEVEL
LOG_TO_FILE
LOG_TO_REMOTE
LOG_REMOTE_ENDPOINT

# Analytics
ANALYTICS_ENABLED
ANALYTICS_BATCH_SIZE
ANALYTICS_FLUSH_INTERVAL

# Game Settings
GAME_MAX_USERS
GAME_DEFAULT_SPEED
GAME_SOUND_ENABLED
GAME_MUSIC_ENABLED

# Admin
ADMIN_EMAIL
ADMIN_PASSWORD

# Cache (optional)
REDIS_URL
CACHE_TTL

# File Storage (optional)
STORAGE_TYPE
STORAGE_BUCKET
STORAGE_REGION
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY

# Email / SMTP (optional)
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
EMAIL_FROM

# Push Notifications (optional)
FCM_SERVER_KEY
APNS_KEY_ID
APNS_TEAM_ID
APNS_BUNDLE_ID

# Monitoring (optional)
HEALTH_CHECK_INTERVAL
METRICS_ENABLED
METRICS_PORT
GOOGLE_ANALYTICS_ID
SENTRY_DSN
NEW_RELIC_LICENSE_KEY

# AI (planned)
ANTHROPIC_API_KEY
```

## Do NOT
- Commit `.env` or any file containing actual secret values
- Hardcode Supabase URLs or keys outside of env vars
- Edit `/src/components/ui/` files directly — use the shadcn CLI
- Skip the SOC2 compliance modules when adding new data-access paths
- Add cloud-provider-specific SDKs without approval (keep infra swappable)
- Break the Capacitor mobile build by using browser-only APIs without guards

## Known Deferred Items
- Anthropic SDK not yet installed — AI features are planned but not wired up
- Redis cache not yet provisioned
- CI/CD pipeline not yet configured (GitHub Actions recommended)
- Payments integration not yet started
- Additional DB tables beyond `profiles` not yet migrated

## Last Updated
2026-05-23 — Initial CONTEXT.md created from codebase scan
