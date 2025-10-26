from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class SubscriptionTier(str, Enum):
    FREE = "free"
    PREMIUM = "premium"
    ENTERPRISE = "enterprise"

class RiskLevel(str, Enum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    VERY_HIGH = "very_high"

class DeviceType(str, Enum):
    AIR_PURIFIER = "air_purifier"
    HUMIDIFIER = "humidifier"
    DEHUMIDIFIER = "dehumidifier"
    HVAC = "hvac"
    SMART_PLUG = "smart_plug"

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    age_range: Optional[str] = None  # "18-25", "26-35", "36-50", "51-65", "65+"
    location: Optional[Dict[str, Any]] = None
    environmental_sensitivities: Optional[List[str]] = []  # "pollen", "dust", "pollution", "smoke", "mold", "pet_dander"
    respiratory_sensitivity: Optional[str] = None  # "none", "low", "moderate", "high"
    known_triggers: Optional[List[str]] = []  # Environmental triggers, not medical
    uses_air_purifier: Optional[bool] = False
    uses_rescue_inhaler: Optional[bool] = False  # Wellness indicator, not medication tracking
    outdoor_activity_level: Optional[str] = None  # "sedentary", "moderate", "active", "very_active"
    household_info: Optional[Dict[str, Any]] = None
    avatar: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    age_range: Optional[str] = None
    location: Optional[Dict[str, Any]] = None
    environmental_sensitivities: Optional[List[str]] = None
    respiratory_sensitivity: Optional[str] = None
    known_triggers: Optional[List[str]] = None
    uses_air_purifier: Optional[bool] = None
    uses_rescue_inhaler: Optional[bool] = None
    outdoor_activity_level: Optional[str] = None
    household_info: Optional[Dict[str, Any]] = None
    avatar: Optional[str] = None  # Can be preset ID or base64 image

class User(UserBase):
    id: str
    subscription_tier: SubscriptionTier
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Authentication schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# Air Quality schemas
class AirQualityData(BaseModel):
    location: Dict[str, Any]
    timestamp: datetime
    aqi: Optional[int] = None
    pm25: Optional[float] = None
    pm10: Optional[float] = None
    ozone: Optional[float] = None
    no2: Optional[float] = None
    so2: Optional[float] = None
    co: Optional[float] = None
    source: str

class AirQualityResponse(AirQualityData):
    id: str
    created_at: datetime

# Weather schemas
class WeatherData(BaseModel):
    location: Dict[str, Any]
    timestamp: datetime
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    pressure: Optional[float] = None
    wind_speed: Optional[float] = None
    wind_direction: Optional[float] = None
    precipitation: Optional[float] = None
    uv_index: Optional[float] = None
    source: str

class WeatherResponse(WeatherData):
    id: str
    created_at: datetime

# Pollen schemas
class PollenData(BaseModel):
    location: Dict[str, Any]
    timestamp: datetime
    tree_pollen: Optional[int] = None
    grass_pollen: Optional[int] = None
    weed_pollen: Optional[int] = None
    mold_spores: Optional[int] = None
    total_pollen: Optional[int] = None
    source: str

class PollenResponse(PollenData):
    id: str
    created_at: datetime

# Symptom schemas
class SymptomEntry(BaseModel):
    symptoms: Dict[str, Any]
    severity: int
    notes: Optional[str] = None

    @validator('severity')
    def validate_severity(cls, v):
        if not 1 <= v <= 10:
            raise ValueError('Severity must be between 1 and 10')
        return v

class SymptomResponse(SymptomEntry):
    id: str
    user_id: str
    timestamp: datetime
    created_at: datetime

# Prediction schemas
class PredictionRequest(BaseModel):
    prediction_date: datetime
    location: Optional[Dict[str, Any]] = None

class Prediction(BaseModel):
    user_id: str
    prediction_date: datetime
    risk_score: float
    risk_level: RiskLevel
    factors: Dict[str, Any]
    recommendations: List[Dict[str, Any]]
    model_version: str

    @validator('risk_score')
    def validate_risk_score(cls, v):
        if not 0 <= v <= 100:
            raise ValueError('Risk score must be between 0 and 100')
        return v

class PredictionResponse(Prediction):
    id: str
    created_at: datetime

# Smart Home schemas
class SmartDeviceBase(BaseModel):
    device_type: DeviceType
    device_name: str
    device_id: str
    platform: str
    settings: Optional[Dict[str, Any]] = {}

class SmartDeviceCreate(SmartDeviceBase):
    pass

class SmartDeviceUpdate(BaseModel):
    device_name: Optional[str] = None
    settings: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None

class SmartDevice(SmartDeviceBase):
    id: str
    user_id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

# Coaching schemas
class CoachingSessionCreate(BaseModel):
    session_type: str
    content: str
    delivery_method: Optional[str] = None

class CoachingSession(CoachingSessionCreate):
    id: str
    user_id: str
    delivered_at: Optional[datetime] = None
    user_feedback: Optional[int] = None
    created_at: datetime

# Alexa schemas
class AlexaRequest(BaseModel):
    version: str
    session: Dict[str, Any]
    context: Dict[str, Any]
    request: Dict[str, Any]

class AlexaResponse(BaseModel):
    version: str = "1.0"
    response: Dict[str, Any]
    sessionAttributes: Optional[Dict[str, Any]] = None

# Voice Query schemas
class VoiceQuery(BaseModel):
    query: str
    user_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None

class VoiceResponse(BaseModel):
    response_text: str
    response_type: str
    additional_data: Optional[Dict[str, Any]] = None

# Subscription schemas
class SubscriptionCreate(BaseModel):
    plan_type: str
    payment_method_id: str

class Subscription(BaseModel):
    id: str
    user_id: str
    stripe_customer_id: Optional[str] = None
    stripe_subscription_id: Optional[str] = None
    plan_type: str
    status: str
    current_period_start: Optional[datetime] = None
    current_period_end: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
