# 🚀 Deploy with Live Stripe - Ready NOW!

**Date:** October 4, 2025, 11:37 PM EST  
**Status:** ✅ Stripe Verified - Live Keys Available  
**Goal:** Deploy and accept REAL donations

---

## ✅ **YOU'RE READY TO GO LIVE!**

Since you have:
- ✅ Stripe verification complete
- ✅ Live API keys
- ✅ Bank account connected

**You can deploy and accept real donations TODAY!**

---

## 🔑 **STEP 1: GET YOUR LIVE STRIPE KEYS**

### **From Stripe Dashboard:**

1. Go to https://dashboard.stripe.com
2. **Toggle to "Live mode"** (top right, switch from Test to Live)
3. Click **"Developers"** → **"API keys"**
4. Copy your keys:

```bash
# Publishable key (starts with pk_live_)
pk_live_51Q8k6vaugBlaMheeqsrQQoc...

# Secret key (starts with sk_live_) - Click "Reveal"
sk_live_51Q8k6vaugBlaMheeqsrQQoc...
```

### **Get Webhook Secret:**

1. Go to **"Developers"** → **"Webhooks"**
2. Click **"Add endpoint"**
3. Endpoint URL: `https://your-backend-url.railway.app/stripe/webhook`
   (You'll update this after deploying backend)
4. Select events:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
5. Click **"Add endpoint"**
6. Copy **Signing secret**: `whsec_live_...`

---

## 🚀 **STEP 2: DEPLOY BACKEND (Railway)**

### **Install Railway CLI:**
```bash
# Install
curl -fsSL https://railway.app/install.sh | sh

# Or with npm
npm install -g @railway/cli
```

### **Deploy:**
```bash
cd /Users/juratevirkutyte/Downloads/Authenticai_software_coach/backend

# Login to Railway
railway login

# Create new project
railway init

# This will open browser - create project named "authenticare-api"
```

### **Add Environment Variables in Railway:**

After project is created:
1. Go to Railway dashboard
2. Click your project
3. Go to **"Variables"** tab
4. Add these variables:

```bash
# Stripe LIVE Keys
STRIPE_SECRET_KEY=sk_live_51Q8k6vaugBlaMheeqsrQQoc...
STRIPE_WEBHOOK_SECRET=whsec_live_...

# Supabase
SUPABASE_URL=https://mvzedizusolvyzqddevm.supabase.co
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key

# APIs
OPENWEATHER_API_KEY=977ba23c8e07a995cd392197671cec8f
AIRNOW_API_KEY=AB22CC3D-8A9C-4E08-9B6F-1AF7DAD0F961
PURPLEAIR_API_KEY=36F61ACC-956B-11F0-BDE5-4201AC1DC121

# JWT
JWT_SECRET=your_secure_random_string_min_32_chars
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=30

# CORS (will update after frontend deployment)
ALLOWED_ORIGINS=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

### **Deploy Backend:**
```bash
# Deploy
railway up

# Get your backend URL
railway status
```

**Copy your Railway URL:** `https://authenticare-api-production.up.railway.app`

---

## 🌐 **STEP 3: DEPLOY FRONTEND (Vercel)**

### **Install Vercel CLI:**
```bash
npm install -g vercel
```

### **Update Frontend Environment:**
```bash
cd /Users/juratevirkutyte/Downloads/Authenticai_software_coach/frontend

# Create production environment file
cat > .env.production << EOF
REACT_APP_API_URL=https://authenticare-api-production.up.railway.app
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_51Q8k6vaugBlaMheeqsrQQoc...
EOF
```

### **Deploy Frontend:**
```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Follow prompts:
# - Project name: authenticare
# - Framework: Create React App
# - Build command: npm run build
# - Output directory: build
```

**Copy your Vercel URL:** `https://authenticare.vercel.app`

---

## 🔄 **STEP 4: UPDATE BACKEND CORS**

### **In Railway Dashboard:**

1. Go to your backend project
2. Click **"Variables"**
3. Update these variables:

```bash
ALLOWED_ORIGINS=https://authenticare.vercel.app
FRONTEND_URL=https://authenticare.vercel.app
```

4. Click **"Save"**
5. Railway will auto-redeploy

---

## 🔗 **STEP 5: UPDATE STRIPE WEBHOOK**

### **In Stripe Dashboard:**

1. Go to **"Developers"** → **"Webhooks"**
2. Click on your webhook endpoint
3. Update URL to: `https://authenticare-api-production.up.railway.app/stripe/webhook`
4. Save

---

## ✅ **STEP 6: TEST WITH REAL DONATION**

### **Test the Full Flow:**

1. Go to `https://authenticare.vercel.app`
2. Register a new account
3. Navigate to donation page
4. **Make a $1 test donation with YOUR real credit card**
5. Verify:
   - ✅ Checkout page loads
   - ✅ Payment succeeds
   - ✅ Redirects back to app
   - ✅ Check Stripe dashboard for payment
   - ✅ Check database for donation record

### **If Everything Works:**
- ✅ You're live!
- ✅ Ready to accept real donations
- ✅ Share with users

---

## 📋 **QUICK REFERENCE**

### **Your Live URLs:**
```
Frontend: https://authenticare.vercel.app
Backend: https://authenticare-api-production.up.railway.app
API Docs: https://authenticare-api-production.up.railway.app/docs
```

### **Your Live Stripe Keys:**
```bash
# In Railway (Backend)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_live_...

# In Vercel (Frontend)
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

---

## 🎯 **DEPLOYMENT CHECKLIST**

- [ ] Get Stripe live keys (pk_live_, sk_live_)
- [ ] Create Stripe webhook endpoint
- [ ] Deploy backend to Railway
- [ ] Add all environment variables in Railway
- [ ] Deploy frontend to Vercel
- [ ] Update CORS in Railway
- [ ] Update Stripe webhook URL
- [ ] Test with real $1 donation
- [ ] Verify payment in Stripe dashboard
- [ ] Share app with users!

---

## 💰 **MONITORING DONATIONS**

### **Stripe Dashboard:**
- View all payments: https://dashboard.stripe.com/payments
- View subscriptions: https://dashboard.stripe.com/subscriptions
- View customers: https://dashboard.stripe.com/customers

### **Check Revenue:**
```
Daily: Dashboard → Home → Today's activity
Monthly: Dashboard → Reports → Monthly summary
```

### **Webhook Logs:**
```
Dashboard → Developers → Webhooks → [Your endpoint] → Logs
```

---

## 🚨 **TROUBLESHOOTING**

### **Payment Fails:**
1. Check Stripe dashboard for error
2. Check Railway logs: `railway logs`
3. Verify webhook secret is correct
4. Check CORS settings

### **Webhook Not Firing:**
1. Verify webhook URL is correct
2. Check webhook events are selected
3. Test webhook in Stripe dashboard
4. Check Railway logs for errors

### **CORS Errors:**
1. Verify ALLOWED_ORIGINS in Railway
2. Should match Vercel URL exactly
3. No trailing slash
4. Redeploy backend after changing

---

## 📱 **SHARE WITH USERS**

### **Announcement Message:**
```
🎉 AuthentiCare is now live!

Track air quality and protect your respiratory health:
https://authenticare.vercel.app

✅ Real-time air quality monitoring
✅ Personalized daily briefings
✅ Location-based recommendations
✅ Free to use

Support development with a voluntary donation:
$10, $20, or $35/year

Try it now! 🌬️💚
```

### **For Mobile Users:**
```
📱 Add to your home screen:
1. Open https://authenticare.vercel.app
2. Tap Share button
3. Select "Add to Home Screen"
4. Enjoy!
```

---

## 🎉 **YOU'RE READY!**

**You have everything you need:**
- ✅ Stripe live keys
- ✅ Verified account
- ✅ Working app
- ✅ Deployment platforms ready

**Next Steps:**
1. Deploy backend (15 min)
2. Deploy frontend (10 min)
3. Test with $1 donation (5 min)
4. Share with users!

**Total time:** 30 minutes to go live! 🚀

---

## 💡 **OPTIONAL: CUSTOM DOMAIN**

### **Want a custom domain like app.authenticare.com?**

**In Vercel:**
1. Go to project settings
2. Click "Domains"
3. Add your domain
4. Update DNS records (Vercel provides instructions)

**In Railway:**
1. Go to project settings
2. Click "Networking"
3. Add custom domain
4. Update DNS records

**Cost:** ~$12/year for domain (from Namecheap, Google Domains, etc.)

---

## ✅ **SUMMARY**

**You're ready to deploy with LIVE Stripe NOW!**

**Steps:**
1. Get live Stripe keys ✅ (you have these)
2. Deploy backend to Railway (15 min)
3. Deploy frontend to Vercel (10 min)
4. Test with real $1 donation (5 min)
5. Go live! 🎉

**Want me to walk you through the deployment step-by-step?** 🚀

---

**Last Updated:** October 4, 2025, 11:37 PM EST  
**Status:** Ready to Deploy with Live Stripe  
**Timeline:** 30 minutes to go live
