# Security & Privacy Documentation

## Data Encryption

### Supabase Built-in Encryption

AuthentiCare uses **Supabase** as its database provider, which provides enterprise-grade security features:

#### ✅ **Encryption at Rest**
- All data stored in Supabase PostgreSQL databases is **encrypted at rest** using AES-256 encryption
- Database backups are also encrypted
- Encryption keys are managed by AWS KMS (Key Management Service)

#### ✅ **Encryption in Transit**
- All connections to Supabase use **TLS 1.2+** encryption
- API calls are made over HTTPS only
- Database connections use SSL/TLS

#### ✅ **Row Level Security (RLS)**
- Supabase PostgreSQL uses Row Level Security policies
- Users can only access their own data
- Admin operations require service role key

### Authentication Security

#### ✅ **Password Security**
- Passwords are hashed using **bcrypt** with salt
- Never stored in plain text
- Password reset uses secure tokens with expiration

#### ✅ **JWT Tokens**
- Session tokens use JWT (JSON Web Tokens)
- Tokens expire after configured time period
- Refresh tokens for extended sessions

### API Security

#### ✅ **API Key Protection**
- Service role keys stored in environment variables
- Never exposed to frontend
- Separate keys for development and production

#### ✅ **Rate Limiting**
- API endpoints protected against abuse
- Rate limits enforced per user/IP

## GDPR & CCPA Compliance

### Data Rights Implementation

#### ✅ **Right to Access**
- Users can view all their data via Privacy Dashboard
- Data access logs track who accessed what data and when

#### ✅ **Right to Export**
- Users can export all their data in JSON format
- Export includes: health profile, settings, activity history, briefings

#### ✅ **Right to Deletion**
- Users can delete specific data types or all data
- Deletion options:
  - Activity & Symptom History
  - Health Readings
  - Medication History
  - Complete Account Deletion

#### ✅ **Right to Rectification**
- Users can update their profile information at any time
- Changes are immediately reflected

### Consent Management

#### ✅ **Granular Consent Controls**
- Data sharing consent (on/off)
- Analytics consent (on/off)
- Marketing consent (on/off)
- Research participation (on/off)

#### ✅ **Consent Tracking**
- All consent changes are logged with timestamps
- Users can revoke consent at any time

## Privacy Dashboard Features

### Current Implementation

✅ **Privacy Settings Tab**
- Toggle consent for different data uses
- Set data retention preferences
- Choose export format (JSON/CSV)

✅ **Data Access Log Tab**
- View all data access events
- See who accessed data, when, and why
- IP address tracking for security

✅ **Data Summary Tab**
- Overview of all stored data
- Record counts per data type
- Last updated timestamps

✅ **Data Rights Tab**
- Export all data
- Delete specific data types
- Request complete account deletion

## Security Best Practices

### For Users

1. **Use Strong Passwords**
   - Minimum 8 characters
   - Mix of letters, numbers, symbols
   - Don't reuse passwords

2. **Enable Two-Factor Authentication** (Coming Soon)
   - Additional security layer
   - SMS or authenticator app

3. **Review Privacy Settings**
   - Check consent preferences regularly
   - Review data access logs
   - Update profile information

### For Developers

1. **Environment Variables**
   - Never commit `.env` files
   - Use separate keys for dev/prod
   - Rotate keys regularly

2. **API Security**
   - Always use HTTPS
   - Validate all inputs
   - Sanitize user data

3. **Database Security**
   - Use RLS policies
   - Limit service role key usage
   - Regular security audits

## Compliance Certifications

### Supabase Compliance
- **SOC 2 Type II** - Security, availability, confidentiality
- **GDPR** - EU data protection regulation
- **CCPA** - California Consumer Privacy Act
- **HIPAA** - Healthcare data protection (available on enterprise plans)

### Our Commitment
- Regular security audits
- Vulnerability scanning
- Incident response plan
- Data breach notification procedures

## Data Storage Locations

### Supabase Regions
- Primary: US East (N. Virginia) - AWS
- Backup: Multi-region replication
- EU users: EU data residency available

### Third-Party Services
- **OpenWeather API**: Weather and air quality data (no personal data shared)
- **PurpleAir API**: Community sensor data (no personal data shared)
- **Pollen.com API**: Pollen data (no personal data shared)

## Incident Response

### In Case of Security Incident

1. **Immediate Actions**
   - Isolate affected systems
   - Notify security team
   - Preserve evidence

2. **User Notification**
   - Email notification within 72 hours (GDPR requirement)
   - Clear explanation of incident
   - Steps users should take

3. **Remediation**
   - Fix vulnerability
   - Update security measures
   - Post-incident review

## Contact

For security concerns or to report vulnerabilities:
- **Email**: jura@authenticai.ai
- **Subject**: [SECURITY] Your concern

For privacy-related questions:
- **Email**: jura@authenticai.ai
- **Subject**: [PRIVACY] Your question

---

**Last Updated**: October 4, 2025  
**Version**: 1.0
