import uuid
from typing import List, Optional, Dict, Any
from datetime import datetime, date
from enum import Enum
from fastapi import FastAPI, HTTPException, Header, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, EmailStr

# Local module import
from .agents import AgentOrchestrator

app = FastAPI(
    title="MCGM Healthcare OS - Core Backend",
    version="1.0.0",
    description="Enterprise-grade data platform microservice endpoints for the MCGM Digital Health Registry."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = AgentOrchestrator()

# --- 1. Enumerations ---
class BloodGroup(str, Enum):
    A_POS = "A+"
    A_NEG = "A-"
    B_POS = "B+"
    B_NEG = "B-"
    AB_POS = "AB+"
    AB_NEG = "AB-"
    O_POS = "O+"
    O_NEG = "O-"

class EncounterType(str, Enum):
    OPD = "opd"
    IPD = "ipd"
    EMERGENCY = "emergency"
    TELECONSULT = "teleconsult"

class EncounterStatus(str, Enum):
    PLANNED = "planned"
    ARRIVED = "arrived"
    TRIAGED = "triaged"
    FINISHED = "finished"
    CANCELLED = "cancelled"

class VitalAlertLevel(str, Enum):
    NORMAL = "normal"
    WARNING = "warning"
    CRITICAL = "critical"

# --- 2. Schemas ---

class CitizenRegister(BaseModel):
    national_id_hash: str = Field(..., description="Salted SHA-256 hash of Aadhaar")
    abha_number: Optional[str] = Field(None, pattern=r"^\d{2}-\d{4}-\d{4}-\d{4}$")
    abha_address: Optional[str] = Field(None, pattern=r"^[a-zA-Z0-9._-]+@abha$")
    first_name: str = Field(..., max_length=100)
    middle_name: Optional[str] = None
    last_name: str = Field(..., max_length=100)
    dob: date
    gender: str = Field(..., max_length=10)
    phone_number: str = Field(..., max_length=20)
    email: Optional[EmailStr] = None
    permanent_address: str
    pincode: str = Field(..., min_length=6, max_length=10)

class CitizenResponse(CitizenRegister):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

class PatientCreate(BaseModel):
    citizen_id: uuid.UUID
    blood_group: BloodGroup
    allergies: List[str] = []
    chronic_conditions: List[str] = []
    family_history: Dict[str, Any] = {}
    emergency_contact_name: str
    emergency_contact_phone: str

class PatientResponse(PatientCreate):
    id: uuid.UUID
    hospital_id: uuid.UUID
    mcgm_card_no: str
    created_at: datetime

class EncounterCreate(BaseModel):
    patient_id: uuid.UUID
    encounter_type: EncounterType
    start_time: datetime = Field(default_factory=datetime.utcnow)

class EncounterResponse(EncounterCreate):
    id: uuid.UUID
    hospital_id: uuid.UUID
    practitioner_id: uuid.UUID
    status: EncounterStatus
    created_at: datetime

class TimelineEventResponse(BaseModel):
    id: uuid.UUID
    citizen_id: uuid.UUID
    event_time: datetime
    event_type: str
    hospital_id: uuid.UUID
    resource_ref_type: str
    resource_ref_id: uuid.UUID
    summary_snippet: str

class VoiceConsultLog(BaseModel):
    clinical_record_id: uuid.UUID
    audio_s3_uri: str
    raw_transcript: str
    speaker_labels: List[Dict[str, Any]]
    language_code: str = "en"
    speech_confidence: float

class VoiceConsultResponse(VoiceConsultLog):
    id: uuid.UUID
    review_status: str
    created_at: datetime

class AIConsultFeedback(BaseModel):
    clinical_record_id: uuid.UUID
    prompt_payload: str
    model_response: Dict[str, Any]
    model_version: str
    feedback_rating: int = Field(..., ge=1, le=5)
    feedback_comments: Optional[str] = None

class AgentDispatchPayload(BaseModel):
    agent_target: str  # 'doctor' or 'nurse'
    payload: Dict[str, Any]
    context: Dict[str, Any]

# --- 3. Mock Auth Dependency ---
async def verify_headers(
    x_hospital_id: uuid.UUID = Header(..., alias="X-Hospital-ID"),
    x_request_id: str = Header(..., alias="X-Request-ID"),
    authorization: str = Header(..., alias="Authorization")
):
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid security scheme. Bearer Token required."
        )
    return {"hospital_id": x_hospital_id, "correlation_id": x_request_id}

# --- 4. API Routes ---

@app.post("/api/v1/citizens", response_model=CitizenResponse, status_code=status.HTTP_201_CREATED, tags=["Citizen Index"])
async def register_citizen(citizen: CitizenRegister, ctx: dict = Depends(verify_headers)):
    return CitizenResponse(
        id=uuid.uuid4(),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        **citizen.dict()
    )

@app.post("/api/v1/patients", response_model=PatientResponse, status_code=status.HTTP_201_CREATED, tags=["Patient Index"])
async def enroll_patient(patient: PatientCreate, ctx: dict = Depends(verify_headers)):
    mcgm_id = f"MCGM-SION-{datetime.now().year}-{uuid.uuid4().hex[:6].upper()}"
    return PatientResponse(
        id=uuid.uuid4(),
        hospital_id=ctx["hospital_id"],
        mcgm_card_no=mcgm_id,
        created_at=datetime.utcnow(),
        **patient.dict()
    )

@app.post("/api/v1/encounters", response_model=EncounterResponse, status_code=status.HTTP_201_CREATED, tags=["Clinical EMR"])
async def create_encounter(encounter: EncounterCreate, ctx: dict = Depends(verify_headers)):
    return EncounterResponse(
        id=uuid.uuid4(),
        hospital_id=ctx["hospital_id"],
        practitioner_id=uuid.uuid4(),
        status=EncounterStatus.ARRIVED,
        created_at=datetime.utcnow(),
        **encounter.dict()
    )

@app.get("/api/v1/citizens/{citizen_id}/timeline", response_model=List[TimelineEventResponse], tags=["Clinical EMR"])
async def get_longitudinal_timeline(citizen_id: uuid.UUID, ctx: dict = Depends(verify_headers)):
    return [
        TimelineEventResponse(
            id=uuid.uuid4(),
            citizen_id=citizen_id,
            event_time=datetime.utcnow(),
            event_type="opd",
            hospital_id=ctx["hospital_id"],
            resource_ref_type="clinical_records",
            resource_ref_id=uuid.uuid4(),
            summary_snippet="OPD Orthopaedics Consultation - Stage II Knee Osteoarthritis"
        )
    ]

@app.post("/api/v1/voice/consults", response_model=VoiceConsultResponse, status_code=status.HTTP_201_CREATED, tags=["AI Cognitive Services"])
async def log_voice_consult(log: VoiceConsultLog, ctx: dict = Depends(verify_headers)):
    return VoiceConsultResponse(
        id=uuid.uuid4(),
        review_status="pending",
        created_at=datetime.utcnow(),
        **log.dict()
    )

@app.post("/api/v1/cognitive/feedback", status_code=status.HTTP_201_CREATED, tags=["AI Cognitive Services"])
async def log_ai_feedback(feedback: AIConsultFeedback, ctx: dict = Depends(verify_headers)):
    return {"status": "success", "message": "AI telemetry and practitioner feedback logged successfully."}

@app.post("/api/v1/cognitive/dispatch", status_code=status.HTTP_200_OK, tags=["AI Cognitive Services"])
async def dispatch_agent_task(payload: AgentDispatchPayload, ctx: dict = Depends(verify_headers)):
    try:
        res = await orchestrator.dispatch(
            target_agent=payload.agent_target,
            payload=payload.payload,
            context=payload.context
        )
        return {
            "success": True,
            "correlation_id": ctx["correlation_id"],
            "result": res
        }
    except PermissionError as pe:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(pe)
        )
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
