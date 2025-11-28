# SignalSync Issues Overview

This document provides a comprehensive overview of all issues across all epics for SignalSync development.

## Quick Navigation

- [Epic 1: Monitoring Engine](#epic-1-monitoring-engine-core)
- [Epic 2: Multi-Tenancy & Agency Management](#epic-2-multi-tenancy--agency-management)
- [Epic 3: Status Page Presentation](#epic-3-status-page-presentation)
- [Epic 4: Notifications & Alerting](#epic-4-notifications--alerting)
- [Epic 5: SaaS Features & White-Labeling](#epic-5-saas-features--white-labeling)
- [Epic 6: Payment & Subscription Management](#epic-6-payment--subscription-management)
- [Epic 7: Marketing & Onboarding](#epic-7-marketing--onboarding)
- [Epic 8: SLA Reporting & Compliance](#epic-8-sla-reporting--compliance)
- [Epic 9: Distributed Monitoring Network](#epic-9-distributed-monitoring-network)
- [Epic 10: Third-Party Integrations](#epic-10-third-party-integrations)

---

## Epic 1: Monitoring Engine (Core)

**Priority:** P0 (Critical)  
**Phase:** Phase 1 - Community Edition MVP  
**Target:** March 2026

### Issues

| # | Title | Priority | Phase | Labels |
|---|-------|----------|-------|--------|
| #1 | [EPIC] Monitoring Engine (Core) | P0 | Phase 1 | `epic`, `P0`, `phase-1` |
| #2 | HTTP/HTTPS Monitor Implementation | P0 | Phase 1 | `enhancement`, `P0`, `phase-1`, `good first issue` |
| #3 | Keyword/Content Verification | P0 | Phase 1 | `enhancement`, `P0`, `phase-1` |
| #4 | TCP Port Monitoring | P0 | Phase 1 | `enhancement`, `P0`, `phase-1` |
| #5 | SSL Certificate Expiry Detection | P1 | Phase 3 | `enhancement`, `P1`, `phase-3`, `saas-only` |
| #6 | Check Scheduling & Queue System | P0 | Phase 1 | `enhancement`, `P0`, `phase-1` |
| #7 | Historical Data & Result Persistence | P0 | Phase 1 | `enhancement`, `P0`, `phase-1` |
| #8 | Retry Logic & False Positive Prevention | P1 | Phase 1 | `enhancement`, `P1`, `phase-1` |

---

## Epic 2: Multi-Tenancy & Agency Management

**Priority:** P0 (Critical)  
**Phase:** Phase 2 - Multi-Tenant Foundation  
**Target:** May 2026

### Issues

| # | Title | Priority | Phase | Labels |
|---|-------|----------|-------|--------|
| #9 | [EPIC] Multi-Tenancy & Agency Management | P0 | Phase 2 | `epic`, `P0`, `phase-2` |
| #10 | Database Schema Design | P0 | Phase 2 | `enhancement`, `P0`, `phase-2`, `database` |
| #11 | Row Level Security (RLS) Implementation | P0 | Phase 2 | `enhancement`, `P0`, `phase-2`, `security`, `database` |
| #12 | Organization & Project CRUD APIs | P0 | Phase 2 | `enhancement`, `P0`, `phase-2`, `backend` |
| #13 | Mission Control Dashboard UI | P1 | Phase 2 | `enhancement`, `P1`, `phase-2`, `frontend` |
| #14 | Team Member Invitation System | P1 | Phase 2 | `enhancement`, `P1`, `phase-2`, `backend`, `frontend` |
| #15 | Role-Based Access Control (RBAC) | P1 | Phase 2 | `enhancement`, `P1`, `phase-2`, `security` |
| #16 | Organization Switcher Component | P2 | Phase 2 | `enhancement`, `P2`, `phase-2`, `frontend` |

---

## Epic 3: Status Page Presentation

**Priority:** P0 (Critical)  
**Phase:** Phase 1 - Community Edition MVP  
**Target:** March 2026

### Issues

| # | Title | Priority | Phase | Labels |
|---|-------|----------|-------|--------|
| #17 | [EPIC] Status Page Presentation | P0 | Phase 1 | `epic`, `P0`, `phase-1` |
| #18 | Public Status Page Renderer | P0 | Phase 1 | `enhancement`, `P0`, `phase-1`, `frontend` |
| #19 | Incident Management Interface | P0 | Phase 1 | `enhancement`, `P0`, `phase-1`, `frontend`, `backend` |
| #20 | Service Grouping & Display | P1 | Phase 1 | `enhancement`, `P1`, `phase-1`, `frontend` |
| #21 | Light/Dark Mode Support | P2 | Phase 1 | `enhancement`, `P2`, `phase-1`, `frontend` |
| #22 | Embeddable Status Widgets | P2 | Phase 2 | `enhancement`, `P2`, `phase-2`, `frontend` |
| #23 | Status Page Customization | P1 | Phase 3 | `enhancement`, `P1`, `phase-3`, `frontend` |

---

## Epic 4: Notifications & Alerting

**Priority:** P0 (Critical)  
**Phase:** Phase 1 (Basic) / Phase 3 (Advanced)  
**Target:** March 2026 (Basic), August 2026 (Advanced)

### Issues

| # | Title | Priority | Phase | Labels |
|---|-------|----------|-------|--------|
| #24 | [EPIC] Notifications & Alerting | P0 | Phase 1 | `epic`, `P0`, `phase-1` |
| #25 | Email Notifications (SMTP) | P0 | Phase 1 | `enhancement`, `P0`, `phase-1`, `backend` |
| #26 | Webhook Dispatcher (Slack, Discord, Teams) | P0 | Phase 1 | `enhancement`, `P0`, `phase-1`, `backend` |
| #27 | Notification Preferences & Routing | P1 | Phase 1 | `enhancement`, `P1`, `phase-1`, `backend`, `frontend` |
| #28 | Alert Deduplication & Escalation | P1 | Phase 2 | `enhancement`, `P1`, `phase-2`, `backend` |
| #29 | SMS Notifications | P2 | Phase 3 | `enhancement`, `P2`, `phase-3`, `saas-only` |
| #30 | Voice Call Alerts | P2 | Phase 3 | `enhancement`, `P2`, `phase-3`, `saas-only` |
| #31 | PagerDuty Integration | P2 | Phase 3 | `enhancement`, `P2`, `phase-3`, `saas-only` |

---

## Epic 5: SaaS Features & White-Labeling

**Priority:** P1 (High)  
**Phase:** Phase 3 - SaaS Launch  
**Target:** August 2026

### Issues

| # | Title | Priority | Phase | Labels |
|---|-------|----------|-------|--------|
| #32 | [EPIC] SaaS Features & White-Labeling | P1 | Phase 3 | `epic`, `P1`, `phase-3` |
| #33 | Custom Domain Mapping (CNAME) | P1 | Phase 3 | `enhancement`, `P1`, `phase-3`, `saas-only` |
| #34 | Automatic SSL Certificate Provisioning | P1 | Phase 3 | `enhancement`, `P1`, `phase-3`, `saas-only` |
| #35 | Brand Customization (Logo, Colors, Favicon) | P1 | Phase 3 | `enhancement`, `P1`, `phase-3`, `saas-only` |
| #36 | "Powered by" Removal | P1 | Phase 3 | `enhancement`, `P1`, `phase-3`, `saas-only` |
| #37 | Email Template Customization | P2 | Phase 3 | `enhancement`, `P2`, `phase-3`, `saas-only` |
| #38 | Custom CSS Injection | P2 | Phase 4 | `enhancement`, `P2`, `phase-4`, `saas-only` |

---

## Epic 6: Payment & Subscription Management

**Priority:** P1 (High)  
**Phase:** Phase 3 - SaaS Launch  
**Target:** August 2026

### Issues

| # | Title | Priority | Phase | Labels |
|---|-------|----------|-------|--------|
| #39 | [EPIC] Payment & Subscription Management | P1 | Phase 3 | `epic`, `P1`, `phase-3` |
| #40 | Stripe Integration | P1 | Phase 3 | `enhancement`, `P1`, `phase-3`, `backend` |
| #41 | Subscription Plan Management | P1 | Phase 3 | `enhancement`, `P1`, `phase-3`, `backend`, `frontend` |
| #42 | Usage-Based Billing | P1 | Phase 3 | `enhancement`, `P1`, `phase-3`, `backend` |
| #43 | Customer Portal for Self-Service | P1 | Phase 3 | `enhancement`, `P1`, `phase-3`, `frontend` |
| #44 | Invoice Generation | P2 | Phase 3 | `enhancement`, `P2`, `phase-3`, `backend` |
| #45 | Trial Periods & Promo Codes | P2 | Phase 3 | `enhancement`, `P2`, `phase-3`, `backend` |
| #46 | Dunning & Failed Payment Handling | P2 | Phase 3 | `enhancement`, `P2`, `phase-3`, `backend` |

---

## Epic 7: Marketing & Onboarding

**Priority:** P1 (High)  
**Phase:** Phase 3 - SaaS Launch  
**Target:** August 2026

### Issues

| # | Title | Priority | Phase | Labels |
|---|-------|----------|-------|--------|
| #47 | [EPIC] Marketing & Onboarding | P1 | Phase 3 | `epic`, `P1`, `phase-3` |
| #48 | Marketing Landing Page | P1 | Phase 3 | `enhancement`, `P1`, `phase-3`, `frontend` |
| #49 | Interactive Product Demo | P2 | Phase 3 | `enhancement`, `P2`, `phase-3`, `frontend` |
| #50 | Onboarding Wizard | P1 | Phase 3 | `enhancement`, `P1`, `phase-3`, `frontend` |
| #51 | Documentation Site (Docusaurus) | P1 | Phase 2 | `enhancement`, `P1`, `phase-2`, `docs` |
| #52 | Video Tutorials | P2 | Phase 3 | `enhancement`, `P2`, `phase-3`, `docs` |
| #53 | Agency Use Case Templates | P2 | Phase 3 | `enhancement`, `P2`, `phase-3`, `frontend` |

---

## Epic 8: SLA Reporting & Compliance

**Priority:** P2 (Medium)  
**Phase:** Phase 4 - Enterprise Features  
**Target:** November 2026

### Issues

| # | Title | Priority | Phase | Labels |
|---|-------|----------|-------|--------|
| #54 | [EPIC] SLA Reporting & Compliance | P2 | Phase 4 | `epic`, `P2`, `phase-4` |
| #55 | Monthly Uptime Percentage Calculation | P2 | Phase 4 | `enhancement`, `P2`, `phase-4`, `backend` |
| #56 | Automated PDF Report Generation | P2 | Phase 4 | `enhancement`, `P2`, `phase-4`, `backend` |
| #57 | Incident Summary & MTTR Metrics | P2 | Phase 4 | `enhancement`, `P2`, `phase-4`, `backend` |
| #58 | Historical Trend Graphs | P2 | Phase 4 | `enhancement`, `P2`, `phase-4`, `frontend` |
| #59 | Client-Facing vs Internal Reports | P2 | Phase 4 | `enhancement`, `P2`, `phase-4`, `frontend` |
| #60 | Email Delivery Scheduling | P2 | Phase 4 | `enhancement`, `P2`, `phase-4`, `backend` |

---

## Epic 9: Distributed Monitoring Network

**Priority:** P2 (Medium)  
**Phase:** Phase 4 - Enterprise Features  
**Target:** November 2026

### Issues

| # | Title | Priority | Phase | Labels |
|---|-------|----------|-------|--------|
| #61 | [EPIC] Distributed Monitoring Network | P2 | Phase 4 | `epic`, `P2`, `phase-4` |
| #62 | Multi-Region Worker Deployment | P2 | Phase 4 | `enhancement`, `P2`, `phase-4`, `infrastructure` |
| #63 | Consensus-Based Downtime Detection | P2 | Phase 4 | `enhancement`, `P2`, `phase-4`, `backend` |
| #64 | Geographic Latency Tracking | P2 | Phase 4 | `enhancement`, `P2`, `phase-4`, `backend` |
| #65 | Node Health Monitoring | P2 | Phase 4 | `enhancement`, `P2`, `phase-4`, `backend` |
| #66 | Load Balancing & Failover | P2 | Phase 4 | `enhancement`, `P2`, `phase-4`, `infrastructure` |

---

## Epic 10: Third-Party Integrations

**Priority:** P2 (Medium)  
**Phase:** Phase 4 - Enterprise Features  
**Target:** November 2026

### Issues

| # | Title | Priority | Phase | Labels |
|---|-------|----------|-------|--------|
| #67 | [EPIC] Third-Party Integrations | P2 | Phase 4 | `epic`, `P2`, `phase-4` |
| #68 | ConnectWise PSA Integration | P2 | Phase 4 | `enhancement`, `P2`, `phase-4`, `integration` |
| #69 | Syncro RMM Integration | P2 | Phase 4 | `enhancement`, `P2`, `phase-4`, `integration` |
| #70 | Datto RMM Integration | P2 | Phase 4 | `enhancement`, `P2`, `phase-4`, `integration` |
| #71 | Zapier/Make Automation | P2 | Phase 4 | `enhancement`, `P2`, `phase-4`, `integration` |
| #72 | Public REST API Documentation | P1 | Phase 2 | `enhancement`, `P1`, `phase-2`, `docs` |
| #73 | Webhooks for Custom Integrations | P2 | Phase 3 | `enhancement`, `P2`, `phase-3`, `backend` |

---

## Issue Counts by Priority

| Priority | Count | Description |
|----------|-------|-------------|
| P0 | 21 | Critical - MVP blockers |
| P1 | 29 | High - SaaS launch requirements |
| P2 | 23 | Medium - Enterprise features |
| **Total** | **73** | All issues across 10 epics |

---

## Issue Counts by Phase

| Phase | Count | Target Date |
|-------|-------|-------------|
| Phase 1 | 21 | March 2026 |
| Phase 2 | 16 | May 2026 |
| Phase 3 | 24 | August 2026 |
| Phase 4 | 12 | November 2026 |

---

## Issue Status Tracking

To track the status of issues, create them in GitHub with the following workflow:

1. **Not Started** - Issue created but work hasn't begun
2. **In Progress** - Actively being worked on
3. **In Review** - Pull request open, awaiting review
4. **Done** - Merged and deployed

Use GitHub Projects to create a kanban board for visual tracking.

---

## How to Create Issues

### ⚡ Quick Start

We provide an automated script to create all issues:

```bash
# From repository root
node scripts/create-github-issues.js
```

This will create all issues with proper labels, milestones, and descriptions.

### 📖 Detailed Guide

For complete instructions on creating issues, see:

**[CREATE-ISSUES.md](../.github/CREATE-ISSUES.md)**

This guide includes:
- Prerequisites (GitHub CLI installation)
- Automated bulk creation
- Manual creation methods
- Setting up GitHub Projects
- Labels and milestones
- Best practices

### Viewing Issues

Once created, view all issues at:

**https://github.com/EAasen/signalsync-core/issues**

Filter by:
- **Milestone:** Phase 1, Phase 2, etc.
- **Label:** P0, P1, P2, epic, frontend, backend, etc.
- **Status:** Open, Closed

### Issue Template

Use the GitHub issue templates in `.github/ISSUE_TEMPLATE/`:
- `epic.md` - For epic-level issues
- `feature.md` - For feature requests
- `bug_report.md` - For bug reports

---

## Contributing

See the detailed epic files for implementation guidance:

- [EPIC-1-MONITORING-ENGINE.md](./EPIC-1-MONITORING-ENGINE.md)
- [EPIC-2-MULTI-TENANCY.md](./EPIC-2-MULTI-TENANCY.md)
- [EPIC-3-4-5-STATUS-NOTIFICATIONS-SAAS.md](./EPIC-3-4-5-STATUS-NOTIFICATIONS-SAAS.md)

Each epic file contains:
- User stories
- Technical specifications
- Database schemas
- API endpoints
- Acceptance criteria
- Testing strategies

---

## Questions?

Join our Discord: [discord.gg/signalsync](#)  
Email: dev@signalsync.io
