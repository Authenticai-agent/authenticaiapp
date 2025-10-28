"""
Daily Wellness Challenges Library
15 fun, actionable challenges to boost mood and wellness
Free for all users - cycles through challenges
"""

from typing import Dict, Any
import random

DAILY_CHALLENGES = [
    {
        "id": "challenge_1",
        "challenge": "Do 10 jumping jacks right now",
        "description": "Get your blood flowing and boost your energy instantly",
        "category": "movement",
        "duration": "1 minute",
        "difficulty": "easy",
        "emoji": "🤸"
    },
    {
        "id": "challenge_2",
        "challenge": "Dance to one song like nobody's watching",
        "description": "Put on your favorite song and move your body freely",
        "category": "joy",
        "duration": "3-4 minutes",
        "difficulty": "easy",
        "emoji": "💃"
    },
    {
        "id": "challenge_3",
        "challenge": "Find something you want to do this week",
        "description": "Think of one activity that excites you and schedule it",
        "category": "planning",
        "duration": "5 minutes",
        "difficulty": "easy",
        "emoji": "📅"
    },
    {
        "id": "challenge_4",
        "challenge": "Text someone you appreciate",
        "description": "Send a genuine message of gratitude to a friend or family member",
        "category": "connection",
        "duration": "2 minutes",
        "difficulty": "easy",
        "emoji": "💌"
    },
    {
        "id": "challenge_5",
        "challenge": "Take 10 deep breaths by an open window",
        "description": "Connect with fresh air and practice mindful breathing",
        "category": "breathing",
        "duration": "2 minutes",
        "difficulty": "easy",
        "emoji": "🪟"
    },
    {
        "id": "challenge_6",
        "challenge": "Drink a full glass of water right now",
        "description": "Hydration is key to wellness - your body will thank you",
        "category": "hydration",
        "duration": "1 minute",
        "difficulty": "easy",
        "emoji": "💧"
    },
    {
        "id": "challenge_7",
        "challenge": "Stretch for 5 minutes",
        "description": "Release tension in your neck, shoulders, and back",
        "category": "movement",
        "duration": "5 minutes",
        "difficulty": "easy",
        "emoji": "🧘"
    },
    {
        "id": "challenge_8",
        "challenge": "Write down 3 things you're grateful for",
        "description": "Shift your focus to the positive aspects of your life",
        "category": "gratitude",
        "duration": "3 minutes",
        "difficulty": "easy",
        "emoji": "📝"
    },
    {
        "id": "challenge_9",
        "challenge": "Go outside for 10 minutes",
        "description": "Get some fresh air and natural light (if air quality permits)",
        "category": "nature",
        "duration": "10 minutes",
        "difficulty": "easy",
        "emoji": "🌳"
    },
    {
        "id": "challenge_10",
        "challenge": "Do something creative for 15 minutes",
        "description": "Draw, color, write, or create something just for fun",
        "category": "creativity",
        "duration": "15 minutes",
        "difficulty": "moderate",
        "emoji": "🎨"
    },
    {
        "id": "challenge_11",
        "challenge": "Laugh out loud - watch a funny video",
        "description": "Laughter is medicine - find something that makes you genuinely laugh",
        "category": "joy",
        "duration": "5 minutes",
        "difficulty": "easy",
        "emoji": "😂"
    },
    {
        "id": "challenge_12",
        "challenge": "Tidy one small space",
        "description": "Clear your desk, organize a drawer, or make your bed",
        "category": "environment",
        "duration": "10 minutes",
        "difficulty": "easy",
        "emoji": "✨"
    },
    {
        "id": "challenge_13",
        "challenge": "Listen to a song that lifts your mood",
        "description": "Music has power - choose something uplifting and really listen",
        "category": "mood",
        "duration": "3-4 minutes",
        "difficulty": "easy",
        "emoji": "🎵"
    },
    {
        "id": "challenge_14",
        "challenge": "Take a 5-minute power break",
        "description": "Step away from screens, close your eyes, and just breathe",
        "category": "rest",
        "duration": "5 minutes",
        "difficulty": "easy",
        "emoji": "😌"
    },
    {
        "id": "challenge_15",
        "challenge": "Compliment yourself in the mirror",
        "description": "Say 3 genuine compliments to yourself out loud",
        "category": "self-love",
        "duration": "2 minutes",
        "difficulty": "moderate",
        "emoji": "💖"
    }
]


def get_daily_challenge() -> Dict[str, Any]:
    """
    Get a random daily challenge
    """
    challenge = random.choice(DAILY_CHALLENGES)
    return {
        "challenge": challenge,
        "message": "Complete this challenge today to boost your wellness! 🌟"
    }


def get_all_challenges() -> list:
    """Get all 15 challenges"""
    return DAILY_CHALLENGES


def get_challenge_by_category(category: str) -> Dict[str, Any]:
    """Get a random challenge from a specific category"""
    filtered = [c for c in DAILY_CHALLENGES if c["category"] == category]
    if not filtered:
        return get_daily_challenge()
    return {"challenge": random.choice(filtered)}
