from fastapi import APIRouter, HTTPException
from database import get_db
import httpx
import os
from datetime import datetime

router = APIRouter()

@router.get("/health")
async def health_check():
    """Simple health check endpoint for Railway deployment"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }

@router.get("/health/detailed")
async def detailed_health_check():
    """Detailed health check endpoint for monitoring"""
    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "services": {}
    }
    
    # Check database connection
    try:
        db = get_db()
        response = db.table("users").select("id").limit(1).execute()
        health_status["services"]["database"] = "healthy"
    except Exception as e:
        health_status["services"]["database"] = f"unhealthy: {str(e)}"
        health_status["status"] = "degraded"
    
    # Check Redis connection (if configured)
    redis_url = os.getenv("REDIS_URL")
    if redis_url:
        try:
            import redis
            r = redis.from_url(redis_url)
            r.ping()
            health_status["services"]["redis"] = "healthy"
        except Exception as e:
            health_status["services"]["redis"] = f"unhealthy: {str(e)}"
            health_status["status"] = "degraded"
    
    # Check external API connectivity
    try:
        async with httpx.AsyncClient() as client:
            # Test OpenWeatherMap API
            if os.getenv("OPENWEATHER_API_KEY"):
                response = await client.get(
                    "https://api.openweathermap.org/data/2.5/weather",
                    params={
                        "q": "London",
                        "appid": os.getenv("OPENWEATHER_API_KEY")
                    },
                    timeout=5.0
                )
                if response.status_code == 200:
                    health_status["services"]["openweather"] = "healthy"
                else:
                    health_status["services"]["openweather"] = f"unhealthy: HTTP {response.status_code}"
                    health_status["status"] = "degraded"
    except Exception as e:
        health_status["services"]["external_apis"] = f"unhealthy: {str(e)}"
        health_status["status"] = "degraded"
    
    if health_status["status"] == "degraded":
        raise HTTPException(status_code=503, detail=health_status)
    
    return health_status

@router.get("/ready")
async def readiness_check():
    """Readiness check for Kubernetes deployments"""
    try:
        # Check if all critical services are available
        db = get_db()
        response = db.table("users").select("id").limit(1).execute()
        return {"status": "ready", "timestamp": datetime.utcnow().isoformat()}
    except Exception as e:
        raise HTTPException(status_code=503, detail={"status": "not ready", "error": str(e)})

@router.get("/live")
async def liveness_check():
    """Liveness check for Kubernetes deployments"""
    return {"status": "alive", "timestamp": datetime.utcnow().isoformat()}
