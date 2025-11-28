# GitHub Issues - Epic 3, 4, 5: Status Page, Notifications, SaaS Features

Create these as GitHub issues in your repository.

---

## EPIC 3: Status Page Presentation

**Title:** [EPIC] Status Page Presentation

**Labels:** `epic`, `P0`, `phase-1`

**Related Issues:**
- #17 - Public Status Page Renderer
- #18 - Incident Management Interface
- #19 - Service Grouping & Display
- #20 - Light/Dark Mode Support
- #21 - Embeddable Status Widgets
- #22 - Status Page Customization

---

## Issue #17: Public Status Page Renderer

**Title:** [FEATURE] Public Status Page with Real-Time Updates

**Labels:** `enhancement`, `P0`, `phase-1`, `frontend`

**Milestone:** Phase 1 MVP

**Description:**

### User Story
As a website visitor
I want to view the current status of services
So that I know if reported issues are being addressed

### Proposed Solution

**URL Structure:**
- Community: `https://status.yourdomain.com`
- SaaS: `https://status.signalsync.io/acme-corp` or `https://status.acme.com`

**Page Components:**
1. Header (org name, logo)
2. Overall status indicator
3. Monitor list with status
4. Recent incidents
5. Uptime history (90-day graph)

**Implementation:**
```typescript
// app/status/[orgSlug]/page.tsx
export default async function StatusPage({ params }: { params: { orgSlug: string } }) {
  const supabase = createClient();
  
  const { data: org } = await supabase
    .from('organizations')
    .select(`
      *,
      monitors (
        id,
        name,
        current_status,
        last_checked_at
      ),
      incidents (
        id,
        title,
        status,
        started_at,
        incident_updates (*)
      )
    `)
    .eq('slug', params.orgSlug)
    .eq('monitors.is_active', true)
    .order('incidents.started_at', { ascending: false })
    .limit(10, { foreignTable: 'incidents' })
    .single();
  
  return <StatusPageView org={org} />;
}
```

### Acceptance Criteria
- [ ] Page loads in < 1 second (static generation)
- [ ] Shows real-time status updates
- [ ] Mobile responsive
- [ ] SEO optimized (meta tags, Open Graph)
- [ ] Works without JavaScript (progressive enhancement)

---

## Issue #18: Incident Management Interface

**Title:** [FEATURE] Incident Creation & Update Interface

**Labels:** `enhancement`, `P0`, `phase-1`, `frontend`, `backend`

**Milestone:** Phase 1 MVP

**Description:**

### User Story
As an organization admin
I want to create and update incidents
So that I can communicate service disruptions to users

### Proposed Solution

**Incident Workflow:**
1. Create incident (title, affected services, severity)
2. Add updates ("Investigating", "Identified", "Monitoring", "Resolved")
3. Automatically posts updates to status page
4. Optionally triggers notifications

**UI Component:**
```typescript
interface CreateIncidentForm {
  title: string;
  description: string;
  severity: 'critical' | 'major' | 'minor' | 'maintenance';
  affectedMonitors: string[]; // monitor IDs
  notify: boolean; // Send notifications?
}

// components/IncidentForm.tsx
export function IncidentForm({ projectId, onSuccess }: IncidentFormProps) {
  const [form, setForm] = useState<CreateIncidentForm>({
    title: '',
    description: '',
    severity: 'major',
    affectedMonitors: [],
    notify: true
  });
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    const response = await fetch('/api/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, projectId })
    });
    
    if (response.ok) {
      onSuccess();
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Incident Title"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        placeholder="Database connectivity issues"
        required
      />
      
      <Textarea
        label="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        placeholder="Describe what's happening..."
      />
      
      <Select
        label="Severity"
        value={form.severity}
        onValueChange={(value) => setForm({ ...form, severity: value })}
      >
        <SelectItem value="critical">🔴 Critical</SelectItem>
        <SelectItem value="major">🟠 Major</SelectItem>
        <SelectItem value="minor">🟡 Minor</SelectItem>
        <SelectItem value="maintenance">🔵 Maintenance</SelectItem>
      </Select>
      
      <MonitorSelector
        monitors={monitors}
        selected={form.affectedMonitors}
        onChange={(ids) => setForm({ ...form, affectedMonitors: ids })}
      />
      
      <Checkbox
        label="Send notifications to subscribers"
        checked={form.notify}
        onChange={(checked) => setForm({ ...form, notify: checked })}
      />
      
      <Button type="submit">Create Incident</Button>
    </form>
  );
}
```

### Acceptance Criteria
- [ ] Admin can create incidents
- [ ] Can add updates to existing incidents
- [ ] Updates appear on status page immediately
- [ ] Rich text editor for incident descriptions
- [ ] Timeline view of all updates
- [ ] Can mark incident as resolved

---

## EPIC 4: Notifications & Alerting

**Title:** [EPIC] Notifications & Alerting

**Labels:** `epic`, `P0`, `phase-1`

**Related Issues:**
- #23 - Email Notifications (SMTP)
- #24 - Webhook Dispatcher (Slack, Discord, Teams)
- #25 - Notification Preferences & Routing
- #26 - Alert Deduplication & Escalation
- #27 - SMS Notifications (SaaS Only)
- #28 - PagerDuty Integration (SaaS Only)

---

## Issue #23: Email Notifications (SMTP)

**Title:** [FEATURE] Email Alert Notifications via SMTP

**Labels:** `enhancement`, `P0`, `phase-1`, `backend`

**Milestone:** Phase 1 MVP

**Description:**

### User Story
As a monitor owner
I want to receive emails when services go down
So that I can respond quickly to outages

### Proposed Solution

**Configuration:**
```typescript
interface EmailNotificationConfig {
  enabled: boolean;
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  from: string; // "SignalSync Alerts <alerts@signalsync.io>"
  recipients: string[];
}
```

**Email Template:**
```html
Subject: [🔴 DOWN] {Monitor Name} - SignalSync Alert

Monitor: {Monitor Name}
URL: {Monitor URL}
Status: DOWN
Last Check: {Timestamp}
Error: {Error Message}

View Details: {Dashboard Link}

---
This alert was sent by SignalSync
Manage your notification settings: {Settings Link}
```

**Implementation:**
```typescript
// lib/notifications/email.ts
import nodemailer from 'nodemailer';

export async function sendEmailAlert(params: {
  monitor: Monitor;
  checkResult: CheckResult;
  recipients: string[];
}) {
  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  
  const statusEmoji = params.checkResult.status === 'down' ? '🔴' : '🟢';
  
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: params.recipients.join(', '),
    subject: `[${statusEmoji} ${params.checkResult.status.toUpperCase()}] ${params.monitor.name}`,
    html: renderEmailTemplate(params)
  });
}
```

### Acceptance Criteria
- [ ] Sends email on monitor down
- [ ] Sends recovery email on monitor up
- [ ] Supports custom SMTP servers (self-hosted)
- [ ] HTML and plain text versions
- [ ] Unsubscribe link included
- [ ] Rate limiting (max 1 email per minute per monitor)

---

## Issue #24: Webhook Dispatcher

**Title:** [FEATURE] Webhook Integration for Slack, Discord, Teams

**Labels:** `enhancement`, `P0`, `phase-1`, `backend`

**Milestone:** Phase 1 MVP

**Description:**

### User Story
As a team using Slack/Discord
I want alerts posted to our channel
So that the whole team is immediately aware of issues

### Proposed Solution

**Webhook Configuration:**
```typescript
interface WebhookConfig {
  type: 'slack' | 'discord' | 'teams' | 'generic';
  url: string;
  events: ('down' | 'up' | 'incident_created' | 'incident_updated')[];
}
```

**Slack Payload:**
```json
{
  "text": "Monitor Alert",
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "🔴 Monitor Down: API Server"
      }
    },
    {
      "type": "section",
      "fields": [
        {
          "type": "mrkdwn",
          "text": "*Status:*\nDOWN"
        },
        {
          "type": "mrkdwn",
          "text": "*Last Checked:*\n2025-01-15 10:30 AM"
        },
        {
          "type": "mrkdwn",
          "text": "*Error:*\nConnection timeout"
        }
      ]
    },
    {
      "type": "actions",
      "elements": [
        {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "View Dashboard"
          },
          "url": "https://app.signalsync.io/monitors/abc123"
        }
      ]
    }
  ]
}
```

**Discord Payload:**
```json
{
  "embeds": [{
    "title": "🔴 Monitor Down: API Server",
    "color": 16711680,
    "fields": [
      { "name": "Status", "value": "DOWN", "inline": true },
      { "name": "Last Checked", "value": "2025-01-15 10:30 AM", "inline": true },
      { "name": "Error", "value": "Connection timeout", "inline": false }
    ],
    "footer": { "text": "SignalSync" },
    "timestamp": "2025-01-15T10:30:00Z"
  }]
}
```

### Implementation
```typescript
// lib/notifications/webhook.ts
export async function sendWebhookNotification(webhook: WebhookConfig, payload: any) {
  const formattedPayload = formatPayloadForPlatform(webhook.type, payload);
  
  const response = await fetch(webhook.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formattedPayload)
  });
  
  if (!response.ok) {
    console.error(`Webhook failed: ${response.statusText}`);
    // Store failed delivery for retry
  }
}
```

### Acceptance Criteria
- [ ] Supports Slack incoming webhooks
- [ ] Supports Discord webhooks
- [ ] Supports Microsoft Teams connectors
- [ ] Supports generic JSON webhooks
- [ ] Retry failed deliveries (3 attempts)
- [ ] Logs all webhook deliveries
- [ ] Validates webhook URL before saving

---

## EPIC 5: SaaS Features & White-Labeling

**Title:** [EPIC] SaaS Features & White-Labeling

**Labels:** `epic`, `P1`, `phase-3`

**Related Issues:**
- #29 - Custom Domain Mapping (CNAME)
- #30 - Automatic SSL Certificate Provisioning
- #31 - Brand Customization (Logo, Colors, Favicon)
- #32 - "Powered by" Removal
- #33 - Email Template Customization
- #34 - Advanced CSS Injection

---

## Issue #29: Custom Domain Mapping

**Title:** [FEATURE] Custom Domain Mapping for Status Pages

**Labels:** `enhancement`, `P1`, `phase-3`, `saas-only`

**Milestone:** Phase 3 - SaaS Launch

**Description:**

### User Story
As an agency
I want clients' status pages on their own domains (status.client.com)
So that it appears as part of their branded infrastructure

### Proposed Solution

**Domain Setup Flow:**
1. User enters desired domain in settings
2. System displays DNS instructions (CNAME record)
3. System verifies DNS configuration
4. System provisions SSL certificate (Let's Encrypt)
5. Status page accessible on custom domain

**DNS Configuration:**
```
Type: CNAME
Name: status
Value: proxy.signalsync.io
TTL: 3600
```

**Architecture:**
Use Cloudflare for Saas or similar reverse proxy:
1. User points `status.client.com` → `proxy.signalsync.io`
2. Reverse proxy routes based on SNI (Server Name Indication)
3. Automatic SSL cert issuance via ACME protocol

**Database Schema:**
```sql
CREATE TABLE custom_domains (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  domain TEXT NOT NULL UNIQUE,
  dns_verified BOOLEAN DEFAULT FALSE,
  ssl_provisioned BOOLEAN DEFAULT FALSE,
  verification_token TEXT,
  created_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ
);
```

**API Endpoints:**
```typescript
// POST /api/organizations/:id/custom-domain
{
  "domain": "status.acme.com"
}

// GET /api/organizations/:id/custom-domain/verify
// Checks DNS and triggers SSL provisioning
```

### Acceptance Criteria
- [ ] Users can add custom domains
- [ ] DNS verification works reliably
- [ ] SSL certificates auto-provision
- [ ] Supports both www and non-www
- [ ] Supports CNAME flattening at root domain
- [ ] Automatic certificate renewal
- [ ] Fallback to default domain if custom fails

---

## Issue #30: Brand Customization

**Title:** [FEATURE] Brand Customization (Logo, Colors, Favicon)

**Labels:** `enhancement`, `P1`, `phase-3`, `saas-only`

**Milestone:** Phase 3 - SaaS Launch

**Description:**

### User Story
As an agency
I want to customize the status page appearance
So that it matches my client's brand identity

### Proposed Solution

**Customization Options:**
```typescript
interface BrandCustomization {
  logo: {
    url: string;
    width: number;
    height: number;
  };
  favicon: string;
  colors: {
    primary: string; // #3B82F6
    success: string; // #10B981
    warning: string; // #F59E0B
    danger: string; // #EF4444
    background: string; // #FFFFFF
    text: string; // #1F2937
  };
  font: 'inter' | 'roboto' | 'poppins' | 'custom';
  customCSS?: string;
}
```

**UI Component:**
```typescript
// components/settings/BrandingSettings.tsx
export function BrandingSettings({ organization }: Props) {
  const [branding, setBranding] = useState<BrandCustomization>(organization.branding);
  
  return (
    <div className="space-y-6">
      <Section title="Logo">
        <ImageUpload
          value={branding.logo.url}
          onChange={(url) => setBranding({ ...branding, logo: { ...branding.logo, url } })}
          accept="image/*"
          maxSize={2 * 1024 * 1024} // 2MB
        />
      </Section>
      
      <Section title="Color Scheme">
        <ColorPicker
          label="Primary Color"
          value={branding.colors.primary}
          onChange={(color) => setBranding({
            ...branding,
            colors: { ...branding.colors, primary: color }
          })}
        />
        {/* More color pickers... */}
      </Section>
      
      <Section title="Preview">
        <StatusPagePreview branding={branding} />
      </Section>
      
      <Button onClick={saveBranding}>Save Changes</Button>
    </div>
  );
}
```

**Status Page Rendering:**
```typescript
// app/status/[orgSlug]/page.tsx
export default async function StatusPage({ params }) {
  const { branding } = await getOrganization(params.orgSlug);
  
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          :root {
            --color-primary: ${branding.colors.primary};
            --color-success: ${branding.colors.success};
            --color-warning: ${branding.colors.warning};
            --color-danger: ${branding.colors.danger};
            --color-bg: ${branding.colors.background};
            --color-text: ${branding.colors.text};
          }
          ${branding.customCSS || ''}
        `
      }} />
      
      <StatusPageContent branding={branding} />
    </>
  );
}
```

### Acceptance Criteria
- [ ] Users can upload custom logo
- [ ] Color picker for brand colors
- [ ] Favicon upload and generation
- [ ] Live preview of changes
- [ ] Changes reflect immediately on status page
- [ ] Supports light and dark mode
- [ ] Advanced users can inject custom CSS

---

## Issue #31: SLA Reporting

**Title:** [FEATURE] Automated SLA Compliance PDF Reports

**Labels:** `enhancement`, `P2`, `phase-4`, `saas-only`

**Milestone:** Phase 4 - Enterprise Features

**Description:**

### User Story
As an MSP
I want to generate monthly uptime reports
So that I can attach them to client invoices as proof of SLA compliance

### Proposed Solution

**Report Contents:**
1. Executive Summary (overall uptime %)
2. Per-monitor uptime breakdown
3. Incident timeline
4. Response time trends (p50, p95, p99)
5. Downtime analysis (total minutes, MTTR)

**Report Generation:**
```typescript
// lib/reports/sla-report.ts
import PDFDocument from 'pdfkit';

export async function generateSLAReport(params: {
  organizationId: string;
  startDate: Date;
  endDate: Date;
}): Promise<Buffer> {
  const data = await calculateSLAMetrics(params);
  
  const doc = new PDFDocument();
  const chunks: Buffer[] = [];
  
  doc.on('data', (chunk) => chunks.push(chunk));
  
  // Header with logo
  if (data.organization.logo_url) {
    doc.image(data.organization.logo_url, 50, 50, { width: 100 });
  }
  doc.fontSize(20).text('Uptime Report', 200, 60);
  doc.fontSize(12).text(`${formatDate(params.startDate)} - ${formatDate(params.endDate)}`, 200, 85);
  
  // Executive Summary
  doc.moveDown(2);
  doc.fontSize(16).text('Executive Summary');
  doc.fontSize(12).text(`Overall Uptime: ${data.overallUptime.toFixed(2)}%`);
  doc.text(`Total Incidents: ${data.totalIncidents}`);
  doc.text(`Average Response Time: ${data.avgResponseTime}ms`);
  
  // Per-Monitor Breakdown
  doc.addPage();
  doc.fontSize(16).text('Monitor Performance');
  data.monitors.forEach(monitor => {
    doc.fontSize(12).text(`${monitor.name}: ${monitor.uptime.toFixed(2)}%`);
  });
  
  // Incident Timeline
  doc.addPage();
  doc.fontSize(16).text('Incident Timeline');
  data.incidents.forEach(incident => {
    doc.fontSize(12).text(`${formatDate(incident.started_at)}: ${incident.title}`);
    doc.fontSize(10).text(`Duration: ${incident.duration} minutes`);
  });
  
  doc.end();
  
  return new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

async function calculateSLAMetrics(params) {
  // Query database for uptime stats
  const { data } = await supabase.rpc('calculate_sla_metrics', params);
  return data;
}
```

**Database Function:**
```sql
CREATE OR REPLACE FUNCTION calculate_sla_metrics(
  p_org_id UUID,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'overallUptime', (
      SELECT AVG(uptime_pct)
      FROM (
        SELECT 
          COUNT(*) FILTER (WHERE status = 'up') * 100.0 / COUNT(*) as uptime_pct
        FROM check_results
        WHERE organization_id = p_org_id
          AND checked_at BETWEEN p_start_date AND p_end_date
        GROUP BY monitor_id
      ) AS monitor_uptimes
    ),
    'monitors', (
      SELECT json_agg(json_build_object(
        'name', m.name,
        'uptime', COUNT(*) FILTER (WHERE cr.status = 'up') * 100.0 / COUNT(*)
      ))
      FROM monitors m
      LEFT JOIN check_results cr ON cr.monitor_id = m.id
        AND cr.checked_at BETWEEN p_start_date AND p_end_date
      WHERE m.organization_id = p_org_id
      GROUP BY m.id, m.name
    ),
    'incidents', (
      SELECT json_agg(json_build_object(
        'title', title,
        'started_at', started_at,
        'duration', EXTRACT(EPOCH FROM (COALESCE(resolved_at, NOW()) - started_at)) / 60
      ))
      FROM incidents
      WHERE organization_id = p_org_id
        AND started_at BETWEEN p_start_date AND p_end_date
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;
```

**API Endpoint:**
```typescript
// GET /api/reports/sla?orgId=xxx&start=2025-01-01&end=2025-01-31
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get('orgId');
  const start = new Date(searchParams.get('start')!);
  const end = new Date(searchParams.get('end')!);
  
  const pdf = await generateSLAReport({ organizationId: orgId!, startDate: start, endDate: end });
  
  return new Response(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="sla-report-${orgId}-${start.toISOString().slice(0, 10)}.pdf"`
    }
  });
}
```

### Acceptance Criteria
- [ ] Generates PDF with all required metrics
- [ ] Includes organization branding (logo, colors)
- [ ] Email delivery scheduling (monthly auto-send)
- [ ] Manual generation on-demand
- [ ] Downloadable from dashboard
- [ ] Supports custom date ranges
- [ ] Includes charts/graphs for visual representation

---

## Additional Issues Summary

**Epic 6: Payment & Subscription Management**
- #35 - Stripe Integration
- #36 - Subscription Plan Management
- #37 - Usage-Based Billing
- #38 - Customer Portal
- #39 - Trial Periods & Promo Codes

**Epic 7: Marketing & Onboarding**
- #40 - Marketing Landing Page
- #41 - Interactive Product Demo
- #42 - Onboarding Wizard
- #43 - Documentation Site (Docusaurus)
- #44 - Video Tutorials

**Epic 8: Distributed Monitoring Network**
- #45 - Multi-Region Worker Deployment
- #46 - Consensus-Based Downtime Detection
- #47 - Geographic Latency Tracking
- #48 - Node Health Monitoring

**Epic 9: Third-Party Integrations**
- #49 - ConnectWise PSA Integration
- #50 - Syncro RMM Integration
- #51 - Datto RMM Integration
- #52 - Zapier Integration
- #53 - Public REST API Documentation

---

## Priority Breakdown

**P0 (Critical - MVP Blockers):**
- All of Epic 1 (Monitoring Engine)
- All of Epic 2 (Multi-Tenancy)
- Issues #17, #18 (Status Page)
- Issues #23, #24 (Basic Notifications)

**P1 (High - SaaS Launch):**
- Issues #29, #30, #31 (White-Labeling)
- Issues #27, #28 (Advanced Notifications)
- Epic 6 (Payment Management)

**P2 (Medium - Enterprise Features):**
- Issue #31 (SLA Reporting)
- Epic 8 (Distributed Monitoring)
- Epic 9 (Integrations)

**P3 (Low - Future Enhancements):**
- Custom CSS injection
- Advanced analytics
- Mobile apps
