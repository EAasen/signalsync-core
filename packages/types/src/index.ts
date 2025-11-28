// Organization Types
export interface Organization {
  id: string;
  name: string;
  slug: string;
  created_at: Date;
  updated_at: Date;
}

export interface Project {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  created_at: Date;
  updated_at: Date;
}

// Monitor Types
export type MonitorType = 'http' | 'https' | 'tcp' | 'ssl';
export type MonitorStatus = 'up' | 'down' | 'paused' | 'maintenance';

export interface Monitor {
  id: string;
  project_id: string;
  name: string;
  type: MonitorType;
  config: MonitorConfig;
  interval_seconds: number;
  timeout_seconds: number;
  status: MonitorStatus;
  created_at: Date;
  updated_at: Date;
}

export type MonitorConfig = 
  | HttpMonitorConfig
  | TcpMonitorConfig
  | SslMonitorConfig;

export interface HttpMonitorConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD';
  headers?: Record<string, string>;
  body?: string;
  expected_status_codes: number[];
  keyword_verification?: {
    enabled: boolean;
    keyword: string;
    case_sensitive?: boolean;
  };
  follow_redirects?: boolean;
  verify_ssl?: boolean;
}

export interface TcpMonitorConfig {
  host: string;
  port: number;
}

export interface SslMonitorConfig {
  host: string;
  port: number;
  warn_days_before_expiry: number;
}

// Check Result Types
export interface CheckResult {
  id: string;
  monitor_id: string;
  status: 'up' | 'down';
  response_time_ms: number;
  checked_at: Date;
  error_message?: string;
  http_status_code?: number;
  ssl_expiry_date?: Date;
}

// Incident Types
export type IncidentStatus = 'investigating' | 'identified' | 'monitoring' | 'resolved';
export type IncidentSeverity = 'critical' | 'major' | 'minor' | 'maintenance';

export interface Incident {
  id: string;
  monitor_id: string;
  title: string;
  status: IncidentStatus;
  severity: IncidentSeverity;
  started_at: Date;
  resolved_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface IncidentUpdate {
  id: string;
  incident_id: string;
  status: IncidentStatus;
  message: string;
  created_at: Date;
}

// Notification Types
export type NotificationChannel = 'email' | 'webhook' | 'sms' | 'voice' | 'pagerduty';

export interface NotificationPreference {
  id: string;
  monitor_id: string;
  channel: NotificationChannel;
  config: NotificationConfig;
  enabled: boolean;
  created_at: Date;
}

export type NotificationConfig = 
  | EmailNotificationConfig
  | WebhookNotificationConfig
  | SmsNotificationConfig
  | PagerDutyNotificationConfig;

export interface EmailNotificationConfig {
  recipients: string[];
  notify_on_recovery: boolean;
}

export interface WebhookNotificationConfig {
  url: string;
  method: 'POST' | 'PUT';
  headers?: Record<string, string>;
  template?: string;
}

export interface SmsNotificationConfig {
  phone_numbers: string[];
}

export interface PagerDutyNotificationConfig {
  integration_key: string;
  severity: 'critical' | 'error' | 'warning' | 'info';
}

// Team & RBAC Types
export type TeamRole = 'owner' | 'admin' | 'editor' | 'viewer';

export interface TeamMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: TeamRole;
  invited_by: string;
  joined_at?: Date;
  created_at: Date;
}

export interface Invitation {
  id: string;
  organization_id: string;
  email: string;
  role: TeamRole;
  invited_by: string;
  expires_at: Date;
  accepted_at?: Date;
  created_at: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}
