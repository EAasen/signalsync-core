-- SignalSync Database Schema
-- Phase 0: Foundation Schema
-- This migration creates the core multi-tenant structure

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ORGANIZATIONS & PROJECTS (Multi-Tenancy Hierarchy)
-- ============================================================================

-- Organizations table (Top-level tenant)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for slug lookups
CREATE INDEX idx_organizations_slug ON organizations(slug);

-- Projects table (Groups monitors within an organization)
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, slug)
);

-- Create indexes
CREATE INDEX idx_projects_organization_id ON projects(organization_id);
CREATE INDEX idx_projects_slug ON projects(organization_id, slug);

-- ============================================================================
-- MONITORS
-- ============================================================================

-- Monitor types enum
CREATE TYPE monitor_type AS ENUM ('http', 'https', 'tcp', 'ssl');

-- Monitor status enum
CREATE TYPE monitor_status AS ENUM ('up', 'down', 'paused', 'maintenance');

-- Monitors table
CREATE TABLE monitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type monitor_type NOT NULL,
    config JSONB NOT NULL,
    interval_seconds INTEGER NOT NULL DEFAULT 60,
    timeout_seconds INTEGER NOT NULL DEFAULT 30,
    status monitor_status NOT NULL DEFAULT 'paused',
    last_checked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_monitors_project_id ON monitors(project_id);
CREATE INDEX idx_monitors_status ON monitors(status);
CREATE INDEX idx_monitors_last_checked_at ON monitors(last_checked_at);

-- ============================================================================
-- CHECK RESULTS (Historical Data)
-- ============================================================================

-- Check results table (Time-series data)
CREATE TABLE check_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    monitor_id UUID NOT NULL REFERENCES monitors(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('up', 'down')),
    response_time_ms INTEGER NOT NULL,
    checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    error_message TEXT,
    http_status_code INTEGER,
    ssl_expiry_date TIMESTAMPTZ
);

-- Create indexes for time-series queries
CREATE INDEX idx_check_results_monitor_id ON check_results(monitor_id);
CREATE INDEX idx_check_results_checked_at ON check_results(checked_at DESC);
CREATE INDEX idx_check_results_monitor_checked ON check_results(monitor_id, checked_at DESC);

-- ============================================================================
-- INCIDENTS
-- ============================================================================

-- Incident status enum
CREATE TYPE incident_status AS ENUM ('investigating', 'identified', 'monitoring', 'resolved');

-- Incident severity enum
CREATE TYPE incident_severity AS ENUM ('critical', 'major', 'minor', 'maintenance');

-- Incidents table
CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    monitor_id UUID NOT NULL REFERENCES monitors(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status incident_status NOT NULL DEFAULT 'investigating',
    severity incident_severity NOT NULL DEFAULT 'major',
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_incidents_monitor_id ON incidents(monitor_id);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_started_at ON incidents(started_at DESC);

-- Incident updates table
CREATE TABLE incident_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    status incident_status NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_incident_updates_incident_id ON incident_updates(incident_id);
CREATE INDEX idx_incident_updates_created_at ON incident_updates(created_at DESC);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

-- Notification channel enum
CREATE TYPE notification_channel AS ENUM ('email', 'webhook', 'sms', 'voice', 'pagerduty');

-- Notification preferences table
CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    monitor_id UUID NOT NULL REFERENCES monitors(id) ON DELETE CASCADE,
    channel notification_channel NOT NULL,
    config JSONB NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_notification_preferences_monitor_id ON notification_preferences(monitor_id);
CREATE INDEX idx_notification_preferences_enabled ON notification_preferences(enabled);

-- Notification log table (for audit trail)
CREATE TABLE notification_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    monitor_id UUID NOT NULL REFERENCES monitors(id) ON DELETE CASCADE,
    incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL,
    channel notification_channel NOT NULL,
    recipient TEXT NOT NULL,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_notification_log_monitor_id ON notification_log(monitor_id);
CREATE INDEX idx_notification_log_sent_at ON notification_log(sent_at DESC);

-- ============================================================================
-- TEAM MEMBERS & RBAC
-- ============================================================================

-- Team role enum
CREATE TYPE team_role AS ENUM ('owner', 'admin', 'editor', 'viewer');

-- Team members table
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL, -- References auth.users
    role team_role NOT NULL DEFAULT 'viewer',
    invited_by UUID, -- References auth.users
    joined_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- Create indexes
CREATE INDEX idx_team_members_organization_id ON team_members(organization_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);

-- Invitations table
CREATE TABLE invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role team_role NOT NULL DEFAULT 'viewer',
    invited_by UUID NOT NULL, -- References auth.users
    expires_at TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, email)
);

-- Create indexes
CREATE INDEX idx_invitations_organization_id ON invitations(organization_id);
CREATE INDEX idx_invitations_email ON invitations(email);
CREATE INDEX idx_invitations_expires_at ON invitations(expires_at);

-- ============================================================================
-- TRIGGERS (Updated timestamps)
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to tables with updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monitors_updated_at BEFORE UPDATE ON monitors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON incidents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
