"""
Historical Air Quality Data API
Stores and retrieves historical air quality data for trend analysis
"""
from fastapi import APIRouter, HTTPException, Depends, Query, status
from typing import List, Dict, Any
from datetime import datetime, timedelta
import uuid

from models.schemas import (
    AirQualityHistory,
    AirQualityHistoryCreate,
    User
)
from utils.auth_utils import get_current_user
from database import get_db
from utils.logger import setup_logger

router = APIRouter()
logger = setup_logger()

@router.post("/history/snapshot", status_code=status.HTTP_201_CREATED)
async def create_daily_snapshot(
    snapshot: AirQualityHistoryCreate,
    current_user: User = Depends(get_current_user)
):
    """
    Store a daily air quality snapshot
    Typically called once per day (e.g., at 7 AM) for each location
    """
    db = get_db()
    
    try:
        # Check if snapshot already exists for this date and location
        existing = db.table("air_quality_history")\
            .select("id")\
            .eq("user_id", current_user.id)\
            .eq("date", snapshot.date)\
            .eq("location_name", snapshot.location_name)\
            .execute()
        
        if existing.data:
            # Update existing snapshot
            update_data = {
                **snapshot.dict(),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            result = db.table("air_quality_history")\
                .update(update_data)\
                .eq("id", existing.data[0]["id"])\
                .execute()
            
            logger.info(f"Updated AQ snapshot for user {current_user.id}, location {snapshot.location_name}, date {snapshot.date}")
            return result.data[0]
        else:
            # Create new snapshot
            snapshot_data = {
                "id": str(uuid.uuid4()),
                "user_id": current_user.id,
                **snapshot.dict(),
                "created_at": datetime.utcnow().isoformat()
            }
            
            result = db.table("air_quality_history").insert(snapshot_data).execute()
            
            if not result.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to create snapshot"
                )
            
            logger.info(f"Created AQ snapshot for user {current_user.id}, location {snapshot.location_name}, date {snapshot.date}")
            return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating AQ snapshot: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create snapshot"
        )


@router.get("/history", response_model=List[AirQualityHistory])
async def get_history(
    location_name: str = Query(None, description="Filter by location name"),
    days: int = Query(30, description="Number of days to retrieve (max 90)"),
    current_user: User = Depends(get_current_user)
):
    """
    Get historical air quality data for the user
    Returns up to 90 days of data
    """
    db = get_db()
    
    try:
        # Limit days to reasonable range
        days = min(days, 90)
        
        # Calculate start date
        start_date = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')
        
        # Build query
        query = db.table("air_quality_history")\
            .select("*")\
            .eq("user_id", current_user.id)\
            .gte("date", start_date)\
            .order("date", desc=True)
        
        # Filter by location if specified
        if location_name:
            query = query.eq("location_name", location_name)
        
        result = query.execute()
        
        logger.info(f"Retrieved {len(result.data)} historical records for user {current_user.id}")
        return result.data
        
    except Exception as e:
        logger.error(f"Error fetching history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch history"
        )


@router.get("/history/trends")
async def get_trends(
    location_name: str = Query(None, description="Filter by location name"),
    days: int = Query(30, description="Number of days to analyze (max 90)"),
    current_user: User = Depends(get_current_user)
):
    """
    Analyze historical trends and provide insights
    """
    db = get_db()
    
    try:
        # Limit days to reasonable range
        days = min(days, 90)
        
        # Calculate start date
        start_date = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')
        
        # Build query
        query = db.table("air_quality_history")\
            .select("*")\
            .eq("user_id", current_user.id)\
            .gte("date", start_date)\
            .order("date")
        
        # Filter by location if specified
        if location_name:
            query = query.eq("location_name", location_name)
        
        result = query.execute()
        
        if not result.data or len(result.data) < 2:
            return {
                "message": "Not enough data for trend analysis",
                "days_available": len(result.data) if result.data else 0,
                "trends": None
            }
        
        # Calculate trends
        data = result.data
        aqi_values = [d['aqi'] for d in data if d['aqi'] is not None]
        pm25_values = [d['pm25'] for d in data if d['pm25'] is not None]
        
        if not aqi_values:
            return {
                "message": "No valid data for trend analysis",
                "trends": None
            }
        
        # Calculate averages and trends
        avg_aqi = sum(aqi_values) / len(aqi_values)
        avg_pm25 = sum(pm25_values) / len(pm25_values) if pm25_values else 0
        
        # Compare first half vs second half
        mid_point = len(aqi_values) // 2
        first_half_avg = sum(aqi_values[:mid_point]) / mid_point if mid_point > 0 else 0
        second_half_avg = sum(aqi_values[mid_point:]) / (len(aqi_values) - mid_point) if (len(aqi_values) - mid_point) > 0 else 0
        
        trend_direction = "improving" if second_half_avg < first_half_avg else "worsening" if second_half_avg > first_half_avg else "stable"
        trend_percentage = abs((second_half_avg - first_half_avg) / first_half_avg * 100) if first_half_avg > 0 else 0
        
        # Find best and worst days
        best_day = min(data, key=lambda x: x['aqi'] if x['aqi'] is not None else float('inf'))
        worst_day = max(data, key=lambda x: x['aqi'] if x['aqi'] is not None else 0)
        
        # Count good vs bad days
        good_days = len([d for d in data if d['aqi'] is not None and d['aqi'] <= 50])
        moderate_days = len([d for d in data if d['aqi'] is not None and 51 <= d['aqi'] <= 100])
        unhealthy_days = len([d for d in data if d['aqi'] is not None and d['aqi'] > 100])
        
        return {
            "period": {
                "start_date": start_date,
                "end_date": datetime.now().strftime('%Y-%m-%d'),
                "days_analyzed": len(data)
            },
            "averages": {
                "aqi": round(avg_aqi, 1),
                "pm25": round(avg_pm25, 1)
            },
            "trend": {
                "direction": trend_direction,
                "percentage": round(trend_percentage, 1),
                "message": f"Air quality {trend_direction} by {round(trend_percentage, 1)}% over the period"
            },
            "best_day": {
                "date": best_day['date'],
                "aqi": best_day['aqi'],
                "pm25": best_day['pm25']
            },
            "worst_day": {
                "date": worst_day['date'],
                "aqi": worst_day['aqi'],
                "pm25": worst_day['pm25']
            },
            "day_distribution": {
                "good": good_days,
                "moderate": moderate_days,
                "unhealthy": unhealthy_days,
                "good_percentage": round(good_days / len(data) * 100, 1) if data else 0
            },
            "location_name": location_name
        }
        
    except Exception as e:
        logger.error(f"Error analyzing trends: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to analyze trends"
        )


@router.get("/history/export")
async def export_history(
    location_name: str = Query(None, description="Filter by location name"),
    days: int = Query(30, description="Number of days to export (max 90)"),
    current_user: User = Depends(get_current_user)
):
    """
    Export historical data as CSV
    """
    db = get_db()
    
    try:
        # Limit days to reasonable range
        days = min(days, 90)
        
        # Calculate start date
        start_date = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')
        
        # Build query
        query = db.table("air_quality_history")\
            .select("*")\
            .eq("user_id", current_user.id)\
            .gte("date", start_date)\
            .order("date")
        
        # Filter by location if specified
        if location_name:
            query = query.eq("location_name", location_name)
        
        result = query.execute()
        
        if not result.data:
            return {
                "message": "No data available for export",
                "csv": ""
            }
        
        # Generate CSV
        csv_lines = ["Date,Location,AQI,PM2.5,PM10,Ozone,NO2,SO2,CO"]
        
        for record in result.data:
            csv_lines.append(
                f"{record['date']},{record['location_name']},{record['aqi']},"
                f"{record['pm25']},{record.get('pm10', '')},"
                f"{record.get('ozone', '')},{record.get('no2', '')},"
                f"{record.get('so2', '')},{record.get('co', '')}"
            )
        
        csv_content = "\n".join(csv_lines)
        
        return {
            "message": f"Exported {len(result.data)} records",
            "csv": csv_content,
            "filename": f"air_quality_history_{start_date}_to_{datetime.now().strftime('%Y-%m-%d')}.csv"
        }
        
    except Exception as e:
        logger.error(f"Error exporting history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to export history"
        )


@router.delete("/history", status_code=status.HTTP_204_NO_CONTENT)
async def delete_old_history(
    days_to_keep: int = Query(90, description="Keep data newer than this many days"),
    current_user: User = Depends(get_current_user)
):
    """
    Delete historical data older than specified days
    Useful for managing storage
    """
    db = get_db()
    
    try:
        # Calculate cutoff date
        cutoff_date = (datetime.now() - timedelta(days=days_to_keep)).strftime('%Y-%m-%d')
        
        result = db.table("air_quality_history")\
            .delete()\
            .eq("user_id", current_user.id)\
            .lt("date", cutoff_date)\
            .execute()
        
        deleted_count = len(result.data) if result.data else 0
        logger.info(f"Deleted {deleted_count} old history records for user {current_user.id}")
        
        return None
        
    except Exception as e:
        logger.error(f"Error deleting old history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete old history"
        )
