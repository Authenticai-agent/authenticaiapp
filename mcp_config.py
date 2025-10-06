"""
MCP Server Configuration for AuthenticAI Platform
"""

# MCP Server Configuration
MCP_SERVER_NAME = "authenticai-mcp"
MCP_SERVER_VERSION = "1.0.0"

# Backend API Configuration
BACKEND_URL = "http://localhost:8000"
API_VERSION = "v1"

# Available Resources
MCP_RESOURCES = {
    "health": "User health data and metrics",
    "environment": "Environmental conditions and air quality",
    "predictions": "Personal risk predictions and assessments",
    "coaching": "Health recommendations and coaching",
    "gamification": "User progress and achievements",
    "privacy": "Privacy settings and data access"
}

# Available Tools
MCP_TOOLS = {
    "get_health_data": "Get user's health data and metrics",
    "get_environmental_data": "Get environmental conditions for a location",
    "get_risk_prediction": "Get personal health risk prediction",
    "get_recommendations": "Get personalized health recommendations",
    "get_user_progress": "Get user's gamification progress",
    "get_privacy_settings": "Get user's privacy settings",
    "update_health_goal": "Update user's health goals",
    "log_symptom": "Log a health symptom",
    "get_air_quality_forecast": "Get air quality forecast for a location"
}

# AI Model Integration Settings
AI_MODEL_TIMEOUT = 30  # seconds
MAX_REQUESTS_PER_MINUTE = 100
ENABLE_CACHING = True
CACHE_TTL = 300  # 5 minutes

# Security Settings
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://authenticai.app",
    "https://app.authenticai.ai"
]

# Rate Limiting
RATE_LIMIT_REQUESTS = 1000
RATE_LIMIT_WINDOW = 60  # seconds

# Logging Configuration
LOG_LEVEL = "INFO"
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
