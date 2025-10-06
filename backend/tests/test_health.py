import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import sys
import os

# Add the backend directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from main import app

client = TestClient(app)

@pytest.fixture
def mock_supabase():
    with patch('database.supabase') as mock:
        yield mock

def test_health_check_healthy(mock_supabase):
    """Test health check when all services are healthy"""
    # Mock successful database connection
    mock_supabase.table.return_value.select.return_value.limit.return_value.execute.return_value = MagicMock()
    
    with patch('httpx.AsyncClient') as mock_client:
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_client.return_value.__aenter__.return_value.get.return_value = mock_response
        
        response = client.get("/health")
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "timestamp" in data
    assert "services" in data

def test_health_check_degraded(mock_supabase):
    """Test health check when database is unhealthy"""
    # Mock database connection failure
    mock_supabase.table.return_value.select.return_value.limit.return_value.execute.side_effect = Exception("Database error")
    
    response = client.get("/health")
    
    assert response.status_code == 503
    data = response.json()
    assert "unhealthy" in data["detail"]["services"]["database"]

def test_readiness_check():
    """Test readiness probe"""
    with patch('database.supabase') as mock_supabase:
        mock_supabase.table.return_value.select.return_value.limit.return_value.execute.return_value = MagicMock()
        
        response = client.get("/ready")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ready"

def test_liveness_check():
    """Test liveness probe"""
    response = client.get("/live")
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "alive"
