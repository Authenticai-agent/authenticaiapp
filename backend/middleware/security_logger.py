"""
Security Event Logger
Tracks and logs security events for monitoring and compliance
"""
import logging
from datetime import datetime
from typing import Optional, Dict, Any
import json

logger = logging.getLogger(__name__)

class SecurityLogger:
    """
    Centralized security event logging
    """
    
    @staticmethod
    def log_security_event(
        event_type: str,
        user_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        severity: str = "INFO"
    ):
        """
        Log security event with structured data
        
        Event types:
        - LOGIN_SUCCESS
        - LOGIN_FAILED
        - LOGOUT
        - PASSWORD_CHANGE
        - ACCOUNT_LOCKED
        - SUSPICIOUS_ACTIVITY
        - RATE_LIMIT_EXCEEDED
        - PROMPT_INJECTION_DETECTED
        - SQL_INJECTION_ATTEMPT
        - XSS_ATTEMPT
        - API_KEY_USED
        - UNAUTHORIZED_ACCESS
        """
        event = {
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": event_type,
            "user_id": user_id or "anonymous",
            "ip_address": ip_address or "unknown",
            "severity": severity,
            "details": details or {}
        }
        
        # Log based on severity
        log_message = f"SECURITY EVENT: {json.dumps(event)}"
        
        if severity == "CRITICAL":
            logger.critical(log_message)
        elif severity == "ERROR":
            logger.error(log_message)
        elif severity == "WARNING":
            logger.warning(log_message)
        else:
            logger.info(log_message)
    
    @staticmethod
    def log_login_attempt(user_id: str, ip_address: str, success: bool, reason: Optional[str] = None):
        """Log login attempt"""
        SecurityLogger.log_security_event(
            event_type="LOGIN_SUCCESS" if success else "LOGIN_FAILED",
            user_id=user_id,
            ip_address=ip_address,
            details={"reason": reason} if reason else {},
            severity="INFO" if success else "WARNING"
        )
    
    @staticmethod
    def log_suspicious_activity(user_id: str, ip_address: str, activity: str, details: Dict[str, Any]):
        """Log suspicious activity"""
        SecurityLogger.log_security_event(
            event_type="SUSPICIOUS_ACTIVITY",
            user_id=user_id,
            ip_address=ip_address,
            details={"activity": activity, **details},
            severity="WARNING"
        )
    
    @staticmethod
    def log_injection_attempt(user_id: str, ip_address: str, injection_type: str, payload: str):
        """Log injection attempt"""
        SecurityLogger.log_security_event(
            event_type=f"{injection_type.upper()}_INJECTION_ATTEMPT",
            user_id=user_id,
            ip_address=ip_address,
            details={
                "injection_type": injection_type,
                "payload_preview": payload[:100]  # Only log first 100 chars
            },
            severity="CRITICAL"
        )
    
    @staticmethod
    def log_rate_limit_exceeded(user_id: str, ip_address: str, endpoint: str, limit: int):
        """Log rate limit exceeded"""
        SecurityLogger.log_security_event(
            event_type="RATE_LIMIT_EXCEEDED",
            user_id=user_id,
            ip_address=ip_address,
            details={"endpoint": endpoint, "limit": limit},
            severity="WARNING"
        )
    
    @staticmethod
    def log_unauthorized_access(user_id: str, ip_address: str, resource: str):
        """Log unauthorized access attempt"""
        SecurityLogger.log_security_event(
            event_type="UNAUTHORIZED_ACCESS",
            user_id=user_id,
            ip_address=ip_address,
            details={"resource": resource},
            severity="ERROR"
        )


# Global instance
security_logger = SecurityLogger()
