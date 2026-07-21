-- ============================================================
-- MCGM DIGITAL HOSPITAL — EMERGENCY OS — COMPLETE SCHEMA
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE triage_category AS ENUM ('RED','YELLOW','GREEN','BLACK','PENDING');
CREATE TYPE patient_status   AS ENUM ('EN_ROUTE','DISPATCHED','ARRIVED','TRIAGED','RESUSCITATING','IN_SURGERY','ICU','ADMITTED','DISCHARGED','DECEASED');
CREATE TYPE gender_type      AS ENUM ('Male','Female','Other','Unknown');
CREATE TYPE ambulance_status AS ENUM ('AVAILABLE','EN_ROUTE_INCIDENT','TRANSPORTING','MAINTENANCE','OFFLINE');
CREATE TYPE bay_status       AS ENUM ('AVAILABLE','OCCUPIED','CLEANING','MAINTENANCE','RESERVED');
CREATE TYPE incident_severity AS ENUM ('LOW','MEDIUM','HIGH','CRITICAL');
CREATE TYPE incident_type    AS ENUM ('ROAD_ACCIDENT','FIRE_INCIDENT','BUILDING_COLLAPSE','MEDICAL_OUTBREAK','MCI','OTHER');
CREATE TYPE incident_status  AS ENUM ('OPEN','RESOLVED','ARCHIVED');
CREATE TYPE order_status     AS ENUM ('PENDING','IN_PROGRESS','COMPLETED','CANCELLED','CRITICAL');
CREATE TYPE blood_type       AS ENUM ('A+','A-','B+','B-','AB+','AB-','O+','O-','Unknown');
CREATE TYPE notification_type AS ENUM ('ALERT','INFO','WARNING','CRITICAL','SUCCESS','VOICE','SMS','WHATSAPP','EMAIL','PUSH');
CREATE TYPE user_role        AS ENUM ('SUPER_ADMIN','HOSPITAL_ADMIN','EMERGENCY_ADMIN','DOCTOR','NURSE','RECEPTION','LAB','RADIOLOGY','BLOOD_BANK','PHARMACY','SECURITY','AMBULANCE_STAFF','CITIZEN','RELATIVE','POLICE','FIRE_BRIGADE');
CREATE TYPE shift_type       AS ENUM ('MORNING','AFTERNOON','NIGHT','EMERGENCY');
CREATE TYPE task_priority    AS ENUM ('LOW','MEDIUM','HIGH','CRITICAL');
CREATE TYPE task_status      AS ENUM ('PENDING','ACCEPTED','IN_PROGRESS','COMPLETED','DELAYED','ESCALATED');
CREATE TYPE resource_type    AS ENUM ('BED','ICU_BED','VENTILATOR','WHEELCHAIR','STRETCHER','OT_SUITE','BLOOD_UNIT','OXYGEN_CYLINDER','DEFIBRILLATOR','MONITOR','IV_PUMP','OTHER');

-- ============================================================
-- HOSPITALS & DEPARTMENTS
-- ============================================================
CREATE TABLE hospitals (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  code        TEXT UNIQUE NOT NULL,
  address     TEXT,
  district    TEXT,
  city        TEXT DEFAULT 'Mumbai',
  state       TEXT DEFAULT 'Maharashtra',
  lat         DOUBLE PRECISION,
  lng         DOUBLE PRECISION,
  phone       TEXT,
  email       TEXT,
  beds_total  INTEGER DEFAULT 0,
  icu_total   INTEGER DEFAULT 0,
  ot_total    INTEGER DEFAULT 0,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE departments (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id  UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  code         TEXT NOT NULL,
  floor        TEXT,
  phone        TEXT,
  head_doctor  TEXT,
  is_active    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- USERS & ROLES
-- ============================================================
CREATE TABLE staff_profiles (
  id             UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  hospital_id    UUID REFERENCES hospitals(id),
  department_id  UUID REFERENCES departments(id),
  role           user_role NOT NULL DEFAULT 'NURSE',
  employee_id    TEXT UNIQUE,
  name           TEXT NOT NULL,
  phone          TEXT,
  email          TEXT,
  photo_url      TEXT,
  specialization TEXT,
  license_no     TEXT,
  is_active      BOOLEAN DEFAULT TRUE,
  fcm_token      TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE shifts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id UUID REFERENCES hospitals(id),
  staff_id    UUID REFERENCES staff_profiles(id),
  shift_type  shift_type NOT NULL,
  date        DATE NOT NULL,
  start_time  TIMESTAMPTZ NOT NULL,
  end_time    TIMESTAMPTZ,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PATIENTS
-- ============================================================
CREATE TABLE patients (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  uhid            TEXT UNIQUE,   -- Permanent UHID after registration
  temp_uhid       TEXT UNIQUE,   -- Temporary ID for emergency intake
  abha_id         TEXT UNIQUE,
  name            TEXT NOT NULL,
  name_as_per_id  TEXT,
  age             INTEGER,
  date_of_birth   DATE,
  gender          gender_type DEFAULT 'Unknown',
  blood_group     blood_type DEFAULT 'Unknown',
  phone           TEXT,
  phone_alt       TEXT,
  address         TEXT,
  district        TEXT,
  state           TEXT,
  aadhaar_no      TEXT,
  photo_url       TEXT,
  is_identified   BOOLEAN DEFAULT FALSE,
  is_emergency    BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  created_by      UUID REFERENCES staff_profiles(id)
);

CREATE TABLE patient_allergies (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id  UUID REFERENCES patients(id) ON DELETE CASCADE,
  allergen    TEXT NOT NULL,
  reaction    TEXT,
  severity    TEXT,
  noted_by    UUID REFERENCES staff_profiles(id),
  noted_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE patient_history (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id   UUID REFERENCES patients(id) ON DELETE CASCADE,
  condition    TEXT NOT NULL,
  diagnosed_at DATE,
  status       TEXT DEFAULT 'ACTIVE',
  notes        TEXT,
  noted_by     UUID REFERENCES staff_profiles(id),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE patient_family_contacts (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id   UUID REFERENCES patients(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  relation     TEXT NOT NULL,
  phone        TEXT NOT NULL,
  is_primary   BOOLEAN DEFAULT FALSE,
  notified_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EMERGENCY INTAKE
-- ============================================================
CREATE TABLE emergency_registrations (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id         UUID REFERENCES patients(id),
  hospital_id        UUID REFERENCES hospitals(id),
  registration_no    TEXT UNIQUE NOT NULL,
  arrival_mode       TEXT DEFAULT 'WALK_IN',  -- WALK_IN, AMBULANCE, POLICE, REFERRAL
  arrival_time       TIMESTAMPTZ DEFAULT NOW(),
  chief_complaint    TEXT,
  injury_mechanism   TEXT,
  incident_id        UUID,
  ambulance_id       UUID,
  referred_from      TEXT,
  police_case        BOOLEAN DEFAULT FALSE,
  police_fir_no      TEXT,
  mlc_no             TEXT,   -- Medico-Legal Case
  status             patient_status DEFAULT 'ARRIVED',
  discharged_at      TIMESTAMPTZ,
  discharge_summary  TEXT,
  created_by         UUID REFERENCES staff_profiles(id),
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TRIAGE
-- ============================================================
CREATE TABLE triage_assessments (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_id   UUID REFERENCES emergency_registrations(id),
  patient_id        UUID REFERENCES patients(id),
  category          triage_category DEFAULT 'PENDING',
  assessed_by       UUID REFERENCES staff_profiles(id),
  assessed_at       TIMESTAMPTZ DEFAULT NOW(),
  gcs_eye           INTEGER CHECK (gcs_eye BETWEEN 1 AND 4),
  gcs_verbal        INTEGER CHECK (gcs_verbal BETWEEN 1 AND 5),
  gcs_motor         INTEGER CHECK (gcs_motor BETWEEN 1 AND 6),
  gcs_total         INTEGER GENERATED ALWAYS AS (COALESCE(gcs_eye,0) + COALESCE(gcs_verbal,0) + COALESCE(gcs_motor,0)) STORED,
  rts_score         DOUBLE PRECISION,
  ai_risk_score     DOUBLE PRECISION,
  ai_suggested_cat  triage_category,
  ai_reasoning      TEXT,
  confirmed_by_doc  UUID REFERENCES staff_profiles(id),
  confirmed_at      TIMESTAMPTZ,
  notes             TEXT,
  is_mass_casualty  BOOLEAN DEFAULT FALSE
);

CREATE TABLE patient_vitals (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id      UUID REFERENCES patients(id),
  registration_id UUID REFERENCES emergency_registrations(id),
  recorded_by     UUID REFERENCES staff_profiles(id),
  recorded_at     TIMESTAMPTZ DEFAULT NOW(),
  heart_rate      INTEGER,
  systolic_bp     INTEGER,
  diastolic_bp    INTEGER,
  respiratory_rate INTEGER,
  spo2            DOUBLE PRECISION,
  temperature     DOUBLE PRECISION,
  blood_glucose   DOUBLE PRECISION,
  pain_score      INTEGER CHECK (pain_score BETWEEN 0 AND 10),
  weight_kg       DOUBLE PRECISION,
  height_cm       DOUBLE PRECISION,
  is_critical     BOOLEAN DEFAULT FALSE,
  notes           TEXT
);

-- ============================================================
-- GOLDEN HOUR TRACKING
-- ============================================================
CREATE TABLE golden_hour_tracking (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_id     UUID REFERENCES emergency_registrations(id) UNIQUE,
  patient_id          UUID REFERENCES patients(id),
  door_time           TIMESTAMPTZ,  -- Patient arrived
  doctor_time         TIMESTAMPTZ,  -- First seen by doctor
  ct_ordered_time     TIMESTAMPTZ,
  ct_completed_time   TIMESTAMPTZ,
  needle_time         TIMESTAMPTZ,  -- First IV/medication
  blood_time          TIMESTAMPTZ,  -- First blood product
  ot_decision_time    TIMESTAMPTZ,
  ot_incision_time    TIMESTAMPTZ,
  icu_decision_time   TIMESTAMPTZ,
  icu_admission_time  TIMESTAMPTZ,
  door_to_doctor_min  DOUBLE PRECISION GENERATED ALWAYS AS (EXTRACT(EPOCH FROM (doctor_time - door_time))/60) STORED,
  door_to_ct_min      DOUBLE PRECISION GENERATED ALWAYS AS (EXTRACT(EPOCH FROM (ct_completed_time - door_time))/60) STORED,
  door_to_needle_min  DOUBLE PRECISION GENERATED ALWAYS AS (EXTRACT(EPOCH FROM (needle_time - door_time))/60) STORED
);

-- ============================================================
-- TRAUMA BAYS
-- ============================================================
CREATE TABLE trauma_bays (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id  UUID REFERENCES hospitals(id),
  bay_number   INTEGER NOT NULL,
  status       bay_status DEFAULT 'AVAILABLE',
  has_ventilator BOOLEAN DEFAULT FALSE,
  has_monitor    BOOLEAN DEFAULT FALSE,
  has_defib      BOOLEAN DEFAULT FALSE,
  notes          TEXT,
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(hospital_id, bay_number)
);

CREATE TABLE bay_assignments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bay_id          UUID REFERENCES trauma_bays(id),
  registration_id UUID REFERENCES emergency_registrations(id),
  patient_id      UUID REFERENCES patients(id),
  assigned_doctor UUID REFERENCES staff_profiles(id),
  assigned_nurse  UUID REFERENCES staff_profiles(id),
  assigned_at     TIMESTAMPTZ DEFAULT NOW(),
  released_at     TIMESTAMPTZ,
  is_active       BOOLEAN DEFAULT TRUE
);

-- ============================================================
-- CLINICAL ORDERS
-- ============================================================
CREATE TABLE clinical_orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_id UUID REFERENCES emergency_registrations(id),
  patient_id      UUID REFERENCES patients(id),
  order_type      TEXT NOT NULL,  -- LAB, RADIOLOGY, MEDICATION, PROCEDURE, CONSULT
  description     TEXT NOT NULL,
  priority        task_priority DEFAULT 'HIGH',
  status          order_status DEFAULT 'PENDING',
  ordered_by      UUID REFERENCES staff_profiles(id),
  ordered_at      TIMESTAMPTZ DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  result          TEXT,
  notes           TEXT,
  is_voice_order  BOOLEAN DEFAULT FALSE
);

CREATE TABLE lab_orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        UUID REFERENCES clinical_orders(id),
  patient_id      UUID REFERENCES patients(id),
  registration_id UUID REFERENCES emergency_registrations(id),
  test_name       TEXT NOT NULL,
  specimen_type   TEXT,
  barcode         TEXT UNIQUE,
  loinc_code      TEXT,
  priority        task_priority DEFAULT 'HIGH',
  status          order_status DEFAULT 'PENDING',
  result_value    TEXT,
  result_unit     TEXT,
  reference_range TEXT,
  is_critical     BOOLEAN DEFAULT FALSE,
  collected_at    TIMESTAMPTZ,
  resulted_at     TIMESTAMPTZ,
  released_by     UUID REFERENCES staff_profiles(id),
  released_at     TIMESTAMPTZ
);

CREATE TABLE radiology_orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        UUID REFERENCES clinical_orders(id),
  patient_id      UUID REFERENCES patients(id),
  registration_id UUID REFERENCES emergency_registrations(id),
  modality        TEXT NOT NULL,  -- CT, MRI, X-RAY, USG
  body_part       TEXT NOT NULL,
  study_name      TEXT NOT NULL,
  priority        task_priority DEFAULT 'HIGH',
  status          order_status DEFAULT 'PENDING',
  ai_finding      TEXT,
  ai_confidence   DOUBLE PRECISION,
  radiologist_report TEXT,
  pacs_url        TEXT,
  acquired_at     TIMESTAMPTZ,
  reported_at     TIMESTAMPTZ,
  reported_by     UUID REFERENCES staff_profiles(id)
);

CREATE TABLE blood_requests (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id      UUID REFERENCES patients(id),
  registration_id UUID REFERENCES emergency_registrations(id),
  blood_group     blood_type NOT NULL,
  units_requested INTEGER NOT NULL,
  units_issued    INTEGER DEFAULT 0,
  reason          TEXT,
  urgency         task_priority DEFAULT 'HIGH',
  status          order_status DEFAULT 'PENDING',
  requested_by    UUID REFERENCES staff_profiles(id),
  requested_at    TIMESTAMPTZ DEFAULT NOW(),
  issued_at       TIMESTAMPTZ,
  cross_match_done BOOLEAN DEFAULT FALSE
);

CREATE TABLE medications (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  generic_name TEXT,
  category     TEXT,
  unit         TEXT DEFAULT 'mg',
  route        TEXT[],  -- IV, ORAL, IM, SC, TOPICAL
  formulary    BOOLEAN DEFAULT TRUE
);

CREATE TABLE prescriptions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id      UUID REFERENCES patients(id),
  registration_id UUID REFERENCES emergency_registrations(id),
  medication_id   UUID REFERENCES medications(id),
  medication_name TEXT,
  dose            TEXT,
  route           TEXT,
  frequency       TEXT,
  duration        TEXT,
  prescribed_by   UUID REFERENCES staff_profiles(id),
  prescribed_at   TIMESTAMPTZ DEFAULT NOW(),
  is_active       BOOLEAN DEFAULT TRUE
);

CREATE TABLE medication_administration (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prescription_id UUID REFERENCES prescriptions(id),
  patient_id     UUID REFERENCES patients(id),
  administered_by UUID REFERENCES staff_profiles(id),
  administered_at TIMESTAMPTZ DEFAULT NOW(),
  dose_given     TEXT,
  site           TEXT,
  notes          TEXT
);

-- ============================================================
-- AMBULANCES & FLEET
-- ============================================================
CREATE TABLE ambulances (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id  UUID REFERENCES hospitals(id),
  vehicle_no   TEXT UNIQUE NOT NULL,
  call_sign    TEXT UNIQUE NOT NULL,
  type         TEXT DEFAULT 'ALS',  -- ALS, BLS, NICU
  status       ambulance_status DEFAULT 'AVAILABLE',
  fuel_pct     INTEGER DEFAULT 100,
  has_ventilator BOOLEAN DEFAULT FALSE,
  has_aed      BOOLEAN DEFAULT FALSE,
  oxygen_pct   INTEGER DEFAULT 100,
  has_ecg      BOOLEAN DEFAULT FALSE,
  driver_id    UUID REFERENCES staff_profiles(id),
  paramedic_id UUID REFERENCES staff_profiles(id),
  lat          DOUBLE PRECISION,
  lng          DOUBLE PRECISION,
  last_gps_at  TIMESTAMPTZ,
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ambulance_gps_log (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ambulance_id UUID REFERENCES ambulances(id),
  lat          DOUBLE PRECISION NOT NULL,
  lng          DOUBLE PRECISION NOT NULL,
  speed_kmh    DOUBLE PRECISION,
  heading      DOUBLE PRECISION,
  logged_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ambulance_missions (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ambulance_id     UUID REFERENCES ambulances(id),
  registration_id  UUID REFERENCES emergency_registrations(id),
  patient_id       UUID REFERENCES patients(id),
  incident_id      UUID,
  pickup_location  TEXT,
  pickup_lat       DOUBLE PRECISION,
  pickup_lng       DOUBLE PRECISION,
  destination_id   UUID REFERENCES hospitals(id),
  eta_minutes      INTEGER,
  dispatched_at    TIMESTAMPTZ DEFAULT NOW(),
  arrived_scene_at TIMESTAMPTZ,
  departed_scene_at TIMESTAMPTZ,
  arrived_hospital_at TIMESTAMPTZ,
  is_active        BOOLEAN DEFAULT TRUE
);

-- ============================================================
-- INCIDENTS
-- ============================================================
CREATE TABLE incidents (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id     UUID REFERENCES hospitals(id),
  incident_no     TEXT UNIQUE NOT NULL,
  title           TEXT NOT NULL,
  location        TEXT NOT NULL,
  lat             DOUBLE PRECISION,
  lng             DOUBLE PRECISION,
  severity        incident_severity DEFAULT 'HIGH',
  type            incident_type DEFAULT 'ROAD_ACCIDENT',
  status          incident_status DEFAULT 'OPEN',
  victims_count   INTEGER DEFAULT 1,
  critical_count  INTEGER DEFAULT 0,
  reported_at     TIMESTAMPTZ DEFAULT NOW(),
  resolved_at     TIMESTAMPTZ,
  reported_by     TEXT,
  notes           TEXT,
  is_mci          BOOLEAN DEFAULT FALSE  -- Mass Casualty Incident
);

-- ============================================================
-- RESOURCES
-- ============================================================
CREATE TABLE resources (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id  UUID REFERENCES hospitals(id),
  name         TEXT NOT NULL,
  type         resource_type NOT NULL,
  total        INTEGER DEFAULT 1,
  available    INTEGER DEFAULT 1,
  in_use       INTEGER DEFAULT 0,
  maintenance  INTEGER DEFAULT 0,
  unit         TEXT DEFAULT 'units',
  location     TEXT,
  last_checked TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE resource_usage (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id  UUID REFERENCES resources(id),
  patient_id   UUID REFERENCES patients(id),
  registration_id UUID REFERENCES emergency_registrations(id),
  assigned_at  TIMESTAMPTZ DEFAULT NOW(),
  released_at  TIMESTAMPTZ,
  assigned_by  UUID REFERENCES staff_profiles(id)
);

-- ============================================================
-- COMMUNICATION
-- ============================================================
CREATE TABLE messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id UUID REFERENCES hospitals(id),
  from_id     UUID REFERENCES staff_profiles(id),
  to_id       UUID REFERENCES staff_profiles(id),
  department  TEXT,
  body        TEXT NOT NULL,
  is_voice    BOOLEAN DEFAULT FALSE,
  audio_url   TEXT,
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE broadcasts (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id   UUID REFERENCES hospitals(id),
  title         TEXT NOT NULL,
  body          TEXT NOT NULL,
  priority      task_priority DEFAULT 'HIGH',
  target_roles  user_role[],
  sent_by       UUID REFERENCES staff_profiles(id),
  expires_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notifications (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID REFERENCES staff_profiles(id),
  hospital_id  UUID REFERENCES hospitals(id),
  type         notification_type DEFAULT 'INFO',
  title        TEXT NOT NULL,
  body         TEXT NOT NULL,
  action_url   TEXT,
  entity_type  TEXT,
  entity_id    UUID,
  is_read      BOOLEAN DEFAULT FALSE,
  read_at      TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TASKS
-- ============================================================
CREATE TABLE tasks (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id     UUID REFERENCES hospitals(id),
  title           TEXT NOT NULL,
  description     TEXT,
  priority        task_priority DEFAULT 'MEDIUM',
  status          task_status DEFAULT 'PENDING',
  assigned_to     UUID REFERENCES staff_profiles(id),
  assigned_by     UUID REFERENCES staff_profiles(id),
  patient_id      UUID REFERENCES patients(id),
  registration_id UUID REFERENCES emergency_registrations(id),
  due_at          TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  escalated_at    TIMESTAMPTZ,
  escalated_to    UUID REFERENCES staff_profiles(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AI & VOICE
-- ============================================================
CREATE TABLE ai_predictions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id      UUID REFERENCES patients(id),
  registration_id UUID REFERENCES emergency_registrations(id),
  model           TEXT NOT NULL,
  prediction_type TEXT NOT NULL,
  input_data      JSONB,
  output          JSONB,
  risk_score      DOUBLE PRECISION,
  confidence      DOUBLE PRECISION,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE copilot_sessions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id    UUID REFERENCES staff_profiles(id),
  hospital_id UUID REFERENCES hospitals(id),
  messages    JSONB DEFAULT '[]',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE voice_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id    UUID REFERENCES staff_profiles(id),
  hospital_id UUID REFERENCES hospitals(id),
  transcript  TEXT NOT NULL,
  intent      TEXT,
  action      TEXT,
  confidence  DOUBLE PRECISION,
  executed    BOOLEAN DEFAULT FALSE,
  error       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AUDIT LOG
-- ============================================================
CREATE TABLE audit_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id UUID REFERENCES hospitals(id),
  actor_id    UUID REFERENCES staff_profiles(id),
  action      TEXT NOT NULL,
  entity_type TEXT,
  entity_id   UUID,
  old_data    JSONB,
  new_data    JSONB,
  ip_address  INET,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PATIENT TIMELINE (unified activity feed)
-- ============================================================
CREATE TABLE patient_timeline (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id      UUID REFERENCES patients(id),
  registration_id UUID REFERENCES emergency_registrations(id),
  event_type      TEXT NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  actor_id        UUID REFERENCES staff_profiles(id),
  actor_name      TEXT,
  entity_type     TEXT,
  entity_id       UUID,
  metadata        JSONB,
  occurred_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_patients_abha    ON patients(abha_id);
CREATE INDEX idx_patients_temp_uhid ON patients(temp_uhid);
CREATE INDEX idx_patients_phone   ON patients(phone);
CREATE INDEX idx_er_reg_status    ON emergency_registrations(status);
CREATE INDEX idx_er_reg_hospital  ON emergency_registrations(hospital_id);
CREATE INDEX idx_vitals_patient   ON patient_vitals(patient_id, recorded_at DESC);
CREATE INDEX idx_triage_category  ON triage_assessments(category);
CREATE INDEX idx_bay_active       ON bay_assignments(is_active, bay_id);
CREATE INDEX idx_amb_status       ON ambulances(status);
CREATE INDEX idx_timeline_patient ON patient_timeline(patient_id, occurred_at DESC);
CREATE INDEX idx_notif_user       ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_audit_actor      ON audit_log(actor_id, created_at DESC);
CREATE INDEX idx_audit_entity     ON audit_log(entity_type, entity_id);
CREATE INDEX idx_resources_type   ON resources(hospital_id, type);
CREATE INDEX idx_tasks_assigned   ON tasks(assigned_to, status);

-- ============================================================
-- REALTIME PUBLICATIONS
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE emergency_registrations;
ALTER PUBLICATION supabase_realtime ADD TABLE patient_vitals;
ALTER PUBLICATION supabase_realtime ADD TABLE triage_assessments;
ALTER PUBLICATION supabase_realtime ADD TABLE trauma_bays;
ALTER PUBLICATION supabase_realtime ADD TABLE bay_assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE ambulances;
ALTER PUBLICATION supabase_realtime ADD TABLE incidents;
ALTER PUBLICATION supabase_realtime ADD TABLE resources;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE broadcasts;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Auto-generate registration numbers
CREATE OR REPLACE FUNCTION generate_registration_no()
RETURNS TEXT AS $$
BEGIN
  RETURN 'ER-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('er_reg_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE er_reg_seq START 800001;

-- Auto-generate temp UHID
CREATE OR REPLACE FUNCTION generate_temp_uhid()
RETURNS TEXT AS $$
BEGIN
  RETURN 'TEMP-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('temp_uhid_seq')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE temp_uhid_seq START 1;

-- Trigger: write patient timeline on registration insert
CREATE OR REPLACE FUNCTION fn_timeline_on_registration()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO patient_timeline(patient_id, registration_id, event_type, title, description, occurred_at)
  VALUES (NEW.patient_id, NEW.id, 'REGISTRATION', 'Emergency Registration', 'Patient registered via ' || NEW.arrival_mode, NEW.arrival_time);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_timeline_registration
  AFTER INSERT ON emergency_registrations
  FOR EACH ROW EXECUTE FUNCTION fn_timeline_on_registration();

-- Trigger: write timeline on vitals
CREATE OR REPLACE FUNCTION fn_timeline_on_vitals()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_critical THEN
    INSERT INTO patient_timeline(patient_id, registration_id, event_type, title, description, occurred_at)
    VALUES (NEW.patient_id, NEW.registration_id, 'CRITICAL_VITALS', 'CRITICAL Vitals Recorded',
      'HR:' || NEW.heart_rate || ' SpO2:' || NEW.spo2 || '% BP:' || NEW.systolic_bp || '/' || NEW.diastolic_bp,
      NEW.recorded_at);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_timeline_vitals
  AFTER INSERT ON patient_vitals
  FOR EACH ROW EXECUTE FUNCTION fn_timeline_on_vitals();

-- Trigger: auto-generate registration_no
CREATE OR REPLACE FUNCTION fn_auto_registration_no()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.registration_no IS NULL OR NEW.registration_no = '' THEN
    NEW.registration_no := generate_registration_no();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_reg_no
  BEFORE INSERT ON emergency_registrations
  FOR EACH ROW EXECUTE FUNCTION fn_auto_registration_no();

-- ============================================================
-- STAFF ATTENDANCE & ROSTER SYSTEM ADDITIONS
-- ============================================================

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

-- Realtime Publications
ALTER PUBLICATION supabase_realtime ADD TABLE attendance_events;
ALTER PUBLICATION supabase_realtime ADD TABLE attendance_exceptions;
ALTER PUBLICATION supabase_realtime ADD TABLE shift_swaps;
ALTER PUBLICATION supabase_realtime ADD TABLE leave_requests;

-- ============================================================
-- CENTRAL STAFF DISPATCH, ALERTS & PROOF OF ARRIVAL SCHEMAS
-- ============================================================

-- 1. Staff Dispatch Assignments Table
CREATE TABLE IF NOT EXISTS staff_assignments (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  priority                  TEXT NOT NULL CHECK (priority IN ('NORMAL', 'HIGH', 'URGENT', 'EMERGENCY')) DEFAULT 'NORMAL',
  task_type                 TEXT NOT NULL CHECK (task_type IN (
                              'REPORT_TO_LOCATION', 'PATIENT_ASSISTANCE', 'WARD_ASSIGNMENT', 'EMERGENCY_RESPONSE',
                              'PATIENT_TRANSPORT', 'SAMPLE_COLLECTION', 'MEDICATION_DELIVERY', 'EQUIPMENT_REQUEST',
                              'CODE_RESPONSE', 'OT_ASSISTANCE', 'ICU_ASSISTANCE', 'SECURITY_ASSISTANCE',
                              'HOUSEKEEPING', 'TECHNICAL_SUPPORT', 'OTHER'
                            )),
  title                     TEXT NOT NULL,
  instructions              TEXT,
  destination_building      TEXT,
  destination_floor         TEXT,
  destination_ward          TEXT,
  destination_room          TEXT,
  destination_bed           TEXT,
  patient_ref               TEXT, -- initials / bed reference (strictly privacy compliant)
  required_arrival_time     TIMESTAMPTZ,
  ack_required              BOOLEAN DEFAULT TRUE,
  loc_verification_required BOOLEAN DEFAULT TRUE,
  photo_proof_required      BOOLEAN DEFAULT FALSE,
  completion_required       BOOLEAN DEFAULT TRUE,
  status                    TEXT NOT NULL CHECK (status IN (
                              'CREATED', 'SENT', 'DELIVERED', 'ACKNOWLEDGED', 'ACCEPTED', 'EN_ROUTE',
                              'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'DECLINED', 'CANCELLED', 'EXPIRED', 'ESCALATED'
                            )) DEFAULT 'CREATED',
  assigned_staff_id         UUID REFERENCES staff_profiles(id) ON DELETE CASCADE,
  created_by                UUID REFERENCES staff_profiles(id),
  created_at                TIMESTAMPTZ DEFAULT NOW(),
  declined_reason           TEXT,
  escalated_at              TIMESTAMPTZ,
  escalation_action_taken   TEXT,
  acknowledged_at           TIMESTAMPTZ,
  accepted_at               TIMESTAMPTZ,
  arrived_at                TIMESTAMPTZ,
  completed_at              TIMESTAMPTZ,
  cancelled_at              TIMESTAMPTZ,
  cancelled_by              UUID REFERENCES staff_profiles(id)
);

-- 2. Arrival Verifications Table
CREATE TABLE IF NOT EXISTS arrival_verifications (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id         UUID REFERENCES staff_assignments(id) ON DELETE CASCADE,
  staff_id              UUID REFERENCES staff_profiles(id) ON DELETE CASCADE,
  verification_method   TEXT NOT NULL CHECK (verification_method IN ('GPS', 'QR', 'NFC', 'PHOTO', 'SUPERVISOR')),
  verified_at           TIMESTAMPTZ DEFAULT NOW(),
  lat                   DOUBLE PRECISION,
  lng                   DOUBLE PRECISION,
  qr_code_scanned       TEXT,
  photo_url             TEXT,
  supervisor_id         UUID REFERENCES staff_profiles(id),
  supervisor_reason     TEXT,
  verification_status   TEXT NOT NULL CHECK (verification_status IN ('PENDING_REVIEW', 'VERIFIED', 'REJECTED')) DEFAULT 'VERIFIED',
  rejected_reason       TEXT,
  reviewed_by           UUID REFERENCES staff_profiles(id),
  reviewed_at           TIMESTAMPTZ
);

-- 3. Operational Availability Table
CREATE TABLE IF NOT EXISTS operational_availabilities (
  staff_id              UUID PRIMARY KEY REFERENCES staff_profiles(id) ON DELETE CASCADE,
  availability_state    TEXT NOT NULL CHECK (availability_state IN (
                          'AVAILABLE', 'BUSY', 'RESPONDING', 'AT_LOCATION', 'ON_BREAK', 'ON_CALL', 'UNAVAILABLE', 'ENDING_SHIFT_SOON'
                        )) DEFAULT 'AVAILABLE',
  last_updated          TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Emergency Broadcasts
CREATE TABLE IF NOT EXISTS emergency_broadcasts (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title                 TEXT NOT NULL,
  message               TEXT NOT NULL,
  priority              TEXT NOT NULL CHECK (priority IN ('URGENT', 'EMERGENCY')) DEFAULT 'EMERGENCY',
  created_by            UUID REFERENCES staff_profiles(id),
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Emergency Broadcast Recipients/Responses
CREATE TABLE IF NOT EXISTS emergency_broadcast_recipients (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  broadcast_id          UUID REFERENCES emergency_broadcasts(id) ON DELETE CASCADE,
  staff_id              UUID REFERENCES staff_profiles(id) ON DELETE CASCADE,
  response_status       TEXT NOT NULL CHECK (response_status IN (
                          'PENDING', 'RESPONDING', 'UNAVAILABLE', 'ALREADY_ASSIGNED'
                        )) DEFAULT 'PENDING',
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_staff_assignments_staff ON staff_assignments(assigned_staff_id, status);
CREATE INDEX IF NOT EXISTS idx_staff_assignments_priority ON staff_assignments(priority);
CREATE INDEX IF NOT EXISTS idx_arrival_verifications_assignment ON arrival_verifications(assignment_id);
CREATE INDEX IF NOT EXISTS idx_emergency_broadcast_recipients_staff ON emergency_broadcast_recipients(staff_id);

-- Realtime Publications
ALTER PUBLICATION supabase_realtime ADD TABLE staff_assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE arrival_verifications;
ALTER PUBLICATION supabase_realtime ADD TABLE operational_availabilities;
ALTER PUBLICATION supabase_realtime ADD TABLE emergency_broadcasts;
ALTER PUBLICATION supabase_realtime ADD TABLE emergency_broadcast_recipients;


