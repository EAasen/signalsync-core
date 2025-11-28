Absolutely\! A compelling `README.md` is the first and most important marketing touchpoint for an Open Core project. It needs to attract developers and clearly differentiate the free Community Edition from the paid SaaS offering.

[cite\_start]Here is the draft content for the `signalsync-monorepo` README.md, incorporating all strategic elements from the reports[cite: 307, 345, 475, 478, 481, 482].

## 🚦 SignalSync: The Agency-First Status OS

[cite\_start]**SignalSync** is the modern, multi-tenant uptime monitoring and status page platform built specifically for **Managed Service Providers (MSPs)** and **Digital Agencies**[cite: 307, 314]. [cite\_start]We address the "Agency Dilemma": managing dozens of client status pages without incurring prohibitive per-page costs from enterprise incumbents[cite: 312, 325, 331].

### Core Thesis: Open Source Power. Enterprise Management.

[cite\_start]We leverage a distributed, stateless architecture (Node.js Worker + Supabase RLS) to provide performance and security, while our **Open Core** model ensures transparent code and rapid adoption[cite: 315, 317, 338, 409, 412].

| Feature Category | Community Edition (Free/Self-Hosted) | Agency Cloud (Paid SaaS) |
| :--- | :--- | :--- |
| **Primary Use Case** | [cite\_start]Personal Projects, Homelab, Single-Client Monitoring [cite: 357] | [cite\_start]**Managing 10+ Client Portfolios** [cite: 367] |
| **Status Pages** | [cite\_start]**1 Page** (Self-Hosted) [cite: 515] | [cite\_start]**Unlimited Client Pages** (Bulk/Agency Pricing) [cite: 520, 524] |
| **Architecture** | [cite\_start]Single-Tenant Focus [cite: 329] | [cite\_start]**Unified Multi-Tenancy** ("Mission Control") [cite: 370] |
| **White-Labeling** | [cite\_start]Requires Manual Code/CSS Changes [cite: 372] | [cite\_start]**Native 1-Click Custom Domains** (CNAME) & Logo [cite: 372, 400] |
| **Team Access** | [cite\_start]Single Admin [cite: 516] | [cite\_start]Multi-User / **Granular RBAC** (Team Collaboration) [cite: 375, 521] |
| **Advanced Alerts** | [cite\_start]Email / Webhook only [cite: 403, 404] | [cite\_start]**SMS, Voice, PagerDuty** Integrations [cite: 405] |
| **Reporting** | [cite\_start]Basic Uptime History [cite: 516] | [cite\_start]**Automated SLA Compliance PDF Reports** [cite: 374, 524] |
| **Cost** | [cite\_start]**$0** (Plus your hosting cost) [cite: 514] | [cite_start]Starting at **$49/month** (Pays for itself via Reselling) [cite: 520, 531] |

-----

## 🚀 Quick Start (Self-Hosted / Community Edition)

The Community Edition gives you the full, unbridled monitoring engine. [cite\_start]Self-host it in minutes using Docker[cite: 479].

### Prerequisites

  * Docker and Docker Compose installed
  * [cite\_start]A Supabase project set up (free tier is fine for testing) [cite: 409]

### Installation

```bash
# 1. Clone the monorepo
git clone https://github.com/signalsync/signalsync-monorepo.git
cd signalsync-monorepo

# 2. Configure Environment Variables
# Create a .env file and add your Supabase connection string and keys.
# (See /docker/README.md for detailed instructions)

# 3. Deploy the Worker and Web Interface
docker compose up -d

# 4. Access the Dashboard
# Navigate to http://localhost:3000 to complete setup.
```

-----

## 🏗️ Technical Architecture and Stack

[cite\_start]SignalSync is engineered for maximum **AI-Augmented Development Velocity** [cite: 16, 39, 43] using the highest-velocity stack:

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | [cite\_start]**Next.js 14+** (App Router) [cite: 220] | [cite\_start]Enables both lightning-fast **Status Pages (SSG)** and a dynamic **Dashboard (CSR)**[cite: 414]. |
| **Database** | [cite\_start]**Supabase** (PostgreSQL) [cite: 220, 409] | [cite\_start]Provides **Auth** and non-negotiable **Row Level Security (RLS)** for strict multi-tenancy isolation[cite: 317, 393, 411]. |
| **Worker** | [cite\_start]**Node.js** (TypeScript) [cite: 412] | [cite\_start]Non-blocking I/O ideal for handling thousands of concurrent uptime checks efficiently[cite: 412]. |
| **UI/Styling** | [cite\_start]**shadcn/ui** + **Tailwind CSS** [cite: 220, 416] | [cite\_start]Allows for rapid, high-quality dashboard generation using AI tools like v0.dev and Cursor[cite: 41, 84]. |

-----

## ⚖️ Licensing

[cite\_start]This project is released under the **Business Source License (BSL) 1.1**[cite: 470].

The BSL allows the source code to be viewed and used for **non-production** or **personal use** free of charge. [cite\_start]However, it specifically restricts the use of the code to launch a **competing commercial, multi-tenant SaaS** product until the specified **Change Date**, at which point the code converts to a permissive open-source license (Apache 2.0)[cite: 472, 473].

This license allows us to maintain a viable business that funds the continued development of the Community Edition.

[](https://www.google.com/search?q=%5Bhttps://mariadb.com/bsl-license-1-1/%5D\(https://mariadb.com/bsl-license-1-1/\))

-----

## 🤝 Contribution & Support

We welcome contributions from the community\!

  * [cite\_start]**Bugs/Features:** Please submit issues to the [GitHub Issues tracker][cite: 482].
  * [cite\_start]**Real-time Support:** Join our [Discord Server Link] for developer chat and community support[cite: 496].

-----

-----

## 📋 Development Roadmap & Issues

### 🎯 View All Epics & Issues

- **[📊 GitHub Issues](https://github.com/EAasen/signalsync-core/issues)** - All 73+ issues in the issue tracker
- **[📈 GitHub Projects](https://github.com/EAasen/signalsync-core/projects)** - Kanban board for visual tracking
- **[📋 Epics Overview](.github/EPICS-OVERVIEW.md)** - High-level roadmap with all 10 development epics
- **[📝 Create Issues Guide](.github/CREATE-ISSUES.md)** - How to bulk-create issues
- **[🗺️ Product Roadmap](./docs/ROADMAP.md)** - Business context and milestones
- **[🏗️ Project Structure](./docs/PROJECT-STRUCTURE.md)** - Technical architecture and monorepo layout

### Quick Links to Epic Details

- [Epic 1: Monitoring Engine (Core)](.github/issues/EPIC-1-MONITORING-ENGINE.md) - HTTP/HTTPS/TCP monitoring
- [Epic 2: Multi-Tenancy & Agency Management](.github/issues/EPIC-2-MULTI-TENANCY.md) - Organization hierarchy and RLS
- [Epic 3-5: Status Pages, Notifications, & SaaS Features](.github/issues/EPIC-3-4-5-STATUS-NOTIFICATIONS-SAAS.md) - Public pages and white-labeling

### Current Development Status

**Phase:** Phase 0 - Foundation  
**Next Milestone:** Phase 1 - Community Edition MVP (March 2026)

See [ROADMAP.md](./docs/ROADMAP.md) for detailed timeline and success metrics.

-----

## ⏭️ Next Step

The next logical step is to implement the **database schema and RLS policies**, which form the security foundation of the multi-tenant architecture.

👉 **See [Epic 2, Issue #10](.github/issues/EPIC-2-MULTI-TENANCY.md#issue-10-database-schema-design)** for the complete schema design and implementation guide.
