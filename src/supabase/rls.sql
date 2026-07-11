-- ============================================================
-- MCGM EMERGENCY OS — ROW LEVEL SECURITY POLICIES
-- ============================================================

ALTER TABLE hospitals              ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments            ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients               ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_vitals         ENABLE ROW LEVEL SECURITY;
ALTER TABLE triage_assessments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE trauma_bays            ENABLE ROW LEVEL SECURITY;
ALTER TABLE bay_assignments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_orders        ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_orders             ENABLE ROW LEVEL SECURITY;
ALTER TABLE radiology_orders       ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_requests         ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambulances             ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents              ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources              ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages               ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications          ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log              ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_timeline       ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcasts             ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_logs             ENABLE ROW LEVEL SECURITY;
ALTER TABLE copilot_sessions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_predictions         ENABLE ROW LEVEL SECURITY;

-- Helper to get current user's role
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS user_role AS $$
  SELECT role FROM staff_profiles WHERE id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper to get current user's hospital
CREATE OR REPLACE FUNCTION current_user_hospital()
RETURNS UUID AS $$
  SELECT hospital_id FROM staff_profiles WHERE id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ---- HOSPITALS ----
CREATE POLICY "Staff read own hospital" ON hospitals
  FOR SELECT USING (id = current_user_hospital());

-- ---- STAFF PROFILES ----
CREATE POLICY "Staff read own hospital staff" ON staff_profiles
  FOR SELECT USING (hospital_id = current_user_hospital());

CREATE POLICY "Staff update own profile" ON staff_profiles
  FOR UPDATE USING (id = auth.uid());

-- ---- PATIENTS ----
-- All clinical staff can read patients in their hospital via registrations
CREATE POLICY "Clinical staff read patients" ON patients
  FOR SELECT USING (
    current_user_role() IN ('DOCTOR','NURSE','RECEPTION','EMERGENCY_ADMIN','HOSPITAL_ADMIN','SUPER_ADMIN','LAB','RADIOLOGY','BLOOD_BANK','PHARMACY')
  );

CREATE POLICY "Clinical staff create patients" ON patients
  FOR INSERT WITH CHECK (
    current_user_role() IN ('DOCTOR','NURSE','RECEPTION','EMERGENCY_ADMIN','HOSPITAL_ADMIN','SUPER_ADMIN')
  );

CREATE POLICY "Clinical staff update patients" ON patients
  FOR UPDATE USING (
    current_user_role() IN ('DOCTOR','NURSE','RECEPTION','EMERGENCY_ADMIN','HOSPITAL_ADMIN','SUPER_ADMIN')
  );

-- ---- EMERGENCY REGISTRATIONS ----
CREATE POLICY "Staff read hospital registrations" ON emergency_registrations
  FOR SELECT USING (hospital_id = current_user_hospital());

CREATE POLICY "Clinical staff create registrations" ON emergency_registrations
  FOR INSERT WITH CHECK (
    hospital_id = current_user_hospital() AND
    current_user_role() IN ('DOCTOR','NURSE','RECEPTION','EMERGENCY_ADMIN','HOSPITAL_ADMIN','SUPER_ADMIN')
  );

CREATE POLICY "Clinical staff update registrations" ON emergency_registrations
  FOR UPDATE USING (
    hospital_id = current_user_hospital() AND
    current_user_role() IN ('DOCTOR','NURSE','RECEPTION','EMERGENCY_ADMIN','HOSPITAL_ADMIN','SUPER_ADMIN')
  );

-- ---- VITALS ----
CREATE POLICY "Clinical read vitals" ON patient_vitals
  FOR SELECT USING (current_user_role() IN ('DOCTOR','NURSE','EMERGENCY_ADMIN','HOSPITAL_ADMIN','SUPER_ADMIN'));

CREATE POLICY "Nurse doctor create vitals" ON patient_vitals
  FOR INSERT WITH CHECK (current_user_role() IN ('DOCTOR','NURSE','EMERGENCY_ADMIN'));

-- ---- TRIAGE ----
CREATE POLICY "Clinical read triage" ON triage_assessments
  FOR SELECT USING (current_user_role() IN ('DOCTOR','NURSE','EMERGENCY_ADMIN','HOSPITAL_ADMIN','SUPER_ADMIN'));

CREATE POLICY "Doctor nurse create triage" ON triage_assessments
  FOR INSERT WITH CHECK (current_user_role() IN ('DOCTOR','NURSE','EMERGENCY_ADMIN'));

CREATE POLICY "Doctor confirm triage" ON triage_assessments
  FOR UPDATE USING (current_user_role() IN ('DOCTOR','EMERGENCY_ADMIN'));

-- ---- TRAUMA BAYS ----
CREATE POLICY "Staff read bays" ON trauma_bays
  FOR SELECT USING (hospital_id = current_user_hospital());

CREATE POLICY "Admin update bays" ON trauma_bays
  FOR UPDATE USING (
    hospital_id = current_user_hospital() AND
    current_user_role() IN ('DOCTOR','NURSE','EMERGENCY_ADMIN','HOSPITAL_ADMIN','SUPER_ADMIN')
  );

-- ---- ORDERS ----
CREATE POLICY "Clinical read orders" ON clinical_orders
  FOR SELECT USING (current_user_role() IN ('DOCTOR','NURSE','LAB','RADIOLOGY','BLOOD_BANK','PHARMACY','EMERGENCY_ADMIN','HOSPITAL_ADMIN','SUPER_ADMIN'));

CREATE POLICY "Doctor create orders" ON clinical_orders
  FOR INSERT WITH CHECK (current_user_role() IN ('DOCTOR','EMERGENCY_ADMIN'));

-- ---- LAB ORDERS ----
CREATE POLICY "Lab staff read lab orders" ON lab_orders
  FOR SELECT USING (current_user_role() IN ('DOCTOR','NURSE','LAB','EMERGENCY_ADMIN','HOSPITAL_ADMIN','SUPER_ADMIN'));

CREATE POLICY "Lab release results" ON lab_orders
  FOR UPDATE USING (current_user_role() IN ('LAB','DOCTOR','EMERGENCY_ADMIN'));

-- ---- RADIOLOGY ----
CREATE POLICY "Radiology staff read" ON radiology_orders
  FOR SELECT USING (current_user_role() IN ('DOCTOR','NURSE','RADIOLOGY','EMERGENCY_ADMIN','HOSPITAL_ADMIN','SUPER_ADMIN'));

CREATE POLICY "Radiology report" ON radiology_orders
  FOR UPDATE USING (current_user_role() IN ('RADIOLOGY','DOCTOR','EMERGENCY_ADMIN'));

-- ---- BLOOD REQUESTS ----
CREATE POLICY "Blood bank read requests" ON blood_requests
  FOR SELECT USING (current_user_role() IN ('DOCTOR','NURSE','BLOOD_BANK','EMERGENCY_ADMIN','HOSPITAL_ADMIN','SUPER_ADMIN'));

-- ---- PRESCRIPTIONS ----
CREATE POLICY "Clinical read prescriptions" ON prescriptions
  FOR SELECT USING (current_user_role() IN ('DOCTOR','NURSE','PHARMACY','EMERGENCY_ADMIN','HOSPITAL_ADMIN','SUPER_ADMIN'));

CREATE POLICY "Doctor create prescriptions" ON prescriptions
  FOR INSERT WITH CHECK (current_user_role() IN ('DOCTOR','EMERGENCY_ADMIN'));

-- ---- AMBULANCES ----
CREATE POLICY "Staff read hospital ambulances" ON ambulances
  FOR SELECT USING (hospital_id = current_user_hospital());

CREATE POLICY "Admin update ambulances" ON ambulances
  FOR UPDATE USING (
    hospital_id = current_user_hospital() AND
    current_user_role() IN ('EMERGENCY_ADMIN','HOSPITAL_ADMIN','SUPER_ADMIN','AMBULANCE_STAFF')
  );

-- ---- RESOURCES ----
CREATE POLICY "Staff read hospital resources" ON resources
  FOR SELECT USING (hospital_id = current_user_hospital());

CREATE POLICY "Admin update resources" ON resources
  FOR UPDATE USING (
    hospital_id = current_user_hospital() AND
    current_user_role() IN ('NURSE','DOCTOR','EMERGENCY_ADMIN','HOSPITAL_ADMIN','SUPER_ADMIN')
  );

-- ---- MESSAGES ----
CREATE POLICY "Staff read own messages" ON messages
  FOR SELECT USING (from_id = auth.uid() OR to_id = auth.uid() OR hospital_id = current_user_hospital());

CREATE POLICY "Staff send messages" ON messages
  FOR INSERT WITH CHECK (hospital_id = current_user_hospital() AND from_id = auth.uid());

-- ---- NOTIFICATIONS ----
CREATE POLICY "Users read own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System create notifications" ON notifications
  FOR INSERT WITH CHECK (hospital_id = current_user_hospital());

CREATE POLICY "Users update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- ---- TASKS ----
CREATE POLICY "Staff read hospital tasks" ON tasks
  FOR SELECT USING (hospital_id = current_user_hospital());

CREATE POLICY "Staff create tasks" ON tasks
  FOR INSERT WITH CHECK (hospital_id = current_user_hospital());

CREATE POLICY "Assignee update tasks" ON tasks
  FOR UPDATE USING (
    hospital_id = current_user_hospital() AND
    (assigned_to = auth.uid() OR assigned_by = auth.uid() OR current_user_role() IN ('EMERGENCY_ADMIN','HOSPITAL_ADMIN','SUPER_ADMIN'))
  );

-- ---- AUDIT LOG — read-only for admins ----
CREATE POLICY "Admins read audit log" ON audit_log
  FOR SELECT USING (
    hospital_id = current_user_hospital() AND
    current_user_role() IN ('EMERGENCY_ADMIN','HOSPITAL_ADMIN','SUPER_ADMIN')
  );

CREATE POLICY "System write audit log" ON audit_log
  FOR INSERT WITH CHECK (TRUE);

-- ---- BROADCASTS ----
CREATE POLICY "Hospital staff read broadcasts" ON broadcasts
  FOR SELECT USING (hospital_id = current_user_hospital());

CREATE POLICY "Admin create broadcasts" ON broadcasts
  FOR INSERT WITH CHECK (
    hospital_id = current_user_hospital() AND
    current_user_role() IN ('EMERGENCY_ADMIN','HOSPITAL_ADMIN','SUPER_ADMIN','DOCTOR')
  );

-- ---- VOICE LOGS ----
CREATE POLICY "Staff read own voice logs" ON voice_logs
  FOR SELECT USING (staff_id = auth.uid() OR current_user_role() IN ('EMERGENCY_ADMIN','HOSPITAL_ADMIN','SUPER_ADMIN'));

CREATE POLICY "Staff create voice logs" ON voice_logs
  FOR INSERT WITH CHECK (staff_id = auth.uid());

-- ---- PATIENT TIMELINE ----
CREATE POLICY "Clinical read timeline" ON patient_timeline
  FOR SELECT USING (current_user_role() IN ('DOCTOR','NURSE','EMERGENCY_ADMIN','HOSPITAL_ADMIN','SUPER_ADMIN','RECEPTION'));

CREATE POLICY "System write timeline" ON patient_timeline
  FOR INSERT WITH CHECK (TRUE);

-- ---- AI PREDICTIONS ----
CREATE POLICY "Clinical read predictions" ON ai_predictions
  FOR SELECT USING (current_user_role() IN ('DOCTOR','NURSE','EMERGENCY_ADMIN','HOSPITAL_ADMIN','SUPER_ADMIN'));

CREATE POLICY "System create predictions" ON ai_predictions
  FOR INSERT WITH CHECK (TRUE);

-- ---- COPILOT SESSIONS ----
CREATE POLICY "Staff own sessions" ON copilot_sessions
  FOR ALL USING (staff_id = auth.uid());
