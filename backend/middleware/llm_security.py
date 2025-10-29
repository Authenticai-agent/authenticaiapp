"""
LLM Security Middleware
Protects against prompt injection, jailbreaking, and abuse
"""
from fastapi import Request, HTTPException, status
from typing import Optional, List
import re
import logging
from datetime import datetime, timedelta
from collections import defaultdict

logger = logging.getLogger(__name__)

class LLMSecurityMiddleware:
    """
    Comprehensive LLM security protection
    - Prompt injection detection
    - Jailbreak attempt detection
    - Content filtering
    - Rate limiting for AI endpoints
    - Cost controls
    """
    
    def __init__(self):
        # Suspicious patterns that indicate prompt injection
        self.injection_patterns = [
            r"ignore\s+(previous|above|all)\s+instructions",
            r"disregard\s+(previous|above|all)\s+instructions",
            r"forget\s+(previous|above|all)\s+instructions",
            r"you\s+are\s+now\s+a",
            r"act\s+as\s+a\s+",
            r"pretend\s+to\s+be",
            r"roleplay\s+as",
            r"system\s*:\s*",
            r"<\|im_start\|>",
            r"<\|im_end\|>",
            r"\[INST\]",
            r"\[/INST\]",
            r"###\s*Instruction",
            r"###\s*Response",
            r"sudo\s+mode",
            r"developer\s+mode",
            r"admin\s+mode",
            r"bypass\s+filter",
            r"jailbreak",
            r"DAN\s+mode",  # "Do Anything Now" jailbreak
        ]
        
        # Compile patterns for efficiency
        self.compiled_patterns = [
            re.compile(pattern, re.IGNORECASE) 
            for pattern in self.injection_patterns
        ]
        
        # Blocked words/phrases
        self.blocked_content = [
            "api_key",
            "secret_key",
            "password",
            "private_key",
            "access_token",
            "bearer",
            "authorization",
        ]
        
        # Rate limiting for AI endpoints (per user)
        self.ai_requests = defaultdict(list)
        self.max_requests_per_hour = 50  # 50 AI requests per hour per user
        self.max_requests_per_day = 200  # 200 AI requests per day per user
        
        # Cost tracking
        self.daily_costs = defaultdict(float)
        self.max_daily_cost_per_user = 5.0  # $5 per user per day
    
    def detect_prompt_injection(self, text: str) -> tuple[bool, Optional[str]]:
        """
        Detect potential prompt injection attempts
        Returns: (is_malicious, reason)
        """
        if not text:
            return False, None
        
        text_lower = text.lower()
        
        # Check for injection patterns
        for pattern in self.compiled_patterns:
            if pattern.search(text):
                match = pattern.search(text).group()
                logger.warning(f"Prompt injection detected: {match}")
                return True, f"Suspicious pattern detected: {match}"
        
        # Check for blocked content
        for blocked in self.blocked_content:
            if blocked in text_lower:
                logger.warning(f"Blocked content detected: {blocked}")
                return True, f"Blocked content: {blocked}"
        
        # Check for excessive special characters (obfuscation attempt)
        special_char_ratio = sum(1 for c in text if not c.isalnum() and not c.isspace()) / len(text)
        if special_char_ratio > 0.3:
            logger.warning(f"High special character ratio: {special_char_ratio}")
            return True, "Excessive special characters detected"
        
        # Check for very long inputs (potential DOS)
        if len(text) > 10000:
            logger.warning(f"Input too long: {len(text)} characters")
            return True, "Input exceeds maximum length"
        
        return False, None
    
    def sanitize_input(self, text: str) -> str:
        """
        Sanitize user input before sending to LLM
        """
        if not text:
            return ""
        
        # Remove potential injection markers
        text = re.sub(r'<\|.*?\|>', '', text)  # Remove special tokens
        text = re.sub(r'\[INST\]|\[/INST\]', '', text)  # Remove instruction markers
        text = re.sub(r'###\s*(Instruction|Response)', '', text, flags=re.IGNORECASE)
        
        # Limit length
        max_length = 5000
        if len(text) > max_length:
            text = text[:max_length]
            logger.info(f"Input truncated to {max_length} characters")
        
        # Remove excessive whitespace
        text = ' '.join(text.split())
        
        return text.strip()
    
    def check_rate_limit(self, user_id: str) -> tuple[bool, Optional[str]]:
        """
        Check if user has exceeded AI request rate limits
        Returns: (is_allowed, error_message)
        """
        now = datetime.utcnow()
        
        # Get user's request history
        requests = self.ai_requests[user_id]
        
        # Remove requests older than 24 hours
        cutoff_day = now - timedelta(days=1)
        cutoff_hour = now - timedelta(hours=1)
        requests[:] = [req_time for req_time in requests if req_time > cutoff_day]
        
        # Check hourly limit
        recent_requests = [req_time for req_time in requests if req_time > cutoff_hour]
        if len(recent_requests) >= self.max_requests_per_hour:
            logger.warning(f"User {user_id} exceeded hourly AI rate limit")
            return False, f"Rate limit exceeded: {self.max_requests_per_hour} requests per hour"
        
        # Check daily limit
        if len(requests) >= self.max_requests_per_day:
            logger.warning(f"User {user_id} exceeded daily AI rate limit")
            return False, f"Rate limit exceeded: {self.max_requests_per_day} requests per day"
        
        # Add current request
        requests.append(now)
        
        return True, None
    
    def track_cost(self, user_id: str, cost: float) -> tuple[bool, Optional[str]]:
        """
        Track AI API costs per user
        Returns: (is_allowed, error_message)
        """
        today = datetime.utcnow().date().isoformat()
        key = f"{user_id}:{today}"
        
        self.daily_costs[key] += cost
        
        if self.daily_costs[key] > self.max_daily_cost_per_user:
            logger.warning(f"User {user_id} exceeded daily cost limit: ${self.daily_costs[key]:.2f}")
            return False, f"Daily cost limit exceeded: ${self.max_daily_cost_per_user}"
        
        return True, None
    
    def validate_ai_request(
        self, 
        user_id: str, 
        prompt: str, 
        estimated_cost: float = 0.01
    ) -> tuple[bool, Optional[str], str]:
        """
        Comprehensive validation for AI requests
        Returns: (is_valid, error_message, sanitized_prompt)
        """
        # 1. Check rate limit
        is_allowed, error = self.check_rate_limit(user_id)
        if not is_allowed:
            return False, error, ""
        
        # 2. Detect prompt injection
        is_malicious, reason = self.detect_prompt_injection(prompt)
        if is_malicious:
            logger.error(f"Malicious prompt from user {user_id}: {reason}")
            return False, f"Security violation: {reason}", ""
        
        # 3. Sanitize input
        sanitized = self.sanitize_input(prompt)
        
        # 4. Check cost limit
        is_allowed, error = self.track_cost(user_id, estimated_cost)
        if not is_allowed:
            return False, error, ""
        
        return True, None, sanitized
    
    def get_safe_error_message(self, error: Exception) -> str:
        """
        Return safe error message without leaking sensitive info
        """
        # Never expose internal errors to users
        safe_messages = {
            "rate_limit": "Too many requests. Please try again later.",
            "injection": "Invalid input detected. Please rephrase your request.",
            "cost": "Daily usage limit reached. Please try again tomorrow.",
            "default": "An error occurred. Please try again or contact support."
        }
        
        error_str = str(error).lower()
        
        if "rate" in error_str or "limit" in error_str:
            return safe_messages["rate_limit"]
        elif "injection" in error_str or "malicious" in error_str:
            return safe_messages["injection"]
        elif "cost" in error_str:
            return safe_messages["cost"]
        else:
            return safe_messages["default"]


# Global instance
llm_security = LLMSecurityMiddleware()


def validate_llm_input(user_id: str, prompt: str) -> str:
    """
    Validate and sanitize LLM input
    Raises HTTPException if validation fails
    """
    is_valid, error, sanitized = llm_security.validate_ai_request(user_id, prompt)
    
    if not is_valid:
        logger.error(f"LLM security violation for user {user_id}: {error}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=llm_security.get_safe_error_message(Exception(error))
        )
    
    return sanitized


def log_llm_request(user_id: str, prompt: str, response: str, cost: float):
    """
    Log LLM requests for audit and monitoring
    """
    logger.info(
        f"LLM Request - User: {user_id}, "
        f"Prompt length: {len(prompt)}, "
        f"Response length: {len(response)}, "
        f"Cost: ${cost:.4f}"
    )
