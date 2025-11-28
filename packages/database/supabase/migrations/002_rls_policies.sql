-- Row Level Security (RLS) Policies
-- This migration implements strict tenant isolation using Supabase RLS

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to check if user is a member of an organization
CREATE OR REPLACE FUNCTION is_organization_member(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM team_members
        WHERE organization_id = org_id
        AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's role in an organization
CREATE OR REPLACE FUNCTION get_user_role(org_id UUID)
RETURNS team_role AS $$
    SELECT role FROM team_members
    WHERE organization_id = org_id
    AND user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to check if user has minimum role
CREATE OR REPLACE FUNCTION has_minimum_role(org_id UUID, min_role team_role)
RETURNS BOOLEAN AS $$
DECLARE
    user_role team_role;
BEGIN
    user_role := get_user_role(org_id);
    
    -- Owner > Admin > Editor > Viewer
    RETURN CASE
        WHEN user_role = 'owner' THEN true
        WHEN user_role = 'admin' AND min_role IN ('admin', 'editor', 'viewer') THEN true
        WHEN user_role = 'editor' AND min_role IN ('editor', 'viewer') THEN true
        WHEN user_role = 'viewer' AND min_role = 'viewer' THEN true
        ELSE false
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ORGANIZATIONS POLICIES
-- ============================================================================

-- Users can view organizations they are members of
CREATE POLICY "Users can view their organizations"
    ON organizations FOR SELECT
    USING (is_organization_member(id));

-- Only owners can update organization details
CREATE POLICY "Owners can update organization"
    ON organizations FOR UPDATE
    USING (has_minimum_role(id, 'owner'));

-- Only owners can delete organizations
CREATE POLICY "Owners can delete organization"
    ON organizations FOR DELETE
    USING (has_minimum_role(id, 'owner'));

-- Authenticated users can create organizations
CREATE POLICY "Authenticated users can create organizations"
    ON organizations FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- ============================================================================
-- PROJECTS POLICIES
-- ============================================================================

-- Users can view projects in their organizations
CREATE POLICY "Users can view organization projects"
    ON projects FOR SELECT
    USING (is_organization_member(organization_id));

-- Editors and above can create projects
CREATE POLICY "Editors can create projects"
    ON projects FOR INSERT
    WITH CHECK (has_minimum_role(organization_id, 'editor'));

-- Editors and above can update projects
CREATE POLICY "Editors can update projects"
    ON projects FOR UPDATE
    USING (has_minimum_role(organization_id, 'editor'));

-- Admins and above can delete projects
CREATE POLICY "Admins can delete projects"
    ON projects FOR DELETE
    USING (has_minimum_role(organization_id, 'admin'));

-- ============================================================================
-- MONITORS POLICIES
-- ============================================================================

-- Users can view monitors in their organization's projects
CREATE POLICY "Users can view organization monitors"
    ON monitors FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = monitors.project_id
            AND is_organization_member(projects.organization_id)
        )
    );

-- Editors and above can create monitors
CREATE POLICY "Editors can create monitors"
    ON monitors FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = monitors.project_id
            AND has_minimum_role(projects.organization_id, 'editor')
        )
    );

-- Editors and above can update monitors
CREATE POLICY "Editors can update monitors"
    ON monitors FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = monitors.project_id
            AND has_minimum_role(projects.organization_id, 'editor')
        )
    );

-- Admins and above can delete monitors
CREATE POLICY "Admins can delete monitors"
    ON monitors FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = monitors.project_id
            AND has_minimum_role(projects.organization_id, 'admin')
        )
    );

-- ============================================================================
-- CHECK RESULTS POLICIES
-- ============================================================================

-- Users can view check results for their organization's monitors
CREATE POLICY "Users can view check results"
    ON check_results FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM monitors
            JOIN projects ON projects.id = monitors.project_id
            WHERE monitors.id = check_results.monitor_id
            AND is_organization_member(projects.organization_id)
        )
    );

-- Service role can insert check results (worker process)
CREATE POLICY "Service role can insert check results"
    ON check_results FOR INSERT
    WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- INCIDENTS POLICIES
-- ============================================================================

-- Users can view incidents for their organization's monitors
CREATE POLICY "Users can view incidents"
    ON incidents FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM monitors
            JOIN projects ON projects.id = monitors.project_id
            WHERE monitors.id = incidents.monitor_id
            AND is_organization_member(projects.organization_id)
        )
    );

-- Editors and above can create incidents
CREATE POLICY "Editors can create incidents"
    ON incidents FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM monitors
            JOIN projects ON projects.id = monitors.project_id
            WHERE monitors.id = incidents.monitor_id
            AND has_minimum_role(projects.organization_id, 'editor')
        )
    );

-- Editors and above can update incidents
CREATE POLICY "Editors can update incidents"
    ON incidents FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM monitors
            JOIN projects ON projects.id = monitors.project_id
            WHERE monitors.id = incidents.monitor_id
            AND has_minimum_role(projects.organization_id, 'editor')
        )
    );

-- ============================================================================
-- INCIDENT UPDATES POLICIES
-- ============================================================================

-- Users can view incident updates
CREATE POLICY "Users can view incident updates"
    ON incident_updates FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM incidents
            JOIN monitors ON monitors.id = incidents.monitor_id
            JOIN projects ON projects.id = monitors.project_id
            WHERE incidents.id = incident_updates.incident_id
            AND is_organization_member(projects.organization_id)
        )
    );

-- Editors and above can create incident updates
CREATE POLICY "Editors can create incident updates"
    ON incident_updates FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM incidents
            JOIN monitors ON monitors.id = incidents.monitor_id
            JOIN projects ON projects.id = monitors.project_id
            WHERE incidents.id = incident_updates.incident_id
            AND has_minimum_role(projects.organization_id, 'editor')
        )
    );

-- ============================================================================
-- NOTIFICATION PREFERENCES POLICIES
-- ============================================================================

-- Users can view notification preferences
CREATE POLICY "Users can view notification preferences"
    ON notification_preferences FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM monitors
            JOIN projects ON projects.id = monitors.project_id
            WHERE monitors.id = notification_preferences.monitor_id
            AND is_organization_member(projects.organization_id)
        )
    );

-- Editors and above can manage notification preferences
CREATE POLICY "Editors can manage notification preferences"
    ON notification_preferences FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM monitors
            JOIN projects ON projects.id = monitors.project_id
            WHERE monitors.id = notification_preferences.monitor_id
            AND has_minimum_role(projects.organization_id, 'editor')
        )
    );

-- ============================================================================
-- TEAM MEMBERS POLICIES
-- ============================================================================

-- Users can view team members in their organizations
CREATE POLICY "Users can view team members"
    ON team_members FOR SELECT
    USING (is_organization_member(organization_id));

-- Only owners can add team members
CREATE POLICY "Owners can add team members"
    ON team_members FOR INSERT
    WITH CHECK (has_minimum_role(organization_id, 'owner'));

-- Only owners can update team member roles
CREATE POLICY "Owners can update team members"
    ON team_members FOR UPDATE
    USING (has_minimum_role(organization_id, 'owner'));

-- Only owners can remove team members
CREATE POLICY "Owners can remove team members"
    ON team_members FOR DELETE
    USING (has_minimum_role(organization_id, 'owner'));

-- ============================================================================
-- INVITATIONS POLICIES
-- ============================================================================

-- Users can view invitations for their organizations
CREATE POLICY "Users can view invitations"
    ON invitations FOR SELECT
    USING (is_organization_member(organization_id));

-- Admins and above can create invitations
CREATE POLICY "Admins can create invitations"
    ON invitations FOR INSERT
    WITH CHECK (has_minimum_role(organization_id, 'admin'));

-- Admins and above can revoke invitations
CREATE POLICY "Admins can revoke invitations"
    ON invitations FOR DELETE
    USING (has_minimum_role(organization_id, 'admin'));
