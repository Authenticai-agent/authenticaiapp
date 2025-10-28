"""
Daily Affirmations Library
30 powerful affirmations for health, wellness, and respiratory health
Users should repeat each affirmation 5 times vocally for maximum impact
"""

from typing import Dict, Any
from datetime import datetime

DAILY_AFFIRMATIONS = [
    {
        "id": "aff_1",
        "affirmation": "My lungs are strong, healthy, and filled with clean, healing air.",
        "category": "breathing",
        "focus": "lung health"
    },
    {
        "id": "aff_2",
        "affirmation": "I choose environments that support my respiratory wellness.",
        "category": "empowerment",
        "focus": "environment"
    },
    {
        "id": "aff_3",
        "affirmation": "Every breath I take nourishes my body and calms my mind.",
        "category": "mindfulness",
        "focus": "breath awareness"
    },
    {
        "id": "aff_4",
        "affirmation": "I am in control of my health, and I make wise choices daily.",
        "category": "empowerment",
        "focus": "self-control"
    },
    {
        "id": "aff_5",
        "affirmation": "My body knows how to heal, and I trust its wisdom.",
        "category": "healing",
        "focus": "self-trust"
    },
    {
        "id": "aff_6",
        "affirmation": "I deserve clean air, rest, and vibrant health.",
        "category": "self-worth",
        "focus": "deserving"
    },
    {
        "id": "aff_7",
        "affirmation": "I listen to my body's signals and respond with compassion.",
        "category": "mindfulness",
        "focus": "body awareness"
    },
    {
        "id": "aff_8",
        "affirmation": "Each day, my respiratory health improves and strengthens.",
        "category": "healing",
        "focus": "progress"
    },
    {
        "id": "aff_9",
        "affirmation": "I am grateful for every breath that sustains my life.",
        "category": "gratitude",
        "focus": "appreciation"
    },
    {
        "id": "aff_10",
        "affirmation": "I release stress with every exhale and welcome peace with every inhale.",
        "category": "stress relief",
        "focus": "letting go"
    },
    {
        "id": "aff_11",
        "affirmation": "My airways are clear, open, and functioning perfectly.",
        "category": "breathing",
        "focus": "airway health"
    },
    {
        "id": "aff_12",
        "affirmation": "I prioritize my health because I am worth it.",
        "category": "self-worth",
        "focus": "priority"
    },
    {
        "id": "aff_13",
        "affirmation": "I am resilient, strong, and capable of overcoming any challenge.",
        "category": "empowerment",
        "focus": "resilience"
    },
    {
        "id": "aff_14",
        "affirmation": "Rest is productive, and I honor my body's need for recovery.",
        "category": "rest",
        "focus": "recovery"
    },
    {
        "id": "aff_15",
        "affirmation": "I breathe deeply, fully, and freely.",
        "category": "breathing",
        "focus": "breath capacity"
    },
    {
        "id": "aff_16",
        "affirmation": "My health journey is unique, and I celebrate every small victory.",
        "category": "self-compassion",
        "focus": "progress"
    },
    {
        "id": "aff_17",
        "affirmation": "I am surrounded by healing energy and supportive people.",
        "category": "support",
        "focus": "community"
    },
    {
        "id": "aff_18",
        "affirmation": "I trust my body to guide me toward wellness.",
        "category": "healing",
        "focus": "body wisdom"
    },
    {
        "id": "aff_19",
        "affirmation": "Every cell in my body vibrates with health and vitality.",
        "category": "vitality",
        "focus": "cellular health"
    },
    {
        "id": "aff_20",
        "affirmation": "I am patient with my healing process and trust divine timing.",
        "category": "patience",
        "focus": "timing"
    },
    {
        "id": "aff_21",
        "affirmation": "Clean air is my birthright, and I advocate for it.",
        "category": "empowerment",
        "focus": "advocacy"
    },
    {
        "id": "aff_22",
        "affirmation": "I release fear and embrace confidence in my body's abilities.",
        "category": "courage",
        "focus": "confidence"
    },
    {
        "id": "aff_23",
        "affirmation": "My immune system is strong and protects me perfectly.",
        "category": "immunity",
        "focus": "protection"
    },
    {
        "id": "aff_24",
        "affirmation": "I am worthy of vibrant health and abundant energy.",
        "category": "self-worth",
        "focus": "worthiness"
    },
    {
        "id": "aff_25",
        "affirmation": "I choose thoughts that support my healing and wellbeing.",
        "category": "mindfulness",
        "focus": "thought patterns"
    },
    {
        "id": "aff_26",
        "affirmation": "My breath connects me to life, peace, and infinite possibility.",
        "category": "spiritual",
        "focus": "connection"
    },
    {
        "id": "aff_27",
        "affirmation": "I am becoming healthier, stronger, and more vibrant every day.",
        "category": "growth",
        "focus": "transformation"
    },
    {
        "id": "aff_28",
        "affirmation": "I honor my body by giving it rest, nourishment, and clean air.",
        "category": "self-care",
        "focus": "honoring"
    },
    {
        "id": "aff_29",
        "affirmation": "I am safe, supported, and breathing with ease.",
        "category": "safety",
        "focus": "security"
    },
    {
        "id": "aff_30",
        "affirmation": "My wellness journey inspires others to prioritize their health too.",
        "category": "inspiration",
        "focus": "leadership"
    }
]


def get_daily_affirmation() -> Dict[str, Any]:
    """
    Get today's affirmation based on the day of the month (1-30)
    Cycles through all 30 affirmations monthly
    """
    day_of_month = datetime.now().day
    # Use modulo to handle months with 31 days
    index = (day_of_month - 1) % 30
    
    affirmation = DAILY_AFFIRMATIONS[index]
    
    return {
        "affirmation": affirmation,
        "instruction": "Repeat this affirmation 5 times out loud for maximum impact. Speak with conviction and feel the words resonate in your body.",
        "day": day_of_month,
        "repetitions": 5,
        "tip": "Say it in front of a mirror, place your hand on your heart, and truly believe what you're saying."
    }


def get_all_affirmations() -> list:
    """Get all 30 affirmations"""
    return DAILY_AFFIRMATIONS
