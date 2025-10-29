"""
Input Validation Middleware
Protects against injection attacks and malformed data
"""
from fastapi import HTTPException, status
from typing import Any, Optional
import re
import html
import logging

logger = logging.getLogger(__name__)

class InputValidator:
    """
    Comprehensive input validation and sanitization
    """
    
    @staticmethod
    def sanitize_string(value: str, max_length: int = 1000) -> str:
        """
        Sanitize string input
        - Remove HTML tags
        - Escape special characters
        - Limit length
        """
        if not isinstance(value, str):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid input type: expected string"
            )
        
        # Remove HTML tags
        value = re.sub(r'<[^>]+>', '', value)
        
        # Escape HTML entities
        value = html.escape(value)
        
        # Remove null bytes
        value = value.replace('\x00', '')
        
        # Limit length
        if len(value) > max_length:
            value = value[:max_length]
            logger.warning(f"Input truncated to {max_length} characters")
        
        return value.strip()
    
    @staticmethod
    def validate_email(email: str) -> str:
        """
        Validate and sanitize email address
        """
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is required"
            )
        
        # Basic email regex
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        
        email = email.strip().lower()
        
        if not re.match(email_pattern, email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid email format"
            )
        
        if len(email) > 254:  # RFC 5321
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email too long"
            )
        
        return email
    
    @staticmethod
    def validate_password(password: str) -> str:
        """
        Validate password strength
        """
        if not password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password is required"
            )
        
        if len(password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters"
            )
        
        if len(password) > 128:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password too long"
            )
        
        # Check for at least one uppercase, lowercase, digit
        if not re.search(r'[A-Z]', password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must contain at least one uppercase letter"
            )
        
        if not re.search(r'[a-z]', password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must contain at least one lowercase letter"
            )
        
        if not re.search(r'\d', password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must contain at least one digit"
            )
        
        return password
    
    @staticmethod
    def validate_coordinates(lat: float, lon: float) -> tuple[float, float]:
        """
        Validate geographic coordinates
        """
        try:
            lat = float(lat)
            lon = float(lon)
        except (ValueError, TypeError):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid coordinates: must be numbers"
            )
        
        if not (-90 <= lat <= 90):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid latitude: must be between -90 and 90"
            )
        
        if not (-180 <= lon <= 180):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid longitude: must be between -180 and 180"
            )
        
        return lat, lon
    
    @staticmethod
    def validate_integer(value: Any, min_val: Optional[int] = None, max_val: Optional[int] = None) -> int:
        """
        Validate integer input
        """
        try:
            value = int(value)
        except (ValueError, TypeError):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid input: expected integer"
            )
        
        if min_val is not None and value < min_val:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Value must be at least {min_val}"
            )
        
        if max_val is not None and value > max_val:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Value must be at most {max_val}"
            )
        
        return value
    
    @staticmethod
    def sanitize_json(data: dict) -> dict:
        """
        Recursively sanitize JSON data
        """
        if not isinstance(data, dict):
            return data
        
        sanitized = {}
        for key, value in data.items():
            # Sanitize key
            key = InputValidator.sanitize_string(str(key), max_length=100)
            
            # Sanitize value based on type
            if isinstance(value, str):
                sanitized[key] = InputValidator.sanitize_string(value)
            elif isinstance(value, dict):
                sanitized[key] = InputValidator.sanitize_json(value)
            elif isinstance(value, list):
                sanitized[key] = [
                    InputValidator.sanitize_string(item) if isinstance(item, str) else item
                    for item in value
                ]
            else:
                sanitized[key] = value
        
        return sanitized
    
    @staticmethod
    def detect_sql_injection(value: str) -> bool:
        """
        Detect potential SQL injection attempts
        Note: This is defense in depth - Supabase already protects against SQL injection
        """
        sql_patterns = [
            r"(\bUNION\b.*\bSELECT\b)",
            r"(\bSELECT\b.*\bFROM\b)",
            r"(\bINSERT\b.*\bINTO\b)",
            r"(\bUPDATE\b.*\bSET\b)",
            r"(\bDELETE\b.*\bFROM\b)",
            r"(\bDROP\b.*\bTABLE\b)",
            r"(--|\#|\/\*|\*\/)",  # SQL comments
            r"(\bOR\b.*=.*)",
            r"(\bAND\b.*=.*)",
            r"(;.*\b(SELECT|INSERT|UPDATE|DELETE|DROP)\b)",
        ]
        
        value_upper = value.upper()
        
        for pattern in sql_patterns:
            if re.search(pattern, value_upper, re.IGNORECASE):
                logger.warning(f"Potential SQL injection detected: {pattern}")
                return True
        
        return False
    
    @staticmethod
    def validate_and_sanitize(value: str, field_name: str = "input") -> str:
        """
        Comprehensive validation and sanitization
        """
        # Check for SQL injection
        if InputValidator.detect_sql_injection(value):
            logger.error(f"SQL injection attempt detected in {field_name}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid input detected"
            )
        
        # Sanitize
        return InputValidator.sanitize_string(value)


# Global instance
input_validator = InputValidator()
