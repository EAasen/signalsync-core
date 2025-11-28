#!/usr/bin/env node

/**
 * Automated script to create all 73 GitHub issues for SignalSync
 * 
 * Prerequisites:
 * 1. Install GitHub CLI: https://cli.github.com/
 * 2. Authenticate: gh auth login
 * 
 * Usage:
 *   node scripts/create-all-73-issues.js
 * 
 * This script will:
 * - Check and create missing milestones
 * - Check which issues already exist
 * - Create only the missing issues
 */

const { execSync } = require('child_process');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const fs = require('fs');
const path = require('path');

// Repository configuration
const REPO_OWNER = 'EAasen';
const REPO_NAME = 'signalsync-core';

// Milestone definitions
const MILESTONES = [
  {
    title: 'Phase 1 - MVP',
    due_on: '2026-03-31T00:00:00Z',
    description: 'Community Edition MVP - Core monitoring, status pages, basic notifications'
  },
  {
    title: 'Phase 2 - Multi-Tenant',
    due_on: '2026-05-31T00:00:00Z',
    description: 'Multi-tenant foundation - Agency management, team invitations, RBAC'
  },
  {
    title: 'Phase 3 - SaaS Launch',
    due_on: '2026-08-31T00:00:00Z',
    description: 'SaaS launch - White-labeling, payments, marketing, onboarding'
  },
  {
    title: 'Phase 4 - Enterprise',
    due_on: '2026-11-30T00:00:00Z',
    description: 'Enterprise features - SLA reporting, distributed monitoring, integrations'
  }
];

// Complete issue definitions for all 73 issues
const ALL_ISSUES = [
  // Epic 1 issues (#1-8) - Already exist, but included for reference
  {
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

### Related Issues
- #2 - HTTP/HTTPS Monitor Implementation
- #3 - Keyword/Content Verification
- #4 - TCP Port Monitoring
- #5 - SSL Certificate Expiry Detection
- #6 - Check Scheduling & Queue System
- #7 - Historical Data & Result Persistence
- #8 - Retry Logic & False Positive Prevention`
  },
  {
    number: 2,
    title: 'HTTP/HTTPS Monitor Implementation',
    labels: ['enhancement', 'P0', 'phase-1', 'good first issue'],
    milestone: 'Phase 1 - MVP',
    body: `### Feature Description
Implement the core HTTP/HTTPS monitoring capability that checks web endpoints and validates response status codes.

### Acceptance Criteria
- [ ] Monitor executes HTTP GET requests successfully
- [ ] Validates status codes against expected values
- [ ] Records response time accurately
- [ ] Handles network errors gracefully
- [ ] Unit tests achieve 80%+ coverage`
  },
  {
    number: 3,
    title: 'Keyword/Content Verification for HTTP Monitors',
    labels: ['enhancement', 'P0', 'phase-1'],
    milestone: 'Phase 1 - MVP',
    body: `### Feature Description
Add the ability to verify that HTTP response bodies contain (or don't contain) specific strings or regex patterns.

### Common Use Cases
- API returns 200 but body contains error message
- Detect soft failures where page loads but shows maintenance mode
- Verify critical content is present`
  },
  {
    number: 4,
    title: 'TCP Port Monitoring',
    labels: ['enhancement', 'P0', 'phase-1'],
    milestone: 'Phase 1 - MVP',
    body: `### Feature Description
Enable monitoring of arbitrary TCP ports to verify services like databases, mail servers, and custom applications are accepting connections.

### Common Use Cases
- PostgreSQL: port 5432
- Redis: port 6379
- SMTP: port 25`
  },
  {
    number: 5,
    title: 'SSL Certificate Expiry Detection',
    labels: ['enhancement', 'P1', 'phase-3', 'saas-only'],
    milestone: 'Phase 3 - SaaS Launch',
    body: `### Feature Description
Monitor SSL certificates and alert users 30, 14, 7, and 1 day(s) before expiration.

### User Story
As an agency managing client domains, I want automatic alerts before SSL certificates expire so that I can renew them proactively.`
  },
  {
    number: 6,
    title: 'Check Scheduling & Queue System',
    labels: ['enhancement', 'P0', 'phase-1'],
    milestone: 'Phase 1 - MVP',
    body: `### Feature Description
Implement a robust scheduling system that queues monitor checks and distributes them across worker instances.

### Requirements
- Schedule checks based on interval
- Distribute work across multiple workers
- Ensure each check runs exactly once
- Handle worker failures gracefully`
  },
  {
    number: 7,
    title: 'Historical Data & Result Persistence',
    labels: ['enhancement', 'P0', 'phase-1'],
    milestone: 'Phase 1 - MVP',
    body: `### Feature Description
Persist check results to the database with efficient querying for uptime calculations and historical graphs.

### Retention Policy
- Community: 24 hours of raw data
- SaaS Starter: 30 days
- SaaS Pro: 1 year + aggregated statistics`
  },
  {
    number: 8,
    title: 'Retry Logic & False Positive Prevention',
    labels: ['enhancement', 'P1', 'phase-1'],
    milestone: 'Phase 1 - MVP',
    body: `### Feature Description
Implement intelligent retry mechanisms to reduce false positives caused by transient network issues.

### Solution
- If check fails, retry 2 more times immediately
- Only mark as "down" if all 3 attempts fail`
  },

  // Epic 2 issues (#9-16) - Already exist
  {
    number: 9,
    title: '[EPIC] Multi-Tenancy & Agency Management',
    labels: ['epic', 'P0', 'phase-2'],
    milestone: 'Phase 2 - Multi-Tenant',
    body: `### Epic Overview
Implement secure multi-tenant architecture allowing agencies to manage multiple client organizations from a unified dashboard.

### Related Issues
- #10 - Database Schema Design
- #11 - Row Level Security (RLS) Implementation
- #12 - Organization & Project CRUD APIs
- #13 - Mission Control Dashboard UI
- #14 - Team Member Invitation System
- #15 - Role-Based Access Control (RBAC)
- #16 - Organization Switcher Component`
  },
  {
    number: 10,
    title: 'Database Schema Design',
    labels: ['enhancement', 'P0', 'phase-2', 'database'],
    milestone: 'Phase 2 - Multi-Tenant',
    body: `### Feature Description
Design and implement the core database schema supporting the organization → project → monitor hierarchy.

### Schema Hierarchy
- profiles (users)
- organizations (tenants)
- projects (client systems)
- monitors (checks)
- check_results (historical data)`
  },
  {
    number: 11,
    title: 'Row Level Security (RLS) Implementation',
    labels: ['enhancement', 'P0', 'phase-2', 'security', 'database'],
    milestone: 'Phase 2 - Multi-Tenant',
    body: `### Feature Description
Implement PostgreSQL Row Level Security (RLS) policies to enforce tenant isolation at the database level.`
  },
  {
    number: 12,
    title: 'Organization & Project CRUD APIs',
    labels: ['enhancement', 'P0', 'phase-2', 'backend'],
    milestone: 'Phase 2 - Multi-Tenant',
    body: `### Feature Description
Build backend APIs for creating, reading, updating, and deleting organizations and projects.`
  },
  {
    number: 13,
    title: 'Mission Control Dashboard UI',
    labels: ['enhancement', 'P1', 'phase-2', 'frontend'],
    milestone: 'Phase 2 - Multi-Tenant',
    body: `### Feature Description
Build the "Mission Control" dashboard that displays a high-level overview of all client organizations an agency manages.`
  },
  {
    number: 14,
    title: 'Team Member Invitation System',
    labels: ['enhancement', 'P1', 'phase-2', 'backend', 'frontend'],
    milestone: 'Phase 2 - Multi-Tenant',
    body: `### Feature Description
Allow organization admins to invite team members via email with specific roles.`
  },
  {
    number: 15,
    title: 'Role-Based Access Control (RBAC)',
    labels: ['enhancement', 'P1', 'phase-2', 'security'],
    milestone: 'Phase 2 - Multi-Tenant',
    body: `### Feature Description
Implement role-based permissions system with four roles: Owner, Admin, Editor, Viewer.`
  },
  {
    number: 16,
    title: 'Organization Switcher Component',
    labels: ['enhancement', 'P2', 'phase-2', 'frontend'],
    milestone: 'Phase 2 - Multi-Tenant',
    body: `### Feature Description
Build a dropdown component allowing users to switch between organizations they're members of.`
  },

  // Epic 3: Status Pages (#17-23)
  {
    number: 17,
    title: '[EPIC] Status Page Presentation',
    labels: ['epic', 'P0', 'phase-1'],
    milestone: 'Phase 1 - MVP',
    body: `### Epic Overview
Build public-facing status pages that display service health, incidents, and uptime history.

### Related Issues
- #18 - Public Status Page Renderer
- #19 - Incident Management Interface
- #20 - Service Grouping & Display
- #21 - Light/Dark Mode Support
- #22 - Embeddable Status Widgets
- #23 - Status Page Customization`
  },
  {
    number: 18,
    title: 'Public Status Page Renderer',
    labels: ['enhancement', 'P0', 'phase-1', 'frontend'],
    milestone: 'Phase 1 - MVP',
    body: `### Feature Description
Create server-rendered status pages accessible at public URLs (status.yourdomain.com).

### Key Features
- Overall status indicator
- Monitor list with current status
- Recent incidents timeline
- 90-day uptime history graph
- Mobile responsive design

### Acceptance Criteria
- [ ] Page loads in < 1 second
- [ ] Shows real-time status updates
- [ ] SEO optimized with meta tags
- [ ] Works without JavaScript`
  },
  {
    number: 19,
    title: 'Incident Management Interface',
    labels: ['enhancement', 'P0', 'phase-1', 'frontend', 'backend'],
    milestone: 'Phase 1 - MVP',
    body: `### Feature Description
Admin interface for creating and updating incidents that appear on the status page.

### Incident Workflow
1. Create incident (title, affected services, severity)
2. Add updates ("Investigating", "Identified", "Monitoring", "Resolved")
3. Updates automatically post to status page
4. Optionally trigger notifications

### Acceptance Criteria
- [ ] Admin can create incidents
- [ ] Can add updates to existing incidents
- [ ] Updates appear on status page immediately
- [ ] Rich text editor for descriptions
- [ ] Timeline view of all updates`
  },
  {
    number: 20,
    title: 'Service Grouping & Display',
    labels: ['enhancement', 'P1', 'phase-1', 'frontend'],
    milestone: 'Phase 1 - MVP',
    body: `### Feature Description
Enable grouping monitors into logical services for better status page organization.

### Example
**API Services**
- Auth API: ✅ Operational
- Payment API: ✅ Operational

**Frontend**
- Web App: ⚠️ Degraded
- Mobile App: ✅ Operational`
  },
  {
    number: 21,
    title: 'Light/Dark Mode Support',
    labels: ['enhancement', 'P2', 'phase-1', 'frontend'],
    milestone: 'Phase 1 - MVP',
    body: `### Feature Description
Add theme toggle for light/dark mode on status pages with automatic detection based on user preference.`
  },
  {
    number: 22,
    title: 'Embeddable Status Widgets',
    labels: ['enhancement', 'P2', 'phase-2', 'frontend'],
    milestone: 'Phase 2 - Multi-Tenant',
    body: `### Feature Description
Create embeddable widgets for displaying status on external sites.

### Implementation
\`\`\`html
<script src="https://cdn.signalsync.io/widget.js"></script>
<div data-signalsync-org="acme-corp"></div>
\`\`\``
  },
  {
    number: 23,
    title: 'Status Page Customization',
    labels: ['enhancement', 'P1', 'phase-3', 'frontend'],
    milestone: 'Phase 3 - SaaS Launch',
    body: `### Feature Description
Allow custom branding, colors, and layout on status pages for SaaS customers.`
  },

  // Epic 4: Notifications (#24-31)
  {
    number: 24,
    title: '[EPIC] Notifications & Alerting',
    labels: ['epic', 'P0', 'phase-1'],
    milestone: 'Phase 1 - MVP',
    body: `### Epic Overview
Implement notification system for alerting users about downtime and incidents.

### Related Issues
- #25 - Email Notifications (SMTP)
- #26 - Webhook Dispatcher
- #27 - Notification Preferences & Routing
- #28 - Alert Deduplication & Escalation
- #29 - SMS Notifications
- #30 - Voice Call Alerts
- #31 - PagerDuty Integration`
  },
  {
    number: 25,
    title: 'Email Notifications (SMTP)',
    labels: ['enhancement', 'P0', 'phase-1', 'backend'],
    milestone: 'Phase 1 - MVP',
    body: `### Feature Description
Send email alerts via SMTP when monitors go down or recover.

### Key Features
- Configurable SMTP server support
- HTML and plain text email templates
- Unsubscribe links
- Rate limiting (max 1 email per minute per monitor)

### Acceptance Criteria
- [ ] Sends email on monitor down
- [ ] Sends recovery email on monitor up
- [ ] Supports custom SMTP servers
- [ ] Includes unsubscribe link`
  },
  {
    number: 26,
    title: 'Webhook Dispatcher',
    labels: ['enhancement', 'P0', 'phase-1', 'backend'],
    milestone: 'Phase 1 - MVP',
    body: `### Feature Description
Integrate with Slack, Discord, Microsoft Teams, and generic webhooks.

### Supported Platforms
- Slack (incoming webhooks)
- Discord (webhooks)
- Microsoft Teams (connectors)
- Generic JSON webhooks

### Acceptance Criteria
- [ ] Supports Slack webhooks with rich formatting
- [ ] Supports Discord embeds
- [ ] Supports Microsoft Teams cards
- [ ] Retry failed deliveries (3 attempts)
- [ ] Logs all webhook deliveries`
  },
  {
    number: 27,
    title: 'Notification Preferences & Routing',
    labels: ['enhancement', 'P1', 'phase-1', 'backend', 'frontend'],
    milestone: 'Phase 1 - MVP',
    body: `### Feature Description
UI for configuring notification preferences per monitor and user.

### Features
- Per-monitor notification settings
- Per-user notification preferences
- Quiet hours (don't alert during specified times)
- Alert only on specific events (down, up, incident)`
  },
  {
    number: 28,
    title: 'Alert Deduplication & Escalation',
    labels: ['enhancement', 'P1', 'phase-2', 'backend'],
    milestone: 'Phase 2 - Multi-Tenant',
    body: `### Feature Description
Prevent duplicate alerts and implement escalation policies.

### Features
- Deduplicate identical alerts within time window
- Escalation after N minutes without acknowledgment
- On-call rotation support`
  },
  {
    number: 29,
    title: 'SMS Notifications',
    labels: ['enhancement', 'P2', 'phase-3', 'saas-only'],
    milestone: 'Phase 3 - SaaS Launch',
    body: `### Feature Description
SMS alerts via Twilio integration for critical incidents.

**SaaS Only** - Requires paid Twilio account.`
  },
  {
    number: 30,
    title: 'Voice Call Alerts',
    labels: ['enhancement', 'P2', 'phase-3', 'saas-only'],
    milestone: 'Phase 3 - SaaS Launch',
    body: `### Feature Description
Voice call alerts for critical incidents using Twilio.

**SaaS Only** - Premium feature for enterprise customers.`
  },
  {
    number: 31,
    title: 'PagerDuty Integration',
    labels: ['enhancement', 'P2', 'phase-3', 'saas-only'],
    milestone: 'Phase 3 - SaaS Launch',
    body: `### Feature Description
Integrate with PagerDuty for on-call management and incident routing.

**SaaS Only** - Enterprise feature.`
  },

  // Epic 5: White-Labeling (#32-38)
  {
    number: 32,
    title: '[EPIC] SaaS Features & White-Labeling',
    labels: ['epic', 'P1', 'phase-3'],
    milestone: 'Phase 3 - SaaS Launch',
    body: `### Epic Overview
Enable white-label status pages with custom domains, SSL, and branding for agency clients.

### Related Issues
- #33 - Custom Domain Mapping (CNAME)
- #34 - Automatic SSL Certificate Provisioning
- #35 - Brand Customization
- #36 - "Powered by" Removal
- #37 - Email Template Customization
- #38 - Custom CSS Injection`
  },
  {
    number: 33,
    title: 'Custom Domain Mapping (CNAME)',
    labels: ['enhancement', 'P1', 'phase-3', 'saas-only'],
    milestone: 'Phase 3 - SaaS Launch',
    body: `### Feature Description
Allow customers to point their own domains (status.client.com) to their status pages.

### Implementation
- User adds CNAME record pointing to proxy.signalsync.io
- System verifies DNS configuration
- Routes traffic based on domain

### Acceptance Criteria
- [ ] Users can add custom domains
- [ ] DNS verification works reliably
- [ ] Supports both www and non-www`
  },
  {
    number: 34,
    title: 'Automatic SSL Certificate Provisioning',
    labels: ['enhancement', 'P1', 'phase-3', 'saas-only'],
    milestone: 'Phase 3 - SaaS Launch',
    body: `### Feature Description
Automatically provision and renew SSL certificates for custom domains using Let's Encrypt.

### Key Features
- ACME protocol integration
- Automatic certificate renewal
- Certificate expiry monitoring`
  },
  {
    number: 35,
    title: 'Brand Customization (Logo, Colors, Favicon)',
    labels: ['enhancement', 'P1', 'phase-3', 'saas-only'],
    milestone: 'Phase 3 - SaaS Launch',
    body: `### Feature Description
Allow customers to customize status page appearance with logo, colors, and favicon.

### Customization Options
- Upload custom logo
- Choose brand colors (primary, success, warning, danger)
- Upload favicon
- Select font family
- Live preview of changes`
  },
  {
    number: 36,
    title: '"Powered by" Removal',
    labels: ['enhancement', 'P1', 'phase-3', 'saas-only'],
    milestone: 'Phase 3 - SaaS Launch',
    body: `### Feature Description
Remove "Powered by SignalSync" branding from status pages for premium customers.`
  },
  {
    number: 37,
    title: 'Email Template Customization',
    labels: ['enhancement', 'P2', 'phase-3', 'saas-only'],
    milestone: 'Phase 3 - SaaS Launch',
    body: `### Feature Description
Allow customers to customize email notification templates with their branding.`
  },
  {
    number: 38,
    title: 'Custom CSS Injection',
    labels: ['enhancement', 'P2', 'phase-4', 'saas-only'],
    milestone: 'Phase 4 - Enterprise',
    body: `### Feature Description
Advanced users can inject custom CSS for complete control over status page styling.`
  },

  // Epic 6: Payments (#39-46)
  {
    number: 39,
    title: '[EPIC] Payment & Subscription Management',
    labels: ['epic', 'P1', 'phase-3'],
    milestone: 'Phase 3 - SaaS Launch',
    body: `### Epic Overview
Integrate Stripe for subscription billing, usage tracking, and payment management.

### Related Issues
- #40 - Stripe Integration
- #41 - Subscription Plan Management
- #42 - Usage-Based Billing
- #43 - Customer Portal
- #44 - Invoice Generation
- #45 - Trial Periods & Promo Codes
- #46 - Dunning & Failed Payment Handling`
  },
  {
    number: 40,
    title: 'Stripe Integration',
    labels: ['enhancement', 'P1', 'phase-3', 'backend'],
    milestone: 'Phase 3 - SaaS Launch',
    body: `### Feature Description
Integrate Stripe for payment processing and subscription management.

### Key Features
- Stripe Checkout integration
- Webhook handlers for events
- Customer portal link generation`
  },
  {
    number: 41,
    title: 'Subscription Plan Management',
    labels: ['enhancement', 'P1', 'phase-3', 'backend', 'frontend'],
    milestone: 'Phase 3 - SaaS Launch',
    body: `### Feature Description
Define and manage subscription tiers (Starter, Pro, Enterprise) with feature gates.

### Plans
- **Starter**: 10 monitors, 30-day retention
- **Pro**: 100 monitors, 1-year retention, white-labeling
- **Enterprise**: Unlimited monitors, custom retention, dedicated support`
  },
  {
    number: 42,
    title: 'Usage-Based Billing',
    labels: ['enhancement', 'P1', 'phase-3', 'backend'],
    milestone: 'Phase 3 - SaaS Launch',
    body: `### Feature Description
Track and bill based on usage (number of monitors, checks per month).

### Metering
- Count active monitors per organization
- Track total checks executed
- Report usage to Stripe`
  },
  {
    number: 43,
    title: 'Customer Portal for Self-Service',
    labels: ['enhancement', 'P1', 'phase-3', 'frontend'],
    milestone: 'Phase 3 - SaaS Launch',
    body: `### Feature Description
Billing page where customers can manage subscription, update payment methods, view invoices.`
  },
  {
    number: 44,
    title: 'Invoice Generation',
    labels: ['enhancement', 'P2', 'phase-3', 'backend'],
    milestone: 'Phase 3 - SaaS Launch',
    body: `### Feature Description
Automatically generate and email invoices for subscription payments.`
  },
  {
    number: 45,
    title: 'Trial Periods & Promo Codes',
    labels: ['enhancement', 'P2', 'phase-3', 'backend'],
    milestone: 'Phase 3 - SaaS Launch',
    body: `### Feature Description
Support 14-day free trials and promotional discount codes.`
  },
  {
    number: 46,
    title: 'Dunning & Failed Payment Handling',
    labels: ['enhancement', 'P2', 'phase-3', 'backend'],
    milestone: 'Phase 3 - SaaS Launch',
    body: `### Feature Description
Handle failed payments gracefully with retry logic and customer notifications.`
  },

  // Epic 7: Marketing & Onboarding (#47-53)
  {
    number: 47,
    title: '[EPIC] Marketing & Onboarding',
    labels: ['epic', 'P1', 'phase-3'],
    milestone: 'Phase 3 - SaaS Launch',
    body: `### Epic Overview
Build marketing site and onboarding flow for new SaaS customers.

### Related Issues
- #48 - Marketing Landing Page
- #49 - Interactive Product Demo
- #50 - Onboarding Wizard
- #51 - Documentation Site
- #52 - Video Tutorials
- #53 - Agency Use Case Templates`
  },
  {
    number: 48,
    title: 'Marketing Landing Page',
    labels: ['enhancement', 'P1', 'phase-3', 'frontend'],
    milestone: 'Phase 3 - SaaS Launch',
    body: `### Feature Description
Build public-facing marketing website explaining SignalSync features and pricing.

### Sections
- Hero with value proposition
- Feature highlights
- Pricing table
- Customer testimonials
- Call-to-action (Start Free Trial)`
  },
  {
    number: 49,
    title: 'Interactive Product Demo',
    labels: ['enhancement', 'P2', 'phase-3', 'frontend'],
    milestone: 'Phase 3 - SaaS Launch',
    body: `### Feature Description
Interactive demo environment where prospects can explore features without signing up.`
  },
  {
    number: 50,
    title: 'Onboarding Wizard',
    labels: ['enhancement', 'P1', 'phase-3', 'frontend'],
    milestone: 'Phase 3 - SaaS Launch',
    body: `### Feature Description
Step-by-step wizard guiding new users through their first monitor setup.

### Steps
1. Create organization
2. Add first monitor
3. Configure notifications
4. View status page`
  },
  {
    number: 51,
    title: 'Documentation Site (Docusaurus)',
    labels: ['enhancement', 'P1', 'phase-2', 'docs'],
    milestone: 'Phase 2 - Multi-Tenant',
    body: `### Feature Description
Build comprehensive documentation site using Docusaurus.

### Content
- Getting started guide
- API documentation
- Self-hosting instructions
- Integration guides`
  },
  {
    number: 52,
    title: 'Video Tutorials',
    labels: ['enhancement', 'P2', 'phase-3', 'docs'],
    milestone: 'Phase 3 - SaaS Launch',
    body: `### Feature Description
Create video tutorials for common tasks and workflows.`
  },
  {
    number: 53,
    title: 'Agency Use Case Templates',
    labels: ['enhancement', 'P2', 'phase-3', 'frontend'],
    milestone: 'Phase 3 - SaaS Launch',
    body: `### Feature Description
Pre-built monitor templates for common MSP use cases (WordPress, WooCommerce, etc.).`
  },

  // Epic 8: SLA Reporting (#54-60)
  {
    number: 54,
    title: '[EPIC] SLA Reporting & Compliance',
    labels: ['epic', 'P2', 'phase-4'],
    milestone: 'Phase 4 - Enterprise',
    body: `### Epic Overview
Generate automated SLA compliance reports for agencies to send to clients.

### Related Issues
- #55 - Monthly Uptime Calculation
- #56 - PDF Report Generation
- #57 - Incident Summary & MTTR
- #58 - Historical Trend Graphs
- #59 - Client vs Internal Reports
- #60 - Email Delivery Scheduling`
  },
  {
    number: 55,
    title: 'Monthly Uptime Percentage Calculation',
    labels: ['enhancement', 'P2', 'phase-4', 'backend'],
    milestone: 'Phase 4 - Enterprise',
    body: `### Feature Description
Calculate accurate uptime percentages for monthly reporting periods.

### Metrics
- Overall uptime percentage
- Per-monitor uptime
- Response time averages (p50, p95, p99)`
  },
  {
    number: 56,
    title: 'Automated PDF Report Generation',
    labels: ['enhancement', 'P2', 'phase-4', 'backend'],
    milestone: 'Phase 4 - Enterprise',
    body: `### Feature Description
Generate professional PDF reports with branding, charts, and metrics.

### Report Contents
- Executive summary
- Uptime breakdown by monitor
- Incident timeline
- Response time trends
- Downtime analysis (MTTR)`
  },
  {
    number: 57,
    title: 'Incident Summary & MTTR Metrics',
    labels: ['enhancement', 'P2', 'phase-4', 'backend'],
    milestone: 'Phase 4 - Enterprise',
    body: `### Feature Description
Calculate Mean Time To Recovery (MTTR) and incident summaries for reports.`
  },
  {
    number: 58,
    title: 'Historical Trend Graphs',
    labels: ['enhancement', 'P2', 'phase-4', 'frontend'],
    milestone: 'Phase 4 - Enterprise',
    body: `### Feature Description
Visualize uptime and response time trends over custom date ranges.`
  },
  {
    number: 59,
    title: 'Client-Facing vs Internal Reports',
    labels: ['enhancement', 'P2', 'phase-4', 'frontend'],
    milestone: 'Phase 4 - Enterprise',
    body: `### Feature Description
Separate report templates for client-facing vs internal operational reporting.`
  },
  {
    number: 60,
    title: 'Email Delivery Scheduling',
    labels: ['enhancement', 'P2', 'phase-4', 'backend'],
    milestone: 'Phase 4 - Enterprise',
    body: `### Feature Description
Schedule automatic delivery of monthly reports via email.`
  },

  // Epic 9: Distributed Monitoring (#61-66)
  {
    number: 61,
    title: '[EPIC] Distributed Monitoring Network',
    labels: ['epic', 'P2', 'phase-4'],
    milestone: 'Phase 4 - Enterprise',
    body: `### Epic Overview
Deploy monitoring workers in multiple geographic regions for consensus-based downtime detection.

### Related Issues
- #62 - Multi-Region Worker Deployment
- #63 - Consensus-Based Downtime Detection
- #64 - Geographic Latency Tracking
- #65 - Node Health Monitoring
- #66 - Load Balancing & Failover`
  },
  {
    number: 62,
    title: 'Multi-Region Worker Deployment',
    labels: ['enhancement', 'P2', 'phase-4', 'infrastructure'],
    milestone: 'Phase 4 - Enterprise',
    body: `### Feature Description
Deploy worker instances in multiple AWS/GCP regions (US East, US West, EU, Asia).`
  },
  {
    number: 63,
    title: 'Consensus-Based Downtime Detection',
    labels: ['enhancement', 'P2', 'phase-4', 'backend'],
    milestone: 'Phase 4 - Enterprise',
    body: `### Feature Description
Only mark service as down if 2+ regions report failure (prevents false positives from regional issues).`
  },
  {
    number: 64,
    title: 'Geographic Latency Tracking',
    labels: ['enhancement', 'P2', 'phase-4', 'backend'],
    milestone: 'Phase 4 - Enterprise',
    body: `### Feature Description
Track and display response times from different geographic locations.`
  },
  {
    number: 65,
    title: 'Node Health Monitoring',
    labels: ['enhancement', 'P2', 'phase-4', 'backend'],
    milestone: 'Phase 4 - Enterprise',
    body: `### Feature Description
Monitor health of worker nodes themselves and alert on worker failures.`
  },
  {
    number: 66,
    title: 'Load Balancing & Failover',
    labels: ['enhancement', 'P2', 'phase-4', 'infrastructure'],
    milestone: 'Phase 4 - Enterprise',
    body: `### Feature Description
Distribute check workload across healthy nodes with automatic failover.`
  },

  // Epic 10: Integrations (#67-73)
  {
    number: 67,
    title: '[EPIC] Third-Party Integrations',
    labels: ['epic', 'P2', 'phase-4'],
    milestone: 'Phase 4 - Enterprise',
    body: `### Epic Overview
Integrate with popular MSP tools and automation platforms.

### Related Issues
- #68 - ConnectWise PSA Integration
- #69 - Syncro RMM Integration
- #70 - Datto RMM Integration
- #71 - Zapier/Make Automation
- #72 - Public REST API Documentation
- #73 - Webhooks for Custom Integrations`
  },
  {
    number: 68,
    title: 'ConnectWise PSA Integration',
    labels: ['enhancement', 'P2', 'phase-4', 'integration'],
    milestone: 'Phase 4 - Enterprise',
    body: `### Feature Description
Automatically create tickets in ConnectWise when monitors go down.`
  },
  {
    number: 69,
    title: 'Syncro RMM Integration',
    labels: ['enhancement', 'P2', 'phase-4', 'integration'],
    milestone: 'Phase 4 - Enterprise',
    body: `### Feature Description
Integrate with Syncro for ticket creation and client linking.`
  },
  {
    number: 70,
    title: 'Datto RMM Integration',
    labels: ['enhancement', 'P2', 'phase-4', 'integration'],
    milestone: 'Phase 4 - Enterprise',
    body: `### Feature Description
Integrate with Datto Autotask for ticket management.`
  },
  {
    number: 71,
    title: 'Zapier/Make Automation',
    labels: ['enhancement', 'P2', 'phase-4', 'integration'],
    milestone: 'Phase 4 - Enterprise',
    body: `### Feature Description
Create Zapier and Make.com integrations for no-code automation workflows.`
  },
  {
    number: 72,
    title: 'Public REST API Documentation',
    labels: ['enhancement', 'P1', 'phase-2', 'docs'],
    milestone: 'Phase 2 - Multi-Tenant',
    body: `### Feature Description
Document public REST API with OpenAPI/Swagger specification.

### API Coverage
- Organizations and projects
- Monitors (CRUD)
- Check results (read)
- Incidents (CRUD)
- Status page data`
  },
  {
    number: 73,
    title: 'Webhooks for Custom Integrations',
    labels: ['enhancement', 'P2', 'phase-3', 'backend'],
    milestone: 'Phase 3 - SaaS Launch',
    body: `### Feature Description
Allow users to configure webhooks for custom integrations beyond built-in platforms.`
  }
];

// Helper function to execute shell commands
async function execAsync(command) {
  try {
    const { stdout, stderr } = await exec(command);
    return { stdout: stdout.trim(), stderr: stderr.trim(), success: true };
  } catch (error) {
    return { stdout: '', stderr: error.message, success: false, error };
  }
}

// Check if GitHub CLI is installed and authenticated
async function checkGitHubCLI() {
  console.log('Checking GitHub CLI...');
  
  const versionCheck = await execAsync('gh --version');
  if (!versionCheck.success) {
    console.error('❌ GitHub CLI (gh) is not installed.');
    console.error('Install it from: https://cli.github.com/');
    process.exit(1);
  }
  
  const authCheck = await execAsync('gh auth status');
  if (!authCheck.success) {
    console.error('❌ Not authenticated with GitHub CLI.');
    console.error('Run: gh auth login');
    process.exit(1);
  }
  
  console.log('✅ GitHub CLI is ready\n');
}

// Get existing milestones
async function getExistingMilestones() {
  const result = await execAsync(`gh api repos/${REPO_OWNER}/${REPO_NAME}/milestones`);
  if (result.success) {
    return JSON.parse(result.stdout || '[]');
  }
  return [];
}

// Create milestone via API
async function createMilestone(milestone) {
  const payload = JSON.stringify({
    title: milestone.title,
    state: 'open',
    description: milestone.description,
    due_on: milestone.due_on
  });
  
  const result = await execAsync(`gh api repos/${REPO_OWNER}/${REPO_NAME}/milestones -f title="${milestone.title}" -f description="${milestone.description}" -f due_on="${milestone.due_on}"`);
  
  return result.success;
}

// Ensure all milestones exist
async function ensureMilestones() {
  console.log('Checking milestones...');
  
  const existing = await getExistingMilestones();
  const existingTitles = existing.map(m => m.title);
  
  for (const milestone of MILESTONES) {
    if (existingTitles.includes(milestone.title)) {
      console.log(`  ✓ Milestone exists: ${milestone.title}`);
    } else {
      console.log(`  Creating milestone: ${milestone.title}...`);
      const success = await createMilestone(milestone);
      if (success) {
        console.log(`  ✅ Created: ${milestone.title}`);
      } else {
        console.log(`  ⚠️  Failed to create: ${milestone.title}`);
      }
    }
  }
  
  console.log('');
}

// Get existing issues
async function getExistingIssues() {
  const result = await execAsync(`gh api repos/${REPO_OWNER}/${REPO_NAME}/issues?state=all&per_page=100`);
  if (result.success) {
    const issues = JSON.parse(result.stdout || '[]');
    return issues.filter(i => !i.pull_request).map(i => i.number);
  }
  return [];
}

// Create a single issue
async function createIssue(issue) {
  const labels = issue.labels.join(',');
  
  // Write body to temp file
  const tempFile = path.join(__dirname, `issue-${issue.number}-temp.md`);
  fs.writeFileSync(tempFile, issue.body, 'utf8');
  
  try {
    const command = `gh issue create --repo ${REPO_OWNER}/${REPO_NAME} --title "${issue.title}" --body-file "${tempFile}" --label "${labels}" --milestone "${issue.milestone}"`;
    
    const result = await execAsync(command);
    
    if (result.success) {
      console.log(`  ✅ Created #${issue.number}: ${issue.title}`);
    } else {
      console.log(`  ❌ Failed #${issue.number}: ${result.stderr}`);
    }
    
    return result.success;
  } finally {
    // Clean up temp file
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
  }
}

// Main execution
async function main() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║  SignalSync Issue Creator (All 73)    ║');
  console.log('╚════════════════════════════════════════╝\n');
  
  // Check prerequisites
  await checkGitHubCLI();
  
  // Ensure milestones exist
  await ensureMilestones();
  
  // Get existing issues
  console.log('Checking existing issues...');
  const existingIssues = await getExistingIssues();
  console.log(`Found ${existingIssues.length} existing issues\n`);
  
  // Filter to only create missing issues (all 73)
  const issuesToCreate = ALL_ISSUES.filter(issue => !existingIssues.includes(issue.number));
  
  if (issuesToCreate.length === 0) {
    console.log('✅ All 73 issues already exist!');
    return;
  }
  
  console.log(`Creating ${issuesToCreate.length} missing issues (out of 73 total)...\n`);
  
  // Create issues with delay to avoid rate limiting
  for (const issue of issuesToCreate) {
    await createIssue(issue);
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║  Issue Creation Complete!             ║');
  console.log('╚════════════════════════════════════════╝');
  console.log(`\nView issues at: https://github.com/${REPO_OWNER}/${REPO_NAME}/issues`);
}

// Run
main().catch(console.error);
