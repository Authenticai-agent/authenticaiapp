from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any, Optional
from pydantic import BaseModel
from datetime import datetime
import logging

from utils.auth_utils import get_current_user
from database import get_admin_db
from utils.logger import setup_logger

router = APIRouter()
logger = setup_logger()

class OutcomeTrackingCreate(BaseModel):
    event_type: str  # 'flare_up_prevented', 'symptom_reduced', 'medication_avoided'
    prevention_method: str
    severity_before: int
    severity_after: int
    time_saved_minutes: Optional[int] = 0
    cost_saved_cents: Optional[int] = 0
    user_notes: Optional[str] = None
    verified: bool = False

class OutcomeTrackingResponse(BaseModel):
    id: str
    event_type: str
    prevention_method: str
    severity_before: int
    severity_after: int
    time_saved_minutes: int
    cost_saved_cents: int
    user_notes: Optional[str]
    verified: bool
    created_at: datetime

@router.post("/outcome-tracking", response_model=OutcomeTrackingResponse)
async def create_outcome_tracking(
    outcome_data: OutcomeTrackingCreate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Track successful outcomes when users prevent flare-ups or reduce symptoms
    """
    try:
        db = get_admin_db()
        
        # Prepare outcome data
        outcome_dict = {
            "user_id": current_user["id"],
            "event_type": outcome_data.event_type,
            "prevention_method": outcome_data.prevention_method,
            "severity_before": outcome_data.severity_before,
            "severity_after": outcome_data.severity_after,
            "time_saved_minutes": outcome_data.time_saved_minutes,
            "cost_saved_cents": outcome_data.cost_saved_cents,
            "user_notes": outcome_data.user_notes,
            "verified": outcome_data.verified,
            "created_at": datetime.utcnow().isoformat()
        }
        
        # Insert outcome tracking
        result = db.table("outcome_tracking").insert(outcome_dict).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create outcome tracking"
            )
        
        outcome = result.data[0]
        
        # Log the success story for analysis
        logger.info(f"Success story recorded: {outcome_data.event_type} - {outcome_data.prevention_method}")
        
        return OutcomeTrackingResponse(
            id=outcome["id"],
            event_type=outcome["event_type"],
            prevention_method=outcome["prevention_method"],
            severity_before=outcome["severity_before"],
            severity_after=outcome["severity_after"],
            time_saved_minutes=outcome["time_saved_minutes"],
            cost_saved_cents=outcome["cost_saved_cents"],
            user_notes=outcome["user_notes"],
            verified=outcome["verified"],
            created_at=datetime.fromisoformat(outcome["created_at"].replace('Z', '+00:00'))
        )
        
    except Exception as e:
        logger.error(f"Error creating outcome tracking: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to submit outcome tracking"
        )

@router.get("/outcome-tracking", response_model=list[OutcomeTrackingResponse])
async def get_user_outcomes(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Get user's outcome tracking history
    """
    try:
        db = get_admin_db()
        
        result = db.table("outcome_tracking").select("*").eq("user_id", current_user["id"]).order("created_at", desc=True).execute()
        
        outcomes = []
        for outcome in result.data:
            outcomes.append(OutcomeTrackingResponse(
                id=outcome["id"],
                event_type=outcome["event_type"],
                prevention_method=outcome["prevention_method"],
                severity_before=outcome["severity_before"],
                severity_after=outcome["severity_after"],
                time_saved_minutes=outcome["time_saved_minutes"],
                cost_saved_cents=outcome["cost_saved_cents"],
                user_notes=outcome["user_notes"],
                verified=outcome["verified"],
                created_at=datetime.fromisoformat(outcome["created_at"].replace('Z', '+00:00'))
            ))
        
        return outcomes
        
    except Exception as e:
        logger.error(f"Error fetching outcome tracking: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch outcome tracking"
        )

@router.get("/outcome-tracking/stats", response_model=Dict[str, Any])
async def get_outcome_stats(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Get aggregated outcome statistics for the user
    """
    try:
        db = get_admin_db()
        
        result = db.table("outcome_tracking").select("*").eq("user_id", current_user["id"]).execute()
        
        if not result.data:
            return {
                "total_outcomes": 0,
                "flare_ups_prevented": 0,
                "symptoms_reduced": 0,
                "medications_avoided": 0,
                "total_time_saved_minutes": 0,
                "total_cost_saved_cents": 0,
                "average_severity_improvement": 0
            }
        
        outcomes = result.data
        
        # Calculate statistics
        total_outcomes = len(outcomes)
        flare_ups_prevented = len([o for o in outcomes if o["event_type"] == "flare_up_prevented"])
        symptoms_reduced = len([o for o in outcomes if o["event_type"] == "symptom_reduced"])
        medications_avoided = len([o for o in outcomes if o["event_type"] == "medication_avoided"])
        
        total_time_saved = sum(o["time_saved_minutes"] or 0 for o in outcomes)
        total_cost_saved = sum(o["cost_saved_cents"] or 0 for o in outcomes)
        
        severity_improvements = [
            o["severity_before"] - o["severity_after"] 
            for o in outcomes 
            if o["severity_before"] and o["severity_after"]
        ]
        average_severity_improvement = sum(severity_improvements) / len(severity_improvements) if severity_improvements else 0
        
        return {
            "total_outcomes": total_outcomes,
            "flare_ups_prevented": flare_ups_prevented,
            "symptoms_reduced": symptoms_reduced,
            "medications_avoided": medications_avoided,
            "total_time_saved_minutes": total_time_saved,
            "total_cost_saved_cents": total_cost_saved,
            "average_severity_improvement": round(average_severity_improvement, 1)
        }
        
    except Exception as e:
        logger.error(f"Error fetching outcome stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch outcome statistics"
        )
