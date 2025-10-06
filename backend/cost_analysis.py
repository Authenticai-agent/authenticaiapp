"""
Cost Analysis for Authenticai Heavy User
Detailed breakdown of monthly costs per heavy user
"""

from typing import Dict, Any
import json

def calculate_heavy_user_monthly_cost() -> Dict[str, Any]:
    """
    Calculate total monthly cost for 1 heavy user
    Based on actual system implementation and API usage
    """
    
    # === API COSTS ===
    api_costs = {
        # OpenWeather API (primary air quality + weather)
        "openweather": {
            "calls_per_day": 8,  # Morning, midday, evening, anomaly checks, location changes
            "calls_per_month": 8 * 30,
            "cost_per_1000_calls": 0.15,  # $0.15 per 1000 calls
            "monthly_cost": (8 * 30 / 1000) * 0.15
        },
        
        # Pollen.com API
        "pollen": {
            "calls_per_day": 4,  # Morning briefing, evening reflection, location changes
            "calls_per_month": 4 * 30,
            "cost_per_1000_calls": 0.10,  # Estimated cost
            "monthly_cost": (4 * 30 / 1000) * 0.10
        },
        
        # PurpleAir API (VOCs and hyperlocal data)
        "purpleair": {
            "calls_per_day": 3,  # Comprehensive environmental data calls
            "calls_per_month": 3 * 30,
            "cost_per_1000_calls": 0.00,  # Free API
            "monthly_cost": 0.00
        },
        
        # Geocoding API (location details)
        "geocoding": {
            "calls_per_day": 2,  # Location changes, travel detection
            "calls_per_month": 2 * 30,
            "cost_per_1000_calls": 0.50,  # Google/Nominatim geocoding
            "monthly_cost": (2 * 30 / 1000) * 0.50
        }
    }
    
    # === PROCESSING COSTS ===
    processing_costs = {
        # Premium Lean Engine (XGBoost + SHAP-like calculations)
        "risk_calculations": {
            "calculations_per_day": 10,  # Morning, midday, evening, predictions, anomalies
            "calculations_per_month": 10 * 30,
            "cost_per_calculation": 0.001,  # Very lightweight ML inference
            "monthly_cost": 10 * 30 * 0.001
        },
        
        # Historical data generation (for inactive periods)
        "historical_generation": {
            "days_generated_per_month": 5,  # Occasional inactive periods
            "cost_per_day": 0.002,  # Lightweight data generation
            "monthly_cost": 5 * 0.002
        },
        
        # Template-based NLG (briefings, recommendations)
        "nlg_processing": {
            "generations_per_day": 6,  # Morning, midday, evening, anomalies, education
            "generations_per_month": 6 * 30,
            "cost_per_generation": 0.0005,  # Template-based, very cheap
            "monthly_cost": 6 * 30 * 0.0005
        }
    }
    
    # === STORAGE COSTS ===
    storage_costs = {
        # User data, historical entries, location history
        "database_storage": {
            "data_per_user_mb": 2,  # 30 days of history, location data, preferences
            "cost_per_gb_month": 0.10,  # Database storage cost
            "monthly_cost": (2 / 1000) * 0.10
        },
        
        # Backup and redundancy
        "backup_storage": {
            "backup_size_mb": 1,
            "cost_per_gb_month": 0.05,
            "monthly_cost": (1 / 1000) * 0.05
        }
    }
    
    # === INFRASTRUCTURE COSTS (per user allocation) ===
    infrastructure_costs = {
        # Server compute (FastAPI backend)
        "compute": {
            "cpu_hours_per_month": 2,  # Heavy user server time allocation
            "cost_per_cpu_hour": 0.05,
            "monthly_cost": 2 * 0.05
        },
        
        # Bandwidth (API responses, data transfer)
        "bandwidth": {
            "data_transfer_gb": 0.5,  # JSON responses, environmental data
            "cost_per_gb": 0.10,
            "monthly_cost": 0.5 * 0.10
        }
    }
    
    # === CALCULATE TOTALS ===
    total_api_cost = sum(item["monthly_cost"] for item in api_costs.values())
    total_processing_cost = sum(item["monthly_cost"] for item in processing_costs.values())
    total_storage_cost = sum(item["monthly_cost"] for item in storage_costs.values())
    total_infrastructure_cost = sum(item["monthly_cost"] for item in infrastructure_costs.values())
    
    total_monthly_cost = (
        total_api_cost + 
        total_processing_cost + 
        total_storage_cost + 
        total_infrastructure_cost
    )
    
    # === USAGE BREAKDOWN ===
    usage_breakdown = {
        "daily_interactions": {
            "morning_briefing": 1,
            "midday_checkin": 1,
            "anomaly_alerts": 2,  # Average
            "evening_reflection": 1,
            "education_queries": 2,
            "location_updates": 3,  # Including travel
            "prediction_requests": 1,
            "total_per_day": 11
        },
        "monthly_totals": {
            "api_calls": sum(item["calls_per_month"] for item in api_costs.values()),
            "ml_inferences": processing_costs["risk_calculations"]["calculations_per_month"],
            "data_generations": processing_costs["nlg_processing"]["generations_per_month"],
            "storage_mb": storage_costs["database_storage"]["data_per_user_mb"]
        }
    }
    
    # === COST COMPARISON ===
    comparison = {
        "our_monthly_cost": round(total_monthly_cost, 4),
        "revenue_per_user": 14.99,
        "gross_profit": round(14.99 - total_monthly_cost, 2),
        "profit_margin_percent": round(((14.99 - total_monthly_cost) / 14.99) * 100, 1),
        "cost_as_percent_of_revenue": round((total_monthly_cost / 14.99) * 100, 1)
    }
    
    # === COMPETITIVE ANALYSIS ===
    competitive_costs = {
        "traditional_health_app": {
            "description": "Basic symptom tracking app",
            "monthly_cost": 0.50,
            "features": "Limited, static content"
        },
        "weather_app_premium": {
            "description": "Advanced weather app with air quality",
            "monthly_cost": 1.20,
            "features": "Weather + basic air quality"
        },
        "medical_grade_monitoring": {
            "description": "Professional health monitoring service",
            "monthly_cost": 8.50,
            "features": "Comprehensive but expensive"
        },
        "our_solution": {
            "description": "AI-powered personalized health coaching",
            "monthly_cost": round(total_monthly_cost, 4),
            "features": "Premium experience at ultra-low cost"
        }
    }
    
    return {
        "timestamp": "2025-10-03T17:54:00Z",
        "analysis_type": "Heavy User Monthly Cost",
        "cost_breakdown": {
            "api_costs": {
                "total": round(total_api_cost, 4),
                "details": api_costs
            },
            "processing_costs": {
                "total": round(total_processing_cost, 4),
                "details": processing_costs
            },
            "storage_costs": {
                "total": round(total_storage_cost, 4),
                "details": storage_costs
            },
            "infrastructure_costs": {
                "total": round(total_infrastructure_cost, 4),
                "details": infrastructure_costs
            }
        },
        "usage_breakdown": usage_breakdown,
        "total_monthly_cost": round(total_monthly_cost, 4),
        "financial_analysis": comparison,
        "competitive_comparison": competitive_costs,
        "cost_efficiency_insights": [
            f"Total cost per heavy user: ${total_monthly_cost:.4f}/month",
            f"Gross profit per user: ${14.99 - total_monthly_cost:.2f}/month",
            f"Profit margin: {((14.99 - total_monthly_cost) / 14.99) * 100:.1f}%",
            f"Cost is only {(total_monthly_cost / 14.99) * 100:.1f}% of revenue",
            f"Can support {int(14.99 / total_monthly_cost)} heavy users per $14.99 revenue"
        ],
        "scalability_analysis": {
            "users_1000": {
                "monthly_cost": round(total_monthly_cost * 1000, 2),
                "monthly_revenue": 14990,
                "monthly_profit": round(14990 - (total_monthly_cost * 1000), 2)
            },
            "users_10000": {
                "monthly_cost": round(total_monthly_cost * 10000, 2),
                "monthly_revenue": 149900,
                "monthly_profit": round(149900 - (total_monthly_cost * 10000), 2)
            },
            "users_100000": {
                "monthly_cost": round(total_monthly_cost * 100000, 2),
                "monthly_revenue": 1499000,
                "monthly_profit": round(1499000 - (total_monthly_cost * 100000), 2)
            }
        }
    }

if __name__ == "__main__":
    analysis = calculate_heavy_user_monthly_cost()
    print(json.dumps(analysis, indent=2))
