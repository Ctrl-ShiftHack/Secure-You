-- Migration: Location Tracking and Background GPS
-- Created: 2024
-- Description: Adds tables for location history and tracking sessions

-- ============================================
-- Table: location_history
-- Purpose: Store GPS coordinates during emergency tracking
-- ============================================

CREATE TABLE IF NOT EXISTS location_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(10, 2), -- Accuracy in meters
  altitude DECIMAL(10, 2), -- Optional altitude in meters
  heading DECIMAL(5, 2), -- Optional heading in degrees (0-360)
  speed DECIMAL(10, 2), -- Optional speed in m/s
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_location_history_user ON location_history(user_id);
CREATE INDEX idx_location_history_created ON location_history(created_at DESC);
CREATE INDEX idx_location_history_user_created ON location_history(user_id, created_at DESC);

-- Comments
COMMENT ON TABLE location_history IS 'GPS location points recorded during emergency tracking';
COMMENT ON COLUMN location_history.user_id IS 'User who generated this location point';
COMMENT ON COLUMN location_history.latitude IS 'Latitude in decimal degrees (-90 to 90)';
COMMENT ON COLUMN location_history.longitude IS 'Longitude in decimal degrees (-180 to 180)';
COMMENT ON COLUMN location_history.accuracy IS 'GPS accuracy radius in meters';
COMMENT ON COLUMN location_history.altitude IS 'Altitude above sea level in meters';
COMMENT ON COLUMN location_history.heading IS 'Direction of travel in degrees (0=North, 90=East, etc.)';
COMMENT ON COLUMN location_history.speed IS 'Speed of movement in meters per second';

-- ============================================
-- Table: tracking_sessions
-- Purpose: Store metadata about location tracking sessions
-- ============================================

CREATE TABLE IF NOT EXISTS tracking_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL, -- Optional link to incident
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  total_distance DECIMAL(10, 2), -- Total distance traveled in meters
  average_speed DECIMAL(10, 2), -- Average speed in km/h
  max_speed DECIMAL(10, 2), -- Maximum speed reached in km/h
  location_count INTEGER DEFAULT 0, -- Number of location points recorded
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  notes TEXT, -- Optional notes about the session
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_tracking_sessions_user ON tracking_sessions(user_id);
CREATE INDEX idx_tracking_sessions_incident ON tracking_sessions(incident_id);
CREATE INDEX idx_tracking_sessions_status ON tracking_sessions(status);
CREATE INDEX idx_tracking_sessions_started ON tracking_sessions(started_at DESC);

-- Comments
COMMENT ON TABLE tracking_sessions IS 'Tracking session metadata and statistics';
COMMENT ON COLUMN tracking_sessions.user_id IS 'User who initiated the tracking session';
COMMENT ON COLUMN tracking_sessions.incident_id IS 'Associated incident if tracking started from SOS';
COMMENT ON COLUMN tracking_sessions.started_at IS 'When tracking began';
COMMENT ON COLUMN tracking_sessions.ended_at IS 'When tracking ended (NULL if still active)';
COMMENT ON COLUMN tracking_sessions.total_distance IS 'Total distance traveled during session in meters';
COMMENT ON COLUMN tracking_sessions.average_speed IS 'Average speed during session in km/h';
COMMENT ON COLUMN tracking_sessions.max_speed IS 'Fastest speed recorded during session in km/h';
COMMENT ON COLUMN tracking_sessions.location_count IS 'Number of location points in this session';
COMMENT ON COLUMN tracking_sessions.status IS 'Session status: active, completed, or cancelled';

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on both tables
ALTER TABLE location_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_sessions ENABLE ROW LEVEL SECURITY;

-- location_history policies
-- Users can only see their own location history
CREATE POLICY "Users can view own location history"
  ON location_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own location points
CREATE POLICY "Users can insert own locations"
  ON location_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own location history
CREATE POLICY "Users can delete own location history"
  ON location_history
  FOR DELETE
  USING (auth.uid() = user_id);

-- tracking_sessions policies
-- Users can only see their own tracking sessions
CREATE POLICY "Users can view own tracking sessions"
  ON tracking_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own tracking sessions
CREATE POLICY "Users can insert own tracking sessions"
  ON tracking_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own tracking sessions
CREATE POLICY "Users can update own tracking sessions"
  ON tracking_sessions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own tracking sessions
CREATE POLICY "Users can delete own tracking sessions"
  ON tracking_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Functions
-- ============================================

-- Function to calculate distance between two points (Haversine formula)
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 DECIMAL,
  lon1 DECIMAL,
  lat2 DECIMAL,
  lon2 DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
  r DECIMAL := 6371000; -- Earth's radius in meters
  dlat DECIMAL;
  dlon DECIMAL;
  a DECIMAL;
  c DECIMAL;
BEGIN
  dlat := radians(lat2 - lat1);
  dlon := radians(lon2 - lon1);
  
  a := sin(dlat/2) * sin(dlat/2) + 
       cos(radians(lat1)) * cos(radians(lat2)) * 
       sin(dlon/2) * sin(dlon/2);
  
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  
  RETURN r * c; -- Distance in meters
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calculate_distance IS 'Calculate distance between two GPS coordinates using Haversine formula';

-- Function to update tracking session statistics
CREATE OR REPLACE FUNCTION update_tracking_session_stats(session_id UUID)
RETURNS void AS $$
DECLARE
  total_dist DECIMAL := 0;
  prev_lat DECIMAL;
  prev_lon DECIMAL;
  prev_time TIMESTAMP;
  curr_lat DECIMAL;
  curr_lon DECIMAL;
  curr_time TIMESTAMP;
  segment_dist DECIMAL;
  segment_time DECIMAL;
  max_spd DECIMAL := 0;
  avg_spd DECIMAL := 0;
  total_time DECIMAL;
  point_count INTEGER;
BEGIN
  -- Count total points
  SELECT COUNT(*) INTO point_count
  FROM location_history lh
  JOIN tracking_sessions ts ON ts.user_id = lh.user_id
  WHERE ts.id = session_id
    AND lh.created_at >= ts.started_at
    AND (ts.ended_at IS NULL OR lh.created_at <= ts.ended_at);

  -- Calculate total distance and speeds
  FOR prev_lat, prev_lon, prev_time, curr_lat, curr_lon, curr_time IN
    SELECT 
      LAG(latitude) OVER (ORDER BY created_at),
      LAG(longitude) OVER (ORDER BY created_at),
      LAG(created_at) OVER (ORDER BY created_at),
      latitude,
      longitude,
      created_at
    FROM location_history lh
    JOIN tracking_sessions ts ON ts.user_id = lh.user_id
    WHERE ts.id = session_id
      AND lh.created_at >= ts.started_at
      AND (ts.ended_at IS NULL OR lh.created_at <= ts.ended_at)
    ORDER BY created_at
  LOOP
    IF prev_lat IS NOT NULL THEN
      -- Calculate distance for this segment
      segment_dist := calculate_distance(prev_lat, prev_lon, curr_lat, curr_lon);
      total_dist := total_dist + segment_dist;
      
      -- Calculate speed for this segment (km/h)
      segment_time := EXTRACT(EPOCH FROM (curr_time - prev_time)) / 3600.0; -- hours
      IF segment_time > 0 THEN
        DECLARE
          segment_speed DECIMAL;
        BEGIN
          segment_speed := (segment_dist / 1000.0) / segment_time; -- km/h
          IF segment_speed > max_spd THEN
            max_spd := segment_speed;
          END IF;
        END;
      END IF;
    END IF;
  END LOOP;

  -- Calculate average speed
  SELECT 
    EXTRACT(EPOCH FROM (ended_at - started_at)) / 3600.0
  INTO total_time
  FROM tracking_sessions
  WHERE id = session_id;

  IF total_time > 0 AND total_dist > 0 THEN
    avg_spd := (total_dist / 1000.0) / total_time; -- km/h
  END IF;

  -- Update tracking session
  UPDATE tracking_sessions
  SET 
    total_distance = total_dist,
    average_speed = avg_spd,
    max_speed = max_spd,
    location_count = point_count,
    updated_at = NOW()
  WHERE id = session_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_tracking_session_stats IS 'Calculate and update statistics for a tracking session';

-- ============================================
-- Triggers
-- ============================================

-- Trigger to update tracking session stats when location is added
CREATE OR REPLACE FUNCTION trigger_update_tracking_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Find active tracking session for this user
  UPDATE tracking_sessions
  SET location_count = location_count + 1,
      updated_at = NOW()
  WHERE user_id = NEW.user_id
    AND status = 'active'
    AND started_at <= NEW.created_at
    AND (ended_at IS NULL OR ended_at >= NEW.created_at);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tracking_stats_on_insert
  AFTER INSERT ON location_history
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_tracking_stats();

COMMENT ON TRIGGER update_tracking_stats_on_insert ON location_history IS 'Update tracking session stats when new location is added';

-- ============================================
-- Sample Queries
-- ============================================

-- Get user's current active tracking session
-- SELECT * FROM tracking_sessions 
-- WHERE user_id = auth.uid() AND status = 'active'
-- ORDER BY started_at DESC LIMIT 1;

-- Get all locations for a tracking session
-- SELECT * FROM location_history
-- WHERE user_id = auth.uid()
--   AND created_at >= (SELECT started_at FROM tracking_sessions WHERE id = 'session-id')
--   AND created_at <= COALESCE((SELECT ended_at FROM tracking_sessions WHERE id = 'session-id'), NOW())
-- ORDER BY created_at ASC;

-- Get tracking session with statistics
-- SELECT 
--   ts.*,
--   (SELECT COUNT(*) FROM location_history lh 
--    WHERE lh.user_id = ts.user_id 
--    AND lh.created_at BETWEEN ts.started_at AND COALESCE(ts.ended_at, NOW())) as actual_location_count
-- FROM tracking_sessions ts
-- WHERE ts.user_id = auth.uid()
-- ORDER BY ts.started_at DESC;

-- ============================================
-- Cleanup
-- ============================================

-- Function to delete old location history (data retention)
CREATE OR REPLACE FUNCTION cleanup_old_location_history(days_to_keep INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM location_history
  WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_old_location_history IS 'Delete location history older than specified days (default 30)';

-- Schedule cleanup (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-location-history', '0 2 * * *', 'SELECT cleanup_old_location_history(30)');

-- ============================================
-- Grants (if needed for service role)
-- ============================================

-- GRANT ALL ON location_history TO service_role;
-- GRANT ALL ON tracking_sessions TO service_role;

-- ============================================
-- Migration Complete
-- ============================================

-- Verify tables created
DO $$
BEGIN
  RAISE NOTICE 'Migration complete!';
  RAISE NOTICE 'Tables created: location_history, tracking_sessions';
  RAISE NOTICE 'RLS policies enabled for both tables';
  RAISE NOTICE 'Helper functions created: calculate_distance, update_tracking_session_stats, cleanup_old_location_history';
END $$;
