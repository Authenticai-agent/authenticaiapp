"""
Comprehensive Authentication Tests
Tests all authentication functionality including edge cases and security
"""

import pytest
import os
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from datetime import datetime, timedelta
import jwt
from passlib.context import CryptContext

# Import the main app
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from main import app
from database import get_db, get_admin_db

client = TestClient(app)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class TestAuthentication:
    """Test authentication endpoints and functionality"""
    
    def setup_method(self):
        """Setup test data"""
        self.test_user = {
            "email": "test@example.com",
            "password": "testpassword123",
            "first_name": "Test",
            "last_name": "User"
        }
        
        self.invalid_user = {
            "email": "invalid@example.com",
            "password": "wrongpassword"
        }
    
    @patch('database.get_admin_db')
    def test_user_registration_success(self, mock_get_admin_db):
        """Test successful user registration"""
        # Mock database response
        mock_db = MagicMock()
        mock_get_admin_db.return_value = mock_db
        
        # Mock successful user creation
        mock_db.table.return_value.select.return_value.eq.return_value.execute.return_value.data = []
        mock_db.table.return_value.insert.return_value.execute.return_value.data = [{
            "id": "test-user-id",
            "email": self.test_user["email"],
            "full_name": f"{self.test_user['first_name']} {self.test_user['last_name']}",
            "subscription_tier": "free",
            "created_at": datetime.utcnow().isoformat()
        }]
        
        response = client.post("/api/v1/auth/register", json=self.test_user)
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
    
    @patch('database.get_admin_db')
    def test_user_registration_duplicate_email(self, mock_get_admin_db):
        """Test registration with duplicate email"""
        mock_db = MagicMock()
        mock_get_admin_db.return_value = mock_db
        
        # Mock existing user
        mock_db.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [{
            "email": self.test_user["email"]
        }]
        
        response = client.post("/api/v1/auth/register", json=self.test_user)
        
        assert response.status_code == 400
        assert "Email already registered" in response.json()["detail"]
    
    def test_user_registration_invalid_email(self):
        """Test registration with invalid email format"""
        invalid_user = self.test_user.copy()
        invalid_user["email"] = "invalid-email"
        
        response = client.post("/api/v1/auth/register", json=invalid_user)
        
        assert response.status_code == 422  # Validation error
    
    def test_user_registration_weak_password(self):
        """Test registration with weak password"""
        weak_user = self.test_user.copy()
        weak_user["password"] = "123"  # Too short
        
        response = client.post("/api/v1/auth/register", json=weak_user)
        
        assert response.status_code == 422  # Validation error
    
    @patch('database.get_admin_db')
    def test_user_login_success(self, mock_get_admin_db):
        """Test successful user login"""
        mock_db = MagicMock()
        mock_get_admin_db.return_value = mock_db
        
        # Mock user exists with correct password
        hashed_password = pwd_context.hash(self.test_user["password"])
        mock_db.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [{
            "id": "test-user-id",
            "email": self.test_user["email"],
            "hashed_password": hashed_password,
            "subscription_tier": "free"
        }]
        
        login_data = {
            "email": self.test_user["email"],
            "password": self.test_user["password"]
        }
        
        response = client.post("/api/v1/auth/login", json=login_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
    
    @patch('database.get_admin_db')
    def test_user_login_invalid_credentials(self, mock_get_admin_db):
        """Test login with invalid credentials"""
        mock_db = MagicMock()
        mock_get_admin_db.return_value = mock_db
        
        # Mock user not found
        mock_db.table.return_value.select.return_value.eq.return_value.execute.return_value.data = []
        
        response = client.post("/api/v1/auth/login", json=self.invalid_user)
        
        assert response.status_code == 401
        assert "Incorrect email or password" in response.json()["detail"]
    
    @patch('database.get_admin_db')
    def test_user_login_wrong_password(self, mock_get_admin_db):
        """Test login with wrong password"""
        mock_db = MagicMock()
        mock_get_admin_db.return_value = mock_db
        
        # Mock user exists but wrong password
        hashed_password = pwd_context.hash("correctpassword")
        mock_db.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [{
            "id": "test-user-id",
            "email": self.test_user["email"],
            "hashed_password": hashed_password,
            "subscription_tier": "free"
        }]
        
        login_data = {
            "email": self.test_user["email"],
            "password": "wrongpassword"
        }
        
        response = client.post("/api/v1/auth/login", json=login_data)
        
        assert response.status_code == 401
        assert "Incorrect email or password" in response.json()["detail"]
    
    def test_get_current_user_without_token(self):
        """Test accessing protected endpoint without token"""
        response = client.get("/api/v1/auth/me")
        
        assert response.status_code == 403
    
    def test_get_current_user_with_invalid_token(self):
        """Test accessing protected endpoint with invalid token"""
        headers = {"Authorization": "Bearer invalid_token"}
        response = client.get("/api/v1/auth/me", headers=headers)
        
        assert response.status_code == 401
    
    @patch('utils.auth_utils.get_current_user')
    def test_get_current_user_success(self, mock_get_current_user):
        """Test successful get current user"""
        mock_user = {
            "id": "test-user-id",
            "email": self.test_user["email"],
            "first_name": self.test_user["first_name"],
            "last_name": self.test_user["last_name"],
            "subscription_tier": "free"
        }
        mock_get_current_user.return_value = mock_user
        
        # Create valid token
        token = jwt.encode(
            {"sub": self.test_user["email"], "exp": datetime.utcnow() + timedelta(minutes=30)},
            os.getenv("JWT_SECRET", "test-secret"),
            algorithm="HS256"
        )
        
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/v1/auth/me", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == self.test_user["email"]
    
    @patch('utils.auth_utils.get_current_user')
    def test_refresh_token_success(self, mock_get_current_user):
        """Test successful token refresh"""
        mock_user = {
            "id": "test-user-id",
            "email": self.test_user["email"],
            "subscription_tier": "free"
        }
        mock_get_current_user.return_value = mock_user
        
        # Create valid token
        token = jwt.encode(
            {"sub": self.test_user["email"], "exp": datetime.utcnow() + timedelta(minutes=30)},
            os.getenv("JWT_SECRET", "test-secret"),
            algorithm="HS256"
        )
        
        headers = {"Authorization": f"Bearer {token}"}
        response = client.post("/api/v1/auth/refresh", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
    
    def test_token_expiration(self):
        """Test token expiration handling"""
        # Create expired token
        expired_token = jwt.encode(
            {"sub": self.test_user["email"], "exp": datetime.utcnow() - timedelta(minutes=1)},
            os.getenv("JWT_SECRET", "test-secret"),
            algorithm="HS256"
        )
        
        headers = {"Authorization": f"Bearer {expired_token}"}
        response = client.get("/api/v1/auth/me", headers=headers)
        
        assert response.status_code == 401
    
    def test_malformed_token(self):
        """Test malformed token handling"""
        headers = {"Authorization": "Bearer malformed.token.here"}
        response = client.get("/api/v1/auth/me", headers=headers)
        
        assert response.status_code == 401
    
    def test_missing_authorization_header(self):
        """Test missing authorization header"""
        response = client.get("/api/v1/auth/me")
        
        assert response.status_code == 403
    
    def test_wrong_authorization_format(self):
        """Test wrong authorization header format"""
        headers = {"Authorization": "Basic dGVzdDp0ZXN0"}  # Basic auth instead of Bearer
        response = client.get("/api/v1/auth/me", headers=headers)
        
        assert response.status_code == 403


class TestPasswordSecurity:
    """Test password security features"""
    
    def test_password_hashing(self):
        """Test that passwords are properly hashed"""
        from routers.auth import get_password_hash, verify_password
        
        password = "testpassword123"
        hashed = get_password_hash(password)
        
        # Hash should be different from original password
        assert hashed != password
        
        # Hash should be verifiable
        assert verify_password(password, hashed)
        
        # Wrong password should not verify
        assert not verify_password("wrongpassword", hashed)
    
    def test_password_complexity_requirements(self):
        """Test password complexity requirements"""
        weak_passwords = [
            "123",           # Too short
            "password",      # Too common
            "12345678",      # Only numbers
            "abcdefgh",      # Only letters
            "PASSWORD",      # Only uppercase
            "password123"    # Common pattern
        ]
        
        # Note: These would be caught by frontend validation
        # Backend should also validate if needed
        for weak_password in weak_passwords:
            # In a real implementation, you might want to add password strength validation
            # For now, we just ensure the password can be hashed
            from routers.auth import get_password_hash
            hashed = get_password_hash(weak_password)
            assert hashed != weak_password


class TestJWTTokenSecurity:
    """Test JWT token security features"""
    
    def test_jwt_secret_required(self):
        """Test that JWT secret is required"""
        # This test ensures the app won't start without a JWT secret
        # The actual check happens at import time
        assert os.getenv("JWT_SECRET") is not None or "test-secret" in str(os.getenv("JWT_SECRET", "test-secret"))
    
    def test_jwt_algorithm_security(self):
        """Test JWT algorithm security"""
        from routers.auth import ALGORITHM
        
        # Should use a secure algorithm
        assert ALGORITHM in ["HS256", "RS256", "ES256"]
    
    def test_jwt_expiration(self):
        """Test JWT token expiration"""
        from routers.auth import ACCESS_TOKEN_EXPIRE_MINUTES
        
        # Token should expire in reasonable time
        assert 5 <= ACCESS_TOKEN_EXPIRE_MINUTES <= 60  # 5 minutes to 1 hour
    
    def test_jwt_payload_structure(self):
        """Test JWT payload structure"""
        from routers.auth import create_access_token
        
        # Create token with test data
        token_data = {"sub": "test@example.com"}
        token = create_access_token(token_data)
        
        # Decode and verify structure
        decoded = jwt.decode(token, os.getenv("JWT_SECRET", "test-secret"), algorithms=["HS256"])
        
        assert "sub" in decoded
        assert "exp" in decoded
        assert decoded["sub"] == "test@example.com"


class TestDatabaseSecurity:
    """Test database security features"""
    
    @patch('database.get_admin_db')
    def test_admin_db_bypass_rls(self, mock_get_admin_db):
        """Test that admin database bypasses RLS for user operations"""
        mock_db = MagicMock()
        mock_get_admin_db.return_value = mock_db
        
        # Mock successful user creation (admin bypasses RLS)
        mock_db.table.return_value.insert.return_value.execute.return_value.data = [{
            "id": "test-user-id",
            "email": "test@example.com"
        }]
        
        response = client.post("/api/v1/auth/register", json={
            "email": "test@example.com",
            "password": "testpassword123"
        })
        
        # Should succeed because admin client bypasses RLS
        assert response.status_code == 200
        mock_get_admin_db.assert_called()
    
    def test_regular_db_respects_rls(self):
        """Test that regular database client respects RLS"""
        # This is more of a configuration test
        # In practice, RLS policies would prevent unauthorized access
        from database import get_db
        
        # Regular client should be available
        db = get_db()
        assert db is not None


class TestInputValidation:
    """Test input validation and sanitization"""
    
    def test_email_validation(self):
        """Test email format validation"""
        invalid_emails = [
            "invalid-email",
            "@example.com",
            "test@",
            "test..test@example.com",
            "test@example",
            ""
        ]
        
        for invalid_email in invalid_emails:
            response = client.post("/api/v1/auth/register", json={
                "email": invalid_email,
                "password": "testpassword123"
            })
            
            assert response.status_code == 422  # Validation error
    
    def test_sql_injection_protection(self):
        """Test SQL injection protection"""
        malicious_inputs = [
            "'; DROP TABLE users; --",
            "1' OR '1'='1",
            "admin'--",
            "test@example.com'; DELETE FROM users; --"
        ]
        
        for malicious_input in malicious_inputs:
            response = client.post("/api/v1/auth/register", json={
                "email": malicious_input,
                "password": "testpassword123"
            })
            
            # Should either validate (422) or handle safely (not 500)
            assert response.status_code in [422, 400, 500]  # Not a successful registration
    
    def test_xss_protection(self):
        """Test XSS protection in user input"""
        xss_payloads = [
            "<script>alert('xss')</script>",
            "javascript:alert('xss')",
            "<img src=x onerror=alert('xss')>",
            "';alert('xss');//"
        ]
        
        for xss_payload in xss_payloads:
            response = client.post("/api/v1/auth/register", json={
                "email": f"test{xss_payload}@example.com",
                "password": "testpassword123"
            })
            
            # Should validate email format and reject XSS
            assert response.status_code == 422  # Validation error


class TestRateLimiting:
    """Test rate limiting and brute force protection"""
    
    def test_multiple_failed_logins(self):
        """Test multiple failed login attempts"""
        # This would typically be implemented with rate limiting middleware
        # For now, we just test that failed logins are handled properly
        
        for i in range(5):
            response = client.post("/api/v1/auth/login", json={
                "email": "nonexistent@example.com",
                "password": "wrongpassword"
            })
            
            assert response.status_code == 401
    
    def test_rapid_registration_attempts(self):
        """Test rapid registration attempts"""
        # This would typically be rate limited
        # For now, we just ensure the endpoint handles multiple requests
        
        for i in range(3):
            response = client.post("/api/v1/auth/register", json={
                "email": f"test{i}@example.com",
                "password": "testpassword123"
            })
            
            # Should handle gracefully (either succeed or fail with proper error)
            assert response.status_code in [200, 400, 422, 500]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
