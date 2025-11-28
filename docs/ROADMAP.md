# SignalSync Development Roadmap

## Vision

Build the agency-first status page platform that bridges the gap between expensive enterprise SaaS and operationally-fragmented open-source solutions.

---

## 🎯 Milestones & Release Strategy

### Phase 0: Foundation (Weeks 1-4)
**Goal:** Establish technical foundation and validate core assumptions

**Target Date:** January 2026

**Deliverables:**
- ✅ Repository structure and monorepo setup
- ✅ Supabase project with RLS-based multi-tenancy schema
- ✅ Basic authentication and authorization
- ✅ Development environment documentation

**Success Criteria:**
- Developer can clone repo and run locally in < 15 minutes
- Database schema supports organization → project → monitor hierarchy
- RLS policies enforce strict tenant isolation

---

### Phase 1: Community Edition MVP (Weeks 5-12)
**Goal:** Ship a self-hostable monitoring solution that developers want to use

**Target Date:** March 2026

**Deliverables:**
- HTTP/HTTPS monitoring with keyword verification
- Single organization, unlimited monitors
- Public status page (1 per instance)
- Email + Webhook notifications
- Basic incident management
- Docker Compose deployment

**Success Criteria:**
- 100 self-hosted deployments within 30 days of r/selfhosted launch
- < 5 critical bugs reported
- Average 4+ stars on GitHub
- Community Discord reaches 50+ members

**Key Epics:**
- [Epic 1] Monitoring Engine (Core)
- [Epic 3] Status Page Presentation
- [Epic 4] Notifications & Alerting (Basic)

---

### Phase 2: Multi-Tenant Foundation (Weeks 13-20)
**Goal:** Enable agencies to manage multiple client organizations

**Target Date:** May 2026

**Deliverables:**
- Multiple organizations per account
- "Mission Control" dashboard showing all orgs
- Team member invitations and basic RBAC
- Project-level monitor grouping
- API endpoints for programmatic access

**Success Criteria:**
- 10 beta agencies actively managing 3+ client orgs each
- Zero cross-tenant data leakage incidents
- < 2 second page load for Mission Control with 50 orgs

**Key Epics:**
- [Epic 2] Multi-Tenancy & Agency Management

---

### Phase 3: SaaS Launch - "Agency Starter" (Weeks 21-30)
**Goal:** Launch paid SaaS tier with white-labeling and custom domains

**Target Date:** August 2026

**Deliverables:**
- Custom domain mapping (CNAME) with auto-SSL
- White-label branding (logo, colors, removal of "Powered by")
- Stripe integration for subscription management
- SSL certificate expiry monitoring
- Enhanced notification channels (SMS, PagerDuty)
- Landing page and marketing site

**Success Criteria:**
- 25 paying customers within 60 days of launch
- $2,500+ MRR
- < 5% churn rate
- Product Hunt top 5 in "Developer Tools"

**Key Epics:**
- [Epic 5] SaaS Features & White-Labeling
- [Epic 6] Payment & Subscription Management
- [Epic 7] Marketing & Onboarding

---

### Phase 4: Enterprise Features (Weeks 31-40)
**Goal:** Add features that increase ACV and reduce churn

**Target Date:** November 2026

**Deliverables:**
- Automated SLA compliance PDF reports
- Advanced synthetic monitoring (latency trends)
- TCP/UDP port monitoring
- Multi-region distributed checks
- Audit logs and compliance exports
- RMM/PSA integrations (ConnectWise, Syncro)

**Success Criteria:**
- $10,000+ MRR
- Average 25+ pages per paying customer
- 3+ enterprise customers (50+ pages each)
- NPS score > 50

**Key Epics:**
- [Epic 8] SLA Reporting & Compliance
- [Epic 9] Distributed Monitoring Network
- [Epic 10] Third-Party Integrations

---

## 🚀 Epic Overview

### Epic 1: Monitoring Engine (Core)
**Status:** Not Started  
**Target:** Phase 1  
**Priority:** P0 (Critical)

Build the stateless, horizontally-scalable monitoring worker that executes uptime checks.

**Key Issues:**
- HTTP/HTTPS monitor with status code validation
- Keyword/content verification
- TCP port monitoring
- SSL certificate expiry detection
- Check scheduling and queue management
- Result persistence and historical tracking

---

### Epic 2: Multi-Tenancy & Agency Management
**Status:** Not Started  
**Target:** Phase 2  
**Priority:** P0 (Critical)

Implement the organization hierarchy and Mission Control dashboard for agencies.

**Key Issues:**
- Organization and project data models
- Row Level Security (RLS) policies
- Mission Control dashboard UI
- Team member invitation system
- Role-Based Access Control (RBAC)
- Organization switching UX

---

### Epic 3: Status Page Presentation
**Status:** Not Started  
**Target:** Phase 1  
**Priority:** P0 (Critical)

Build the public-facing status pages that display uptime data.

**Key Issues:**
- Public status page renderer
- Incident timeline and updates
- Service grouping and display
- Light/Dark mode support
- Embeddable status widgets
- Status page customization (Community Edition)

---

### Epic 4: Notifications & Alerting
**Status:** Not Started  
**Target:** Phase 1 (Basic), Phase 3 (Advanced)  
**Priority:** P0 (Critical)

Deliver real-time notifications when monitors detect issues.

**Key Issues:**
- Email notifications (SMTP)
- Webhook dispatcher (Slack, Discord, Teams)
- Notification preferences and routing
- Alert deduplication and escalation
- SMS notifications (SaaS only)
- Voice call alerts (SaaS only)
- PagerDuty integration (SaaS only)

---

### Epic 5: SaaS Features & White-Labeling
**Status:** Not Started  
**Target:** Phase 3  
**Priority:** P1 (High)

Enable agencies to present SignalSync as their own branded solution.

**Key Issues:**
- Custom domain mapping (CNAME)
- Automatic SSL certificate provisioning
- Brand customization (logo, colors, favicon)
- "Powered by" removal
- Email template customization
- Custom CSS injection (advanced)

---

### Epic 6: Payment & Subscription Management
**Status:** Not Started  
**Target:** Phase 3  
**Priority:** P1 (High)

Monetize the platform through Stripe subscriptions.

**Key Issues:**
- Stripe integration
- Subscription plan management
- Usage-based billing (pages, checks)
- Customer portal for self-service
- Invoice generation
- Trial period and promo codes
- Dunning and failed payment handling

---

### Epic 7: Marketing & Onboarding
**Status:** Not Started  
**Target:** Phase 3  
**Priority:** P1 (High)

Drive adoption through education and seamless onboarding.

**Key Issues:**
- Marketing landing page
- Interactive product demo
- Onboarding wizard (first monitor setup)
- Documentation site (Docusaurus)
- Video tutorials
- Agency use case templates

---

### Epic 8: SLA Reporting & Compliance
**Status:** Not Started  
**Target:** Phase 4  
**Priority:** P2 (Medium)

Generate professional reports for MSP client billing.

**Key Issues:**
- Monthly uptime percentage calculation
- Automated PDF report generation
- Incident summary and MTTR metrics
- Historical trend graphs
- Client-facing vs. internal reports
- Email delivery scheduling

---

### Epic 9: Distributed Monitoring Network
**Status:** Not Started  
**Target:** Phase 4  
**Priority:** P2 (Medium)

Deploy monitoring workers across multiple regions to reduce false positives.

**Key Issues:**
- Multi-region worker deployment (US, EU, APAC)
- Consensus-based downtime detection
- Geographic latency tracking
- Node health monitoring
- Load balancing and failover

---

### Epic 10: Third-Party Integrations
**Status:** Not Started  
**Target:** Phase 4  
**Priority:** P2 (Medium)

Integrate with tools agencies already use daily.

**Key Issues:**
- ConnectWise PSA integration
- Syncro RMM integration
- Datto RMM integration
- Zapier/Make automation
- Public REST API documentation
- Webhooks for custom integrations

---

## 📊 Success Metrics by Phase

| Metric | Phase 1 (MVP) | Phase 2 (Multi-Tenant) | Phase 3 (SaaS) | Phase 4 (Enterprise) |
|--------|---------------|------------------------|----------------|----------------------|
| **GitHub Stars** | 200+ | 500+ | 1,000+ | 2,000+ |
| **Self-Hosted Installs** | 100+ | 250+ | 500+ | 1,000+ |
| **Paying Customers** | 0 | 10 (Beta) | 25+ | 75+ |
| **MRR** | $0 | $0 (Beta) | $2,500+ | $10,000+ |
| **Discord Members** | 50+ | 150+ | 300+ | 750+ |
| **Avg Pages/Customer** | N/A | 5 | 15 | 30 |

---

## 🎯 Strategic Priorities

### Q1 2026: Validate Technical Foundation
- Focus: Ship Community Edition to r/selfhosted
- Goal: Prove we can build better UX than Uptime Kuma for multi-client scenarios
- Risk Mitigation: Get feedback fast, iterate on core monitoring reliability

### Q2 2026: Agency Beta Program
- Focus: Recruit 10 agencies to test multi-tenant features
- Goal: Validate that $49/mo pricing resonates and features meet real needs
- Risk Mitigation: Avoid building features nobody wants; let agencies guide roadmap

### Q3 2026: Revenue Generation
- Focus: Launch paid tier and hit $2,500 MRR
- Goal: Achieve sustainability to fund full-time development
- Risk Mitigation: Keep overhead low; validate unit economics before scaling

### Q4 2026: Scale & Retention
- Focus: Increase ACV through enterprise features
- Goal: Transition early customers from Starter to Pro plans
- Risk Mitigation: Reduce churn through sticky features (historical data, integrations)

---

## 🔄 Continuous Improvement

Throughout all phases:
- **Weekly:** Ship improvements based on Discord feedback
- **Monthly:** Review metrics and adjust roadmap priorities
- **Quarterly:** Survey customers on feature priorities
- **Customer Interviews:** 2-3 per month with agencies of varying sizes

---

## 📝 Contributing to the Roadmap

This roadmap is a living document. Community input is essential to building the right product.

**How to influence the roadmap:**
- **Vote on issues:** Use 👍 reactions on GitHub issues
- **Submit feature requests:** Use the Feature Request template
- **Join Discord:** Participate in #feature-requests channel
- **Beta program:** Email beta@signalsync.io to join agency testing
