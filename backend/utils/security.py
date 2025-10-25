"""
Security utilities for input validation, sanitization, and protection against common attacks
Includes API key protection to prevent accidental disclosure
"""
import re
import html
import os
from typing import Any, Dict, List, Optional
from fastapi import HTTPException, status
import bleach

class SecurityValidator:
    """Comprehensive security validation and sanitization"""
    
    # Prompt injection patterns to detect and block
    PROMPT_INJECTION_PATTERNS = [
        r'ignore\s+(previous|all|above)\s+(instructions?|prompts?|commands?)',
        r'disregard\s+(previous|all|above)',
        r'forget\s+(everything|all|previous)',
        r'new\s+instructions?:',
        r'system\s*:',
        r'<\|.*?\|>',  # Special tokens
        r'\[INST\]|\[/INST\]',  # Instruction markers
        r'<s>|</s>',  # Special markers
        r'###\s*System',
        r'You\s+are\s+now',
        r'Act\s+as\s+(if|though)',
        r'Pretend\s+(you|to\s+be)',
        r'Roleplay\s+as',
    ]
    
    # SQL injection patterns
    SQL_INJECTION_PATTERNS = [
        r"(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)",
        r"(--|#|/\*|\*/)",
        r"(\bOR\b.*=.*)",
        r"(\bAND\b.*=.*)",
        r"(;.*\b(SELECT|INSERT|UPDATE|DELETE)\b)",
    ]
    
    # XSS patterns
    XSS_PATTERNS = [
        r'<script[^>]*>.*?</script>',
        r'javascript:',
        r'on\w+\s*=',  # Event handlers like onclick=
        r'<iframe',
        r'<object',
        r'<embed',
    ]
    
    @classmethod
    def sanitize_user_input(cls, text: str, max_length: int = 1000) -> str:
        """
        Sanitize user input to prevent XSS, SQL injection, and prompt injection
        
        Args:
            text: Raw user input
            max_length: Maximum allowed length
            
        Returns:
            Sanitized text
            
        Raises:
            HTTPException: If malicious patterns detected
        """
        if not text:
            return ""
        
        # Truncate to max length
        text = text[:max_length]
        
        # Check for SQL injection
        if cls._detect_sql_injection(text):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid input: potential SQL injection detected"
            )
        
        # Check for XSS
        if cls._detect_xss(text):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid input: potential XSS detected"
            )
        
        # HTML escape
        text = html.escape(text)
        
        # Remove any remaining HTML tags using bleach
        text = bleach.clean(text, tags=[], strip=True)
        
        return text.strip()
    
    @classmethod
    def sanitize_prompt_input(cls, text: str, max_length: int = 2000) -> str:
        """
        Sanitize input before sending to LLM to prevent prompt injection
        
        Args:
            text: User input to be included in LLM prompt
            max_length: Maximum allowed length
            
        Returns:
            Sanitized text safe for LLM prompts
            
        Raises:
            HTTPException: If prompt injection detected
        """
        if not text:
            return ""
        
        # Truncate
        text = text[:max_length]
        
        # Check for prompt injection patterns
        if cls._detect_prompt_injection(text):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid input: potential prompt injection detected"
            )
        
        # Remove special characters that could be used for injection
        # Keep alphanumeric, spaces, and basic punctuation
        text = re.sub(r'[^\w\s\.,!?\-\'\"()]', '', text)
        
        # Normalize whitespace
        text = ' '.join(text.split())
        
        return text.strip()
    
    @classmethod
    def validate_email(cls, email: str) -> str:
        """Validate and sanitize email address"""
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is required"
            )
        
        # Basic email regex
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid email format"
            )
        
        return email.lower().strip()
    
    @classmethod
    def validate_password(cls, password: str) -> None:
        """
        Validate password strength
        
        Requirements:
        - Minimum 8 characters
        - At least one uppercase letter
        - At least one lowercase letter
        - At least one number
        - At least one special character
        """
        if not password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password is required"
            )
        
        if len(password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters long"
            )
        
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
                detail="Password must contain at least one number"
            )
        
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must contain at least one special character"
            )
    
    @classmethod
    def validate_numeric_range(cls, value: Any, min_val: float, max_val: float, field_name: str) -> float:
        """Validate numeric input is within acceptable range"""
        try:
            num_value = float(value)
        except (ValueError, TypeError):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"{field_name} must be a valid number"
            )
        
        if num_value < min_val or num_value > max_val:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"{field_name} must be between {min_val} and {max_val}"
            )
        
        return num_value
    
    @classmethod
    def _detect_sql_injection(cls, text: str) -> bool:
        """Detect potential SQL injection patterns"""
        text_upper = text.upper()
        for pattern in cls.SQL_INJECTION_PATTERNS:
            if re.search(pattern, text_upper, re.IGNORECASE):
                return True
        return False
    
    @classmethod
    def _detect_xss(cls, text: str) -> bool:
        """Detect potential XSS patterns"""
        for pattern in cls.XSS_PATTERNS:
            if re.search(pattern, text, re.IGNORECASE):
                return True
        return False
    
    @classmethod
    def _detect_prompt_injection(cls, text: str) -> bool:
        """Detect potential prompt injection patterns"""
        for pattern in cls.PROMPT_INJECTION_PATTERNS:
            if re.search(pattern, text, re.IGNORECASE):
                return True
        return False
    
    @classmethod
    def sanitize_api_keys(cls, text: str) -> str:
        """
        Sanitize text to remove any API keys that might have been accidentally included
        
        Protects against:
        - Gemini API keys
        - OpenAI API keys
        - Supabase keys
        - Any other sensitive keys
        
        Args:
            text: Text that might contain API keys
            
        Returns:
            Text with API keys replaced by masked versions
        """
        if not text:
            return text
        
        # Get all environment variables that might be API keys
        sensitive_env_vars = [
            'GEMINI_API_KEY',
            'OPENAI_API_KEY',
            'SUPABASE_KEY',
            'SUPABASE_SERVICE_KEY',
            'STRIPE_SECRET_KEY',
            'STRIPE_WEBHOOK_SECRET',
            'JWT_SECRET_KEY',
            'DATABASE_URL'
        ]
        
        sanitized = text
        
        # Replace actual API key values with masked versions
        for env_var in sensitive_env_vars:
            key_value = os.getenv(env_var)
            if key_value and key_value in sanitized:
                # Mask the key: show first 8 and last 4 characters
                if len(key_value) > 12:
                    masked = key_value[:8] + "..." + key_value[-4:]
                else:
                    masked = "***REDACTED***"
                sanitized = sanitized.replace(key_value, f"[{env_var}:{masked}]")
        
        # Also catch common API key patterns even if not in env
        # Pattern: AIza... (Google API keys)
        sanitized = re.sub(
            r'AIza[0-9A-Za-z\-_]{35}',
            '[GOOGLE_API_KEY:***REDACTED***]',
            sanitized
        )
        
        # Pattern: sk-... (OpenAI API keys)
        sanitized = re.sub(
            r'sk-[0-9A-Za-z]{48}',
            '[OPENAI_API_KEY:***REDACTED***]',
            sanitized
        )
        
        # Pattern: eyJ... (JWT tokens)
        sanitized = re.sub(
            r'eyJ[A-Za-z0-9\-_=]+\.eyJ[A-Za-z0-9\-_=]+\.[A-Za-z0-9\-_.+/=]+',
            '[JWT_TOKEN:***REDACTED***]',
            sanitized
        )
        
        return sanitized
    
    @classmethod
    def mask_api_key(cls, api_key: str) -> str:
        """
        Mask an API key for safe logging
        
        Args:
            api_key: Full API key
            
        Returns:
            Masked version showing only first 8 and last 4 characters
        """
        if not api_key:
            return "***NONE***"
        
        if len(api_key) > 12:
            return api_key[:8] + "..." + api_key[-4:]
        else:
            return "***"


class RateLimiter:
    """Simple in-memory rate limiter"""
    
    def __init__(self):
        self.requests: Dict[str, List[float]] = {}
    
    def check_rate_limit(self, identifier: str, max_requests: int = 100, window_seconds: int = 60) -> None:
        """
        Check if request should be rate limited
        
        Args:
            identifier: Unique identifier (e.g., user_id, IP address)
            max_requests: Maximum requests allowed in window
            window_seconds: Time window in seconds
            
        Raises:
            HTTPException: If rate limit exceeded
        """
        import time
        
        current_time = time.time()
        
        # Initialize if new identifier
        if identifier not in self.requests:
            self.requests[identifier] = []
        
        # Remove old requests outside window
        self.requests[identifier] = [
            req_time for req_time in self.requests[identifier]
            if current_time - req_time < window_seconds
        ]
        
        # Check if limit exceeded
        if len(self.requests[identifier]) >= max_requests:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded. Maximum {max_requests} requests per {window_seconds} seconds."
            )
        
        # Add current request
        self.requests[identifier].append(current_time)


# Global rate limiter instance
rate_limiter = RateLimiter()
