-- Database Functions
-- Utility functions for common operations

-- ============================================================================
-- UPTIME CALCULATION FUNCTIONS
-- ============================================================================

-- Calculate uptime percentage for a monitor over a time period
CREATE OR REPLACE FUNCTION calculate_uptime_percentage(
    p_monitor_id UUID,
    p_start_date TIMESTAMPTZ,
    p_end_date TIMESTAMPTZ
)
RETURNS NUMERIC AS $$
DECLARE
    total_checks INTEGER;
    successful_checks INTEGER;
    uptime_percentage NUMERIC;
BEGIN
    -- Count total checks
    SELECT COUNT(*) INTO total_checks
    FROM check_results
    WHERE monitor_id = p_monitor_id
    AND checked_at BETWEEN p_start_date AND p_end_date;
    
    -- If no checks, return NULL
    IF total_checks = 0 THEN
        RETURN NULL;
    END IF;
    
    -- Count successful checks
    SELECT COUNT(*) INTO successful_checks
    FROM check_results
    WHERE monitor_id = p_monitor_id
    AND checked_at BETWEEN p_start_date AND p_end_date
    AND status = 'up';
    
    -- Calculate percentage
    uptime_percentage := (successful_checks::NUMERIC / total_checks::NUMERIC) * 100;
    
    RETURN ROUND(uptime_percentage, 2);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INCIDENT METRICS FUNCTIONS
-- ============================================================================

-- Calculate Mean Time To Recovery (MTTR) for a monitor
CREATE OR REPLACE FUNCTION calculate_mttr(
    p_monitor_id UUID,
    p_start_date TIMESTAMPTZ,
    p_end_date TIMESTAMPTZ
)
RETURNS INTERVAL AS $$
DECLARE
    total_duration INTERVAL;
    incident_count INTEGER;
BEGIN
    -- Calculate total duration of resolved incidents
    SELECT 
        COALESCE(SUM(resolved_at - started_at), INTERVAL '0'),
        COUNT(*)
    INTO total_duration, incident_count
    FROM incidents
    WHERE monitor_id = p_monitor_id
    AND resolved_at IS NOT NULL
    AND started_at BETWEEN p_start_date AND p_end_date;
    
    -- If no incidents, return NULL
    IF incident_count = 0 THEN
        RETURN NULL;
    END IF;
    
    -- Calculate average
    RETURN total_duration / incident_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- CLEANUP FUNCTIONS
-- ============================================================================

-- Delete old check results (for data retention)
CREATE OR REPLACE FUNCTION cleanup_old_check_results(
    p_retention_days INTEGER DEFAULT 90
)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM check_results
    WHERE checked_at < NOW() - (p_retention_days || ' days')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGER FUNCTIONS
-- ============================================================================

-- Automatically create incident when monitor goes down
CREATE OR REPLACE FUNCTION create_incident_on_monitor_down()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create incident if status changed from 'up' to 'down'
    IF OLD.status = 'up' AND NEW.status = 'down' THEN
        INSERT INTO incidents (monitor_id, title, severity, status)
        VALUES (
            NEW.id,
            'Monitor ' || NEW.name || ' is down',
            'major',
            'investigating'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER monitor_status_change
    AFTER UPDATE OF status ON monitors
    FOR EACH ROW
    EXECUTE FUNCTION create_incident_on_monitor_down();

-- Auto-resolve incident when monitor comes back up
CREATE OR REPLACE FUNCTION resolve_incident_on_monitor_up()
RETURNS TRIGGER AS $$
BEGIN
    -- Only resolve if status changed from 'down' to 'up'
    IF OLD.status = 'down' AND NEW.status = 'up' THEN
        -- Find most recent unresolved incident
        UPDATE incidents
        SET 
            status = 'resolved',
            resolved_at = NOW()
        WHERE monitor_id = NEW.id
        AND resolved_at IS NULL
        AND id = (
            SELECT id FROM incidents
            WHERE monitor_id = NEW.id
            AND resolved_at IS NULL
            ORDER BY started_at DESC
            LIMIT 1
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER monitor_recovery
    AFTER UPDATE OF status ON monitors
    FOR EACH ROW
    EXECUTE FUNCTION resolve_incident_on_monitor_up();

-- ============================================================================
-- AGGREGATION VIEWS
-- ============================================================================

-- View: Monitor summary with latest stats
CREATE OR REPLACE VIEW monitor_summary AS
SELECT 
    m.id,
    m.project_id,
    m.name,
    m.type,
    m.status,
    m.interval_seconds,
    m.last_checked_at,
    (
        SELECT response_time_ms
        FROM check_results
        WHERE monitor_id = m.id
        ORDER BY checked_at DESC
        LIMIT 1
    ) as last_response_time,
    calculate_uptime_percentage(
        m.id,
        NOW() - INTERVAL '24 hours',
        NOW()
    ) as uptime_24h,
    calculate_uptime_percentage(
        m.id,
        NOW() - INTERVAL '7 days',
        NOW()
    ) as uptime_7d,
    calculate_uptime_percentage(
        m.id,
        NOW() - INTERVAL '30 days',
        NOW()
    ) as uptime_30d,
    (
        SELECT COUNT(*)
        FROM incidents
        WHERE monitor_id = m.id
        AND resolved_at IS NULL
    ) as open_incidents_count
FROM monitors m;

-- View: Organization statistics
CREATE OR REPLACE VIEW organization_stats AS
SELECT 
    o.id as organization_id,
    o.name as organization_name,
    COUNT(DISTINCT p.id) as project_count,
    COUNT(DISTINCT m.id) as monitor_count,
    COUNT(DISTINCT CASE WHEN m.status = 'up' THEN m.id END) as monitors_up,
    COUNT(DISTINCT CASE WHEN m.status = 'down' THEN m.id END) as monitors_down,
    COUNT(DISTINCT tm.id) as team_member_count
FROM organizations o
LEFT JOIN projects p ON p.organization_id = o.id
LEFT JOIN monitors m ON m.project_id = p.id
LEFT JOIN team_members tm ON tm.organization_id = o.id
GROUP BY o.id, o.name;
