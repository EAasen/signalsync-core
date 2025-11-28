# Project Structure Guide

This document outlines the recommended monorepo structure for SignalSync.

## Overview

SignalSync uses a Turborepo-based monorepo structure to share code between applications while maintaining clear boundaries.

```
signalsync-core/
├── .github/                      # GitHub configuration
│   ├── workflows/                # CI/CD pipelines
│   │   ├── test.yml
│   │   ├── build.yml
│   │   └── deploy.yml
│   ├── ISSUE_TEMPLATE/           # Issue templates
│   │   ├── epic.md
│   │   ├── feature.md
│   │   └── bug_report.md
│   ├── CONTRIBUTING.md
│   └── issues/                   # Epic documentation
│       ├── EPIC-1-MONITORING-ENGINE.md
│       ├── EPIC-2-MULTI-TENANCY.md
│       └── EPIC-3-4-5-STATUS-NOTIFICATIONS-SAAS.md
├── apps/                         # Application packages
│   ├── web/                      # Next.js dashboard (admin interface)
│   │   ├── app/                  # Next.js 14 App Router
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   └── signup/
│   │   │   ├── dashboard/
│   │   │   │   └── [orgSlug]/
│   │   │   │       ├── page.tsx
│   │   │   │       ├── projects/
│   │   │   │       ├── monitors/
│   │   │   │       └── settings/
│   │   │   ├── mission-control/
│   │   │   │   └── page.tsx
│   │   │   ├── api/              # API routes
│   │   │   │   ├── organizations/
│   │   │   │   ├── monitors/
│   │   │   │   ├── incidents/
│   │   │   │   └── webhooks/
│   │   │   └── layout.tsx
│   │   ├── components/           # React components
│   │   │   ├── mission-control/
│   │   │   ├── monitors/
│   │   │   ├── incidents/
│   │   │   └── settings/
│   │   ├── lib/                  # Utilities
│   │   │   ├── supabase/
│   │   │   ├── rbac.ts
│   │   │   └── api-client.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── next.config.js
│   ├── status-page/              # Public status pages (optimized)
│   │   ├── app/
│   │   │   ├── [orgSlug]/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── StatusHeader.tsx
│   │   │   ├── MonitorList.tsx
│   │   │   ├── IncidentTimeline.tsx
│   │   │   └── UptimeGraph.tsx
│   │   └── package.json
│   ├── worker/                   # Monitoring engine (Node.js service)
│   │   ├── src/
│   │   │   ├── index.ts          # Entry point
│   │   │   ├── scheduler.ts      # Job scheduling
│   │   │   ├── monitors/
│   │   │   │   ├── http.ts
│   │   │   │   ├── tcp.ts
│   │   │   │   ├── ssl.ts
│   │   │   │   └── base.ts
│   │   │   ├── queue/
│   │   │   │   ├── redis.ts      # BullMQ implementation
│   │   │   │   └── supabase.ts   # Supabase pg_cron implementation
│   │   │   └── notifications/
│   │   │       ├── email.ts
│   │   │       ├── webhook.ts
│   │   │       └── sms.ts
│   │   ├── tests/
│   │   ├── Dockerfile
│   │   └── package.json
│   └── docs/                     # Documentation site (Docusaurus)
│       ├── docs/
│       │   ├── getting-started/
│       │   ├── self-hosting/
│       │   ├── api-reference/
│       │   └── guides/
│       ├── blog/
│       ├── docusaurus.config.js
│       └── package.json
├── packages/                     # Shared libraries
│   ├── database/                 # Database schema & migrations
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   ├── supabase/
│   │   │   ├── migrations/
│   │   │   │   ├── 001_initial_schema.sql
│   │   │   │   ├── 002_rls_policies.sql
│   │   │   │   └── 003_functions.sql
│   │   │   └── seed.sql
│   │   ├── types.ts              # Generated TypeScript types
│   │   └── package.json
│   ├── ui/                       # Shared UI components (Shadcn/UI)
│   │   ├── components/
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── ...
│   │   ├── lib/
│   │   │   └── utils.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── config/                   # Shared configurations
│   │   ├── eslint/
│   │   │   └── index.js
│   │   ├── typescript/
│   │   │   ├── base.json
│   │   │   ├── nextjs.json
│   │   │   └── react.json
│   │   └── package.json
│   ├── logger/                   # Structured logging
│   │   ├── index.ts
│   │   └── package.json
│   └── types/                    # Shared TypeScript types
│       ├── monitor.ts
│       ├── organization.ts
│       └── index.ts
├── docker/                       # Docker configurations
│   ├── docker-compose.yml        # Full stack (development)
│   ├── docker-compose.prod.yml   # Production configuration
│   ├── Dockerfile.web
│   ├── Dockerfile.worker
│   └── README.md
├── scripts/                      # Utility scripts
│   ├── setup-dev.sh
│   ├── migrate-db.sh
│   └── generate-types.sh
├── .env.example                  # Environment variables template
├── .gitignore
├── LICENSE                       # Business Source License 1.1
├── README.md                     # Main project documentation
├── ROADMAP.md                    # Product roadmap
├── turbo.json                    # Turborepo configuration
├── package.json                  # Root package.json
└── pnpm-workspace.yaml           # pnpm workspaces config
```

## Application Architecture

### Web Dashboard (`apps/web`)

**Purpose:** Admin interface for managing organizations, monitors, and viewing analytics.

**Tech Stack:**
- Next.js 14 (App Router)
- React Server Components
- Supabase client
- Shadcn/UI + Tailwind CSS

**Key Features:**
- Authentication (Supabase Auth)
- Mission Control dashboard
- Monitor configuration
- Incident management
- Settings & integrations

### Status Page (`apps/status-page`)

**Purpose:** Highly optimized public-facing status pages.

**Tech Stack:**
- Next.js 14 (Static Site Generation)
- Minimal JavaScript bundle
- Edge-cached responses

**Key Features:**
- Real-time status display
- Incident timeline
- Uptime history graphs
- Embeddable widgets

**Why Separate App?**
- **Performance:** Status pages must load instantly, even during outages
- **Caching:** Aggressive CDN caching without affecting dashboard
- **Security:** No admin code exposed to public
- **Custom Domains:** Easier routing for white-label domains

### Worker (`apps/worker`)

**Purpose:** Background service that executes monitoring checks.

**Tech Stack:**
- Node.js + TypeScript
- BullMQ (job queue)
- Supabase client (service role)

**Key Features:**
- Distributed job scheduling
- HTTP/HTTPS/TCP/SSL monitoring
- Result persistence
- Notification dispatch

**Deployment:**
- Docker container
- Horizontal scaling (multiple instances)
- Regional deployment (US, EU, APAC for SaaS)

## Shared Packages

### `packages/database`

**Purpose:** Database schema, migrations, and type generation.

**Contents:**
- Supabase migrations (SQL files)
- Prisma schema (optional, for type generation)
- RLS policies
- Database functions

**Usage:**
```typescript
import { supabase } from '@signalsync/database';
import type { Monitor, Organization } from '@signalsync/database/types';
```

### `packages/ui`

**Purpose:** Shared React components (Shadcn/UI).

**Contents:**
- Primitive components (Button, Input, Card, etc.)
- Composed components (MonitorCard, IncidentBanner)
- Theme provider

**Usage:**
```typescript
import { Button, Card, Input } from '@signalsync/ui';
```

### `packages/config`

**Purpose:** Shared configurations for ESLint, TypeScript, Prettier.

**Benefits:**
- Consistent code style across apps
- Single source of truth for linting rules

### `packages/logger`

**Purpose:** Structured logging utility.

**Features:**
- JSON logging for production
- Pretty logging for development
- Integration with monitoring tools (Sentry, Datadog)

### `packages/types`

**Purpose:** Shared TypeScript types and interfaces.

**Contents:**
```typescript
// packages/types/monitor.ts
export interface Monitor {
  id: string;
  type: 'http' | 'https' | 'tcp' | 'ssl';
  name: string;
  config: MonitorConfig;
  interval_seconds: number;
}

export type MonitorConfig = 
  | HttpMonitorConfig
  | TcpMonitorConfig
  | SslMonitorConfig;

export interface CheckResult {
  monitorId: string;
  status: 'up' | 'down';
  responseTime: number;
  timestamp: Date;
  error?: string;
}
```

## Development Workflow

### Initial Setup

```bash
# Clone repository
git clone https://github.com/EAasen/signalsync-core.git
cd signalsync-core

# Install dependencies (uses pnpm workspaces)
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Run database migrations
pnpm db:migrate

# Start development servers
pnpm dev
```

This command starts:
- `apps/web` on http://localhost:3000
- `apps/status-page` on http://localhost:3001
- `apps/worker` (background service)

### Adding a New Feature

1. **Create an issue** using the feature template
2. **Create a branch:** `git checkout -b feature/your-feature-name`
3. **Develop:**
   ```bash
   # Run specific app
   pnpm --filter @signalsync/web dev
   
   # Run tests
   pnpm test
   
   # Type check
   pnpm typecheck
   
   # Lint
   pnpm lint
   ```
4. **Commit:** Use conventional commits
   ```bash
   git commit -m "feat: add SSL certificate monitoring"
   ```
5. **Open PR:** Against `main` branch

### Database Migrations

```bash
# Create a new migration
pnpm db:migrate:create add_custom_domains_table

# Apply migrations
pnpm db:migrate

# Generate TypeScript types from schema
pnpm db:generate-types
```

### Building for Production

```bash
# Build all apps
pnpm build

# Build specific app
pnpm --filter @signalsync/web build

# Build Docker images
docker build -f docker/Dockerfile.web -t signalsync/web:latest .
docker build -f docker/Dockerfile.worker -t signalsync/worker:latest .
```

## Deployment Architecture

### Community Edition (Self-Hosted)

**Docker Compose:**
```yaml
version: '3.8'
services:
  web:
    image: signalsync/web:latest
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
  
  worker:
    image: signalsync/worker:latest
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
    
  supabase:
    image: supabase/postgres:latest
    # ... Supabase configuration
```

### SaaS (Cloud)

**Infrastructure:**
- **Frontend (Web + Status Pages):** Vercel (global CDN)
- **Database:** Supabase Cloud (managed PostgreSQL)
- **Worker:** Fly.io (multi-region containers)
- **Queue:** Upstash Redis (serverless)
- **Storage:** S3 (logos, reports)

**Regions:**
- Primary: US-East (Virginia)
- Secondary: EU-West (Frankfurt)
- Tertiary: APAC (Singapore)

## Testing Strategy

### Unit Tests
```bash
# Run all unit tests
pnpm test

# Run with coverage
pnpm test:coverage

# Watch mode
pnpm test:watch
```

**Location:** `__tests__` directories within each package/app

### Integration Tests
```bash
# Start test database
docker-compose -f docker-compose.test.yml up -d

# Run integration tests
pnpm test:integration
```

### E2E Tests
```bash
# Uses Playwright
pnpm test:e2e

# Run specific test
pnpm test:e2e --grep "create monitor"
```

## Environment Variables

### Required (All Environments)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Optional (Development)

```bash
# Redis (for queue, optional in dev)
REDIS_URL=redis://localhost:6379

# Email (optional in dev, uses console logging)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password
SMTP_FROM="SignalSync <alerts@signalsync.io>"
```

### Production Only

```bash
# Stripe (SaaS only)
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=xxx
SENTRY_DSN=xxx

# Custom Domain Proxy (SaaS)
CLOUDFLARE_API_TOKEN=xxx
```

## Troubleshooting

### Common Issues

**Issue: "Cannot find module '@signalsync/database'"**

Solution:
```bash
# Rebuild packages
pnpm build --filter @signalsync/database
```

**Issue: "Database migration failed"**

Solution:
```bash
# Reset database (warning: deletes all data)
pnpm db:reset

# Re-run migrations
pnpm db:migrate
```

**Issue: "Worker not executing checks"**

Solution:
1. Check Redis connection: `redis-cli ping`
2. Check worker logs: `docker logs signalsync-worker`
3. Verify Supabase service role key has correct permissions

## Contributing

See [CONTRIBUTING.md](.github/CONTRIBUTING.md) for detailed contribution guidelines.

## License

Business Source License 1.1 - See [LICENSE](LICENSE) for details.
