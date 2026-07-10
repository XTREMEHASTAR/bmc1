import abc
import uuid
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("MCGM-AI-Agents")

class MCGMBaseAgent(abc.ABC):
    """
    Standard base class representing an autonomous clinical agent within the MCGM service mesh.
    Enforces dynamic RBAC evaluation, execution guardrails, and immutable audit logs.
    """
    def __init__(
        self,
        agent_id: str,
        role: str,
        allowed_tools: List[str],
        access_scopes: List[str]
    ):
        self.agent_id = agent_id
        self.role = role
        self.allowed_tools = allowed_tools
        self.access_scopes = access_scopes

    @abc.abstractmethod
    async def process_task(self, payload: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Core execution logic. Subclasses implement specialized agent functions."""
        pass

    def enforce_guardrails(self, payload: Dict[str, Any], context: Dict[str, Any]) -> bool:
        """Evaluate access tokens and security boundaries prior to LLM routing."""
        user_role = context.get("user_role")
        if user_role not in self.access_scopes:
            logger.warning(f"Guardrail Denied: Role '{user_role}' lacks permissions for {self.agent_id}")
            return False
            
        # Verify active patient consent token is present
        if "patient_id" in payload and not context.get("consent_verified", False):
            logger.warning(f"Guardrail Denied: Missing verified consent token for patient {payload.get('patient_id')}")
            return False
            
        return True

    def format_agent_log(
        self,
        action: str,
        target_id: uuid.UUID,
        status: str,
        details: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate audit logs matching system security specifications."""
        return {
            "agent_id": self.agent_id,
            "role": self.role,
            "action": action,
            "target_id": str(target_id),
            "execution_status": status,
            "details": details,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }


class DoctorAgent(MCGMBaseAgent):
    """
    Clinical Copilot responsible for ambient dictation SOAP structuring, 
    prescription drafting, and contraindication scanning.
    """
    def __init__(self):
        super().__init__(
            agent_id="doctor_copilot_v1",
            role="clinical_support",
            allowed_tools=["soap_parser", "nlem_lookup", "allergy_crosscheck"],
            access_scopes=["doctor", "specialist"]
        )

    async def process_task(self, payload: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        if not self.enforce_guardrails(payload, context):
            raise PermissionError("Task blocked by security guardrails.")

        raw_transcript = payload.get("transcript", "")
        # Mock structured output representing NLP clinical extraction
        soap_draft = {
            "subjective": {
                "chief_complaint": "Bilateral knee joint stiffness and moderate pain, worse in the morning.",
                "hpi": "Progressive over 6 months. Relieved slightly with rest. No trauma history."
            },
            "objective": {
                "examination": "Mild swelling in right knee. Crepitus present on flexion."
            },
            "assessment": {
                "primary_diagnosis": "Primary Osteoarthritis of Knee, bilateral",
                "icd10": "M17.0"
            },
            "plan": {
                "medications": [
                    {
                        "medicine_name": "Paracetamol 650mg",
                        "generic_name": "Paracetamol",
                        "dosage": "1-0-1",
                        "duration_days": 7
                    }
                ],
                "follow_up": "Review after 1 week with bilateral knee joint X-rays."
            }
        }

        # Mock contraindication checks
        patient_allergies = payload.get("allergies", [])
        alerts = []
        for allergy in patient_allergies:
            if allergy.lower() in "paracetamol":
                alerts.append({
                    "severity": "critical",
                    "reason": f"Patient has documented allergy to paracetamol.",
                    "action_required": "Substitute paracetamol with alternative NSAID."
                })

        logger.info(f"Doctor Agent successfully completed parsing for transcript. Alerts found: {len(alerts)}")

        return {
            "soap_note_draft": soap_draft,
            "contraindication_alerts": alerts,
            "status": "DRAFT_PENDING_PHYSICIAN_SIGNATURE",
            "audit_log": self.format_agent_log(
                action="PARSE_SOAP_DICTATION",
                target_id=uuid.uuid4(),
                status="success",
                details=f"Parsed dictation with {len(alerts)} allergy alerts."
            )
        }


class NurseAgent(MCGMBaseAgent):
    """
    Ward assistant responsible for prioritizing nursing tasks and generating risk notifications.
    """
    def __init__(self):
        super().__init__(
            agent_id="nurse_assistant_v1",
            role="ward_support",
            allowed_tools=["mews_calculator", "schedule_prioritizer"],
            access_scopes=["nurse", "doctor"]
        )

    async def process_task(self, payload: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        if not self.enforce_guardrails(payload, context):
            raise PermissionError("Task blocked by security guardrails.")

        vitals = payload.get("vitals", {})
        spo2 = vitals.get("spo2", 98.0)
        systolic = vitals.get("systolic_bp", 120)

        # Simple Modified Early Warning Score (MEWS) evaluation
        mews_score = 0
        alert_needed = False
        if spo2 < 92.0:
            mews_score += 3
            alert_needed = True
        if systolic > 160 or systolic < 90:
            mews_score += 2
            alert_needed = True

        priority = "medium" if mews_score > 2 else "normal"
        if mews_score >= 4:
            priority = "high"

        return {
            "mews_score": mews_score,
            "priority": priority,
            "escalation_recommended": alert_needed,
            "audit_log": self.format_agent_log(
                action="CALCULATE_MEWS_ALERT",
                target_id=uuid.uuid4(),
                status="success",
                details=f"MEWS Score calculated: {mews_score}. Escalation: {alert_needed}"
            )
        }


class AgentOrchestrator:
    """
    Central dispatcher coordinating task routing across the NATS service mesh
    while executing security checking triggers.
    """
    def __init__(self):
        self.agents = {
            "doctor": DoctorAgent(),
            "nurse": NurseAgent()
        }

    async def dispatch(self, target_agent: str, payload: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        agent = self.agents.get(target_agent)
        if not agent:
            raise ValueError(f"Agent target '{target_agent}' is not registered.")
            
        logger.info(f"Orchestrator dispatching task to '{target_agent}' agent (ID: {agent.agent_id})")
        return await agent.process_task(payload, context)
