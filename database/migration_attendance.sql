-- Migration: Add Staff Attendance & Roster System

-- Enable PostGIS extension (should already be enabled, but to be sure)
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. Campus Config / Work Locations Table
CREATE TABLE IF NOT EXISTS work_locations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id     UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  lat             DOUBLE PRECISION NOT NULL,
  lng             DOUBLE PRECISION NOT NULL,
  radius_meters   DOUBLE PRECISION DEFAULT 150.0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Attendance Exceptions Table
CREATE TABLE IF NOT EXISTS attendance_exceptions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id        UUID REFERENCES staff_profiles(id) ON DELETE CASCADE,
  event_type      TEXT NOT NULL CHECK (event_type IN ('CLOCK_IN', 'CLOCK_OUT')),
  timestamp       TIMESTAMPTZ NOT NULL,
  lat             DOUBLE PRECISION NOT NULL,
  lng             DOUBLE PRECISION NOT NULL,
  reason          TEXT NOT NULL,
  status          TEXT NOT NULL CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')) DEFAULT 'PENDING',
  reviewed_by     UUID REFERENCES staff_profiles(id),
  reviewed_at     TIMESTAMPTZ,
  comments        TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Attendance Events Table
CREATE TABLE IF NOT EXISTS attendance_events (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id            UUID REFERENCES staff_profiles(id) ON DELETE CASCADE,
  shift_id            UUID REFERENCES shifts(id) ON DELETE SET NULL,
  event_type          TEXT NOT NULL CHECK (event_type IN ('CLOCK_IN', 'CLOCK_OUT')),
  timestamp           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  lat                 DOUBLE PRECISION NOT NULL,
  lng                 DOUBLE PRECISION NOT NULL,
  verified            BOOLEAN DEFAULT FALSE,
  verification_method TEXT NOT NULL CHECK (verification_method IN ('GEOFENCE', 'EXCEPTION', 'BYPASS')),
  exception_id        UUID REFERENCES attendance_exceptions(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Shift Swaps Table
CREATE TABLE IF NOT EXISTS shift_swaps (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requesting_staff_id UUID REFERENCES staff_profiles(id) ON DELETE CASCADE,
  target_staff_id     UUID REFERENCES staff_profiles(id) ON DELETE CASCADE,
  requesting_shift_id UUID REFERENCES shifts(id) ON DELETE CASCADE,
  target_shift_id     UUID REFERENCES shifts(id) ON DELETE CASCADE,
  status              TEXT NOT NULL CHECK (status IN ('PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'CANCELLED')) DEFAULT 'PENDING_APPROVAL',
  reviewed_by         UUID REFERENCES staff_profiles(id),
  reviewed_at         TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Leave Requests Table
CREATE TABLE IF NOT EXISTS leave_requests (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id        UUID REFERENCES staff_profiles(id) ON DELETE CASCADE,
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  leave_type      TEXT NOT NULL CHECK (leave_type IN ('CASUAL', 'SICK', 'EARNED', 'MATERNITY', 'PATERNITY', 'UNPAID')),
  reason          TEXT NOT NULL,
  status          TEXT NOT NULL CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')) DEFAULT 'PENDING',
  reviewed_by     UUID REFERENCES staff_profiles(id),
  reviewed_at     TIMESTAMPTZ,
  comments        TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_attendance_events_staff ON attendance_events(staff_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_exceptions_staff ON attendance_exceptions(staff_id, status);
CREATE INDEX IF NOT EXISTS idx_shift_swaps_requester ON shift_swaps(requesting_staff_id);
CREATE INDEX IF NOT EXISTS idx_shift_swaps_target ON shift_swaps(target_staff_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_staff ON leave_requests(staff_id, start_date);

-- Realtime Publications for Live Roster / Workforce Monitoring (Note: If pub exists, we alter it)
-- Note: Wrap publication alter in a block or handle it separately if running in database.
-- For local SQLite or dev database schema updates, this is standard postgres syntax.
ALTER PUBLICATION supabase_realtime ADD TABLE attendance_events;
ALTER PUBLICATION supabase_realtime ADD TABLE attendance_exceptions;
ALTER PUBLICATION supabase_realtime ADD TABLE shift_swaps;
ALTER PUBLICATION supabase_realtime ADD TABLE leave_requests;
