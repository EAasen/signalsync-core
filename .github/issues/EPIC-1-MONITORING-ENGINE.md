# GitHub Issues - Epic 1: Monitoring Engine (Core)

This document outlines all issues for Epic 1. Create these as GitHub issues in your repository.

---

## Epic Issue

**Title:** [EPIC] Monitoring Engine (Core)

**Labels:** `epic`, `P0`, `phase-1`

**Description:**

### Epic Overview

**Epic Goal:** Build the stateless, horizontally-scalable monitoring worker that executes uptime checks and persists results.

**Target Milestone:** Phase 1 - Community Edition MVP

**Success Criteria:**
- Execute 1000+ concurrent HTTP checks without degradation
- < 5 second detection time for downtime events
- Zero false positives in production testing
- Support for HTTP, HTTPS, TCP, and keyword verification

### User Story

As a DevOps engineer or agency technician
I want to configure monitors that automatically check my services
So that I'm immediately alerted when something goes down

### Technical Scope

- Stateless worker design for horizontal scaling
- Queue-based job scheduling (Redis or Supabase Realtime)
- Protocol support: HTTP/HTTPS, TCP, SSL certificate checks
- Result persistence with historical tracking
- Retry logic and exponential backoff

### Related Issues

- [ ] #2 - HTTP/HTTPS Monitor Implementation
- [ ] #3 - Keyword/Content Verification
- [ ] #4 - TCP Port Monitoring
- [ ] #5 - SSL Certificate Expiry Detection
- [ ] #6 - Check Scheduling & Queue System
- [ ] #7 - Historical Data & Result Persistence
- [ ] #8 - Retry Logic & False Positive Prevention

### Dependencies

- Supabase database schema (Epic 2)
- Authentication system (Epic 2)

---

## Issue #2: HTTP/HTTPS Monitor Implementation

**Title:** [FEATURE] HTTP/HTTPS Monitor with Status Code Validation

**Labels:** `enhancement`, `P0`, `phase-1`, `good first issue`

**Milestone:** Phase 1 MVP

**Description:**

### Feature Description

Implement the core HTTP/HTTPS monitoring capability that checks web endpoints and validates response status codes.

**Which edition does this apply to?**
- [x] Community Edition (Self-Hosted)
- [x] Agency Cloud (SaaS)
- [x] Both

### User Story

As a user monitoring web services
I want to configure HTTP/HTTPS checks with expected status codes
So that I'm alerted when services return errors or become unreachable

### Proposed Solution

**Core Functionality:**
- Accept URL, method (GET, POST, PUT, DELETE), and expected status codes
- Support custom headers (e.g., Authorization, User-Agent)
- Follow redirects (configurable: yes/no)
- Validate SSL certificates (fail on invalid certs)
- Record response time (TTFB - Time To First Byte)
- Support HTTP/2 and HTTP/3 protocols

**Configuration Schema:**
```typescript
interface HttpMonitor {
  id: string;
  type: 'http' | 'https';
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: string;
  expectedStatusCodes: number[]; // e.g., [200, 201, 204]
  followRedirects: boolean;
  timeout: number; // milliseconds
  interval: number; // seconds between checks
  validateSSL: boolean;
}
```

**Success Response:**
```typescript
interface CheckResult {
  monitorId: string;
  timestamp: Date;
  status: 'up' | 'down';
  responseTime: number; // milliseconds
  statusCode: number;
  error?: string;
  metadata?: {
    resolvedIP?: string;
    certificateExpiry?: Date;
  };
}
```

### Technical Considerations

**Libraries:**
- Use `axios` or `undici` for HTTP requests
- Consider `got` for advanced retry logic
- Use native Node.js `https` module for certificate inspection

**Error Handling:**
- Network errors (ECONNREFUSED, ETIMEDOUT)
- DNS resolution failures
- SSL certificate errors
- Invalid responses

**Performance:**
- Use HTTP keep-alive for repeated checks
- Implement connection pooling
- Ensure non-blocking async execution

### Acceptance Criteria

- [ ] Monitor executes HTTP GET requests successfully
- [ ] Validates status codes against expected values
- [ ] Records response time accurately
- [ ] Handles network errors gracefully
- [ ] Follows redirects when configured
- [ ] Validates SSL certificates
- [ ] Unit tests achieve 80%+ coverage
- [ ] Integration test verifies end-to-end flow

### Related Issues

- Relates to #3 (Keyword Verification)
- Relates to #6 (Scheduling)
- Blocked by database schema (Epic 2)

---

## Issue #3: Keyword/Content Verification

**Title:** [FEATURE] Keyword/Content Match Verification for HTTP Monitors

**Labels:** `enhancement`, `P0`, `phase-1`

**Milestone:** Phase 1 MVP

**Description:**

### Feature Description

Add the ability to verify that HTTP response bodies contain (or don't contain) specific strings or regex patterns.

**Which edition does this apply to?**
- [x] Community Edition (Self-Hosted)
- [x] Agency Cloud (SaaS)
- [x] Both

### User Story

As a user monitoring web applications
I want to verify that responses contain expected content
So that I can detect "soft failures" where a page returns 200 but shows an error message

### Proposed Solution

**Common Use Cases:**
1. API returns `200 OK` but body contains `{"error": "Database connection failed"}`
2. Web page returns 200 but displays "503 Service Unavailable" message
3. E-commerce site should contain "Add to Cart" button
4. Admin page should NOT contain "Maintenance Mode"

**Configuration:**
```typescript
interface ContentVerification {
  type: 'contains' | 'not-contains' | 'regex';
  pattern: string;
  caseSensitive: boolean;
}
```

**Examples:**
```typescript
// Positive match - must contain
{
  type: 'contains',
  pattern: 'Welcome to Dashboard',
  caseSensitive: false
}

// Negative match - must NOT contain
{
  type: 'not-contains',
  pattern: 'Database Error',
  caseSensitive: false
}

// Regex match
{
  type: 'regex',
  pattern: '<title>.*Dashboard.*</title>',
  caseSensitive: false
}
```

### Technical Considerations

**Performance:**
- Limit response body parsing to first 1MB (configurable)
- Use streaming for large responses
- Early exit if match found (don't parse entire body)

**Security:**
- Sanitize regex patterns to prevent ReDoS attacks
- Implement regex timeout (100ms max)
- Validate patterns before saving

### Acceptance Criteria

- [ ] Supports 'contains' verification
- [ ] Supports 'not-contains' verification
- [ ] Supports regex pattern matching
- [ ] Case-sensitive and case-insensitive modes
- [ ] Protects against ReDoS attacks
- [ ] Unit tests cover edge cases
- [ ] Documentation includes examples

### Related Issues

- Depends on #2 (HTTP Monitor)
- Relates to #7 (Result Persistence)

---

## Issue #4: TCP Port Monitoring

**Title:** [FEATURE] TCP Port Connectivity Monitoring

**Labels:** `enhancement`, `P0`, `phase-1`

**Milestone:** Phase 1 MVP

**Description:**

### Feature Description

Enable monitoring of arbitrary TCP ports to verify services like databases, mail servers, and custom applications are accepting connections.

**Which edition does this apply to?**
- [x] Community Edition (Self-Hosted)
- [x] Agency Cloud (SaaS)
- [x] Both

### User Story

As a user managing backend infrastructure
I want to monitor TCP ports (e.g., PostgreSQL 5432, Redis 6379)
So that I'm alerted when services stop accepting connections

### Proposed Solution

**Configuration:**
```typescript
interface TcpMonitor {
  id: string;
  type: 'tcp';
  host: string;
  port: number;
  timeout: number; // milliseconds
  interval: number; // seconds between checks
}
```

**Common Use Cases:**
- PostgreSQL: `host: db.example.com, port: 5432`
- Redis: `host: cache.example.com, port: 6379`
- SMTP: `host: mail.example.com, port: 25`
- Custom API: `host: api.internal.com, port: 8080`

**Implementation:**
```typescript
import net from 'net';

async function checkTcpPort(host: string, port: number, timeout: number): Promise<CheckResult> {
  const startTime = Date.now();
  
  return new Promise((resolve) => {
    const socket = new net.Socket();
    
    socket.setTimeout(timeout);
    
    socket.on('connect', () => {
      const responseTime = Date.now() - startTime;
      socket.destroy();
      resolve({
        status: 'up',
        responseTime,
        timestamp: new Date()
      });
    });
    
    socket.on('timeout', () => {
      socket.destroy();
      resolve({
        status: 'down',
        error: 'Connection timeout',
        timestamp: new Date()
      });
    });
    
    socket.on('error', (err) => {
      socket.destroy();
      resolve({
        status: 'down',
        error: err.message,
        timestamp: new Date()
      });
    });
    
    socket.connect(port, host);
  });
}
```

### Technical Considerations

**Error Types:**
- `ECONNREFUSED` - Port is closed or service not running
- `ETIMEDOUT` - Host is unreachable or firewall blocking
- `EHOSTUNREACH` - Network routing issue

**Performance:**
- Use connection pooling for repeated checks? (Investigate)
- Ensure sockets are properly destroyed to prevent leaks

### Acceptance Criteria

- [ ] Successfully detects open TCP ports
- [ ] Correctly identifies closed/filtered ports
- [ ] Records connection time accurately
- [ ] Handles all common error types
- [ ] No socket leaks (verified with load testing)
- [ ] Unit tests for success and failure scenarios
- [ ] Integration test with real TCP server

### Related Issues

- Relates to #2 (HTTP Monitor)
- Relates to #6 (Scheduling)

---

## Issue #5: SSL Certificate Expiry Detection

**Title:** [FEATURE] SSL Certificate Expiry Monitoring & Alerts

**Labels:** `enhancement`, `P1`, `phase-3`, `saas-only`

**Milestone:** Phase 3 - SaaS Launch

**Description:**

### Feature Description

Monitor SSL certificates and alert users 30, 14, 7, and 1 day(s) before expiration.

**Which edition does this apply to?**
- [ ] Community Edition (Self-Hosted)
- [x] Agency Cloud (SaaS)
- [ ] Both

*Note: This is a high-value SaaS differentiator. Agencies manage hundreds of domains and frequently forget to renew certificates.*

### User Story

As an agency managing client domains
I want automatic alerts before SSL certificates expire
So that I can renew them proactively and avoid client downtime

### Proposed Solution

**Configuration:**
```typescript
interface SslMonitor {
  id: string;
  type: 'ssl';
  domain: string;
  port: number; // typically 443
  alertThresholds: number[]; // days before expiry [30, 14, 7, 1]
  interval: number; // check once per day
}
```

**Implementation:**
```typescript
import tls from 'tls';

async function checkSslCertificate(domain: string, port: number = 443): Promise<CertificateInfo> {
  return new Promise((resolve, reject) => {
    const socket = tls.connect(port, domain, { servername: domain }, () => {
      const cert = socket.getPeerCertificate();
      
      if (!cert || !Object.keys(cert).length) {
        return reject(new Error('No certificate found'));
      }
      
      const validTo = new Date(cert.valid_to);
      const daysUntilExpiry = Math.floor((validTo.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      
      socket.end();
      
      resolve({
        domain,
        issuer: cert.issuer.O,
        validFrom: new Date(cert.valid_from),
        validTo,
        daysUntilExpiry,
        isValid: daysUntilExpiry > 0
      });
    });
    
    socket.on('error', reject);
  });
}
```

**Alert Logic:**
- Check once per day (no need for frequent checks)
- Send alert when crossing threshold (30 → 29 days)
- Don't spam: Only alert once per threshold
- Track alert history in database

### Technical Considerations

**Edge Cases:**
- Self-signed certificates (should flag as warning)
- Certificate chain validation
- SNI (Server Name Indication) support for multi-domain hosts

**Database Schema:**
```sql
CREATE TABLE ssl_alerts_sent (
  id UUID PRIMARY KEY,
  monitor_id UUID REFERENCES monitors(id),
  threshold_days INT,
  sent_at TIMESTAMPTZ,
  certificate_expiry TIMESTAMPTZ
);
```

### Acceptance Criteria

- [ ] Correctly parses SSL certificate details
- [ ] Calculates days until expiry accurately
- [ ] Sends alerts at configured thresholds
- [ ] Doesn't duplicate alerts for same threshold
- [ ] Handles self-signed certificates
- [ ] Works with SNI for shared hosting
- [ ] Unit tests for certificate parsing
- [ ] Integration test with real SSL endpoint

### Related Issues

- Relates to #2 (HTTP Monitor - shares SSL validation)
- Relates to Epic 4 (Notification system)
- Requires alert deduplication logic

---

## Issue #6: Check Scheduling & Queue System

**Title:** [FEATURE] Distributed Check Scheduling with Queue Management

**Labels:** `enhancement`, `P0`, `phase-1`

**Milestone:** Phase 1 MVP

**Description:**

### Feature Description

Implement a robust scheduling system that queues monitor checks and distributes them across worker instances.

**Which edition does this apply to?**
- [x] Community Edition (Self-Hosted)
- [x] Agency Cloud (SaaS)
- [x] Both

### User Story

As a platform operator
I want monitors to execute at precise intervals
So that checks are reliable and the system can scale horizontally

### Proposed Solution

**Requirements:**
1. Schedule checks based on `interval` (e.g., every 60 seconds)
2. Distribute work across multiple worker instances
3. Ensure each check runs exactly once (no duplicates)
4. Handle worker failures gracefully
5. Support priority queues (critical monitors first)

**Architecture Options:**

**Option A: Redis-based Queue (Recommended for SaaS)**
- Use BullMQ for job scheduling
- Pros: Battle-tested, supports distributed workers, retries, priorities
- Cons: Additional infrastructure dependency

**Option B: Supabase Realtime (Lightweight for Community Edition)**
- Use Supabase `pg_cron` extension + Realtime subscriptions
- Pros: No additional dependencies, simpler self-hosting
- Cons: Less mature, potential scaling limitations

**Recommended Hybrid Approach:**
- Community Edition: Supabase pg_cron
- SaaS: Redis + BullMQ

### Technical Implementation (BullMQ)

```typescript
import { Queue, Worker } from 'bullmq';

// Producer: Schedule checks
const monitorQueue = new Queue('monitor-checks', {
  connection: redisConnection
});

// Add recurring job
await monitorQueue.add(
  'http-check',
  { monitorId: 'abc123', url: 'https://example.com' },
  {
    repeat: {
      every: 60000 // 60 seconds
    },
    priority: monitor.priority
  }
);

// Consumer: Execute checks
const worker = new Worker('monitor-checks', async (job) => {
  const result = await executeCheck(job.data);
  await saveCheckResult(result);
}, {
  connection: redisConnection,
  concurrency: 100 // Process 100 checks simultaneously
});
```

### Acceptance Criteria

- [ ] Monitors execute at configured intervals (±5 second accuracy)
- [ ] Multiple workers can process queue concurrently
- [ ] Failed checks are retried automatically (max 3 attempts)
- [ ] High-priority monitors execute first
- [ ] System handles 10,000+ monitors without degradation
- [ ] Worker crashes don't lose in-flight jobs
- [ ] Unit tests for scheduling logic
- [ ] Load test with 1000+ concurrent monitors

### Related Issues

- Blocks #2, #3, #4 (all monitor types)
- Relates to #8 (retry logic)

---

## Issue #7: Historical Data & Result Persistence

**Title:** [FEATURE] Check Result Storage with Historical Tracking

**Labels:** `enhancement`, `P0`, `phase-1`

**Milestone:** Phase 1 MVP

**Description:**

### Feature Description

Persist check results to the database with efficient querying for uptime calculations and historical graphs.

**Which edition does this apply to?**
- [x] Community Edition (Self-Hosted)
- [x] Agency Cloud (SaaS)
- [x] Both

### User Story

As a user viewing a status page
I want to see historical uptime percentages and incident timelines
So that I can assess service reliability over time

### Proposed Solution

**Database Schema:**
```sql
CREATE TABLE check_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monitor_id UUID NOT NULL REFERENCES monitors(id) ON DELETE CASCADE,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('up', 'down', 'degraded')),
  response_time_ms INT,
  status_code INT,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_check_results_monitor_time ON check_results(monitor_id, checked_at DESC);
CREATE INDEX idx_check_results_status ON check_results(monitor_id, status);

-- RLS Policy
ALTER TABLE check_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view check results for their monitors"
  ON check_results FOR SELECT
  USING (
    monitor_id IN (
      SELECT id FROM monitors 
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid()
      )
    )
  );
```

**Retention Policy:**
- Community Edition: Keep 24 hours of raw data (configurable)
- SaaS Starter: Keep 30 days of raw data
- SaaS Pro: Keep 1 year of raw data + aggregated statistics forever

**Data Aggregation (for long-term storage):**
```sql
CREATE TABLE uptime_statistics (
  id UUID PRIMARY KEY,
  monitor_id UUID REFERENCES monitors(id),
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  period_type TEXT, -- 'hour', 'day', 'week', 'month'
  total_checks INT,
  successful_checks INT,
  failed_checks INT,
  avg_response_time_ms DECIMAL,
  uptime_percentage DECIMAL(5,2)
);
```

### Query Examples

**Calculate uptime percentage (last 30 days):**
```sql
SELECT 
  COUNT(*) FILTER (WHERE status = 'up') * 100.0 / COUNT(*) as uptime_percentage
FROM check_results
WHERE monitor_id = $1
  AND checked_at > NOW() - INTERVAL '30 days';
```

**Get response time trend:**
```sql
SELECT 
  DATE_TRUNC('hour', checked_at) as hour,
  AVG(response_time_ms) as avg_response_time,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time_ms) as p95_response_time
FROM check_results
WHERE monitor_id = $1
  AND checked_at > NOW() - INTERVAL '7 days'
  AND status = 'up'
GROUP BY hour
ORDER BY hour;
```

### Acceptance Criteria

- [ ] Check results persist to database successfully
- [ ] RLS policies prevent cross-tenant data access
- [ ] Queries for uptime calculation execute in < 100ms
- [ ] Retention policies clean up old data automatically
- [ ] Aggregation job runs daily for SaaS accounts
- [ ] Indexes optimize common query patterns
- [ ] Unit tests for data access layer
- [ ] Load test with 1M+ records

### Related Issues

- Depends on Epic 2 (database schema)
- Used by Epic 3 (status page display)
- Required for Epic 8 (SLA reporting)

---

## Issue #8: Retry Logic & False Positive Prevention

**Title:** [FEATURE] Smart Retry Logic with False Positive Prevention

**Labels:** `enhancement`, `P1`, `phase-1`

**Milestone:** Phase 1 MVP

**Description:**

### Feature Description

Implement intelligent retry mechanisms to reduce false positives caused by transient network issues.

**Which edition does this apply to?**
- [x] Community Edition (Self-Hosted)
- [x] Agency Cloud (SaaS)
- [x] Both

### User Story

As a user receiving alerts
I want to avoid false alarms from temporary network glitches
So that I only respond to real outages

### Proposed Solution

**Problem:**
A single failed check doesn't necessarily mean a service is down:
- Temporary DNS resolution failure
- Network congestion causing timeout
- Service restarted and took 5 seconds to recover
- Rate limiting or CDN hiccup

**Solution: Multi-Tier Verification**

**Tier 1: Immediate Retry**
- If check fails, retry 2 more times immediately (2 second intervals)
- Only mark as "down" if all 3 attempts fail

**Tier 2: Confirmation Check (SaaS only - Phase 4)**
- After Tier 1 failure, trigger checks from 2 other geographic regions
- Use consensus: Mark down only if 2+ regions agree

**Implementation:**
```typescript
async function executeCheckWithRetry(monitor: Monitor): Promise<CheckResult> {
  const maxRetries = 3;
  const retryDelay = 2000; // 2 seconds
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const result = await executeCheck(monitor);
    
    if (result.status === 'up') {
      return result; // Success, no need to retry
    }
    
    if (attempt < maxRetries) {
      await sleep(retryDelay);
      console.log(`Retry ${attempt}/${maxRetries} for monitor ${monitor.id}`);
    }
  }
  
  // All retries failed
  return {
    status: 'down',
    error: 'Failed after 3 attempts',
    timestamp: new Date()
  };
}
```

**Exponential Backoff (for persistent failures):**
```typescript
// After initial failure, increase check frequency temporarily
// to quickly detect recovery
const intervals = [30, 60, 120, 300]; // seconds
```

### Configuration

Allow users to tune sensitivity:
```typescript
interface RetryConfig {
  enabled: boolean;
  maxRetries: number;
  retryDelay: number; // milliseconds
  requireConsensus: boolean; // multi-region (SaaS only)
}
```

### Acceptance Criteria

- [ ] Failed checks retry 2 additional times
- [ ] Successful retry prevents false alert
- [ ] Retry delay is configurable
- [ ] Exponential backoff after confirmed downtime
- [ ] Unit tests for retry logic
- [ ] Integration test simulates transient failures
- [ ] Documentation explains retry behavior

### Related Issues

- Relates to #2, #3, #4 (all monitor types)
- Relates to Epic 4 (alert triggering logic)
- Future enhancement: #9 (multi-region consensus)

---

## Testing Strategy for Epic 1

### Unit Tests
- Mock network calls using `nock` or `msw`
- Test error handling for all failure modes
- Verify retry logic with controlled failures

### Integration Tests
- Spin up real HTTP server with `express`
- Test TCP server with `net.createServer`
- Verify database persistence

### Load Tests
- Use `k6` or `Artillery` to simulate 1000+ concurrent checks
- Measure memory usage and CPU under load
- Verify no connection/socket leaks

### E2E Tests
- Full workflow: Create monitor → Execute check → Store result → Display on status page
