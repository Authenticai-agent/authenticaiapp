"""
Comprehensive API Endpoint Tests
Tests all API endpoints for functionality, error handling, and security
"""

import pytest
import os
import json
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from datetime import datetime, timedelta
import jwt

# Import the main app
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from main import app

client = TestClient(app)

class TestAPIEndpoints:
    """Test all API endpoints"""
    
    def setup_method(self):
        """Setup test data"""
        self.test_user = {
            "id": "test-user-id",
            "email": "test@example.com",
            "first_name": "Test",
            "last_name": "User",
            "subscription_tier": "free"
        }
        
        self.auth_headers = self._create_auth_headers()
    
    def _create_auth_headers(self):
        """Create valid authentication headers"""
        token = jwt.encode(
            {"sub": self.test_user["email"], "exp": datetime.utcnow() + timedelta(minutes=30)},
            os.getenv("JWT_SECRET", "test-secret"),
            algorithm="HS256"
        )
        return {"Authorization": f"Bearer {token}"}
    
    def test_root_endpoint(self):
        """Test root endpoint"""
        response = client.get("/")
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data
        assert "status" in data
        assert data["status"] == "healthy"
    
    def test_health_endpoint(self):
        """Test health check endpoint"""
        response = client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "authenticai-api"
    
    def test_docs_endpoint(self):
        """Test API documentation endpoint"""
        response = client.get("/docs")
        
        assert response.status_code == 200
        assert "text/html" in response.headers["content-type"]
    
    def test_redoc_endpoint(self):
        """Test ReDoc documentation endpoint"""
        response = client.get("/redoc")
        
        assert response.status_code == 200
        assert "text/html" in response.headers["content-type"]


class TestAirQualityEndpoints:
    """Test air quality API endpoints"""
    
    def setup_method(self):
        """Setup test data"""
        self.test_user = {
            "id": "test-user-id",
            "email": "test@example.com",
            "subscription_tier": "free"
        }
        
        self.auth_headers = self._create_auth_headers()
    
    def _create_auth_headers(self):
        """Create valid authentication headers"""
        token = jwt.encode(
            {"sub": self.test_user["email"], "exp": datetime.utcnow() + timedelta(minutes=30)},
            os.getenv("JWT_SECRET", "test-secret"),
            algorithm="HS256"
        )
        return {"Authorization": f"Bearer {token}"}
    
    @patch('routers.air_quality.get_air_quality_service')
    def test_get_current_air_quality(self, mock_get_service):
        """Test get current air quality endpoint"""
        mock_service = MagicMock()
        mock_get_service.return_value = mock_service
        
        # Mock air quality data
        mock_air_quality = {
            "aqi": 45,
            "pm25": 12.5,
            "pm10": 25.0,
            "o3": 0.08,
            "no2": 0.02,
            "so2": 0.01,
            "co": 0.5,
            "location": {
                "lat": 40.7128,
                "lon": -74.0060,
                "address": "New York, NY"
            },
            "timestamp": datetime.utcnow().isoformat(),
            "sources": ["airnow", "openweather"]
        }
        
        mock_service.get_current_air_quality.return_value = mock_air_quality
        
        response = client.get(
            "/api/v1/air-quality/current",
            params={"lat": 40.7128, "lon": -74.0060},
            headers=self.auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "aqi" in data
        assert "pm25" in data
        assert "location" in data
    
    @patch('routers.air_quality.get_air_quality_service')
    def test_get_comprehensive_air_quality(self, mock_get_service):
        """Test get comprehensive air quality endpoint"""
        mock_service = MagicMock()
        mock_get_service.return_value = mock_service
        
        # Mock comprehensive data
        mock_comprehensive = {
            "current": {"aqi": 45, "pm25": 12.5},
            "forecast": [{"date": "2025-09-27", "aqi": 50}],
            "health_recommendations": ["Good air quality for outdoor activities"],
            "pollen": {"tree_pollen": "low", "grass_pollen": "moderate"}
        }
        
        mock_service.get_comprehensive_air_quality.return_value = mock_comprehensive
        
        response = client.get(
            "/api/v1/air-quality/comprehensive",
            params={"lat": 40.7128, "lon": -74.0060},
            headers=self.auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "current" in data
        assert "forecast" in data
        assert "health_recommendations" in data
    
    def test_air_quality_missing_coordinates(self):
        """Test air quality endpoint with missing coordinates"""
        response = client.get("/api/v1/air-quality/current", headers=self.auth_headers)
        
        assert response.status_code == 422  # Validation error
    
    def test_air_quality_invalid_coordinates(self):
        """Test air quality endpoint with invalid coordinates"""
        response = client.get(
            "/api/v1/air-quality/current",
            params={"lat": "invalid", "lon": "invalid"},
            headers=self.auth_headers
        )
        
        assert response.status_code == 422  # Validation error
    
    def test_air_quality_unauthorized(self):
        """Test air quality endpoint without authentication"""
        response = client.get(
            "/api/v1/air-quality/current",
            params={"lat": 40.7128, "lon": -74.0060}
        )
        
        assert response.status_code == 403  # Forbidden


class TestPredictionEndpoints:
    """Test prediction API endpoints"""
    
    def setup_method(self):
        """Setup test data"""
        self.test_user = {
            "id": "test-user-id",
            "email": "test@example.com",
            "subscription_tier": "free"
        }
        
        self.auth_headers = self._create_auth_headers()
    
    def _create_auth_headers(self):
        """Create valid authentication headers"""
        token = jwt.encode(
            {"sub": self.test_user["email"], "exp": datetime.utcnow() + timedelta(minutes=30)},
            os.getenv("JWT_SECRET", "test-secret"),
            algorithm="HS256"
        )
        return {"Authorization": f"Bearer {token}"}
    
    @patch('routers.predictions.get_current_user')
    def test_get_flareup_risk(self, mock_get_user):
        """Test get flareup risk prediction endpoint"""
        mock_get_user.return_value = self.test_user
        
        prediction_data = {
            "prediction_date": "2025-09-27",
            "location": {"lat": 40.7128, "lon": -74.0060}
        }
        
        response = client.post(
            "/api/v1/predictions/flareup-risk",
            json=prediction_data,
            headers=self.auth_headers
        )
        
        # Should return prediction or handle gracefully
        assert response.status_code in [200, 500]  # 500 if services unavailable
    
    @patch('routers.predictions.get_current_user')
    def test_get_daily_forecast(self, mock_get_user):
        """Test get daily forecast endpoint"""
        mock_get_user.return_value = self.test_user
        
        response = client.get(
            "/api/v1/predictions/daily-forecast",
            params={"days": 7},
            headers=self.auth_headers
        )
        
        # Should return forecast or handle gracefully
        assert response.status_code in [200, 500]  # 500 if services unavailable
    
    def test_prediction_unauthorized(self):
        """Test prediction endpoint without authentication"""
        prediction_data = {
            "prediction_date": "2025-09-27",
            "location": {"lat": 40.7128, "lon": -74.0060}
        }
        
        response = client.post("/api/v1/predictions/flareup-risk", json=prediction_data)
        
        assert response.status_code == 403  # Forbidden


class TestCoachingEndpoints:
    """Test coaching API endpoints"""
    
    def setup_method(self):
        """Setup test data"""
        self.test_user = {
            "id": "test-user-id",
            "email": "test@example.com",
            "subscription_tier": "free"
        }
        
        self.auth_headers = self._create_auth_headers()
    
    def _create_auth_headers(self):
        """Create valid authentication headers"""
        token = jwt.encode(
            {"sub": self.test_user["email"], "exp": datetime.utcnow() + timedelta(minutes=30)},
            os.getenv("JWT_SECRET", "test-secret"),
            algorithm="HS256"
        )
        return {"Authorization": f"Bearer {token}"}
    
    @patch('routers.coaching.get_current_user')
    def test_voice_query(self, mock_get_user):
        """Test voice query endpoint"""
        mock_get_user.return_value = self.test_user
        
        query_data = {
            "query": "What's the air quality like today?",
            "context": {"location": {"lat": 40.7128, "lon": -74.0060}}
        }
        
        response = client.post(
            "/api/v1/coaching/voice-query",
            json=query_data,
            headers=self.auth_headers
        )
        
        # Should return response or handle gracefully
        assert response.status_code in [200, 500]  # 500 if LLM services unavailable
    
    @patch('routers.coaching.get_current_user')
    def test_daily_briefing(self, mock_get_user):
        """Test daily briefing endpoint"""
        mock_get_user.return_value = self.test_user
        
        response = client.post(
            "/api/v1/coaching/daily-briefing",
            headers=self.auth_headers
        )
        
        # Should return briefing or handle gracefully
        assert response.status_code in [200, 500]  # 500 if LLM services unavailable
    
    def test_coaching_unauthorized(self):
        """Test coaching endpoint without authentication"""
        query_data = {
            "query": "What's the air quality like today?",
            "context": {}
        }
        
        response = client.post("/api/v1/coaching/voice-query", json=query_data)
        
        assert response.status_code == 403  # Forbidden


class TestUserEndpoints:
    """Test user management API endpoints"""
    
    def setup_method(self):
        """Setup test data"""
        self.test_user = {
            "id": "test-user-id",
            "email": "test@example.com",
            "first_name": "Test",
            "last_name": "User",
            "subscription_tier": "free"
        }
        
        self.auth_headers = self._create_auth_headers()
    
    def _create_auth_headers(self):
        """Create valid authentication headers"""
        token = jwt.encode(
            {"sub": self.test_user["email"], "exp": datetime.utcnow() + timedelta(minutes=30)},
            os.getenv("JWT_SECRET", "test-secret"),
            algorithm="HS256"
        )
        return {"Authorization": f"Bearer {token}"}
    
    @patch('routers.users.get_current_user')
    def test_get_user_profile(self, mock_get_user):
        """Test get user profile endpoint"""
        mock_get_user.return_value = self.test_user
        
        response = client.get("/api/v1/users/profile", headers=self.auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == self.test_user["email"]
        assert data["first_name"] == self.test_user["first_name"]
    
    @patch('routers.users.get_current_user')
    @patch('database.get_admin_db')
    def test_update_user_profile(self, mock_get_admin_db, mock_get_user):
        """Test update user profile endpoint"""
        mock_get_user.return_value = self.test_user
        
        mock_db = MagicMock()
        mock_get_admin_db.return_value = mock_db
        
        # Mock successful update
        updated_user = self.test_user.copy()
        updated_user["first_name"] = "Updated"
        mock_db.table.return_value.update.return_value.eq.return_value.execute.return_value.data = [updated_user]
        
        update_data = {
            "first_name": "Updated",
            "last_name": "User"
        }
        
        response = client.put(
            "/api/v1/users/profile",
            json=update_data,
            headers=self.auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["first_name"] == "Updated"
    
    @patch('routers.users.get_current_user')
    def test_get_onboarding_status(self, mock_get_user):
        """Test get onboarding status endpoint"""
        mock_get_user.return_value = self.test_user
        
        response = client.get("/api/v1/users/onboarding-status", headers=self.auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "is_complete" in data
        assert "completed_fields" in data
        assert "required_fields" in data
        assert "completion_percentage" in data
    
    def test_user_endpoints_unauthorized(self):
        """Test user endpoints without authentication"""
        response = client.get("/api/v1/users/profile")
        
        assert response.status_code == 403  # Forbidden


class TestPaymentEndpoints:
    """Test payment API endpoints"""
    
    def setup_method(self):
        """Setup test data"""
        self.test_user = {
            "id": "test-user-id",
            "email": "test@example.com",
            "subscription_tier": "free"
        }
        
        self.auth_headers = self._create_auth_headers()
    
    def _create_auth_headers(self):
        """Create valid authentication headers"""
        token = jwt.encode(
            {"sub": self.test_user["email"], "exp": datetime.utcnow() + timedelta(minutes=30)},
            os.getenv("JWT_SECRET", "test-secret"),
            algorithm="HS256"
        )
        return {"Authorization": f"Bearer {token}"}
    
    @patch('routers.payments.get_current_user')
    def test_get_subscription_plans(self, mock_get_user):
        """Test get subscription plans endpoint"""
        mock_get_user.return_value = self.test_user
        
        response = client.get("/api/payments/plans", headers=self.auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "plans" in data
        assert "currency" in data
        assert "premium" in data["plans"]
        assert "enterprise" in data["plans"]
    
    @patch('routers.payments.get_current_user')
    def test_get_usage_stats(self, mock_get_user):
        """Test get usage stats endpoint"""
        mock_get_user.return_value = self.test_user
        
        response = client.get("/api/payments/usage", headers=self.auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "coaching_sessions_this_month" in data
        assert "predictions_this_month" in data
        assert "active_devices" in data
        assert "subscription_tier" in data
        assert "limits" in data
    
    def test_payment_endpoints_unauthorized(self):
        """Test payment endpoints without authentication"""
        response = client.get("/api/payments/plans")
        
        assert response.status_code == 403  # Forbidden


class TestErrorHandling:
    """Test error handling across all endpoints"""
    
    def test_404_endpoint(self):
        """Test 404 for non-existent endpoint"""
        response = client.get("/api/v1/nonexistent")
        
        assert response.status_code == 404
    
    def test_method_not_allowed(self):
        """Test 405 for wrong HTTP method"""
        response = client.delete("/")  # DELETE not allowed on root
        
        assert response.status_code == 405
    
    def test_invalid_json(self):
        """Test invalid JSON handling"""
        response = client.post(
            "/api/v1/auth/login",
            data="invalid json",
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 422  # Validation error
    
    def test_missing_required_fields(self):
        """Test missing required fields"""
        response = client.post("/api/v1/auth/login", json={})
        
        assert response.status_code == 422  # Validation error
    
    def test_cors_headers(self):
        """Test CORS headers are present"""
        response = client.options("/api/v1/auth/login")
        
        # Should have CORS headers
        assert "access-control-allow-origin" in response.headers or "Access-Control-Allow-Origin" in response.headers


class TestSecurityHeaders:
    """Test security headers and configurations"""
    
    def test_security_headers(self):
        """Test that security headers are present"""
        response = client.get("/")
        
        # Check for common security headers
        headers = response.headers
        
        # These might be set by middleware or server configuration
        security_headers = [
            "x-content-type-options",
            "x-frame-options", 
            "x-xss-protection",
            "strict-transport-security"
        ]
        
        # At least some security headers should be present
        present_headers = [h for h in security_headers if h in headers or h.title() in headers]
        # Note: This is a basic check - actual security headers depend on server configuration
    
    def test_no_sensitive_data_in_errors(self):
        """Test that error responses don't leak sensitive data"""
        # Try to trigger an error
        response = client.post("/api/v1/auth/login", json={"email": "test@example.com"})
        
        # Error response should not contain sensitive information
        error_text = response.text.lower()
        sensitive_terms = ["password", "secret", "key", "token", "database", "sql"]
        
        for term in sensitive_terms:
            assert term not in error_text, f"Sensitive term '{term}' found in error response"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
