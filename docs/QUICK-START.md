# Quick Start Guide - SignalSync Development

## Immediate Next Steps

### 1️⃣ Install Dependencies (2 minutes)
```powershell
pnpm install
```

### 2️⃣ Setup Supabase (5 minutes)
1. Go to https://supabase.com/dashboard
2. Create new project
3. Copy credentials to `.env`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx
WORKER_CHECK_INTERVAL_MS=60000
WORKER_CONCURRENCY=10
```

### 3️⃣ Run Database Migrations (3 minutes)
In Supabase Dashboard → SQL Editor, run these files:
- `packages/database/supabase/migrations/001_initial_schema.sql`
- `packages/database/supabase/migrations/002_rls_policies.sql`
- `packages/database/supabase/migrations/003_functions.sql`

### 4️⃣ Start Development (1 minute)

**Terminal 1:**
```powershell
cd apps/web
pnpm dev
```

**Terminal 2:**
```powershell
cd apps/worker
pnpm dev
```

### 5️⃣ Test the System (5 minutes)
1. Open http://localhost:3000
2. Sign up with email/password
3. Create organization on onboarding page
4. Open Supabase SQL Editor and create test monitor:

```sql
-- Get your project ID
SELECT id, name FROM projects;

-- Create test monitor (replace PROJECT_ID)
INSERT INTO monitors (project_id, name, type, config, interval_seconds, timeout_seconds, status)
VALUES (
  'YOUR_PROJECT_ID',
  'Google Check',
  'http',
  '{"url": "https://www.google.com", "method": "GET", "expected_status_codes": [200]}'::jsonb,
  60,
  10,
  'up'
);
```

5. Wait 60 seconds and check results:
```sql
SELECT m.name, cr.status, cr.response_time_ms, cr.checked_at
FROM check_results cr
JOIN monitors m ON m.id = cr.monitor_id
ORDER BY cr.checked_at DESC
LIMIT 5;
```

---

## What's Working Right Now

✅ User authentication (signup/login/logout)  
✅ Organization creation with team ownership  
✅ Multi-tenant database with RLS policies  
✅ HTTP/HTTPS monitor execution  
✅ TCP port monitoring  
✅ SSL certificate checking  
✅ Automatic check scheduling every 60s  
✅ Incident creation when monitors go down  
✅ Auto-resolution when monitors recover  

---

## What's Next to Build

### Priority 1: Monitor Management UI (3-4 days)
- Form to create monitors via web interface
- Monitor list page at `/dashboard/monitors`
- Edit/delete monitor functionality
- Monitor detail page with check history

### Priority 2: Dashboard Enhancements (2-3 days)
- Show all monitors with current status
- Response time charts
- Uptime percentage calculations
- Recent incidents list

### Priority 3: Public Status Page (2-3 days)
- Public URL per project (e.g., `/status/[project-slug]`)
- Show monitor statuses
- Display incidents and updates
- Historical uptime data

---

## File Structure Reference

```
apps/
  web/                          # Next.js frontend
    src/
      app/
        dashboard/
          page.tsx              # Dashboard home
          onboarding/page.tsx   # Org creation form
          layout.tsx            # Protected layout
        login/page.tsx          # Login form
        signup/page.tsx         # Signup form
      components/
        dashboard/
          DashboardNav.tsx      # Top navigation
          OrganizationSwitcher.tsx  # Org dropdown
      lib/
        actions/
          organizations.ts      # Server actions for orgs
        auth/
          actions.ts            # Auth server actions
        context/
          OrganizationContext.tsx   # React context
        supabase/
          client.ts             # Browser Supabase client
          server.ts             # Server Supabase client
      middleware.ts             # Route protection

  worker/                       # Background worker
    src/
      monitors/
        http.ts                 # HTTP monitoring
        tcp.ts                  # TCP monitoring
        ssl.ts                  # SSL monitoring
        executor.ts             # Unified executor
      scheduler.ts              # Check scheduler
      index.ts                  # Worker entry point

packages/
  types/src/index.ts           # Shared TypeScript types
  database/
    src/index.ts               # Supabase clients
    supabase/migrations/       # Database schema
  logger/src/index.ts          # Logging utilities
```

---

## Common Commands

```powershell
# Install dependencies
pnpm install

# Start web app
cd apps/web
pnpm dev

# Start worker
cd apps/worker
pnpm dev

# Build everything
pnpm -r build

# Type check
pnpm -r typecheck

# Lint
pnpm -r lint

# Clean build artifacts
pnpm -r clean
```

---

## Environment Variables Explained

| Variable | Purpose | Where to Find |
|----------|---------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key (respects RLS) | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin key (bypasses RLS) | Supabase Dashboard → Settings → API |
| `WORKER_CHECK_INTERVAL_MS` | How often scheduler runs (ms) | Default: 60000 (60s) |
| `WORKER_CONCURRENCY` | Max concurrent checks | Default: 10 |

---

## Database Tables Quick Reference

| Table | Purpose |
|-------|---------|
| `auth.users` | Supabase auth users |
| `organizations` | Customer organizations |
| `team_members` | User→Org membership with roles |
| `projects` | Projects within organizations |
| `monitors` | Monitor configurations |
| `check_results` | Individual check results |
| `incidents` | Downtime incidents |
| `notification_preferences` | Alert configurations |

---

## Getting Help

**Documentation:**
- `/docs/PHASE-1-ACTION-PLAN.md` - Complete implementation plan
- `/docs/AUTH-SETUP-COMPLETE.md` - Authentication guide
- `/docs/HTTP-MONITOR-COMPLETE.md` - Monitor implementation details
- `/docs/PROJECT-STRUCTURE.md` - Architecture overview

**Check Logs:**
- Web app logs: Terminal running `pnpm dev` in apps/web
- Worker logs: Terminal running `pnpm dev` in apps/worker
- Database: Supabase Dashboard → Table Editor or SQL Editor

**Common Issues:**
- TypeScript errors after install → Run `pnpm -r build`
- Worker not finding monitors → Check service role key in .env
- Auth not working → Verify Supabase URL and anon key
- RLS policy errors → Make sure user is in team_members table

---

🚀 **You're ready to continue development!**
