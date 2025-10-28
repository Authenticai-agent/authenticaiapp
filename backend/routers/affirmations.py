"""
Daily Affirmations API
Provides daily affirmations with vocal repetition instructions
"""

from fastapi import APIRouter
from typing import Dict, Any
from .affirmations_library import get_daily_affirmation, get_all_affirmations

router = APIRouter()


@router.get("/daily")
async def get_todays_affirmation() -> Dict[str, Any]:
    """
    Get today's affirmation based on day of month
    FREE: Unlimited access
    INSTRUCTION: Users must repeat 5 times vocally
    """
    result = get_daily_affirmation()
    return {
        "status": "success",
        **result
    }


@router.get("/all")
async def get_all() -> Dict[str, Any]:
    """
    Get all 30 affirmations
    """
    affirmations = get_all_affirmations()
    return {
        "status": "success",
        "affirmations": affirmations,
        "total": len(affirmations),
        "instruction": "Repeat each affirmation 5 times out loud for maximum impact"
    }
