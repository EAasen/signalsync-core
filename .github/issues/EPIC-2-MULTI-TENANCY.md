# GitHub Issues - Epic 2: Multi-Tenancy & Agency Management

This document outlines all issues for Epic 2. Create these as GitHub issues in your repository.

---

## Epic Issue

**Title:** [EPIC] Multi-Tenancy & Agency Management

**Labels:** `epic`, `P0`, `phase-2`

**Description:**

### Epic Overview

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

- [ ] #10 - Database Schema Design
- [ ] #11 - Row Level Security (RLS) Implementation
- [ ] #12 - Organization & Project CRUD APIs
- [ ] #13 - Mission Control Dashboard UI
- [ ] #14 - Team Member Invitation System
- [ ] #15 - Role-Based Access Control (RBAC)
- [ ] #16 - Organization Switcher Component

### Dependencies

- Supabase Auth (authentication)
- Epic 1 (monitoring engine uses organization-scoped data)

---

## Issue #10: Database Schema Design

**Title:** [FEATURE] Multi-Tenant Database Schema with Hierarchy

**Labels:** `enhancement`, `P0`, `phase-2`, `database`

**Milestone:** Phase 2 - Multi-Tenant Foundation

**Description:**

### Feature Description

Design and implement the core database schema supporting the organization → project → monitor hierarchy.

**Which edition does this apply to?**
- [x] Community Edition (Self-Hosted) - Limited to 1 org
- [x] Agency Cloud (SaaS) - Unlimited orgs
- [x] Both

### User Story

As a platform architect
I want a database schema that enforces tenant isolation at the database level
So that application bugs cannot cause cross-tenant data leakage

### Proposed Solution

**Schema Diagram:**
```
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
```

**SQL Implementation:**

```sql
-- ============================================
-- PROFILES (User Accounts)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- ORGANIZATIONS (Tenants)
-- ============================================
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE, -- For custom domains: status.{slug}.signalsync.io
  logo_url TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  CONSTRAINT slug_format CHECK (slug ~ '^[a-z0-9-]+$')
);

CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_created_by ON organizations(created_by);

-- ============================================
-- ORGANIZATION MEMBERS (Join Table)
-- ============================================
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  invited_by UUID REFERENCES profiles(id),
  invited_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(organization_id, user_id)
);

CREATE INDEX idx_org_members_org ON organization_members(organization_id);
CREATE INDEX idx_org_members_user ON organization_members(user_id);

-- ============================================
-- PROJECTS (Client Systems/Apps)
-- ============================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  UNIQUE(organization_id, slug)
);

CREATE INDEX idx_projects_org ON projects(organization_id);
CREATE INDEX idx_projects_slug ON projects(organization_id, slug);

-- ============================================
-- MONITORS
-- ============================================
CREATE TABLE monitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('http', 'https', 'tcp', 'ssl', 'ping')),
  
  -- Monitor Configuration (type-specific)
  config JSONB NOT NULL,
  /*
    HTTP/HTTPS: {
      url: string,
      method: 'GET' | 'POST',
      headers: Record<string, string>,
      expectedStatusCodes: number[],
      contentVerification?: { type: 'contains', pattern: string }
    }
    TCP: {
      host: string,
      port: number
    }
    SSL: {
      domain: string,
      alertThresholds: number[]
    }
  */
  
  -- Scheduling
  interval_seconds INT NOT NULL DEFAULT 60,
  timeout_ms INT NOT NULL DEFAULT 10000,
  retry_count INT NOT NULL DEFAULT 3,
  
  -- State
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  current_status TEXT CHECK (current_status IN ('up', 'down', 'unknown')),
  last_checked_at TIMESTAMPTZ,
  
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_monitors_project ON monitors(project_id);
CREATE INDEX idx_monitors_org ON monitors(organization_id);
CREATE INDEX idx_monitors_active ON monitors(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_monitors_next_check ON monitors(last_checked_at, interval_seconds) WHERE is_active = TRUE;

-- ============================================
-- CHECK RESULTS (from Epic 1)
-- ============================================
-- Already defined in Epic 1, adding org reference for RLS
ALTER TABLE check_results ADD COLUMN organization_id UUID REFERENCES organizations(id);
CREATE INDEX idx_check_results_org ON check_results(organization_id);

-- ============================================
-- INCIDENTS
-- ============================================
CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  monitor_id UUID REFERENCES monitors(id) ON DELETE SET NULL,
  
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('investigating', 'identified', 'monitoring', 'resolved')),
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'major', 'minor', 'maintenance')),
  
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_incidents_org ON incidents(organization_id);
CREATE INDEX idx_incidents_project ON incidents(project_id);
CREATE INDEX idx_incidents_monitor ON incidents(monitor_id);
CREATE INDEX idx_incidents_status ON incidents(status) WHERE status != 'resolved';

-- ============================================
-- INCIDENT UPDATES
-- ============================================
CREATE TABLE incident_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('investigating', 'identified', 'monitoring', 'resolved')),
  message TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_incident_updates_incident ON incident_updates(incident_id, created_at DESC);
```

### Data Denormalization Strategy

**Why `organization_id` on monitors AND projects?**

While normalized design would only require `organization_id` on `projects`, we denormalize by adding it to `monitors` for:
1. **RLS Performance:** Avoids JOIN in RLS policy checks
2. **Query Optimization:** Direct org filtering without traversing relationships
3. **Audit Trail:** Clear organizational ownership at every level

**Trade-off:** Slight increase in storage vs. significant performance gain for multi-tenant queries.

### Acceptance Criteria

- [ ] All tables created with proper relationships
- [ ] Foreign key constraints enforce referential integrity
- [ ] Indexes optimize common query patterns
- [ ] Denormalized `organization_id` maintained via triggers or application logic
- [ ] Schema supports both Community (1 org) and SaaS (many orgs) editions
- [ ] Migration script is idempotent and reversible
- [ ] Documentation includes ERD diagram

### Related Issues

- Blocks #11 (RLS policies depend on schema)
- Blocks #12 (CRUD APIs)
- Used by Epic 1 (monitors reference this schema)

---

## Issue #11: Row Level Security (RLS) Implementation

**Title:** [FEATURE] Row Level Security Policies for Multi-Tenancy

**Labels:** `enhancement`, `P0`, `phase-2`, `security`, `database`

**Milestone:** Phase 2 - Multi-Tenant Foundation

**Description:**

### Feature Description

Implement PostgreSQL Row Level Security (RLS) policies to enforce tenant isolation at the database level.

**Which edition does this apply to?**
- [x] Community Edition (Self-Hosted)
- [x] Agency Cloud (SaaS)
- [x] Both

### User Story

As a security-conscious platform operator
I want database-level access controls
So that even if application code has bugs, users cannot access other tenants' data

### Proposed Solution

**RLS Philosophy:**
- **Defense in Depth:** RLS is the LAST line of defense, not the first
- **Fail Secure:** Policies should deny by default
- **Performance:** Use indexes to make RLS checks fast

**Core Helper Function:**
```sql
-- Helper function to check org membership
CREATE OR REPLACE FUNCTION auth.user_organizations()
RETURNS SETOF UUID AS $$
  SELECT organization_id
  FROM organization_members
  WHERE user_id = auth.uid()
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

CREATE INDEX idx_org_members_user_lookup ON organization_members(user_id, organization_id);
```

**RLS Policies:**

```sql
-- ============================================
-- ORGANIZATIONS
-- ============================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Users can view organizations they're members of
CREATE POLICY "View own organizations"
  ON organizations FOR SELECT
  USING (id IN (SELECT auth.user_organizations()));

-- Users can create organizations (automatic membership added via trigger)
CREATE POLICY "Create organizations"
  ON organizations FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- Owners and admins can update organizations
CREATE POLICY "Update own organizations"
  ON organizations FOR UPDATE
  USING (
    id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Only owners can delete organizations
CREATE POLICY "Delete own organizations"
  ON organizations FOR DELETE
  USING (
    id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- ============================================
-- ORGANIZATION MEMBERS
-- ============================================
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- View members of organizations you belong to
CREATE POLICY "View organization members"
  ON organization_members FOR SELECT
  USING (organization_id IN (SELECT auth.user_organizations()));

-- Admins and owners can invite members
CREATE POLICY "Invite members"
  ON organization_members FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Admins and owners can update member roles (except can't demote owners)
CREATE POLICY "Update member roles"
  ON organization_members FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  )
  WITH CHECK (role != 'owner' OR auth.uid() IN (
    SELECT user_id FROM organization_members
    WHERE organization_id = organization_members.organization_id AND role = 'owner'
  ));

-- Admins and owners can remove members
CREATE POLICY "Remove members"
  ON organization_members FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- ============================================
-- PROJECTS
-- ============================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View organization projects"
  ON projects FOR SELECT
  USING (organization_id IN (SELECT auth.user_organizations()));

CREATE POLICY "Create projects"
  ON projects FOR INSERT
  WITH CHECK (
    organization_id IN (SELECT auth.user_organizations())
    AND created_by = auth.uid()
  );

CREATE POLICY "Update projects"
  ON projects FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'editor')
    )
  );

CREATE POLICY "Delete projects"
  ON projects FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- ============================================
-- MONITORS
-- ============================================
ALTER TABLE monitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View organization monitors"
  ON monitors FOR SELECT
  USING (organization_id IN (SELECT auth.user_organizations()));

CREATE POLICY "Create monitors"
  ON monitors FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'editor')
    )
  );

CREATE POLICY "Update monitors"
  ON monitors FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'editor')
    )
  );

CREATE POLICY "Delete monitors"
  ON monitors FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'editor')
    )
  );

-- ============================================
-- CHECK RESULTS
-- ============================================
ALTER TABLE check_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View organization check results"
  ON check_results FOR SELECT
  USING (organization_id IN (SELECT auth.user_organizations()));

-- Workers insert check results (via service role, bypasses RLS)
-- No INSERT policy needed for users

-- ============================================
-- INCIDENTS
-- ============================================
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View organization incidents"
  ON incidents FOR SELECT
  USING (organization_id IN (SELECT auth.user_organizations()));

CREATE POLICY "Create incidents"
  ON incidents FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'editor')
    )
  );

CREATE POLICY "Update incidents"
  ON incidents FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'editor')
    )
  );

-- ============================================
-- INCIDENT UPDATES
-- ============================================
ALTER TABLE incident_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View incident updates"
  ON incident_updates FOR SELECT
  USING (
    incident_id IN (
      SELECT id FROM incidents
      WHERE organization_id IN (SELECT auth.user_organizations())
    )
  );

CREATE POLICY "Create incident updates"
  ON incident_updates FOR INSERT
  WITH CHECK (
    incident_id IN (
      SELECT id FROM incidents
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'editor')
      )
    )
  );
```

### Security Testing Strategy

**Test Cases:**
1. User A cannot query User B's organizations
2. User A cannot insert data into User B's organization
3. User A cannot update User B's monitors
4. Viewer role cannot create/update/delete resources
5. Admin cannot demote organization owner
6. Service role (worker) can bypass RLS to insert check results

**Test Implementation:**
```sql
-- Create test users and orgs
BEGIN;
  -- Setup test data
  INSERT INTO profiles (id, email) VALUES 
    ('user-a-id', 'usera@test.com'),
    ('user-b-id', 'userb@test.com');
  
  -- User A creates org
  SET LOCAL jwt.claims.sub = 'user-a-id';
  INSERT INTO organizations (id, name, slug, created_by) 
  VALUES ('org-a', 'Org A', 'org-a', 'user-a-id');
  
  -- User B creates org
  SET LOCAL jwt.claims.sub = 'user-b-id';
  INSERT INTO organizations (id, name, slug, created_by) 
  VALUES ('org-b', 'Org B', 'org-b', 'user-b-id');
  
  -- Test: User A cannot see Org B
  SET LOCAL jwt.claims.sub = 'user-a-id';
  SELECT id FROM organizations; -- Should only return 'org-a'
  
ROLLBACK; -- Don't commit test data
```

### Performance Considerations

**Optimization:**
- Index on `organization_members(user_id, organization_id)` makes `auth.user_organizations()` fast
- Materialized path or cached membership for users with 100+ orgs
- Consider `SECURITY INVOKER` vs `SECURITY DEFINER` for helper functions

### Acceptance Criteria

- [ ] All tables have RLS enabled
- [ ] Policies enforce role-based permissions (owner, admin, editor, viewer)
- [ ] Security tests verify cross-tenant isolation
- [ ] Performance tests show < 50ms overhead for RLS checks
- [ ] Documentation explains policy logic and testing approach
- [ ] Automated test suite runs on every migration

### Related Issues

- Depends on #10 (database schema)
- Critical for Phase 2 launch (security requirement)

---

## Issue #12: Organization & Project CRUD APIs

**Title:** [FEATURE] REST/GraphQL APIs for Organization Management

**Labels:** `enhancement`, `P0`, `phase-2`, `backend`

**Milestone:** Phase 2 - Multi-Tenant Foundation

**Description:**

### Feature Description

Build backend APIs for creating, reading, updating, and deleting organizations and projects.

**Which edition does this apply to?**
- [x] Community Edition (Self-Hosted) - Limited features
- [x] Agency Cloud (SaaS)
- [x] Both

### User Story

As a frontend developer
I want well-documented APIs for organization management
So that I can build the Mission Control dashboard UI

### Proposed Solution

**Tech Stack:**
- **Option A:** Supabase PostgREST (auto-generated REST APIs)
- **Option B:** Next.js API Routes (more control, custom logic)
- **Recommended:** Hybrid approach - Supabase for reads, Next.js for complex writes

**API Endpoints:**

#### Organizations

```typescript
// GET /api/organizations
// List all organizations the user has access to
interface GetOrganizationsResponse {
  organizations: Array<{
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    role: 'owner' | 'admin' | 'editor' | 'viewer';
    member_count: number;
    project_count: number;
    monitor_count: number;
    created_at: string;
  }>;
}

// GET /api/organizations/:id
// Get single organization details
interface GetOrganizationResponse {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
  members: Array<{
    user_id: string;
    email: string;
    full_name: string;
    role: string;
    joined_at: string;
  }>;
  projects: Array<{
    id: string;
    name: string;
    slug: string;
    monitor_count: number;
  }>;
}

// POST /api/organizations
// Create a new organization
interface CreateOrganizationRequest {
  name: string;
  slug: string;
  logo_url?: string;
}

// PATCH /api/organizations/:id
// Update organization
interface UpdateOrganizationRequest {
  name?: string;
  slug?: string;
  logo_url?: string;
}

// DELETE /api/organizations/:id
// Delete organization (owner only)
```

#### Projects

```typescript
// GET /api/organizations/:orgId/projects
// List projects in an organization
interface GetProjectsResponse {
  projects: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    monitor_count: number;
    uptime_percentage: number;
    current_status: 'operational' | 'degraded' | 'down';
    created_at: string;
  }>;
}

// POST /api/organizations/:orgId/projects
// Create a project
interface CreateProjectRequest {
  name: string;
  slug: string;
  description?: string;
}

// PATCH /api/projects/:id
// Update project
interface UpdateProjectRequest {
  name?: string;
  slug?: string;
  description?: string;
}

// DELETE /api/projects/:id
// Delete project
```

### Implementation Example (Next.js API Route)

```typescript
// app/api/organizations/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createClient();
  
  const { data: organizations, error } = await supabase
    .from('organizations')
    .select(`
      *,
      organization_members!inner(role),
      projects(count),
      monitors(count)
    `)
    .order('name');
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ organizations });
}

export async function POST(request: Request) {
  const supabase = createClient();
  const { name, slug, logo_url } = await request.json();
  
  // Validate slug format
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json(
      { error: 'Slug must contain only lowercase letters, numbers, and hyphens' },
      { status: 400 }
    );
  }
  
  // Check slug availability
  const { data: existing } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', slug)
    .single();
  
  if (existing) {
    return NextResponse.json(
      { error: 'Slug already taken' },
      { status: 409 }
    );
  }
  
  // Create organization
  const { data: user } = await supabase.auth.getUser();
  
  const { data: org, error } = await supabase
    .from('organizations')
    .insert({
      name,
      slug,
      logo_url,
      created_by: user.user!.id
    })
    .select()
    .single();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  // Add creator as owner (via database trigger or explicit insert)
  await supabase
    .from('organization_members')
    .insert({
      organization_id: org.id,
      user_id: user.user!.id,
      role: 'owner'
    });
  
  return NextResponse.json({ organization: org }, { status: 201 });
}
```

### Validation & Error Handling

**Validation Rules:**
- Organization name: 1-100 characters
- Slug: 3-50 characters, lowercase alphanumeric + hyphens
- Slug must be unique across platform (check before insert)

**Error Responses:**
```typescript
{
  "error": "Slug already taken",
  "code": "SLUG_CONFLICT",
  "status": 409
}
```

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

---

## Issue #13: Mission Control Dashboard UI

**Title:** [FEATURE] Mission Control Dashboard for Agency Management

**Labels:** `enhancement`, `P1`, `phase-2`, `frontend`

**Milestone:** Phase 2 - Multi-Tenant Foundation

**Description:**

### Feature Description

Build the "Mission Control" dashboard that displays a high-level overview of all client organizations an agency manages.

**Which edition does this apply to?**
- [ ] Community Edition (Self-Hosted)
- [x] Agency Cloud (SaaS)

*Note: Community Edition is single-org, so this multi-org dashboard only applies to SaaS.*

### User Story

As an MSP technician
I want to see the status of all my clients at a glance
So that I can quickly identify which clients need attention

### Proposed Solution

**UI Layout:**

```
┌────────────────────────────────────────────────────────────┐
│  Mission Control                        [+ New Client]      │
├────────────────────────────────────────────────────────────┤
│  [Search clients...]                    [Filter: All ▾]     │
├────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Acme Corp    │  │ TechStart    │  │ RetailCo     │     │
│  │ 🟢 Operational│  │ 🟡 Degraded  │  │ 🔴 DOWN      │     │
│  │              │  │              │  │              │     │
│  │ 12 monitors  │  │ 8 monitors   │  │ 15 monitors  │     │
│  │ 99.98% uptime│  │ 97.2% uptime │  │ 94.1% uptime │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ DevShop LLC  │  │ CloudFirst   │  │ DataVault    │     │
│  │ 🟢 Operational│  │ 🟢 Operational│  │ 🟢 Operational│    │
│  │ ...          │  │ ...          │  │ ...          │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────────────────────────────────────────────────────┘
```

**Component Structure:**

```typescript
// components/mission-control/OrgCard.tsx
interface OrgCardProps {
  org: {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    current_status: 'operational' | 'degraded' | 'down';
    monitor_count: number;
    uptime_percentage: number;
    active_incidents: number;
  };
}

export function OrgCard({ org }: OrgCardProps) {
  const statusIcon = {
    operational: '🟢',
    degraded: '🟡',
    down: '🔴'
  };
  
  return (
    <Link href={`/dashboard/${org.slug}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-center gap-3">
            {org.logo_url ? (
              <img src={org.logo_url} className="w-10 h-10 rounded" />
            ) : (
              <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                {org.name[0]}
              </div>
            )}
            <div>
              <h3 className="font-semibold">{org.name}</h3>
              <p className="text-sm text-gray-500">
                {statusIcon[org.current_status]} {org.current_status}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm">{org.monitor_count} monitors</p>
            <p className="text-sm">{org.uptime_percentage.toFixed(2)}% uptime (30d)</p>
            {org.active_incidents > 0 && (
              <Badge variant="destructive">
                {org.active_incidents} active incident(s)
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
```

**Data Fetching:**

```typescript
// app/mission-control/page.tsx
import { createClient } from '@/lib/supabase/server';
import { OrgCard } from '@/components/mission-control/OrgCard';

export default async function MissionControlPage() {
  const supabase = createClient();
  
  // Fetch all orgs with aggregated stats
  const { data: orgs } = await supabase
    .rpc('get_mission_control_summary');
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mission Control</h1>
        <Button>+ New Client</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orgs?.map(org => (
          <OrgCard key={org.id} org={org} />
        ))}
      </div>
    </div>
  );
}
```

**Database Function (for performance):**

```sql
CREATE OR REPLACE FUNCTION get_mission_control_summary()
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  logo_url TEXT,
  current_status TEXT,
  monitor_count BIGINT,
  uptime_percentage DECIMAL,
  active_incidents BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.name,
    o.slug,
    o.logo_url,
    CASE 
      WHEN COUNT(m.id) FILTER (WHERE m.current_status = 'down') > 0 THEN 'down'
      WHEN COUNT(m.id) FILTER (WHERE m.current_status = 'unknown') > 0 THEN 'degraded'
      ELSE 'operational'
    END::TEXT as current_status,
    COUNT(DISTINCT m.id) as monitor_count,
    COALESCE(
      AVG(
        (SELECT COUNT(*) FILTER (WHERE status = 'up') * 100.0 / COUNT(*)
         FROM check_results
         WHERE monitor_id = m.id
           AND checked_at > NOW() - INTERVAL '30 days')
      ), 0
    )::DECIMAL as uptime_percentage,
    COUNT(DISTINCT i.id) FILTER (WHERE i.status != 'resolved') as active_incidents
  FROM organizations o
  LEFT JOIN monitors m ON m.organization_id = o.id AND m.is_active = TRUE
  LEFT JOIN incidents i ON i.organization_id = o.id
  WHERE o.id IN (SELECT auth.user_organizations())
  GROUP BY o.id, o.name, o.slug, o.logo_url
  ORDER BY o.name;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
```

### Features

**Core:**
- Grid of organization cards
- Real-time status updates (via Supabase Realtime)
- Click card to navigate to org dashboard

**Enhancements:**
- Search/filter organizations
- Sort by: name, status, uptime
- Bulk actions (e.g., "Pause all monitors for selected orgs")

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

---

## Issue #14: Team Member Invitation System

**Title:** [FEATURE] Invite Team Members to Organizations

**Labels:** `enhancement`, `P1`, `phase-2`, `backend`, `frontend`

**Milestone:** Phase 2 - Multi-Tenant Foundation

**Description:**

### Feature Description

Allow organization admins to invite team members via email with specific roles.

**Which edition does this apply to?**
- [x] Community Edition (Self-Hosted)
- [x] Agency Cloud (SaaS)
- [x] Both

### User Story

As an organization admin
I want to invite team members to access our organization
So that we can collaborate on monitoring and incident management

### Proposed Solution

**Invitation Flow:**

1. Admin enters email and selects role
2. System sends invitation email with magic link
3. Recipient clicks link (if no account, creates one)
4. User joins organization with specified role

**Database Schema:**

```sql
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
  invited_by UUID NOT NULL REFERENCES profiles(id),
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '7 days',
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(organization_id, email) -- Prevent duplicate invites
);

CREATE INDEX idx_invitations_token ON invitations(token) WHERE accepted_at IS NULL;
CREATE INDEX idx_invitations_email ON invitations(email) WHERE accepted_at IS NULL;
```

**API Endpoints:**

```typescript
// POST /api/organizations/:orgId/invitations
interface SendInvitationRequest {
  email: string;
  role: 'admin' | 'editor' | 'viewer';
}

// GET /api/invitations/:token
// Verify invitation is valid
interface VerifyInvitationResponse {
  organization: {
    name: string;
    logo_url: string | null;
  };
  email: string;
  role: string;
  invited_by: {
    full_name: string;
  };
}

// POST /api/invitations/:token/accept
// Accept invitation and join organization
```

**Email Template:**

```html
Subject: You've been invited to join {Organization Name} on SignalSync

Hi there,

{Inviter Name} has invited you to join {Organization Name} as a {Role}.

[Accept Invitation Button]
Or copy this link: https://app.signalsync.io/invitations/{token}

This invitation expires in 7 days.

---
SignalSync - The Agency-First Status Page
```

### Implementation (Next.js API Route)

```typescript
// app/api/organizations/[orgId]/invitations/route.ts
import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email';

export async function POST(
  request: Request,
  { params }: { params: { orgId: string } }
) {
  const supabase = createClient();
  const { email, role } = await request.json();
  
  // Check user has permission to invite
  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', params.orgId)
    .eq('user_id', (await supabase.auth.getUser()).data.user!.id)
    .single();
  
  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return new Response('Forbidden', { status: 403 });
  }
  
  // Check if user is already a member
  const { data: existingMember } = await supabase
    .from('organization_members')
    .select('id')
    .eq('organization_id', params.orgId)
    .eq('user_id', email) // Assuming email lookup
    .single();
  
  if (existingMember) {
    return Response.json(
      { error: 'User is already a member' },
      { status: 409 }
    );
  }
  
  // Create invitation
  const { data: invitation, error } = await supabase
    .from('invitations')
    .insert({
      organization_id: params.orgId,
      email,
      role,
      invited_by: (await supabase.auth.getUser()).data.user!.id
    })
    .select()
    .single();
  
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  
  // Send invitation email
  await sendEmail({
    to: email,
    subject: `You've been invited to join on SignalSync`,
    html: renderInvitationEmail(invitation)
  });
  
  return Response.json({ invitation }, { status: 201 });
}
```

### Security Considerations

- Invitations expire after 7 days
- Token is cryptographically random (32 bytes)
- Rate limit: Max 10 invitations per hour per user
- Can't invite to 'owner' role (must be transferred explicitly)

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

---

## Issue #15: Role-Based Access Control (RBAC)

**Title:** [FEATURE] Granular Role-Based Access Control

**Labels:** `enhancement`, `P1`, `phase-2`, `security`

**Milestone:** Phase 2 - Multi-Tenant Foundation

**Description:**

### Feature Description

Implement role-based permissions system with four roles: Owner, Admin, Editor, Viewer.

**Which edition does this apply to?**
- [x] Community Edition (Self-Hosted)
- [x] Agency Cloud (SaaS)
- [x] Both

### User Story

As an organization owner
I want to control what team members can do
So that I can delegate responsibilities safely

### Proposed Solution

**Role Hierarchy:**

| Permission | Owner | Admin | Editor | Viewer |
|------------|-------|-------|--------|--------|
| **Organization** |
| View organization | ✅ | ✅ | ✅ | ✅ |
| Edit settings | ✅ | ✅ | ❌ | ❌ |
| Delete organization | ✅ | ❌ | ❌ | ❌ |
| **Members** |
| View members | ✅ | ✅ | ✅ | ✅ |
| Invite members | ✅ | ✅ | ❌ | ❌ |
| Change roles | ✅ | ✅ | ❌ | ❌ |
| Remove members | ✅ | ✅ | ❌ | ❌ |
| Transfer ownership | ✅ | ❌ | ❌ | ❌ |
| **Projects** |
| View projects | ✅ | ✅ | ✅ | ✅ |
| Create projects | ✅ | ✅ | ✅ | ❌ |
| Edit projects | ✅ | ✅ | ✅ | ❌ |
| Delete projects | ✅ | ✅ | ❌ | ❌ |
| **Monitors** |
| View monitors | ✅ | ✅ | ✅ | ✅ |
| Create monitors | ✅ | ✅ | ✅ | ❌ |
| Edit monitors | ✅ | ✅ | ✅ | ❌ |
| Delete monitors | ✅ | ✅ | ✅ | ❌ |
| **Incidents** |
| View incidents | ✅ | ✅ | ✅ | ✅ |
| Create incidents | ✅ | ✅ | ✅ | ❌ |
| Update incidents | ✅ | ✅ | ✅ | ❌ |
| Resolve incidents | ✅ | ✅ | ✅ | ❌ |

**Helper Functions:**

```typescript
// lib/rbac.ts
export type Role = 'owner' | 'admin' | 'editor' | 'viewer';

export interface Permission {
  resource: 'organization' | 'members' | 'projects' | 'monitors' | 'incidents';
  action: 'view' | 'create' | 'update' | 'delete';
}

export function canPerformAction(
  role: Role,
  permission: Permission
): boolean {
  const permissions: Record<Role, Permission[]> = {
    owner: [{ resource: '*', action: '*' }], // All permissions
    admin: [
      { resource: 'organization', action: 'view' },
      { resource: 'organization', action: 'update' },
      { resource: 'members', action: 'view' },
      { resource: 'members', action: 'create' },
      { resource: 'members', action: 'update' },
      { resource: 'members', action: 'delete' },
      { resource: 'projects', action: '*' },
      { resource: 'monitors', action: '*' },
      { resource: 'incidents', action: '*' }
    ],
    editor: [
      { resource: 'organization', action: 'view' },
      { resource: 'members', action: 'view' },
      { resource: 'projects', action: 'view' },
      { resource: 'projects', action: 'create' },
      { resource: 'projects', action: 'update' },
      { resource: 'monitors', action: '*' },
      { resource: 'incidents', action: '*' }
    ],
    viewer: [
      { resource: 'organization', action: 'view' },
      { resource: 'members', action: 'view' },
      { resource: 'projects', action: 'view' },
      { resource: 'monitors', action: 'view' },
      { resource: 'incidents', action: 'view' }
    ]
  };
  
  // Check if user has specific permission or wildcard
  return permissions[role].some(p =>
    (p.resource === permission.resource || p.resource === '*') &&
    (p.action === permission.action || p.action === '*')
  );
}

// React hook for UI
export function usePermission(permission: Permission) {
  const { role } = useOrganization(); // Context hook
  return canPerformAction(role, permission);
}
```

**UI Integration:**

```typescript
// components/MonitorList.tsx
import { usePermission } from '@/lib/rbac';

export function MonitorList() {
  const canCreate = usePermission({ resource: 'monitors', action: 'create' });
  const canDelete = usePermission({ resource: 'monitors', action: 'delete' });
  
  return (
    <div>
      {canCreate && (
        <Button onClick={openCreateModal}>+ New Monitor</Button>
      )}
      
      <MonitorTable
        monitors={monitors}
        showDeleteButton={canDelete}
      />
    </div>
  );
}
```

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

---

## Issue #16: Organization Switcher Component

**Title:** [FEATURE] Organization Switcher Navigation Component

**Labels:** `enhancement`, `P2`, `phase-2`, `frontend`

**Milestone:** Phase 2 - Multi-Tenant Foundation

**Description:**

### Feature Description

Build a dropdown component allowing users to switch between organizations they're members of.

**Which edition does this apply to?**
- [ ] Community Edition (Self-Hosted) - Single org only
- [x] Agency Cloud (SaaS)

### User Story

As a user belonging to multiple organizations
I want to easily switch between them
So that I can manage different clients without logging in/out

### Proposed Solution

**UI Design (similar to GitHub's org switcher):**

```
┌────────────────────────────────────────┐
│ Dashboard                               │
├────────────────────────────────────────┤
│ [Acme Corp ▾]   Search   Profile       │
└────────────────────────────────────────┘
  │
  ├─ Acme Corp ✓
  ├─ TechStart
  ├─ RetailCo
  ├─────────────
  ├─ + Create Organization
  └─ Mission Control (View All)
```

**Component:**

```typescript
// components/OrgSwitcher.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
}

interface OrgSwitcherProps {
  organizations: Organization[];
  currentOrgId: string;
}

export function OrgSwitcher({ organizations, currentOrgId }: OrgSwitcherProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  
  const currentOrg = organizations.find(o => o.id === currentOrgId);
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          <div className="flex items-center gap-2">
            {currentOrg?.logo_url ? (
              <img src={currentOrg.logo_url} className="w-5 h-5 rounded" />
            ) : (
              <div className="w-5 h-5 bg-gray-200 rounded" />
            )}
            <span className="truncate">{currentOrg?.name}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search organizations..." />
          <CommandList>
            <CommandEmpty>No organization found.</CommandEmpty>
            <CommandGroup>
              {organizations.map(org => (
                <CommandItem
                  key={org.id}
                  onSelect={() => {
                    router.push(`/dashboard/${org.slug}`);
                    setOpen(false);
                  }}
                >
                  <div className="flex items-center gap-2 flex-1">
                    {org.logo_url ? (
                      <img src={org.logo_url} className="w-5 h-5 rounded" />
                    ) : (
                      <div className="w-5 h-5 bg-gray-200 rounded" />
                    )}
                    <span>{org.name}</span>
                  </div>
                  {org.id === currentOrgId && <Check className="h-4 w-4" />}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  router.push('/organizations/new');
                  setOpen(false);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Organization
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  router.push('/mission-control');
                  setOpen(false);
                }}
              >
                Mission Control (View All)
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
```

### Data Fetching

```typescript
// app/dashboard/[orgSlug]/layout.tsx
import { OrgSwitcher } from '@/components/OrgSwitcher';
import { createClient } from '@/lib/supabase/server';

export default async function OrgLayout({ params, children }) {
  const supabase = createClient();
  
  // Fetch all user's orgs for switcher
  const { data: orgs } = await supabase
    .from('organizations')
    .select('id, name, slug, logo_url')
    .order('name');
  
  // Get current org
  const { data: currentOrg } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', params.orgSlug)
    .single();
  
  return (
    <div>
      <nav className="border-b p-4">
        <OrgSwitcher
          organizations={orgs || []}
          currentOrgId={currentOrg?.id || ''}
        />
      </nav>
      {children}
    </div>
  );
}
```

### Acceptance Criteria

- [ ] Dropdown shows all user's organizations
- [ ] Search/filter organizations by name
- [ ] Current organization indicated with checkmark
- [ ] Clicking org navigates to its dashboard
- [ ] "Create Organization" link functional
- [ ] "Mission Control" link navigates to overview
- [ ] Keyboard accessible (arrow keys, enter)
- [ ] Responsive design

### Related Issues

- Depends on #12 (API for fetching orgs)
- Enhances #13 (Mission Control navigation)

---

## Testing Strategy for Epic 2

### Unit Tests
- RLS policies prevent unauthorized access
- RBAC helper functions return correct permissions
- API validation rejects invalid data

### Integration Tests
- Full CRUD workflows for organizations and projects
- Team invitation and acceptance flow
- Cross-tenant isolation verified

### E2E Tests
- Admin invites member → Member accepts → Member accesses org
- Viewer cannot create monitors (UI + API rejection)
- Organization switcher navigates correctly

### Security Audit
- Penetration testing for RLS bypasses
- Verify no SQL injection vectors
- Check JWT token validation
