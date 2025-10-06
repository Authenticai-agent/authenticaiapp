# 🔒 Safe .env Template - AuthentiCare

**Use this template for your `.env` files**  
**NEVER put actual API keys in documentation!**

---

## 📝 **BACKEND .env FILE**

```bash
# ============================================
# DATABASE & AUTHENTICATION
# ============================================
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_KEY=your_supabase_service_role_key_here

# JWT Configuration
JWT_SECRET=your_long_random_secret_key_here_min_32_chars
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=30

# ============================================
# WEATHER & AIR QUALITY APIs (Required)
# ============================================
# Get from: https://home.openweathermap.org/api_keys
OPENWEATHER_API_KEY=your_openweather_api_key_here

# Get from: https://docs.airnowapi.org/account/request/
AIRNOW_API_KEY=your_airnow_api_key_here

# Get from: https://www2.purpleair.com/pages/contact-us
PURPLEAIR_API_KEY=your_purpleair_api_key_here

# ============================================
# LLM APIs (OPTIONAL - Not currently used)
# ============================================
# Your app uses LOCAL KNOWLEDGE BASE instead
# These are not needed unless you want to enable LLM features
# OPENAI_API_KEY=your_openai_key_here
# GOOGLE_API_KEY=your_google_gemini_key_here

# ============================================
# STRIPE PAYMENT PROCESSING (Required)
# ============================================
# Get from: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Stripe Price IDs (create in Stripe Dashboard)
STRIPE_PRICE_SUPPORTER=price_your_supporter_price_id
STRIPE_PRICE_CONTRIBUTOR=price_your_contributor_price_id
STRIPE_PRICE_CHAMPION=price_your_champion_price_id

# ============================================
# APPLICATION SETTINGS
# ============================================
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000

# Environment
ENVIRONMENT=development
DEBUG=true
```

---

## 📝 **FRONTEND .env FILE**

```bash
# ============================================
# API CONFIGURATION
# ============================================
REACT_APP_API_URL=http://localhost:8000/api/v1

# ============================================
# STRIPE (Public Key Only)
# ============================================
# Get from: https://dashboard.stripe.com/apikeys
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Stripe Price IDs (must match backend)
REACT_APP_STRIPE_PRICE_SUPPORTER=price_your_supporter_price_id
REACT_APP_STRIPE_PRICE_CONTRIBUTOR=price_your_contributor_price_id
REACT_APP_STRIPE_PRICE_CHAMPION=price_your_champion_price_id

# ============================================
# FEATURE FLAGS (Optional)
# ============================================
REACT_APP_ENABLE_PREMIUM_FEATURES=false
REACT_APP_ENABLE_DEBUG_MODE=false
REACT_APP_ENABLE_ANALYTICS=true
```

---

## 🔑 **HOW TO GET API KEYS**

### **1. Supabase (Database)**
1. Go to: https://supabase.com/dashboard
2. Create new project or select existing
3. Go to Settings → API
4. Copy:
   - Project URL → `SUPABASE_URL`
   - anon/public key → `SUPABASE_KEY`
   - service_role key → `SUPABASE_SERVICE_KEY` (keep secret!)

### **2. OpenWeather (Air Quality)**
1. Go to: https://home.openweathermap.org/api_keys
2. Sign up for free account
3. Generate API key
4. Copy to `OPENWEATHER_API_KEY`

### **3. AirNow (Air Quality)**
1. Go to: https://docs.airnowapi.org/account/request/
2. Request API key (free)
3. Wait for approval email
4. Copy to `AIRNOW_API_KEY`

### **4. PurpleAir (Air Quality)**
1. Go to: https://www2.purpleair.com/pages/contact-us
2. Request API key (free)
3. Wait for approval
4. Copy to `PURPLEAIR_API_KEY`

### **5. Stripe (Payments)**
1. Go to: https://dashboard.stripe.com/register
2. Complete account setup
3. Go to Developers → API keys
4. Copy:
   - Secret key → `STRIPE_SECRET_KEY`
   - Publishable key → `STRIPE_PUBLISHABLE_KEY`
5. Go to Developers → Webhooks
6. Add endpoint: `https://yourdomain.com/api/v1/stripe/webhook`
7. Copy webhook secret → `STRIPE_WEBHOOK_SECRET`

### **6. JWT Secret**
Generate a random secret:
```bash
# On Mac/Linux:
openssl rand -base64 32

# Or use Python:
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## ⚠️ **SECURITY BEST PRACTICES**

### **DO:**
✅ Keep `.env` files in `.gitignore`
✅ Use different keys for dev/staging/production
✅ Rotate keys regularly (every 90 days)
✅ Use environment-specific keys
✅ Store production keys in secure vault
✅ Enable 2FA on all API provider accounts

### **DON'T:**
❌ Commit `.env` files to Git
❌ Share API keys via email/Slack
❌ Put keys in documentation
❌ Use production keys in development
❌ Hardcode keys in source code
❌ Screenshot keys

---

## 📋 **CHECKLIST**

Before deploying to production:

- [ ] All API keys configured
- [ ] `.env` file in `.gitignore`
- [ ] Different keys for dev/prod
- [ ] JWT secret is strong (32+ chars)
- [ ] Stripe webhook configured
- [ ] All keys tested and working
- [ ] 2FA enabled on critical accounts
- [ ] Keys documented in password manager
- [ ] Team members have access to keys (securely)
- [ ] Backup of `.env` file (encrypted)

---

## 🚨 **IF KEYS ARE EXPOSED**

1. **Immediately revoke the exposed key**
2. Generate new key
3. Update `.env` file
4. Restart application
5. Check for unauthorized usage
6. Document the incident

---

## 💡 **TIPS**

### **For Development:**
```bash
# Copy example to actual .env
cp .env.example .env

# Edit with your keys
nano .env  # or use your preferred editor
```

### **For Production:**
- Use environment variables in hosting platform
- Don't store `.env` file on server
- Use secrets management (AWS Secrets Manager, etc.)

### **For Team:**
- Share keys via password manager (1Password, LastPass)
- Never via email or Slack
- Document who has access

---

**Remember: API keys are like passwords - keep them secret!** 🔒
