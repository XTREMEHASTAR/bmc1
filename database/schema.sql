-- Core Enumerations
CREATE TYPE blood_group_type AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
CREATE TYPE appointment_status_type AS ENUM ('scheduled', 'arrived', 'in-consultation', 'completed', 'cancelled', 'no-show');
CREATE TYPE vital_alert_level_type AS ENUM ('normal', 'warning', 'critical');
CREATE TYPE consent_status_type AS ENUM ('requested', 'granted', 'denied', 'expired', 'revoked');

-- 1. CITIZEN REGISTRY (Lifelong Identity Table)
CREATE TABLE citizens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    national_id_hash VARCHAR(64) UNIQUE NOT NULL, -- Salted SHA-256 hash of Aadhaar
    abha_number VARCHAR(17) UNIQUE,               -- e.g., 91-8834-2910-4482
    abha_address VARCHAR(100) UNIQUE,             -- e.g., rahul.patil@abha
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    dob DATE NOT NULL,
    gender VARCHAR(10) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    permanent_address TEXT NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    version INT NOT NULL DEFAULT 1
);

-- 2. HOSPITALS (Multi-Tenant Master Registry)
CREATE TABLE hospitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_code VARCHAR(50) UNIQUE NOT NULL, -- e.g., MCGM-SION-01
    name VARCHAR(255) NOT NULL,
    tier VARCHAR(20) NOT NULL, -- 'Primary', 'Secondary', 'Tertiary'
    address TEXT NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. PATIENTS (Hospital-Specific Enrollment Context)
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    citizen_id UUID REFERENCES citizens(id) ON DELETE RESTRICT,
    hospital_id UUID REFERENCES hospitals(id) ON DELETE RESTRICT,
    mcgm_card_no VARCHAR(50) UNIQUE NOT NULL,
    blood_group blood_group_type NOT NULL,
    allergies TEXT[] DEFAULT '{}',
    chronic_conditions TEXT[] DEFAULT '{}',
    family_history JSONB DEFAULT '{}',
    emergency_contact_name VARCHAR(100) NOT NULL,
    emergency_contact_phone VARCHAR(20) NOT NULL,
    consent_preferences JSONB DEFAULT '{"allow_research": false, "auto_share_abha": true}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- 4. STAFF REGISTRY
CREATE TABLE staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID REFERENCES hospitals(id) ON DELETE RESTRICT,
    employee_id VARCHAR(50) NOT NULL,
    hpr_id VARCHAR(100), -- Healthcare Professional Registry ID (ABDM)
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL, -- 'doctor', 'nurse', 'receptionist', 'pharmacist', 'lab_tech'
    specialization VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_hospital_staff UNIQUE(hospital_id, employee_id)
);

-- 5. ENCOUNTERS
CREATE TABLE encounters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID REFERENCES hospitals(id) ON DELETE RESTRICT,
    patient_id UUID REFERENCES patients(id) ON DELETE RESTRICT,
    practitioner_id UUID REFERENCES staff(id) ON DELETE RESTRICT,
    encounter_type VARCHAR(50) NOT NULL, -- 'opd', 'ipd', 'emergency', 'teleconsult'
    status VARCHAR(50) NOT NULL, -- 'planned', 'triaged', 'consulting', 'finished'
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. CLINICAL RECORDS
CREATE TABLE clinical_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    encounter_id UUID REFERENCES encounters(id) ON DELETE RESTRICT,
    patient_id UUID REFERENCES patients(id) ON DELETE RESTRICT,
    practitioner_id UUID REFERENCES staff(id) ON DELETE RESTRICT,
    record_type VARCHAR(50) NOT NULL, -- 'soap_note', 'lab_report', 'discharge_summary'
    structured_content JSONB NOT NULL, -- SOAP schemas, vitals, diagnosis (ICD-10)
    is_signed BOOLEAN NOT NULL DEFAULT FALSE,
    signature_hash TEXT,
    signed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    version INT NOT NULL DEFAULT 1
);

-- 7. CLINICAL RECORD VERSION HISTORY (Temporal Audit Pattern)
CREATE TABLE clinical_records_history (
    history_id BIGSERIAL PRIMARY KEY,
    record_id UUID NOT NULL,
    encounter_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    practitioner_id UUID NOT NULL,
    record_type VARCHAR(50) NOT NULL,
    structured_content JSONB NOT NULL,
    is_signed BOOLEAN NOT NULL,
    signature_hash TEXT,
    signed_at TIMESTAMP WITH TIME ZONE,
    changed_by UUID NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. MEDICINE PRESCRIPTIONS (Line items)
CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinical_record_id UUID REFERENCES clinical_records(id) ON DELETE RESTRICT,
    patient_id UUID REFERENCES patients(id) ON DELETE RESTRICT,
    medicine_name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255) NOT NULL,
    dosage_form VARCHAR(50) NOT NULL, -- 'tablet', 'capsule', 'syrup', 'injection'
    strength VARCHAR(50) NOT NULL, -- e.g., '650mg'
    frequency VARCHAR(100) NOT NULL, -- e.g., '1-0-1' (thrice daily)
    duration_days INT NOT NULL,
    instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 9. PATIENT VITALS (Partitioned by Range - Monthly)
CREATE TABLE patient_vitals (
    id UUID NOT NULL,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    encounter_id UUID NOT NULL REFERENCES encounters(id) ON DELETE RESTRICT,
    recorded_by UUID NOT NULL REFERENCES staff(id) ON DELETE RESTRICT,
    systolic_bp INT,
    diastolic_bp INT,
    pulse_rate INT,
    temperature_fahrenheit NUMERIC(4,2),
    spo2 NUMERIC(5,2),
    alert_level vital_alert_level_type DEFAULT 'normal',
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
) PARTITION BY RANGE (recorded_at);

-- Partition Tables for patient vitals
CREATE TABLE patient_vitals_default PARTITION OF patient_vitals DEFAULT;

-- 10. VOICE CONSULT DATA
CREATE TABLE voice_consult_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinical_record_id UUID REFERENCES clinical_records(id) ON DELETE CASCADE,
    audio_s3_uri VARCHAR(512) NOT NULL,            -- Encrypted raw audio reference
    raw_transcript TEXT NOT NULL,                  -- Speech-to-Text output
    speaker_labels JSONB NOT NULL,                  -- [{"timestamp": 12.4, "speaker": "doctor", "text": "..."}]
    language_code VARCHAR(10) DEFAULT 'en',         -- 'en', 'mr', 'hi'
    speech_confidence NUMERIC(4,3) NOT NULL,       -- Whisper model certainty score
    review_status VARCHAR(20) DEFAULT 'pending',    -- 'pending', 'approved', 'edited'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. AI CLINICAL LOGS (Prompt/Response Tracing)
CREATE TABLE ai_clinical_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinical_record_id UUID REFERENCES clinical_records(id) ON DELETE CASCADE,
    prompt_payload TEXT NOT NULL,                   -- Complete prompt context sent to gateway
    model_response JSONB NOT NULL,                  -- Complete LLM structured JSON output
    model_version VARCHAR(100) NOT NULL,            -- e.g., 'Llama-3-70B-v1.4'
    confidence_score NUMERIC(5,4),                  -- NLP confidence extraction score
    feedback_rating INT CHECK(feedback_rating BETWEEN 1 AND 5),
    feedback_comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. DIGITAL DOCUMENTS (Signed PDF Archives)
CREATE TABLE digital_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE RESTRICT,
    document_type VARCHAR(50) NOT NULL, -- 'prescription', 'discharge_summary', 'birth_certificate'
    pdf_s3_uri VARCHAR(512) NOT NULL,
    structured_json_ref UUID REFERENCES clinical_records(id) ON DELETE RESTRICT,
    version INT NOT NULL DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    hash_signature VARCHAR(256) NOT NULL, -- Cryptographic hash of the document body
    e_sign_token TEXT NOT NULL,            -- Digital signature certificate payload
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. ABDM CONSENTS
CREATE TABLE abdm_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE RESTRICT,
    consent_request_id VARCHAR(100) UNIQUE NOT NULL,
    consent_artifact_id VARCHAR(100),
    status consent_status_type NOT NULL DEFAULT 'requested',
    purpose_code VARCHAR(50) NOT NULL,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    access_mode VARCHAR(20) NOT NULL, -- 'VIEW', 'STORE'
    health_info_types VARCHAR(50)[] NOT NULL, -- e.g., ['OPConsultation', 'DischargeSummary']
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. LONGITUDINAL HEALTH TIMELINE (Life-long chronology index)
CREATE TABLE longitudinal_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    citizen_id UUID REFERENCES citizens(id) ON DELETE RESTRICT NOT NULL,
    event_time TIMESTAMP WITH TIME ZONE NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- 'birth', 'vaccination', 'opd', 'surgery', 'lab'
    hospital_id UUID REFERENCES hospitals(id) ON DELETE RESTRICT,
    resource_ref_type VARCHAR(50) NOT NULL, -- e.g., 'clinical_records', 'prescriptions'
    resource_ref_id UUID NOT NULL,
    summary_snippet TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. IMMUTABLE SECURITY AUDIT TRAIL
CREATE TABLE security_audit_trail (
    id BIGSERIAL,
    event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actor_id UUID NOT NULL,
    actor_role VARCHAR(50) NOT NULL,
    action_type VARCHAR(50) NOT NULL,            -- 'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'EXPORT'
    target_table VARCHAR(100) NOT NULL,
    target_record_id UUID NOT NULL,
    client_ip INET NOT NULL,
    user_agent TEXT NOT NULL,
    consent_token_id UUID,                       -- Linked consent verifying access
    old_state JSONB,
    new_state JSONB,
    PRIMARY KEY (id, event_timestamp)
) PARTITION BY RANGE (event_timestamp);

-- Default Audit Partition
CREATE TABLE security_audit_trail_default PARTITION OF security_audit_trail DEFAULT;

-- --- ANALYTICS WAREHOUSE (OLAP DIMENSION & FACT TABLES) ---
CREATE TABLE dim_patients (
    patient_key SERIAL PRIMARY KEY,
    patient_id UUID NOT NULL,
    gender VARCHAR(10) NOT NULL,
    age_group VARCHAR(20) NOT NULL,
    region_pincode VARCHAR(10) NOT NULL,
    is_abha_verified BOOLEAN NOT NULL
);

CREATE TABLE dim_hospitals (
    hospital_key SERIAL PRIMARY KEY,
    hospital_id UUID NOT NULL,
    facility_code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    tier VARCHAR(20) NOT NULL,
    district VARCHAR(100) NOT NULL
);

CREATE TABLE dim_diagnoses_icd (
    diagnosis_icd_key SERIAL PRIMARY KEY,
    icd_10_code VARCHAR(10) UNIQUE NOT NULL,
    disease_name VARCHAR(255) NOT NULL,
    disease_category VARCHAR(100) NOT NULL
);

CREATE TABLE dim_date (
    date_key INT PRIMARY KEY, -- YYYYMMDD
    full_date DATE NOT NULL,
    day_of_week VARCHAR(10) NOT NULL,
    month_name VARCHAR(15) NOT NULL,
    quarter INT NOT NULL,
    year INT NOT NULL,
    is_public_holiday BOOLEAN NOT NULL
);

CREATE TABLE fact_encounters (
    encounter_key BIGSERIAL PRIMARY KEY,
    encounter_id UUID NOT NULL,
    patient_key INT NOT NULL REFERENCES dim_patients(patient_key),
    hospital_key INT NOT NULL REFERENCES dim_hospitals(hospital_key),
    date_key INT NOT NULL REFERENCES dim_date(date_key),
    practitioner_id UUID NOT NULL,
    department_key INT NOT NULL,
    diagnosis_icd_key INT REFERENCES dim_diagnoses_icd(diagnosis_icd_key),
    queue_wait_duration_seconds INT NOT NULL,
    consultation_duration_seconds INT,
    billing_amount NUMERIC(12,2)
);

-- --- INDICES & OPTIMIZATIONS ---
CREATE INDEX idx_citizens_national_id ON citizens(national_id_hash);
CREATE INDEX idx_citizens_abha ON citizens(abha_number);
CREATE INDEX idx_patients_citizen_id ON patients(citizen_id);
CREATE INDEX idx_encounters_patient_id ON encounters(patient_id);
CREATE INDEX idx_clinical_records_patient ON clinical_records(patient_id);
CREATE INDEX idx_clinical_records_gin ON clinical_records USING gin (structured_content);
CREATE INDEX idx_prescriptions_record ON prescriptions(clinical_record_id);
CREATE INDEX idx_timeline_citizen_chronology ON longitudinal_timeline(citizen_id, event_time DESC);
CREATE INDEX idx_digital_docs_patient ON digital_documents(patient_id, document_type);

-- --- DATABASE FUNCTIONS & TRIGGERS ---

-- 1. Timestamp Updater Trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_citizens_updated_at BEFORE UPDATE ON citizens FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_hospitals_updated_at BEFORE UPDATE ON hospitals FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_encounters_updated_at BEFORE UPDATE ON encounters FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_clinical_records_updated_at BEFORE UPDATE ON clinical_records FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_abdm_consents_updated_at BEFORE UPDATE ON abdm_consents FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 2. Audit Trail Immutability Guard
CREATE OR REPLACE FUNCTION lock_audit_logs()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
        RAISE EXCEPTION 'Audit records are immutable. Operation blocked.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_lock_audit BEFORE UPDATE OR DELETE ON security_audit_trail
FOR EACH ROW EXECUTE PROCEDURE lock_audit_logs();

-- 3. Temporal Table Versioning Trigger for Clinical Records
CREATE OR REPLACE FUNCTION log_clinical_record_history()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO clinical_records_history (
        record_id, encounter_id, patient_id, practitioner_id, 
        record_type, structured_content, is_signed, 
        signature_hash, signed_at, changed_by
    ) VALUES (
        OLD.id, OLD.encounter_id, OLD.patient_id, OLD.practitioner_id,
        OLD.record_type, OLD.structured_content, OLD.is_signed,
        OLD.signature_hash, OLD.signed_at, OLD.practitioner_id
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_clinical_records_history BEFORE UPDATE ON clinical_records
FOR EACH ROW EXECUTE PROCEDURE log_clinical_record_history();

-- 4. Dynamic Consent Verification Evaluator
CREATE OR REPLACE FUNCTION verify_patient_consent(
    p_patient_id UUID,
    p_practitioner_id UUID,
    p_purpose VARCHAR(50),
    p_record_category VARCHAR(50)
) RETURNS BOOLEAN AS $$
DECLARE
    v_consent_valid BOOLEAN := FALSE;
BEGIN
    -- Check if record is accessed by parent hospital (auto-consented)
    IF EXISTS (
        SELECT 1 FROM patients p
        JOIN staff s ON p.hospital_id = s.hospital_id
        WHERE p.id = p_patient_id AND s.id = p_practitioner_id
    ) THEN
        RETURN TRUE;
    END IF;

    -- Evaluate active consent token registry
    SELECT EXISTS (
        SELECT 1 FROM abdm_consents
        WHERE patient_id = p_patient_id
          AND status = 'granted'
          AND purpose_code = p_purpose
          AND expiry_date > now()
          AND p_record_category = ANY(health_info_types)
    ) INTO v_consent_valid;

    RETURN v_consent_valid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
