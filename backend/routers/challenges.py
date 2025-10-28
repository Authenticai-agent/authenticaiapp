"""
Daily Wellness Challenges API
Provides fun, actionable daily challenges
"""

from fastapi import APIRouter
from typing import Dict, Any
from .challenges_library import get_daily_challenge, get_all_challenges, get_challenge_by_category

router = APIRouter()


@router.get("/daily")
async def get_todays_challenge() -> Dict[str, Any]:
    """
    Get a random daily challenge
    FREE: Unlimited access for all users
    """
    result = get_daily_challenge()
    return {
        "status": "success",
        **result
    }


@router.get("/all")
async def get_all() -> Dict[str, Any]:
    """
    Get all 15 wellness challenges
    """
    challenges = get_all_challenges()
    return {
        "status": "success",
        "challenges": challenges,
        "total": len(challenges)
    }


@router.get("/category/{category}")
async def get_by_category(category: str) -> Dict[str, Any]:
    """
    Get a challenge from a specific category
    Categories: movement, joy, planning, connection, breathing, hydration, 
                gratitude, nature, creativity, mood, environment, rest, self-love
    """
    result = get_challenge_by_category(category)
    return {
        "status": "success",
        **result
    }
