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

def test_register_user(mock_supabase):
    """Test user registration"""
    # Mock successful user creation
    mock_supabase.table.return_value.insert.return_value.execute.return_value.data = [
        {"id": "test-user-id", "email": "test@example.com"}
    ]
    
    response = client.post("/api/v1/auth/register", json={
        "email": "test@example.com",
        "password": "testpassword123",
        "full_name": "Test User"
    })
    
    assert response.status_code == 201
    assert "access_token" in response.json()

def test_login_user(mock_supabase):
    """Test user login"""
    # Mock user lookup
    mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = {
        "id": "test-user-id",
        "email": "test@example.com",
        "hashed_password": "$2b$12$test_hashed_password"
    }
    
    with patch('routers.auth.verify_password', return_value=True):
        response = client.post("/api/v1/auth/login", json={
            "email": "test@example.com",
            "password": "testpassword123"
        })
    
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_invalid_login(mock_supabase):
    """Test login with invalid credentials"""
    # Mock user not found
    mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.side_effect = Exception("User not found")
    
    response = client.post("/api/v1/auth/login", json={
        "email": "nonexistent@example.com",
        "password": "wrongpassword"
    })
    
    assert response.status_code == 401

def test_protected_route_without_token():
    """Test accessing protected route without token"""
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401

def test_protected_route_with_invalid_token():
    """Test accessing protected route with invalid token"""
    response = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer invalid_token"})
    assert response.status_code == 401
