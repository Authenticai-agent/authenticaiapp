# HIPAA Compliance Implementation Plan for AuthentiCare

## Current Status: ⚠️ NOT HIPAA COMPLIANT

Your app collects Protected Health Information (PHI):
- Asthma severity
- Allergies
- Health conditions
- Medications
- Triggers
- Age + location (can identify individuals)

## HIPAA Requirements Overview

### 1. **Administrative Safeguards**
- [ ] Designate a Privacy Officer and Security Officer
- [ ] Conduct risk assessment
- [ ] Implement workforce training
- [ ] Create incident response plan
- [ ] Business Associate Agreements (BAAs) with all vendors

### 2. **Physical Safeguards**
- [ ] Secure data center (if self-hosted) or BAA with cloud provider
- [ ] Workstation security policies
- [ ] Device and media controls

### 3. **Technical Safeguards**
- [ ] **Encryption at rest** (database)
- [ ] **Encryption in transit** (HTTPS/TLS 1.2+)
- [ ] Access controls and authentication
- [ ] Audit logging
- [ ] Automatic logoff
- [ ] Data backup and disaster recovery

## Critical Implementation Steps

### Phase 1: Immediate (Required Before Launch)

#### 1.1 Database Encryption at Rest
**Current:** Supabase provides encryption at rest by default ✅
**Action:** Verify and document

#### 1.2 Encryption in Transit
**Current:** Using HTTPS ✅
**Action:** Enforce TLS 1.2+ minimum

```python
# backend/main.py - Add security headers
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware

# Force HTTPS in production
if os.getenv("ENVIRONMENT") == "production":
    app.add_middleware(HTTPSRedirectMiddleware)
```

#### 1.3 Field-Level Encryption for PHI
**Current:** PHI stored in plaintext ❌
**Action:** Encrypt sensitive fields

```python
# backend/utils/encryption.py
from cryptography.fernet import Fernet
import os
import base64

class PHIEncryption:
    """Encrypt/decrypt PHI fields using Fernet (AES-128)"""
    
    def __init__(self):
        # Store key in environment variable, NOT in code
        key = os.getenv("PHI_ENCRYPTION_KEY")
        if not key:
            raise ValueError("PHI_ENCRYPTION_KEY not set!")
        self.cipher = Fernet(key.encode())
    
    def encrypt(self, plaintext: str) -> str:
        """Encrypt sensitive data"""
        if not plaintext:
            return plaintext
        encrypted = self.cipher.encrypt(plaintext.encode())
        return base64.b64encode(encrypted).decode()
    
    def decrypt(self, ciphertext: str) -> str:
        """Decrypt sensitive data"""
        if not ciphertext:
            return ciphertext
        decoded = base64.b64decode(ciphertext.encode())
        decrypted = self.cipher.decrypt(decoded)
        return decrypted.decode()
```

#### 1.4 Audit Logging
**Current:** Basic logging ⚠️
**Action:** Comprehensive audit trail

```python
# backend/utils/audit_log.py
from datetime import datetime
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class AuditLogger:
    """HIPAA-compliant audit logging"""
    
    @staticmethod
    async def log_phi_access(
        user_id: str,
        action: str,  # "CREATE", "READ", "UPDATE", "DELETE"
        resource: str,  # "user_profile", "health_data"
        ip_address: str,
        success: bool,
        details: Optional[str] = None
    ):
        """Log all PHI access attempts"""
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "user_id": user_id,
            "action": action,
            "resource": resource,
            "ip_address": ip_address,
            "success": success,
            "details": details
        }
        
        # Store in separate audit table (never delete)
        # Log to secure logging service (e.g., AWS CloudWatch, Datadog)
        logger.info(f"AUDIT: {log_entry}")
        
        # TODO: Store in audit_logs table in database
```

#### 1.5 Access Controls
**Current:** Basic JWT auth ✅
**Action:** Enhance with role-based access

```python
# backend/models/schemas.py - Add roles
from enum import Enum

class UserRole(str, Enum):
    PATIENT = "patient"
    ADMIN = "admin"
    SUPPORT = "support"  # Can view data for support, but limited

class User(UserBase):
    id: str
    role: UserRole = UserRole.PATIENT
    subscription_tier: SubscriptionTier
    created_at: datetime
    updated_at: datetime
```

### Phase 2: Business Associate Agreements (BAAs)

#### Required BAAs with:
1. **Supabase** (database) - ✅ Supabase offers BAA for Enterprise plans
2. **Netlify** (hosting) - ⚠️ Check if BAA available
3. **Google Gemini API** (AI) - ⚠️ Google Cloud offers BAA, verify Gemini API coverage
4. **OpenWeatherMap** (if storing user queries) - Probably not needed
5. **Email provider** (if sending PHI via email) - Required

**Action Items:**
- [ ] Upgrade Supabase to Enterprise plan with BAA
- [ ] Contact Netlify about BAA or migrate to AWS/GCP with BAA
- [ ] Verify Google Gemini API is covered under Google Cloud BAA
- [ ] Never send PHI via email without encryption

### Phase 3: User Rights & Privacy

#### 3.1 Right to Access
Users must be able to download all their data

```python
# backend/routers/privacy.py
@router.get("/export-my-data")
async def export_user_data(current_user: User = Depends(get_current_user)):
    """Export all user data (HIPAA right to access)"""
    # Decrypt PHI before export
    # Return as JSON download
    pass
```

#### 3.2 Right to Delete
Users must be able to delete their account and all PHI

```python
@router.delete("/delete-my-account")
async def delete_account(current_user: User = Depends(get_current_user)):
    """Permanently delete account and all PHI"""
    # Audit log the deletion
    # Delete from database
    # Cannot be recovered (except from backups for 30 days)
    pass
```

#### 3.3 Breach Notification
Must notify users within 60 days of discovering a breach

```python
# backend/utils/breach_notification.py
async def notify_breach(affected_users: List[str], breach_details: str):
    """HIPAA requires notification within 60 days"""
    # Email all affected users
    # If >500 users, notify HHS and media
    pass
```

### Phase 4: Minimum Necessary Rule

**Current:** Gemini API receives full user profile ❌
**Action:** Only send necessary data

```python
# backend/routers/daily_briefing.py - BEFORE
user_profile = {
    "age": user.age,
    "asthma_severity": user.asthma_severity,
    "allergies": user.allergies,
    "triggers": user.triggers,
    "medications": user.medications,  # ❌ Not necessary for briefing!
    "health_conditions": user.health_conditions
}

# AFTER - Minimum necessary
user_profile = {
    "age_range": "30-40" if user.age else None,  # Range, not exact
    "respiratory_condition": "asthma" if user.asthma_severity else None,
    "known_triggers": user.triggers[:5] if user.triggers else []  # Limit data
    # DON'T send: medications, exact age, full health history
}
```

## Technical Implementation Checklist

### Database Security
- [x] Encryption at rest (Supabase default)
- [ ] Field-level encryption for PHI columns
- [ ] Separate audit log table (append-only)
- [ ] Row-level security policies
- [ ] Regular backups (encrypted)
- [ ] Backup retention policy (30 days)

### API Security
- [x] HTTPS/TLS 1.2+
- [x] JWT authentication
- [ ] Rate limiting (prevent brute force)
- [ ] IP whitelisting for admin endpoints
- [ ] Session timeout (15 minutes)
- [ ] MFA for admin accounts

### Application Security
- [ ] Input validation (prevent injection)
- [ ] Output encoding (prevent XSS)
- [ ] CSRF protection
- [ ] Security headers (CSP, HSTS, etc.)
- [ ] Dependency scanning (npm audit, pip audit)
- [ ] Penetration testing (annual)

### Monitoring & Logging
- [ ] Audit all PHI access (who, what, when, where)
- [ ] Failed login attempts
- [ ] Unusual access patterns
- [ ] Data export/deletion requests
- [ ] System errors and exceptions
- [ ] Log retention (6 years minimum)

## Recommended Architecture Changes

### Option 1: De-identify Data (Recommended for MVP)
**Remove PHI entirely** - Don't store exact medications, just categories

```python
# Instead of: medications = ["Albuterol", "Singulair"]
# Store: has_rescue_inhaler = True, has_controller_medication = True
```

**Pros:**
- Not subject to HIPAA if truly de-identified
- Simpler compliance
- Lower risk

**Cons:**
- Less personalized
- May limit future features

### Option 2: Full HIPAA Compliance (Required for Scale)
**Implement all safeguards** - Treat as covered entity

**Pros:**
- Can store detailed medical info
- Highly personalized
- Competitive advantage

**Cons:**
- Expensive (BAAs, audits, insurance)
- Complex implementation
- Ongoing compliance burden

## Cost Estimates

### One-Time Costs
- HIPAA compliance consultant: $5,000 - $15,000
- Security audit/penetration test: $10,000 - $30,000
- Legal review: $5,000 - $10,000
- **Total: $20,000 - $55,000**

### Recurring Costs
- Supabase Enterprise (BAA): ~$599/month
- Cyber liability insurance: $2,000 - $5,000/year
- Annual security audit: $10,000 - $20,000/year
- Compliance monitoring tools: $500 - $2,000/month
- **Total: ~$30,000 - $60,000/year**

## Immediate Action Plan (Next 30 Days)

### Week 1: Assessment
1. [ ] Inventory all PHI collected
2. [ ] Map data flow (where PHI goes)
3. [ ] Identify all vendors/subprocessors
4. [ ] Review current security measures

### Week 2: Quick Wins
1. [ ] Add field-level encryption
2. [ ] Implement audit logging
3. [ ] Add session timeout
4. [ ] Update privacy policy with HIPAA notice

### Week 3: Vendor Management
1. [ ] Request BAAs from all vendors
2. [ ] Evaluate alternatives if BAA not available
3. [ ] Document all agreements

### Week 4: Testing & Documentation
1. [ ] Test encryption/decryption
2. [ ] Test data export/deletion
3. [ ] Document all security controls
4. [ ] Create incident response plan

## Alternative: Wellness App (Non-HIPAA)

If HIPAA compliance is too burdensome for MVP, pivot to **wellness coaching** without PHI:

```python
# Instead of medical data:
class UserPreferences(BaseModel):
    air_quality_sensitivity: str  # "low", "medium", "high"
    outdoor_activity_level: str  # "sedentary", "active", "athlete"
    weather_preferences: Dict[str, Any]
    notification_preferences: Dict[str, Any]
    # NO: medications, diagnoses, health conditions
```

**Positioning:** "Environmental wellness coach" vs. "Medical prevention tool"

## Conclusion

**Current Status:** Your app IS collecting PHI and IS subject to HIPAA.

**Recommended Path:**
1. **Short-term (MVP):** Minimize PHI collection, focus on wellness
2. **Long-term (Scale):** Full HIPAA compliance with proper funding

**Critical:** Do NOT launch with current setup without either:
- Removing PHI fields, OR
- Implementing encryption + BAAs + audit logging

**Next Step:** Decide which path to take, then I can help implement.
