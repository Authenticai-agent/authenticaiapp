"""
Inspirational Quotes API
Provides daily inspiration and wellness quotes for users
"""

from fastapi import APIRouter, Query
from typing import Dict, Any, List
from .inspirations_library import (
    get_daily_inspiration,
    get_inspiration_by_category,
    get_all_inspirations,
    get_random_inspirations
)

router = APIRouter()


@router.get("/daily")
async def get_daily_quote() -> Dict[str, Any]:
    """
    Get a random daily inspirational quote
    Free tier: Unlimited access
    """
    quote = get_daily_inspiration()
    return {
        "status": "success",
        "inspiration": quote,
        "message": "Your daily dose of inspiration ✨"
    }


@router.get("/category/{category}")
async def get_quote_by_category(category: str) -> Dict[str, Any]:
    """
    Get an inspirational quote from a specific category
    Categories: breathing, wellness, environment, mindfulness, empowerment, rest
    """
    quote = get_inspiration_by_category(category)
    return {
        "status": "success",
        "inspiration": quote,
        "category": category
    }


@router.get("/all")
async def get_all_quotes() -> Dict[str, Any]:
    """
    Get all 15 inspirational quotes
    """
    quotes = get_all_inspirations()
    return {
        "status": "success",
        "inspirations": quotes,
        "total": len(quotes),
        "message": "All inspirational quotes for your wellness journey"
    }


@router.get("/random")
async def get_random_quotes(count: int = Query(default=3, ge=1, le=15)) -> Dict[str, Any]:
    """
    Get multiple random inspirational quotes
    """
    quotes = get_random_inspirations(count)
    return {
        "status": "success",
        "inspirations": quotes,
        "count": len(quotes)
    }
