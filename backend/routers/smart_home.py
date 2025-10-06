from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import uuid

# Define schemas inline
from pydantic import BaseModel

class SmartHomeDevice(BaseModel):
    id: str
    name: str
    type: str
    status: str
    location: str
    last_updated: datetime
    data: Optional[Dict[str, Any]] = None

router = APIRouter()

@router.get("/devices", response_model=List[SmartHomeDevice])
async def get_devices():
    """Get smart home devices"""
    try:
        # Demo smart home devices - in production, this would integrate with real IoT devices
        # via APIs like Google Home, Amazon Alexa, Apple HomeKit, etc.
        devices = [
            SmartHomeDevice(
                id=str(uuid.uuid4()),
                name="Living Room Air Purifier",
                type="air_purifier",
                status="active",
                location="living_room",
                last_updated=datetime.utcnow(),
                data={
                    "pm25_reduction": 85,
                    "filter_life": 78,
                    "fan_speed": "auto",
                    "air_quality": "good"
                }
            ),
            SmartHomeDevice(
                id=str(uuid.uuid4()),
                name="Bedroom Humidity Monitor",
                type="humidity_sensor",
                status="active", 
                location="bedroom",
                last_updated=datetime.utcnow(),
                data={
                    "humidity": 45,
                    "temperature": 22.5,
                    "battery": 92
                }
            ),
            SmartHomeDevice(
                id=str(uuid.uuid4()),
                name="HVAC System",
                type="hvac",
                status="active",
                location="whole_house",
                last_updated=datetime.utcnow(),
                data={
                    "temperature": 21.0,
                    "mode": "auto",
                    "filter_status": "good",
                    "energy_efficiency": 87
                }
            )
        ]
        
        return devices
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch smart home devices: {str(e)}"
        )

@router.post("/devices/{device_id}/control")
async def control_device(device_id: str, command: Dict[str, Any]):
    """Control a smart home device"""
    try:
        return {
            "device_id": device_id,
            "command": command,
            "status": "success",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to control device: {str(e)}"
        )

@router.get("/automation/rules")
async def get_automation_rules():
    """Get automation rules"""
    try:
        rules = [
            {
                "id": str(uuid.uuid4()),
                "name": "High Pollution Auto-Purify",
                "trigger": "pm25 > 35",
                "action": "turn_on_air_purifier",
                "status": "active",
                "last_triggered": datetime.utcnow() - timedelta(hours=2)
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Sleep Mode Humidity Control",
                "trigger": "time = 22:00",
                "action": "set_humidity_45_percent",
                "status": "active",
                "last_triggered": datetime.utcnow() - timedelta(hours=8)
            }
        ]
        
        return {"rules": rules}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch automation rules: {str(e)}"
        )
