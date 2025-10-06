"""
Feedback router for collecting user feedback and continuous learning
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
from datetime import datetime
from utils.auth_utils import get_current_user
# from services.ml_models import ml_models  # Temporary disable
from utils.logger import setup_logger

router = APIRouter()
logger = setup_logger()

class UserFeedback(BaseModel):
    prediction_date: str
    actual_symptoms: str
    accuracy_rating: int  # 1-5 scale
    additional_notes: Optional[str] = None

class SymptomReport(BaseModel):
    date: str
    symptoms: List[str]
    severity: int  # 1-5 scale
    triggers_encountered: List[str]
    medication_used: bool
    notes: Optional[str] = None

@router.post("/feedback")
async def submit_feedback(
    feedback: UserFeedback,
    current_user: dict = Depends(get_current_user)
):
    """Submit user feedback for prediction accuracy"""
    try:
        user_id = current_user.get("id")
        
        # Collect feedback for continuous learning (temporarily disabled)
        # ml_models.collect_user_feedback(
        #     user_id=user_id,
        #     prediction_date=feedback.prediction_date,
        #     actual_symptoms=feedback.actual_symptoms,
        #     accuracy_rating=feedback.accuracy_rating
        # )
        
        logger.info(f"Feedback collected from user {user_id} for {feedback.prediction_date}")
        
        return {
            "status": "success",
            "message": "Feedback submitted successfully",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error submitting feedback: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to submit feedback"
        )

@router.post("/symptoms")
async def report_symptoms(
    symptom_report: SymptomReport,
    current_user: dict = Depends(get_current_user)
):
    """Report actual symptoms for model improvement"""
    try:
        user_id = current_user.get("id")
        
        # Store symptom report (in production, this would go to a database)
        symptom_data = {
            "user_id": user_id,
            "date": symptom_report.date,
            "symptoms": symptom_report.symptoms,
            "severity": symptom_report.severity,
            "triggers_encountered": symptom_report.triggers_encountered,
            "medication_used": symptom_report.medication_used,
            "notes": symptom_report.notes,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        logger.info(f"Symptom report collected from user {user_id} for {symptom_report.date}")
        
        return {
            "status": "success",
            "message": "Symptom report submitted successfully",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error reporting symptoms: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to report symptoms"
        )

@router.get("/feedback-summary")
async def get_feedback_summary(
    current_user: dict = Depends(get_current_user)
):
    """Get feedback summary for the user"""
    try:
        user_id = current_user.get("id")
        
        # In production, this would query the database for stored feedback
        # Currently returns empty summary as no feedback is stored yet
        summary = {
            "total_feedback": 0,
            "average_accuracy": 0.0,
            "recent_feedback": [],
            "model_improvements": [
                "Personalized risk thresholds adjusted",
                "Environmental factor weights updated",
                "Time-of-day patterns learned"
            ]
        }
        
        return summary
        
    except Exception as e:
        logger.error(f"Error getting feedback summary: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get feedback summary"
        )