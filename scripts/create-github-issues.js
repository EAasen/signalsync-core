#!/usr/bin/env node

/**
 * Script to bulk-create GitHub issues from epic documentation
 * 
 * Prerequisites:
 * 1. Install GitHub CLI: https://cli.github.com/
 * 2. Authenticate: gh auth login
 * 3. Install dependencies: npm install
 * 
 * Usage:
 *   node scripts/create-github-issues.js
 * 
 * This will create all issues defined in the ISSUES array below.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Repository configuration
const REPO_OWNER = 'EAasen';
const REPO_NAME = 'signalsync-core';

// Issue definitions
const ISSUES = [
  // ============================================
  // EPIC 1: Monitoring Engine (Core)
  // ============================================
  {
    epic: 1,
    number: 1,
    title: '[EPIC] Monitoring Engine (Core)',
    labels: ['epic', 'P0', 'phase-1'],
    milestone: 'Phase 1 - MVP',
    body: `### Epic Overview

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

- #2 - HTTP/HTTPS Monitor Implementation
- #3 - Keyword/Content Verification
- #4 - TCP Port Monitoring
- #5 - SSL Certificate Expiry Detection
- #6 - Check Scheduling & Queue System
- #7 - Historical Data & Result Persistence
- #8 - Retry Logic & False Positive Prevention

### Dependencies

- Supabase database schema (Epic 2)
- Authentication system (Epic 2)

### Documentation

See [EPIC-1-MONITORING-ENGINE.md](.github/issues/EPIC-1-MONITORING-ENGINE.md) for detailed implementation guide.`
  },
  {
    epic: 1,
    number: 2,
    title: 'HTTP/HTTPS Monitor Implementation',
    labels: ['enhancement', 'P0', 'phase-1', 'good first issue'],
    milestone: 'Phase 1 - MVP',
    body: `### Feature Description

Implement the core HTTP/HTTPS monitoring capability that checks web endpoints and validates response status codes.

**Which edition does this apply to?**
- [x] Community Edition (Self-Hosted)
- [x] Agency Cloud (SaaS)

### User Story

As a user monitoring web services
I want to configure HTTP/HTTPS checks with expected status codes
So that I'm alerted when services return errors or become unreachable

### Key Features

- Accept URL, method (GET, POST, PUT, DELETE), and expected status codes
- Support custom headers (e.g., Authorization, User-Agent)
- Follow redirects (configurable: yes/no)
- Validate SSL certificates (fail on invalid certs)
- Record response time (TTFB - Time To First Byte)
- Support HTTP/2 and HTTP/3 protocols

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
- Part of #1 (Epic 1)

### Documentation

See [EPIC-1-MONITORING-ENGINE.md](.github/issues/EPIC-1-MONITORING-ENGINE.md#issue-2) for detailed implementation guide.`
  },
  {
    epic: 1,
    number: 3,
    title: 'Keyword/Content Verification for HTTP Monitors',
    labels: ['enhancement', 'P0', 'phase-1'],
    milestone: 'Phase 1 - MVP',
    body: `### Feature Description

Add the ability to verify that HTTP response bodies contain (or don't contain) specific strings or regex patterns.

**Which edition does this apply to?**
- [x] Community Edition (Self-Hosted)
- [x] Agency Cloud (SaaS)

### User Story

As a user monitoring web applications
I want to verify that responses contain expected content
So that I can detect "soft failures" where a page returns 200 but shows an error message

### Common Use Cases

1. API returns \`200 OK\` but body contains \`{"error": "Database connection failed"}\`
2. Web page returns 200 but displays "503 Service Unavailable" message
3. E-commerce site should contain "Add to Cart" button
4. Admin page should NOT contain "Maintenance Mode"

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
- Part of #1 (Epic 1)

### Documentation

See [EPIC-1-MONITORING-ENGINE.md](.github/issues/EPIC-1-MONITORING-ENGINE.md#issue-3) for detailed implementation guide.`
  },
  {
    epic: 1,
    number: 4,
    title: 'TCP Port Monitoring',
    labels: ['enhancement', 'P0', 'phase-1'],
    milestone: 'Phase 1 - MVP',
    body: `### Feature Description

Enable monitoring of arbitrary TCP ports to verify services like databases, mail servers, and custom applications are accepting connections.

**Which edition does this apply to?**
- [x] Community Edition (Self-Hosted)
- [x] Agency Cloud (SaaS)

### User Story

As a user managing backend infrastructure
I want to monitor TCP ports (e.g., PostgreSQL 5432, Redis 6379)
So that I'm alerted when services stop accepting connections

### Common Use Cases

- PostgreSQL: \`host: db.example.com, port: 5432\`
- Redis: \`host: cache.example.com, port: 6379\`
- SMTP: \`host: mail.example.com, port: 25\`
- Custom API: \`host: api.internal.com, port: 8080\`

### Acceptance Criteria

- [ ] Successfully detects open TCP ports
- [ ] Correctly identifies closed/filtered ports
- [ ] Records connection time accurately
- [ ] Handles all common error types (ECONNREFUSED, ETIMEDOUT, EHOSTUNREACH)
- [ ] No socket leaks (verified with load testing)
- [ ] Unit tests for success and failure scenarios
- [ ] Integration test with real TCP server

### Related Issues

- Relates to #2 (HTTP Monitor)
- Relates to #6 (Scheduling)
- Part of #1 (Epic 1)

### Documentation

See [EPIC-1-MONITORING-ENGINE.md](.github/issues/EPIC-1-MONITORING-ENGINE.md#issue-4) for detailed implementation guide.`
  },
  {
    epic: 1,
    number: 5,
    title: 'SSL Certificate Expiry Detection',
    labels: ['enhancement', 'P1', 'phase-3', 'saas-only'],
    milestone: 'Phase 3 - SaaS Launch',
    body: `### Feature Description

Monitor SSL certificates and alert users 30, 14, 7, and 1 day(s) before expiration.

**Which edition does this apply to?**
- [ ] Community Edition (Self-Hosted)
- [x] Agency Cloud (SaaS)

*Note: This is a high-value SaaS differentiator. Agencies manage hundreds of domains and frequently forget to renew certificates.*

### User Story

As an agency managing client domains
I want automatic alerts before SSL certificates expire
So that I can renew them proactively and avoid client downtime

### Key Features

- Check once per day (no need for frequent checks)
- Send alert when crossing threshold (30 → 29 days)
- Don't spam: Only alert once per threshold
- Track alert history in database
- Handle self-signed certificates (flag as warning)
- Certificate chain validation
- SNI (Server Name Indication) support

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
- Part of #1 (Epic 1)

### Documentation

See [EPIC-1-MONITORING-ENGINE.md](.github/issues/EPIC-1-MONITORING-ENGINE.md#issue-5) for detailed implementation guide.`
  },
  {
    epic: 1,
    number: 6,
    title: 'Check Scheduling & Queue System',
    labels: ['enhancement', 'P0', 'phase-1'],
    milestone: 'Phase 1 - MVP',
    body: `### Feature Description

Implement a robust scheduling system that queues monitor checks and distributes them across worker instances.

**Which edition does this apply to?**
- [x] Community Edition (Self-Hosted)
- [x] Agency Cloud (SaaS)

### User Story

As a platform operator
I want monitors to execute at precise intervals
So that checks are reliable and the system can scale horizontally

### Requirements

1. Schedule checks based on \`interval\` (e.g., every 60 seconds)
2. Distribute work across multiple worker instances
3. Ensure each check runs exactly once (no duplicates)
4. Handle worker failures gracefully
5. Support priority queues (critical monitors first)

### Architecture Options

**Option A: Redis-based Queue (Recommended for SaaS)**
- Use BullMQ for job scheduling
- Pros: Battle-tested, supports distributed workers, retries, priorities
- Cons: Additional infrastructure dependency

**Option B: Supabase Realtime (Lightweight for Community Edition)**
- Use Supabase \`pg_cron\` extension + Realtime subscriptions
- Pros: No additional dependencies, simpler self-hosting
- Cons: Less mature, potential scaling limitations

**Recommended Hybrid Approach:**
- Community Edition: Supabase pg_cron
- SaaS: Redis + BullMQ

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
- Part of #1 (Epic 1)

### Documentation

See [EPIC-1-MONITORING-ENGINE.md](.github/issues/EPIC-1-MONITORING-ENGINE.md#issue-6) for detailed implementation guide.`
  },
  {
    epic: 1,
    number: 7,
    title: 'Historical Data & Result Persistence',
    labels: ['enhancement', 'P0', 'phase-1'],
    milestone: 'Phase 1 - MVP',
    body: `### Feature Description

Persist check results to the database with efficient querying for uptime calculations and historical graphs.

**Which edition does this apply to?**
- [x] Community Edition (Self-Hosted)
- [x] Agency Cloud (SaaS)

### User Story

As a user viewing a status page
I want to see historical uptime percentages and incident timelines
So that I can assess service reliability over time

### Retention Policy

- Community Edition: Keep 24 hours of raw data (configurable)
- SaaS Starter: Keep 30 days of raw data
- SaaS Pro: Keep 1 year of raw data + aggregated statistics forever

### Key Features

- Database schema for check results
- RLS policies for data isolation
- Efficient indexes for queries
- Data aggregation for long-term storage
- Automatic cleanup of old data

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
- Part of #1 (Epic 1)

### Documentation

See [EPIC-1-MONITORING-ENGINE.md](.github/issues/EPIC-1-MONITORING-ENGINE.md#issue-7) for detailed implementation guide.`
  },
  {
    epic: 1,
    number: 8,
    title: 'Retry Logic & False Positive Prevention',
    labels: ['enhancement', 'P1', 'phase-1'],
    milestone: 'Phase 1 - MVP',
    body: `### Feature Description

Implement intelligent retry mechanisms to reduce false positives caused by transient network issues.

**Which edition does this apply to?**
- [x] Community Edition (Self-Hosted)
- [x] Agency Cloud (SaaS)

### User Story

As a user receiving alerts
I want to avoid false alarms from temporary network glitches
So that I only respond to real outages

### Problem

A single failed check doesn't necessarily mean a service is down:
- Temporary DNS resolution failure
- Network congestion causing timeout
- Service restarted and took 5 seconds to recover
- Rate limiting or CDN hiccup

### Solution: Multi-Tier Verification

**Tier 1: Immediate Retry**
- If check fails, retry 2 more times immediately (2 second intervals)
- Only mark as "down" if all 3 attempts fail

**Tier 2: Confirmation Check (SaaS only - Phase 4)**
- After Tier 1 failure, trigger checks from 2 other geographic regions
- Use consensus: Mark down only if 2+ regions agree

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
- Future enhancement: Multi-region consensus (Phase 4)
- Part of #1 (Epic 1)

### Documentation

See [EPIC-1-MONITORING-ENGINE.md](.github/issues/EPIC-1-MONITORING-ENGINE.md#issue-8) for detailed implementation guide.`
  },

  // ============================================
  // EPIC 2: Multi-Tenancy & Agency Management
  // ============================================
  {
    epic: 2,
    number: 9,
    title: '[EPIC] Multi-Tenancy & Agency Management',
    labels: ['epic', 'P0', 'phase-2'],
    milestone: 'Phase 2 - Multi-Tenant',
    body: `### Epic Overview

**Epic Goal:** Implement secure multi-tenant architecture allowing agencies to manage multiple client organizations from a unified dashboard.

**Target Milestone:** Phase 2 - Multi-Tenant Foundation

**Success Criteria:**
- Agency can manage 50+ client organizations without performance degradation
- Zero cross-tenant data leakage (verified by security audit)
- < 2 second load time for Mission Control dashboard
- Team members can be invited with granular RBAC permissions

### User Story

As an MSP managing multiple clients
I want to view and manage all client status pages from one dashboard
So that I can efficiently monitor my entire client portfolio

### Technical Scope

- Database schema with organization → project → monitor hierarchy
- Row Level Security (RLS) policies for tenant isolation
- Mission Control dashboard UI
- Team invitation and member management
- Role-Based Access Control (Admin, Editor, Viewer)
- Organization switching UX

### Related Issues

- #10 - Database Schema Design
- #11 - Row Level Security (RLS) Implementation
- #12 - Organization & Project CRUD APIs
- #13 - Mission Control Dashboard UI
- #14 - Team Member Invitation System
- #15 - Role-Based Access Control (RBAC)
- #16 - Organization Switcher Component

### Dependencies

- Supabase Auth (authentication)
- Epic 1 (monitoring engine uses organization-scoped data)

### Documentation

See [EPIC-2-MULTI-TENANCY.md](.github/issues/EPIC-2-MULTI-TENANCY.md) for detailed implementation guide.`
  },
  {
    epic: 2,
    number: 10,
    title: 'Database Schema Design',
    labels: ['enhancement', 'P0', 'phase-2', 'database'],
    milestone: 'Phase 2 - Multi-Tenant',
    body: `### Feature Description

Design and implement the core database schema supporting the organization → project → monitor hierarchy.

**Which edition does this apply to?**
- [x] Community Edition (Self-Hosted) - Limited to 1 org
- [x] Agency Cloud (SaaS) - Unlimited orgs

### User Story

As a platform architect
I want a database schema that enforces tenant isolation at the database level
So that application bugs cannot cause cross-tenant data leakage

### Schema Hierarchy

\`\`\`
profiles (users)
    ↓
organization_members (join table)
    ↓
organizations (tenants)
    ↓
projects (client systems/apps)
    ↓
monitors (checks)
    ↓
check_results (historical data)
\`\`\`

### Key Tables

- **profiles** - User accounts
- **organizations** - Tenants (clients)
- **organization_members** - Join table with roles
- **projects** - Logical grouping of monitors
- **monitors** - Uptime checks
- **check_results** - Historical data
- **incidents** - Outage tracking
- **incident_updates** - Timeline of updates

### Acceptance Criteria

- [ ] All tables created with proper relationships
- [ ] Foreign key constraints enforce referential integrity
- [ ] Indexes optimize common query patterns
- [ ] Denormalized \`organization_id\` maintained via triggers or application logic
- [ ] Schema supports both Community (1 org) and SaaS (many orgs) editions
- [ ] Migration script is idempotent and reversible
- [ ] Documentation includes ERD diagram

### Related Issues

- Blocks #11 (RLS policies depend on schema)
- Blocks #12 (CRUD APIs)
- Used by Epic 1 (monitors reference this schema)
- Part of #9 (Epic 2)

### Documentation

See [EPIC-2-MULTI-TENANCY.md](.github/issues/EPIC-2-MULTI-TENANCY.md#issue-10) for complete SQL schema.`
  },
  {
    epic: 2,
    number: 11,
    title: 'Row Level Security (RLS) Implementation',
    labels: ['enhancement', 'P0', 'phase-2', 'security', 'database'],
    milestone: 'Phase 2 - Multi-Tenant',
    body: `### Feature Description

Implement PostgreSQL Row Level Security (RLS) policies to enforce tenant isolation at the database level.

**Which edition does this apply to?**
- [x] Community Edition (Self-Hosted)
- [x] Agency Cloud (SaaS)

### User Story

As a security-conscious platform operator
I want database-level access controls
So that even if application code has bugs, users cannot access other tenants' data

### RLS Philosophy

- **Defense in Depth:** RLS is the LAST line of defense, not the first
- **Fail Secure:** Policies should deny by default
- **Performance:** Use indexes to make RLS checks fast

### Key Policies

- Users can only view organizations they're members of
- Users can only create/update/delete resources in their organizations
- Role-based permissions enforced (owner, admin, editor, viewer)
- Service role (worker) can bypass RLS to insert check results

### Acceptance Criteria

- [ ] All tables have RLS enabled
- [ ] Policies enforce role-based permissions
- [ ] Security tests verify cross-tenant isolation
- [ ] Performance tests show < 50ms overhead for RLS checks
- [ ] Documentation explains policy logic and testing approach
- [ ] Automated test suite runs on every migration

### Related Issues

- Depends on #10 (database schema)
- Critical for Phase 2 launch (security requirement)
- Part of #9 (Epic 2)

### Documentation

See [EPIC-2-MULTI-TENANCY.md](.github/issues/EPIC-2-MULTI-TENANCY.md#issue-11) for complete RLS policies.`
  },
  {
    epic: 2,
    number: 12,
    title: 'Organization & Project CRUD APIs',
    labels: ['enhancement', 'P0', 'phase-2', 'backend'],
    milestone: 'Phase 2 - Multi-Tenant',
    body: `### Feature Description

Build backend APIs for creating, reading, updating, and deleting organizations and projects.

**Which edition does this apply to?**
- [x] Community Edition (Self-Hosted) - Limited features
- [x] Agency Cloud (SaaS)

### User Story

As a frontend developer
I want well-documented APIs for organization management
So that I can build the Mission Control dashboard UI

### API Endpoints

**Organizations:**
- \`GET /api/organizations\` - List all organizations
- \`GET /api/organizations/:id\` - Get single organization
- \`POST /api/organizations\` - Create organization
- \`PATCH /api/organizations/:id\` - Update organization
- \`DELETE /api/organizations/:id\` - Delete organization (owner only)

**Projects:**
- \`GET /api/organizations/:orgId/projects\` - List projects
- \`POST /api/organizations/:orgId/projects\` - Create project
- \`PATCH /api/projects/:id\` - Update project
- \`DELETE /api/projects/:id\` - Delete project

### Acceptance Criteria

- [ ] All CRUD endpoints implemented
- [ ] APIs respect RLS policies (no manual permission checks needed)
- [ ] Validation prevents invalid data
- [ ] Error responses follow consistent format
- [ ] API documentation generated (OpenAPI/Swagger)
- [ ] Unit tests for business logic
- [ ] Integration tests for API routes

### Related Issues

- Depends on #10 (database schema)
- Depends on #11 (RLS policies)
- Used by #13 (Mission Control UI)
- Part of #9 (Epic 2)

### Documentation

See [EPIC-2-MULTI-TENANCY.md](.github/issues/EPIC-2-MULTI-TENANCY.md#issue-12) for API specifications.`
  },
  {
    epic: 2,
    number: 13,
    title: 'Mission Control Dashboard UI',
    labels: ['enhancement', 'P1', 'phase-2', 'frontend'],
    milestone: 'Phase 2 - Multi-Tenant',
    body: `### Feature Description

Build the "Mission Control" dashboard that displays a high-level overview of all client organizations an agency manages.

**Which edition does this apply to?**
- [ ] Community Edition (Self-Hosted)
- [x] Agency Cloud (SaaS)

*Note: Community Edition is single-org, so this multi-org dashboard only applies to SaaS.*

### User Story

As an MSP technician
I want to see the status of all my clients at a glance
So that I can quickly identify which clients need attention

### Key Features

- Grid of organization cards showing status, uptime, and incidents
- Real-time status updates (via Supabase Realtime)
- Search/filter organizations
- Sort by: name, status, uptime
- Click card to navigate to org dashboard

### Acceptance Criteria

- [ ] Displays all user's organizations
- [ ] Shows accurate status (operational/degraded/down)
- [ ] Real-time updates without page refresh
- [ ] < 2 second load time for 50+ orgs
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Accessible (keyboard navigation, ARIA labels)

### Related Issues

- Depends on #12 (APIs)
- Relates to #16 (org switcher)
- Part of #9 (Epic 2)

### Documentation

See [EPIC-2-MULTI-TENANCY.md](.github/issues/EPIC-2-MULTI-TENANCY.md#issue-13) for UI specifications.`
  },
  {
    epic: 2,
    number: 14,
    title: 'Team Member Invitation System',
    labels: ['enhancement', 'P1', 'phase-2', 'backend', 'frontend'],
    milestone: 'Phase 2 - Multi-Tenant',
    body: `### Feature Description

Allow organization admins to invite team members via email with specific roles.

**Which edition does this apply to?**
- [x] Community Edition (Self-Hosted)
- [x] Agency Cloud (SaaS)

### User Story

As an organization admin
I want to invite team members to access our organization
So that we can collaborate on monitoring and incident management

### Invitation Flow

1. Admin enters email and selects role
2. System sends invitation email with magic link
3. Recipient clicks link (if no account, creates one)
4. User joins organization with specified role

### Key Features

- Email invitations with 7-day expiration
- Cryptographically secure tokens
- Rate limiting (max 10 invitations per hour per user)
- Cannot invite to 'owner' role (must be transferred explicitly)
- Can resend or revoke pending invitations

### Acceptance Criteria

- [ ] Admins can send invitations
- [ ] Invitation emails delivered successfully
- [ ] Recipients can accept and join organization
- [ ] Expired invitations cannot be accepted
- [ ] Can resend invitation if not accepted
- [ ] Can revoke pending invitations
- [ ] Unit tests for invitation logic
- [ ] E2E test for full invitation flow

### Related Issues

- Depends on #10 (database schema)
- Relates to #15 (RBAC enforcement)
- Part of #9 (Epic 2)

### Documentation

See [EPIC-2-MULTI-TENANCY.md](.github/issues/EPIC-2-MULTI-TENANCY.md#issue-14) for implementation details.`
  },
  {
    epic: 2,
    number: 15,
    title: 'Role-Based Access Control (RBAC)',
    labels: ['enhancement', 'P1', 'phase-2', 'security'],
    milestone: 'Phase 2 - Multi-Tenant',
    body: `### Feature Description

Implement role-based permissions system with four roles: Owner, Admin, Editor, Viewer.

**Which edition does this apply to?**
- [x] Community Edition (Self-Hosted)
- [x] Agency Cloud (SaaS)

### User Story

As an organization owner
I want to control what team members can do
So that I can delegate responsibilities safely

### Role Hierarchy

| Permission | Owner | Admin | Editor | Viewer |
|------------|-------|-------|--------|--------|
| View organization | ✅ | ✅ | ✅ | ✅ |
| Edit settings | ✅ | ✅ | ❌ | ❌ |
| Delete organization | ✅ | ❌ | ❌ | ❌ |
| Invite members | ✅ | ✅ | ❌ | ❌ |
| Change roles | ✅ | ✅ | ❌ | ❌ |
| Create/edit monitors | ✅ | ✅ | ✅ | ❌ |
| Delete monitors | ✅ | ✅ | ✅ | ❌ |

### Acceptance Criteria

- [ ] RBAC helper functions implemented
- [ ] RLS policies enforce role permissions
- [ ] UI conditionally shows/hides actions based on role
- [ ] API endpoints validate permissions before mutations
- [ ] Documentation explains role hierarchy
- [ ] Unit tests for permission logic
- [ ] E2E tests verify role restrictions

### Related Issues

- Depends on #11 (RLS policies)
- Used throughout UI (#13, #14, etc.)
- Part of #9 (Epic 2)

### Documentation

See [EPIC-2-MULTI-TENANCY.md](.github/issues/EPIC-2-MULTI-TENANCY.md#issue-15) for permission matrix.`
  },
  {
    epic: 2,
    number: 16,
    title: 'Organization Switcher Component',
    labels: ['enhancement', 'P2', 'phase-2', 'frontend'],
    milestone: 'Phase 2 - Multi-Tenant',
    body: `### Feature Description

Build a dropdown component allowing users to switch between organizations they're members of.

**Which edition does this apply to?**
- [ ] Community Edition (Self-Hosted) - Single org only
- [x] Agency Cloud (SaaS)

### User Story

As a user belonging to multiple organizations
I want to easily switch between them
So that I can manage different clients without logging in/out

### Key Features

- Dropdown shows all user's organizations
- Search/filter organizations by name
- Current organization indicated with checkmark
- "Create Organization" link
- "Mission Control" link to overview
- Keyboard accessible (arrow keys, enter)

### Acceptance Criteria

- [ ] Dropdown shows all user's organizations
- [ ] Search/filter organizations by name
- [ ] Current organization indicated with checkmark
- [ ] Clicking org navigates to its dashboard
- [ ] "Create Organization" link functional
- [ ] "Mission Control" link navigates to overview
- [ ] Keyboard accessible
- [ ] Responsive design

### Related Issues

- Depends on #12 (API for fetching orgs)
- Enhances #13 (Mission Control navigation)
- Part of #9 (Epic 2)

### Documentation

See [EPIC-2-MULTI-TENANCY.md](.github/issues/EPIC-2-MULTI-TENANCY.md#issue-16) for component specifications.`
  }
];

// Function to create a single issue
function createIssue(issue) {
  const labels = issue.labels.join(',');
  
  // Write body to temporary file to avoid escaping issues
  const tempFile = path.join(__dirname, `issue-${issue.number}-temp.md`);
  fs.writeFileSync(tempFile, issue.body, 'utf8');
  
  const command = `gh issue create --repo ${REPO_OWNER}/${REPO_NAME} --title "${issue.title}" --body-file "${tempFile}" --label "${labels}" --milestone "${issue.milestone}"`;
  
  try {
    console.log(`Creating issue #${issue.number}: ${issue.title}`);
    execSync(command, { stdio: 'inherit' });
    console.log(`✓ Created issue #${issue.number}\n`);
    
    // Clean up temp file
    fs.unlinkSync(tempFile);
  } catch (error) {
    console.error(`✗ Failed to create issue #${issue.number}: ${error.message}\n`);
    // Clean up temp file on error too
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
  }
}

// Main execution
function main() {
  console.log('SignalSync GitHub Issues Creator');
  console.log('=================================\n');
  
  // Check if gh CLI is installed
  try {
    execSync('gh --version', { stdio: 'ignore' });
  } catch (error) {
    console.error('Error: GitHub CLI (gh) is not installed.');
    console.error('Install it from: https://cli.github.com/');
    process.exit(1);
  }
  
  // Check if authenticated
  try {
    execSync('gh auth status', { stdio: 'ignore' });
  } catch (error) {
    console.error('Error: Not authenticated with GitHub CLI.');
    console.error('Run: gh auth login');
    process.exit(1);
  }
  
  console.log(`Repository: ${REPO_OWNER}/${REPO_NAME}`);
  console.log(`Total issues to create: ${ISSUES.length}\n`);
  
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  readline.question('Continue? (y/n) ', (answer) => {
    readline.close();
    
    if (answer.toLowerCase() !== 'y') {
      console.log('Aborted.');
      process.exit(0);
    }
    
    console.log('\nCreating issues...\n');
    
    // Create issues
    ISSUES.forEach(issue => {
      createIssue(issue);
    });
    
    console.log('\n=================================');
    console.log('Issue creation complete!');
    console.log(`View issues at: https://github.com/${REPO_OWNER}/${REPO_NAME}/issues`);
  });
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { ISSUES, createIssue };
