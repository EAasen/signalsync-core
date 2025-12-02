# Phase 1 - MVP Action Plan

**Status:** Ready to Start  
**Current Date:** December 1, 2025  
**Target Launch:** March 2026 (12 weeks)  
**Phase:** Foundation → Implementation

---

## 🎯 Quick Start (First 3 Days)

### Day 1: Environment Setup ⚡

#### Step 1: Install Dependencies
```bash
# Install all workspace dependencies
pnpm install
```

**Expected Output:** All packages installed successfully, no errors

---

#### Step 2: Create Environment Configuration
```bash
# Copy example env file
cp .env.example .env
```

**Required Configuration:**
Edit `.env` and add:
```env
# Get these from https://supabase.com/dashboard
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Local development URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_STATUS_PAGE_URL=http://localhost:3000

# Worker config
WORKER_CONCURRENCY=10
WORKER_CHECK_INTERVAL_MS=60000

# Development mode
NODE_ENV=development
```

---

#### Step 3: Set Up Supabase Project

**Option A: Use Supabase Cloud (Recommended for MVP)**
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in details:
   - Name: `signalsync-dev`
   - Database Password: (generate strong password)
   - Region: (closest to you)
4. Wait 2 minutes for project to provision

**Option B: Local Supabase (Advanced)**
```bash
# Install Supabase CLI
npm install -g supabase

# Start local instance
supabase start
```

---

#### Step 4: Apply Database Migrations

**Via Supabase Dashboard:**
1. Go to SQL Editor
2. Copy content from `packages/database/supabase/migrations/001_initial_schema.sql`
3. Paste and run
4. Repeat for `002_rls_policies.sql`
5. Repeat for `003_functions.sql`

**Via CLI (if using local):**
```bash
pnpm db:migrate
```

**Verification:**
- Check that tables exist: `organizations`, `projects`, `monitors`, etc.
- Verify RLS policies are enabled

---

#### Step 5: Start Development Servers
```bash
# Terminal 1: Start all services
pnpm dev

# This will start:
# - Web dashboard at http://localhost:3000
# - Worker service (background)
```

**Success Criteria:**
- ✅ Web dashboard loads without errors
- ✅ No database connection errors in console
- ✅ Worker starts and logs "Worker started successfully"

---

## 📋 Phase 1 Implementation Tasks (Week by Week)

### Week 1-2: Core Authentication & Database Foundation

#### Task 1.1: Supabase Auth Integration (2 days)
**Priority: P0 - BLOCKER**  
**Files to create/modify:**
- `apps/web/src/lib/supabase/client.ts` - Supabase client setup
- `apps/web/src/lib/supabase/server.ts` - Server-side client
- `apps/web/src/lib/auth.ts` - Auth helpers

**Implementation:**
```typescript
// apps/web/src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Test Criteria:**
- User can sign up with email/password
- User can log in
- Session persists across page refreshes

---

#### Task 1.2: Login/Signup Pages (2 days)
**Priority: P0 - BLOCKER**  
**Files to create:**
- `apps/web/src/app/login/page.tsx`
- `apps/web/src/app/signup/page.tsx`
- `apps/web/src/components/auth/LoginForm.tsx`
- `apps/web/src/components/auth/SignupForm.tsx`

**Features:**
- Email/password authentication
- Form validation
- Loading states
- Error handling
- Redirect after login

---

#### Task 1.3: Protected Routes Middleware (1 day)
**Priority: P0 - BLOCKER**  
**Files to create:**
- `apps/web/src/middleware.ts`
- `apps/web/src/app/dashboard/layout.tsx`

**Implementation:**
```typescript
// apps/web/src/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Check if user is authenticated
  // Redirect to /login if not
  // Allow access to dashboard if authenticated
}

export const config = {
  matcher: ['/dashboard/:path*']
}
```

---

#### Task 1.4: Organization Creation Flow (2 days)
**Priority: P0 - BLOCKER**  
**GitHub Issue:** Related to #28  
**Files to create:**
- `apps/web/src/app/dashboard/onboarding/page.tsx`
- `apps/web/src/lib/actions/organizations.ts`

**Flow:**
1. After signup, user is prompted to create organization
2. Form collects:
   - Organization name
   - Slug (auto-generated, editable)
3. Creates organization in database
4. Adds user as owner in `team_members` table
5. Redirects to dashboard

**Database Operations:**
```sql
-- Insert organization
INSERT INTO organizations (name, slug) VALUES ('Acme Inc', 'acme-inc');

-- Add user as owner
INSERT INTO team_members (organization_id, user_id, role) 
VALUES (org_id, user_id, 'owner');
```

---

### Week 3-4: Monitoring Engine Core

#### Task 2.1: HTTP Monitor Implementation (3 days)
**Priority: P0 - CRITICAL**  
**GitHub Issue:** #48 (formerly #18)  
**Files to create:**
- `apps/worker/src/monitors/http.ts`
- `apps/worker/src/monitors/types.ts`
- `apps/worker/src/monitors/executor.ts`

**Implementation Requirements:**

```typescript
// apps/worker/src/monitors/http.ts
import axios from 'axios';

interface HttpMonitorConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  timeout: number; // milliseconds
  expectedStatusCodes: number[];
  keyword?: string; // Optional content verification
}

interface CheckResult {
  status: 'up' | 'down';
  responseTimeMs: number;
  statusCode?: number;
  error?: string;
}

export async function executeHttpCheck(
  config: HttpMonitorConfig
): Promise<CheckResult> {
  const startTime = Date.now();
  
  try {
    const response = await axios({
      method: config.method,
      url: config.url,
      timeout: config.timeout,
      validateStatus: () => true, // Don't throw on any status
    });
    
    const responseTime = Date.now() - startTime;
    const statusOk = config.expectedStatusCodes.includes(response.status);
    
    // Check keyword if specified
    let keywordFound = true;
    if (config.keyword) {
      const body = String(response.data);
      keywordFound = body.includes(config.keyword);
    }
    
    return {
      status: statusOk && keywordFound ? 'up' : 'down',
      responseTimeMs: responseTime,
      statusCode: response.status,
    };
  } catch (error) {
    return {
      status: 'down',
      responseTimeMs: Date.now() - startTime,
      error: error.message,
    };
  }
}
```

**Test Cases:**
- ✅ Successfully checks https://google.com → status: up
- ✅ Times out after configured duration
- ✅ Returns down for 404/500 errors
- ✅ Verifies keyword presence in response
- ✅ Handles network errors gracefully

---

#### Task 2.2: Check Scheduling System (3 days)
**Priority: P0 - CRITICAL**  
**GitHub Issue:** #52 (formerly #22)  
**Files to modify:**
- `apps/worker/src/scheduler.ts`

**Architecture:**
```
┌─────────────────────────────────────────┐
│  Scheduler (Main Loop)                  │
│  - Polls DB every 60s                   │
│  - Finds monitors due for check         │
│  - Dispatches to executor               │
└─────────────┬───────────────────────────┘
              │
              ↓
┌─────────────────────────────────────────┐
│  Executor                               │
│  - Executes checks concurrently         │
│  - Respects WORKER_CONCURRENCY          │
│  - Calls monitor type handlers          │
└─────────────┬───────────────────────────┘
              │
              ↓
┌─────────────────────────────────────────┐
│  Monitor Handlers                       │
│  - http.ts → HTTP/HTTPS checks          │
│  - tcp.ts → Port checks                 │
└─────────────────────────────────────────┘
```

**Implementation:**
```typescript
// apps/worker/src/scheduler.ts
import { createLogger } from '@signalsync/logger';
import { executeHttpCheck } from './monitors/http';

export class Scheduler {
  private isRunning = false;
  private intervalId?: NodeJS.Timer;
  private logger = createLogger('scheduler');

  async start() {
    this.isRunning = true;
    this.logger.info('Starting scheduler...');
    
    // Run immediately
    await this.tick();
    
    // Then run every minute
    this.intervalId = setInterval(() => this.tick(), 60000);
  }

  async stop() {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private async tick() {
    try {
      // 1. Query monitors due for check
      const monitors = await this.getMonitorsDueForCheck();
      
      this.logger.info({ count: monitors.length }, 'Found monitors to check');
      
      // 2. Execute checks concurrently (respecting concurrency limit)
      await this.executeChecks(monitors);
      
    } catch (error) {
      this.logger.error({ error }, 'Error in scheduler tick');
    }
  }

  private async getMonitorsDueForCheck() {
    // Query database for monitors where:
    // - status != 'paused'
    // - last_checked_at is null OR 
    //   last_checked_at < (NOW() - INTERVAL interval_seconds)
    
    // Return monitor configurations
  }

  private async executeChecks(monitors: Monitor[]) {
    // Execute checks with concurrency control
    const concurrency = parseInt(process.env.WORKER_CONCURRENCY || '10');
    
    // Simple Promise.all with batching for now
    // TODO: Use BullMQ for production
    
    for (let i = 0; i < monitors.length; i += concurrency) {
      const batch = monitors.slice(i, i + concurrency);
      await Promise.all(batch.map(m => this.checkMonitor(m)));
    }
  }

  private async checkMonitor(monitor: Monitor) {
    this.logger.debug({ monitorId: monitor.id }, 'Checking monitor');
    
    let result;
    
    switch (monitor.type) {
      case 'http':
      case 'https':
        result = await executeHttpCheck(monitor.config);
        break;
      case 'tcp':
        // TODO: Implement TCP check
        throw new Error('TCP monitoring not yet implemented');
      default:
        throw new Error(`Unknown monitor type: ${monitor.type}`);
    }
    
    // Save result to database
    await this.saveCheckResult(monitor.id, result);
    
    // Update monitor.last_checked_at
    await this.updateMonitorLastChecked(monitor.id);
    
    this.logger.debug(
      { monitorId: monitor.id, status: result.status },
      'Check complete'
    );
  }

  private async saveCheckResult(monitorId: string, result: CheckResult) {
    // INSERT INTO check_results ...
  }

  private async updateMonitorLastChecked(monitorId: string) {
    // UPDATE monitors SET last_checked_at = NOW() WHERE id = ?
  }
}
```

---

#### Task 2.3: Result Persistence & Uptime Calculation (2 days)
**Priority: P0 - CRITICAL**  
**GitHub Issue:** #53 (formerly #23)  
**Files to create:**
- `packages/database/src/functions/uptime.ts`

**Database Functions:**
```typescript
// Calculate uptime percentage
export async function calculateUptime(
  monitorId: string,
  hours: number
): Promise<number> {
  // Query check_results for last X hours
  // Count: total checks, successful checks
  // Return: (successful / total) * 100
}
```

**SQL Function (optional optimization):**
```sql
CREATE OR REPLACE FUNCTION calculate_uptime(
  p_monitor_id UUID,
  p_hours INTEGER
) RETURNS NUMERIC AS $$
DECLARE
  total_checks INTEGER;
  successful_checks INTEGER;
BEGIN
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'up')
  INTO total_checks, successful_checks
  FROM check_results
  WHERE monitor_id = p_monitor_id
    AND checked_at > NOW() - INTERVAL '1 hour' * p_hours;
  
  IF total_checks = 0 THEN
    RETURN 100.0;
  END IF;
  
  RETURN (successful_checks::NUMERIC / total_checks::NUMERIC) * 100;
END;
$$ LANGUAGE plpgsql;
```

---

#### Task 2.4: TCP Monitor Implementation (2 days)
**Priority: P0 - CRITICAL**  
**GitHub Issue:** #50 (formerly #20)  
**Files to create:**
- `apps/worker/src/monitors/tcp.ts`

**Implementation:**
```typescript
import * as net from 'net';

interface TcpMonitorConfig {
  host: string;
  port: number;
  timeout: number;
}

export async function executeTcpCheck(
  config: TcpMonitorConfig
): Promise<CheckResult> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const socket = new net.Socket();
    
    socket.setTimeout(config.timeout);
    
    socket.on('connect', () => {
      const responseTime = Date.now() - startTime;
      socket.destroy();
      resolve({
        status: 'up',
        responseTimeMs: responseTime,
      });
    });
    
    socket.on('timeout', () => {
      socket.destroy();
      resolve({
        status: 'down',
        responseTimeMs: Date.now() - startTime,
        error: 'Connection timeout',
      });
    });
    
    socket.on('error', (error) => {
      resolve({
        status: 'down',
        responseTimeMs: Date.now() - startTime,
        error: error.message,
      });
    });
    
    socket.connect(config.port, config.host);
  });
}
```

---

### Week 5-6: Monitor Management Dashboard

#### Task 3.1: Dashboard Layout & Navigation (2 days)
**Priority: P0 - CRITICAL**  
**Files to create:**
- `apps/web/src/app/dashboard/layout.tsx`
- `apps/web/src/components/dashboard/Sidebar.tsx`
- `apps/web/src/components/dashboard/Header.tsx`

**Layout Structure:**
```
┌─────────────────────────────────────────┐
│  Header (User menu, org switcher)       │
├────────┬────────────────────────────────┤
│        │                                │
│ Side   │  Main Content Area             │
│ bar    │  (Page content here)           │
│        │                                │
│        │                                │
│        │                                │
└────────┴────────────────────────────────┘
```

**Navigation Items:**
- Dashboard (overview)
- Monitors
- Incidents
- Status Page
- Settings

---

#### Task 3.2: Monitor Creation Form (3 days)
**Priority: P0 - CRITICAL**  
**Files to create:**
- `apps/web/src/app/dashboard/monitors/new/page.tsx`
- `apps/web/src/components/monitors/MonitorForm.tsx`

**Form Fields:**
- Monitor Name (text)
- Monitor Type (select: HTTP/HTTPS, TCP)
- URL or Host (text)
- Port (number, if TCP)
- Check Interval (select: 30s, 1m, 5m, 10m, 30m, 1h)
- Timeout (number, default 30s)
- Expected Status Codes (multi-select, default [200])
- Keyword Verification (text, optional)

**Validation:**
- URL must be valid format
- Port must be 1-65535
- Interval must be >= 30 seconds
- Timeout must be < interval

**Actions:**
- Save monitor to database
- Set initial status as 'paused'
- Redirect to monitor detail page

---

#### Task 3.3: Monitor List View (2 days)
**Priority: P0 - CRITICAL**  
**Files to create:**
- `apps/web/src/app/dashboard/monitors/page.tsx`
- `apps/web/src/components/monitors/MonitorList.tsx`
- `apps/web/src/components/monitors/MonitorCard.tsx`

**Display:**
- List/grid of all monitors
- Status indicator (green dot = up, red dot = down)
- Last check time
- Uptime percentage (24h)
- Quick actions: Edit, Delete, Pause/Resume

---

#### Task 3.4: Monitor Detail Page (2 days)
**Priority: P0 - CRITICAL**  
**Files to create:**
- `apps/web/src/app/dashboard/monitors/[id]/page.tsx`
- `apps/web/src/components/monitors/MonitorStats.tsx`
- `apps/web/src/components/monitors/CheckHistory.tsx`

**Display:**
- Monitor configuration
- Current status
- Uptime percentages (24h, 7d, 30d, 90d)
- Response time graph
- Recent check results (table)
- Incident history

---

### Week 7-8: Public Status Page

#### Task 4.1: Status Page Route & Layout (2 days)
**Priority: P0 - CRITICAL**  
**GitHub Issue:** #34  
**Files to create:**
- `apps/web/src/app/status/[slug]/page.tsx`
- `apps/web/src/components/status/StatusPageLayout.tsx`

**URL Structure:**
- `/status/[organization-slug]` - Main status page
- Example: `/status/acme-inc`

**Features:**
- Server-side rendering (SSR) or Static Generation (SSG)
- Public access (no auth required)
- SEO optimized

---

#### Task 4.2: Monitor Status Display (2 days)
**Priority: P0 - CRITICAL**  
**Files to create:**
- `apps/web/src/components/status/MonitorStatusList.tsx`
- `apps/web/src/components/status/MonitorStatusCard.tsx`

**Display:**
- All monitors for organization
- Current status (operational, degraded, down)
- Uptime percentage (90 days)
- Response time trend

---

#### Task 4.3: Incident Timeline (2 days)
**Priority: P0 - CRITICAL**  
**GitHub Issue:** #35  
**Files to create:**
- `apps/web/src/components/status/IncidentTimeline.tsx`
- `apps/web/src/components/status/IncidentCard.tsx`

**Display:**
- Recent incidents (last 30 days)
- Incident status and severity
- Timeline of updates
- Resolved incidents with duration

---

#### Task 4.4: Service Grouping (2 days)
**Priority: P1 - HIGH**  
**GitHub Issue:** #36  
**Files to modify:**
- Status page components

**Feature:**
- Group monitors by project
- Collapsible sections
- Overall project status (all up, partial, all down)

---

### Week 9-10: Notifications

#### Task 5.1: Email Notification Setup (2 days)
**Priority: P0 - CRITICAL**  
**GitHub Issue:** #41  
**Files to create:**
- `apps/worker/src/notifications/email.ts`
- `apps/worker/src/notifications/templates/`

**Implementation:**
```typescript
import nodemailer from 'nodemailer';

export async function sendDownAlert(
  recipient: string,
  monitorName: string,
  error: string
) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: recipient,
    subject: `🚨 ${monitorName} is DOWN`,
    html: `
      <h2>Monitor Alert</h2>
      <p><strong>${monitorName}</strong> is currently down.</p>
      <p><strong>Error:</strong> ${error}</p>
      <p>We'll notify you when it's back up.</p>
    `,
  });
}
```

---

#### Task 5.2: Webhook Dispatcher (2 days)
**Priority: P0 - CRITICAL**  
**GitHub Issue:** #42  
**Files to create:**
- `apps/worker/src/notifications/webhook.ts`

**Implementation:**
```typescript
import axios from 'axios';

export async function sendWebhook(
  url: string,
  payload: WebhookPayload
) {
  try {
    await axios.post(url, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000,
    });
  } catch (error) {
    // Log failure but don't block
    console.error('Webhook delivery failed:', error);
  }
}

// Slack format
export function formatSlackMessage(monitor: Monitor, status: string) {
  return {
    text: status === 'down' 
      ? `🚨 ${monitor.name} is DOWN` 
      : `✅ ${monitor.name} is UP`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${monitor.name}*\nStatus: ${status}`
        }
      }
    ]
  };
}
```

---

#### Task 5.3: Notification Preferences UI (2 days)
**Priority: P1 - HIGH**  
**GitHub Issue:** #43  
**Files to create:**
- `apps/web/src/app/dashboard/monitors/[id]/notifications/page.tsx`

**Features:**
- Add/remove notification channels per monitor
- Configure email recipients
- Configure webhook URLs
- Test notification button

---

#### Task 5.4: Incident Auto-Creation (1 day)
**Priority: P0 - CRITICAL**  
**Files to modify:**
- `apps/worker/src/scheduler.ts`

**Logic:**
```typescript
// When monitor goes from 'up' to 'down'
if (previousStatus === 'up' && currentStatus === 'down') {
  // Create new incident
  const incident = await createIncident({
    monitor_id: monitor.id,
    title: `${monitor.name} is down`,
    status: 'investigating',
    severity: 'major',
    started_at: new Date(),
  });
  
  // Send notifications
  await notifyDownAlert(monitor, incident);
}

// When monitor recovers
if (previousStatus === 'down' && currentStatus === 'up') {
  // Resolve incident
  await resolveIncident(monitor.currentIncidentId);
  
  // Send recovery notification
  await notifyRecovery(monitor);
}
```

---

### Week 11: Testing & Polish

#### Task 6.1: Unit Tests (3 days)
**Priority: P1 - HIGH**  
**Coverage:**
- Monitor execution functions
- Uptime calculation
- Notification dispatchers

**Tools:**
- Jest for unit tests
- Supertest for API tests

---

#### Task 6.2: Integration Tests (2 days)
**Priority: P1 - HIGH**  
**Coverage:**
- Full check execution flow
- Database operations
- Authentication flow

---

#### Task 6.3: Performance Testing (2 days)
**Priority: P1 - HIGH**  
**Tests:**
- Worker can handle 1000+ monitors
- Database queries are optimized
- Status page loads in < 2s

---

### Week 12: Documentation & Launch

#### Task 7.1: Installation Documentation (2 days)
**Priority: P0 - CRITICAL**  
**Files to create:**
- `docs/INSTALLATION.md`
- `docs/CONFIGURATION.md`
- `docs/TROUBLESHOOTING.md`

---

#### Task 7.2: Docker Compose Refinement (2 days)
**Priority: P0 - CRITICAL**  
**Files to update:**
- `docker/docker-compose.yml`
- `docker/README.md`

**Test:**
- Fresh install from Docker Compose works
- All services start correctly
- Database migrations run automatically

---

#### Task 7.3: Launch Preparation (1 day)
**Priority: P0 - CRITICAL**  
**Actions:**
- Create GitHub release v0.1.0
- Write release notes
- Prepare Reddit post for r/selfhosted
- Prepare Hacker News submission
- Set up Discord server

---

## 🚀 Critical Path Summary

**Must be completed in order:**

1. ✅ Environment Setup (Day 1-2)
2. ✅ Authentication (Week 1)
3. ✅ Organization Creation (Week 2)
4. ✅ HTTP Monitor Implementation (Week 3)
5. ✅ Check Scheduling (Week 3-4)
6. ✅ Monitor Management UI (Week 5-6)
7. ✅ Status Page (Week 7-8)
8. ✅ Notifications (Week 9-10)
9. ✅ Testing (Week 11)
10. ✅ Documentation & Launch (Week 12)

---

## 📊 Progress Tracking

Use GitHub Issues with `phase-1` label to track:
- [ ] #48 - HTTP/HTTPS Monitor Implementation
- [ ] #50 - TCP Port Monitoring
- [ ] #52 - Check Scheduling & Queue System
- [ ] #53 - Historical Data & Result Persistence
- [ ] #34 - Public Status Page Renderer
- [ ] #35 - Incident Management Interface
- [ ] #41 - Email Notifications (SMTP)
- [ ] #42 - Webhook Dispatcher

---

## 🎯 Success Criteria

### Technical
- ✅ Can monitor 100+ HTTP endpoints
- ✅ Check results stored in database
- ✅ Public status page loads in < 2s
- ✅ Email alerts sent within 30s of downtime
- ✅ Docker Compose deployment works

### User Experience
- ✅ Sign up and create first monitor in < 5 minutes
- ✅ Status page looks professional
- ✅ Clear error messages and validation

### Community
- 🎯 100 GitHub stars within 30 days
- 🎯 50 Discord members
- 🎯 < 5 critical bugs reported

---

## 🆘 Getting Help

- **Issues:** https://github.com/EAasen/signalsync-core/issues
- **Discussions:** https://github.com/EAasen/signalsync-core/discussions
- **Discord:** (coming soon)

---

## 📝 Next Steps

**Start NOW:**
1. Run `pnpm install`
2. Create `.env` file
3. Set up Supabase project
4. Start implementing Task 1.1 (Auth integration)

**Questions?**
- Review `DEVELOPMENT-PLAN.md` for architecture details
- Check `PROJECT-STRUCTURE.md` for file organization
- See `ROADMAP.md` for long-term vision
