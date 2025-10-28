"""
Inspirational Quotes Library for Health & Wellness
15 original quotes to motivate and inspire users on their wellness journey
"""

from typing import List, Dict, Any
import random

INSPIRATIONAL_QUOTES = [
    {
        "id": "insp_1",
        "quote": "Every breath you take is a gift. Honor it by creating an environment where your lungs can thrive.",
        "author": "Authenticai Wellness",
        "category": "breathing",
        "theme": "gratitude"
    },
    {
        "id": "insp_2",
        "quote": "Your health is not a destination, but a daily practice. Small steps today create the wellness of tomorrow.",
        "author": "Authenticai Wellness",
        "category": "wellness",
        "theme": "consistency"
    },
    {
        "id": "insp_3",
        "quote": "The air you breathe shapes your life. Choose your environment wisely, and your body will thank you.",
        "author": "Authenticai Wellness",
        "category": "environment",
        "theme": "awareness"
    },
    {
        "id": "insp_4",
        "quote": "Healing begins when you listen to your body's whispers before they become screams.",
        "author": "Authenticai Wellness",
        "category": "mindfulness",
        "theme": "self-awareness"
    },
    {
        "id": "insp_5",
        "quote": "You cannot control the air outside, but you can control how you respond to it. Knowledge is your superpower.",
        "author": "Authenticai Wellness",
        "category": "empowerment",
        "theme": "control"
    },
    {
        "id": "insp_6",
        "quote": "Rest is not weakness. It's the foundation upon which all strength is built.",
        "author": "Authenticai Wellness",
        "category": "rest",
        "theme": "self-care"
    },
    {
        "id": "insp_7",
        "quote": "Your respiratory health is a marathon, not a sprint. Pace yourself with patience and compassion.",
        "author": "Authenticai Wellness",
        "category": "breathing",
        "theme": "patience"
    },
    {
        "id": "insp_8",
        "quote": "The most powerful medicine is the one you give yourself: clean air, deep breaths, and intentional rest.",
        "author": "Authenticai Wellness",
        "category": "wellness",
        "theme": "self-healing"
    },
    {
        "id": "insp_9",
        "quote": "Progress isn't always visible. Trust that every mindful breath is rebuilding your resilience.",
        "author": "Authenticai Wellness",
        "category": "mindfulness",
        "theme": "trust"
    },
    {
        "id": "insp_10",
        "quote": "Your lungs are your life force. Protect them like the precious treasure they are.",
        "author": "Authenticai Wellness",
        "category": "breathing",
        "theme": "protection"
    },
    {
        "id": "insp_11",
        "quote": "Wellness is not about perfection. It's about making better choices, one breath at a time.",
        "author": "Authenticai Wellness",
        "category": "wellness",
        "theme": "progress"
    },
    {
        "id": "insp_12",
        "quote": "The quality of your air determines the quality of your life. Advocate for clean air, for yourself and others.",
        "author": "Authenticai Wellness",
        "category": "environment",
        "theme": "advocacy"
    },
    {
        "id": "insp_13",
        "quote": "When you can't change the weather, change your response. Indoor wellness is still wellness.",
        "author": "Authenticai Wellness",
        "category": "empowerment",
        "theme": "adaptability"
    },
    {
        "id": "insp_14",
        "quote": "Your body is always speaking. Learn its language through mindful awareness and gentle attention.",
        "author": "Authenticai Wellness",
        "category": "mindfulness",
        "theme": "body-wisdom"
    },
    {
        "id": "insp_15",
        "quote": "Breathing is life's most fundamental act. Make each breath count by living with intention and awareness.",
        "author": "Authenticai Wellness",
        "category": "breathing",
        "theme": "intention"
    }
]


def get_daily_inspiration() -> Dict[str, Any]:
    """
    Get a random daily inspiration
    Returns a single quote
    """
    return random.choice(INSPIRATIONAL_QUOTES)


def get_inspiration_by_category(category: str) -> Dict[str, Any]:
    """
    Get a random inspiration from a specific category
    Categories: breathing, wellness, environment, mindfulness, empowerment, rest
    """
    filtered = [q for q in INSPIRATIONAL_QUOTES if q["category"] == category]
    if not filtered:
        return get_daily_inspiration()
    return random.choice(filtered)


def get_all_inspirations() -> List[Dict[str, Any]]:
    """
    Get all inspirational quotes
    """
    return INSPIRATIONAL_QUOTES


def get_random_inspirations(count: int = 3) -> List[Dict[str, Any]]:
    """
    Get multiple random inspirations
    """
    return random.sample(INSPIRATIONAL_QUOTES, min(count, len(INSPIRATIONAL_QUOTES)))
