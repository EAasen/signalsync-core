# SignalSync Development Plan

**Status:** Phase 0 - Foundation  
**Last Updated:** November 28, 2025  
**Target Launch:** Phase 1 MVP by March 2026

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Current Status](#current-status)
3. [Development Phases](#development-phases)
4. [Implementation Roadmap](#implementation-roadmap)
5. [Epic Breakdown](#epic-breakdown)
6. [Technical Architecture](#technical-architecture)
7. [Getting Started](#getting-started)
8. [Development Workflow](#development-workflow)
9. [Testing Strategy](#testing-strategy)
10. [Deployment Strategy](#deployment-strategy)

---

## 🎯 Project Overview

SignalSync is an Open Core, multi-tenant uptime monitoring and status page platform built for Managed Service Providers (MSPs) and Digital Agencies. The platform addresses the "Agency Dilemma" of managing dozens of client status pages without prohibitive per-page costs.

### Core Value Proposition

- **Community Edition:** Free, self-hosted monitoring for personal projects and single clients
- **Agency Cloud (SaaS):** Paid tier with unlimited client pages, white-labeling, and agency features

### Technology Stack

- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS
- **Backend:** Node.js (TypeScript), Supabase (PostgreSQL)
- **Worker:** Node.js monitoring engine
- **Infrastructure:** Docker, Vercel (SaaS), Fly.io (workers)

---

## 🚀 Current Status

### Completed ✅

- [x] Repository structure and monorepo setup
- [x] Package configuration (TypeScript, ESLint)
- [x] Database schema design (PostgreSQL with RLS)
- [x] Basic project scaffolding
- [x] Docker configuration

### File Structure Created

```
signalsync-core/
├── apps/
│   ├── web/              # Next.js dashboard (scaffolded)
│   └── worker/           # Monitoring engine (scaffolded)
├── packages/
│   ├── config/           # Shared configs (ESLint, TypeScript)
│   ├── types/            # Shared TypeScript types
│   ├── logger/           # Logging utility
│   └── database/         # Database schema & migrations
├── docker/               # Docker configurations
└── scripts/              # Utility scripts
```

### Next Immediate Steps

1. Install dependencies: `pnpm install`
2. Set up Supabase project and apply migrations
3. Configure environment variables
4. Start implementing Epic 1 (Monitoring Engine)

---

## 📅 Development Phases

### Phase 0: Foundation (Current - Week 4)
**Goal:** Technical foundation and development environment

**Completed:**
- ✅ Monorepo structure
- ✅ Database schema
- ✅ Project scaffolding

**Remaining:**
- [ ] Install dependencies
- [ ] Apply database migrations
- [ ] Basic authentication setup
- [ ] Development documentation

---

### Phase 1: Community Edition MVP (Weeks 5-12)
**Target:** March 2026  
**Goal:** Ship self-hostable monitoring solution

**Key Deliverables:**
- HTTP/HTTPS monitoring with keyword verification
- Single organization, unlimited monitors
- Public status page (1 per instance)
- Email + Webhook notifications
- Basic incident management
- Docker Compose deployment

**Success Criteria:**
- 100 self-hosted deployments within 30 days
- < 5 critical bugs reported
- Average 4+ stars on GitHub

**Epics to Complete:**
- [Epic 1] Monitoring Engine (Core)
- [Epic 3] Status Page Presentation
- [Epic 4] Notifications & Alerting (Basic)

---

### Phase 2: Multi-Tenant Foundation (Weeks 13-20)
**Target:** May 2026  
**Goal:** Enable agency multi-client management

**Key Deliverables:**
- Multiple organizations per account
- Mission Control dashboard
- Team member invitations and RBAC
- Project-level monitor grouping
- REST API endpoints

**Success Criteria:**
- 10 beta agencies managing 3+ client orgs each
- Zero cross-tenant data leakage
- < 2 second Mission Control load time with 50 orgs

**Epics to Complete:**
- [Epic 2] Multi-Tenancy & Agency Management

---

### Phase 3: SaaS Launch (Weeks 21-30)
**Target:** August 2026  
**Goal:** Launch paid tier with white-labeling

**Key Deliverables:**
- Custom domain mapping with auto-SSL
- White-label branding
- Stripe subscription management
- SSL certificate monitoring
- SMS/PagerDuty notifications
- Marketing landing page

**Success Criteria:**
- 25 paying customers within 60 days
- $2,500+ MRR
- < 5% churn rate
- Product Hunt top 5 in Developer Tools

**Epics to Complete:**
- [Epic 5] SaaS Features & White-Labeling
- [Epic 6] Payment & Subscription Management
- [Epic 7] Marketing & Onboarding
- [Epic 4] Notifications (Advanced features)

---

### Phase 4: Enterprise Features (Weeks 31-40)
**Target:** November 2026  
**Goal:** Increase ACV and reduce churn

**Key Deliverables:**
- Automated SLA PDF reports
- Multi-region distributed checks
- TCP/UDP monitoring
- RMM/PSA integrations
- Audit logs

**Success Criteria:**
- $10,000+ MRR
- 25+ pages per customer average
- 3+ enterprise customers (50+ pages each)
- NPS score > 50

**Epics to Complete:**
- [Epic 8] SLA Reporting & Compliance
- [Epic 9] Distributed Monitoring Network
- [Epic 10] Third-Party Integrations

---

## 🗺️ Implementation Roadmap

### Week-by-Week Plan (Phase 1)

#### Week 1-2: Core Monitoring Engine
**Epic 1: Issues #1-8**

**Week 1:**
- [ ] Set up development environment
- [ ] Implement HTTP monitor (`apps/worker/src/monitors/http.ts`)
- [ ] Write unit tests for HTTP monitor
- [ ] Test with real endpoints

**Week 2:**
- [ ] Implement TCP monitor
- [ ] Implement SSL monitor
- [ ] Create monitor executor
- [ ] Implement scheduler with database polling

**Deliverable:** Worker can execute HTTP/TCP/SSL checks

---

#### Week 3-4: Database Integration & Check Storage
**Epic 1: Issues #4-6**

**Week 3:**
- [ ] Complete RLS policy testing
- [ ] Implement check result storage
- [ ] Create uptime calculation functions
- [ ] Set up data retention policies

**Week 4:**
- [ ] Implement incident auto-creation triggers
- [ ] Test monitor status transitions
- [ ] Performance testing with 1000+ checks
- [ ] Worker scalability testing

**Deliverable:** Complete monitoring engine with data persistence

---

#### Week 5-6: Authentication & Basic Dashboard
**Epic 2: Issues #9-11**

**Week 5:**
- [ ] Implement Supabase Auth integration
- [ ] Create login/signup pages
- [ ] Set up protected routes
- [ ] User session management

**Week 6:**
- [ ] Create organization creation flow
- [ ] Build basic dashboard layout
- [ ] Implement project creation
- [ ] Monitor list view

**Deliverable:** Users can sign up and create organizations

---

#### Week 7-8: Monitor Management UI
**Epic 1: Issues #7-8**

**Week 7:**
- [ ] Monitor creation form (HTTP/HTTPS)
- [ ] Monitor configuration UI
- [ ] Monitor list with status indicators
- [ ] Monitor detail page with latest checks

**Week 8:**
- [ ] Monitor edit/delete functionality
- [ ] Bulk monitor operations
- [ ] Monitor pause/resume
- [ ] TCP/SSL monitor UI

**Deliverable:** Complete monitor CRUD interface

---

#### Week 9-10: Status Page
**Epic 3: Issues #17-23**

**Week 9:**
- [ ] Public status page layout
- [ ] Display monitor statuses
- [ ] Service grouping
- [ ] Uptime percentage display
- [ ] Response time graphs

**Week 10:**
- [ ] Incident timeline
- [ ] Light/dark mode
- [ ] Status page customization
- [ ] Embeddable widget
- [ ] Static site generation optimization

**Deliverable:** Public status pages

---

#### Week 11-12: Notifications & Polish
**Epic 4: Issues #24-27**

**Week 11:**
- [ ] Email notification implementation
- [ ] Webhook dispatcher (Slack, Discord)
- [ ] Notification preferences UI
- [ ] Alert deduplication logic

**Week 12:**
- [ ] Documentation writing
- [ ] Bug fixes and polish
- [ ] Performance optimization
- [ ] Docker Compose setup guide
- [ ] Community Edition release prep

**Deliverable:** Phase 1 MVP Launch

---

## 📊 Epic Breakdown

### Priority Matrix

| Priority | Epics | Status | Phase |
|----------|-------|--------|-------|
| **P0** | Epic 1, 2, 3, 4 (Basic) | Not Started | 1-2 |
| **P1** | Epic 5, 6, 7 | Not Started | 3 |
| **P2** | Epic 8, 9, 10 | Not Started | 4 |

### Epic Details

#### Epic 1: Monitoring Engine (Core)
**Issues:** #1-8 | **Priority:** P0 | **Phase:** 1

**Implementation Order:**
1. HTTP monitor implementation
2. TCP monitor implementation
3. SSL monitor implementation
4. Scheduler and queue management
5. Check result storage
6. Incident auto-creation
7. Monitor configuration UI
8. Historical data & uptime calculation

**Technical Challenges:**
- False positive prevention (retry logic)
- High concurrency check execution
- Efficient time-series data storage
- Horizontal worker scaling

---

#### Epic 2: Multi-Tenancy & Agency Management
**Issues:** #9-16 | **Priority:** P0 | **Phase:** 2

**Implementation Order:**
1. Database schema (already complete)
2. RLS policy testing
3. Organization creation flow
4. Mission Control dashboard
5. Team member invitation system
6. RBAC implementation
7. Organization switcher UI

**Technical Challenges:**
- RLS policy performance at scale
- Cross-tenant data isolation verification
- Efficient multi-org queries

---

#### Epic 3: Status Page Presentation
**Issues:** #17-23 | **Priority:** P0 | **Phase:** 1

**Implementation Order:**
1. Public page layout
2. Monitor status display
3. Incident timeline
4. Uptime graphs
5. Service grouping
6. Embeddable widgets
7. Customization options

**Technical Challenges:**
- Static site generation for performance
- Real-time status updates
- CDN caching strategy

---

#### Epic 4: Notifications & Alerting
**Issues:** #24-31 | **Priority:** P0 (Basic), P1 (Advanced) | **Phase:** 1 & 3

**Phase 1 (Basic):**
1. Email notifications (SMTP)
2. Webhook dispatcher
3. Notification preferences
4. Alert routing

**Phase 3 (Advanced):**
5. SMS notifications (Twilio)
6. Voice calls
7. PagerDuty integration
8. Escalation policies

**Technical Challenges:**
- Alert deduplication
- Delivery reliability
- Rate limiting

---

## 🏗️ Technical Architecture

### System Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ↓
┌─────────────────────────────────────┐
│     Next.js Web Dashboard           │
│  (apps/web)                         │
│  - Authentication                   │
│  - Monitor Management               │
│  - Mission Control                  │
└─────────┬───────────────────────────┘
          │
          ↓
┌─────────────────────────────────────┐
│      Supabase (PostgreSQL)          │
│  - User Auth                        │
│  - Multi-tenant Data                │
│  - Row Level Security               │
└─────────┬───────────────────────────┘
          │
          ↑
┌─────────────────────────────────────┐
│    Monitoring Worker                │
│  (apps/worker)                      │
│  - HTTP/TCP/SSL Checks              │
│  - Scheduler                        │
│  - Result Storage                   │
└─────────────────────────────────────┘
```

### Database Schema

See `packages/database/supabase/migrations/` for complete schema.

**Key Tables:**
- `organizations` - Top-level tenant
- `projects` - Monitor grouping
- `monitors` - Check configurations
- `check_results` - Time-series data
- `incidents` - Downtime tracking
- `team_members` - RBAC

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+
- Supabase account
- Docker (optional)

### Initial Setup

```bash
# 1. Clone repository
git clone https://github.com/EAasen/signalsync-core.git
cd signalsync-core

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# 4. Apply database migrations
# Login to Supabase dashboard and run SQL files in:
# packages/database/supabase/migrations/

# 5. Start development servers
pnpm dev
```

This starts:
- Web dashboard: http://localhost:3000
- Worker: Background service

### Docker Setup (Alternative)

```bash
# 1. Set up environment
cp .env.example .env

# 2. Start with Docker Compose
cd docker
docker-compose up
```

---

## 🔄 Development Workflow

### Creating a New Feature

1. **Pick an issue from GitHub**
   - Browse: https://github.com/EAasen/signalsync-core/issues
   - Filter by `phase-1` label for current work

2. **Create a branch**
   ```bash
   git checkout -b feature/issue-number-description
   ```

3. **Implement the feature**
   - Write code in appropriate package/app
   - Add unit tests
   - Update documentation

4. **Test locally**
   ```bash
   # Type check
   pnpm typecheck

   # Lint
   pnpm lint

   # Run tests
   pnpm test

   # Test in browser
   pnpm dev
   ```

5. **Commit and push**
   ```bash
   git commit -m "feat: implement feature description (#issue-number)"
   git push origin feature/issue-number-description
   ```

6. **Open Pull Request**
   - Target `main` branch
   - Reference issue number
   - Request review

### Conventional Commits

Use semantic commit messages:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `refactor:` - Code restructuring
- `test:` - Test additions
- `chore:` - Maintenance tasks

---

## 🧪 Testing Strategy

### Unit Tests

Test individual functions and components:

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

**Location:** `__tests__/` directories

### Integration Tests

Test database interactions and API routes:

```bash
pnpm test:integration
```

### E2E Tests

Test complete user flows (Phase 2+):

```bash
pnpm test:e2e
```

### Manual Testing Checklist

**Before each PR:**
- [ ] Feature works as described
- [ ] No console errors
- [ ] Responsive on mobile
- [ ] Accessibility (keyboard navigation)
- [ ] Database queries are efficient

---

## 🚢 Deployment Strategy

### Community Edition (Self-Hosted)

**Docker Compose:**
```bash
docker-compose -f docker/docker-compose.yml up -d
```

**Manual:**
```bash
pnpm build
pnpm start
```

### SaaS (Cloud) - Phase 3+

**Frontend (Vercel):**
- Automatic deployment from `main` branch
- Preview deployments for PRs

**Worker (Fly.io):**
```bash
fly deploy
```

**Database (Supabase Cloud):**
- Managed PostgreSQL
- Automatic backups
- Global edge network

---

## 📈 Success Metrics

### Phase 1 Goals

| Metric | Target |
|--------|--------|
| GitHub Stars | 200+ |
| Self-Hosted Installs | 100+ |
| Discord Members | 50+ |
| Critical Bugs | < 5 |
| Average Rating | 4+ stars |

### Development Velocity

- **Sprint Length:** 2 weeks
- **Story Points:** 20-30 per sprint
- **Code Review:** Within 24 hours
- **Bug Fix SLA:** Critical (24h), Major (3 days), Minor (7 days)

---

## 🤝 Contributing

See [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md) for detailed guidelines.

### Quick Links

- **Issues:** https://github.com/EAasen/signalsync-core/issues
- **Epics:** [.github/EPICS-OVERVIEW.md](.github/EPICS-OVERVIEW.md)
- **Project Board:** https://github.com/EAasen/signalsync-core/projects
- **Discord:** [Join community](#)

---

## 📚 Additional Resources

- **Product Roadmap:** [ROADMAP.md](ROADMAP.md)
- **Project Structure:** [PROJECT-STRUCTURE.md](PROJECT-STRUCTURE.md)
- **Database Schema:** [packages/database/README.md](packages/database/README.md)
- **Epic Documentation:** [.github/issues/](..github/issues/)

---

**Ready to start coding?** Pick an issue from [Phase 1 issues](https://github.com/EAasen/signalsync-core/issues?q=is%3Aissue+is%3Aopen+label%3Aphase-1) and let's build! 🚀
