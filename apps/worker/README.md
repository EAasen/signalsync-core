# Monitoring Worker

The background service that executes uptime checks for SignalSync monitors.

## Features

- HTTP/HTTPS monitoring with status code and keyword verification
- TCP port monitoring
- SSL certificate expiry monitoring
- Configurable check intervals and timeouts
- Automatic incident creation on status changes
- Horizontal scalability

## Getting Started

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm dev

# Build for production
pnpm build

# Run in production
pnpm start
```

## Configuration

Environment variables:

```bash
# Supabase (required)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx

# Worker settings
WORKER_CHECK_INTERVAL_MS=60000    # How often to poll for monitors (default: 60s)
WORKER_CONCURRENCY=10              # Max concurrent checks (default: 10)

# Logging
LOG_LEVEL=info                     # debug, info, warn, error
```

## Architecture

### Scheduler
- Polls the database every 60 seconds for monitors that need checking
- Batches monitors and executes checks with concurrency control
- Updates monitor status and last_checked_at timestamp

### Monitor Types

**HTTP Monitor** (`monitors/http.ts`)
- Sends HTTP/HTTPS requests
- Validates status codes
- Optional keyword verification in response body
- Supports custom headers and methods

**TCP Monitor** (`monitors/tcp.ts`)
- Tests TCP port connectivity
- Simple socket connection test
- Useful for non-HTTP services

**SSL Monitor** (`monitors/ssl.ts`)
- Checks SSL certificate validity
- Monitors certificate expiry dates
- Warns N days before expiration

### Check Results
- All check results are stored in `check_results` table
- Includes response time, status, and error messages
- Time-series data for historical analysis

### Auto-Incident Creation
- Database triggers automatically create incidents when monitors go down
- Incidents are auto-resolved when monitors recover
- See `packages/database/supabase/migrations/003_functions.sql`

## Scaling

### Horizontal Scaling
Run multiple worker instances for increased capacity:

```bash
# Instance 1
pnpm start

# Instance 2 (on another server)
pnpm start
```

Workers coordinate through the database - no additional setup needed.

### Regional Deployment
For distributed monitoring from multiple locations:
- Deploy workers in different regions (US, EU, APAC)
- Tag monitors with preferred check regions
- Implement consensus logic (Phase 4 feature)

## Troubleshooting

### Worker not executing checks

1. Check database connection:
   ```bash
   # Verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
   ```

2. Check for active monitors:
   ```sql
   SELECT * FROM monitors WHERE status IN ('up', 'down');
   ```

3. Check worker logs:
   ```bash
   pnpm dev
   # Look for "Scheduling monitor checks" messages
   ```

### Checks timing out

Increase timeout values:
```bash
# In monitor configuration
timeout_seconds: 30  # Increase this value
```

### High memory usage

Reduce concurrency:
```bash
WORKER_CONCURRENCY=5  # Lower this value
```
