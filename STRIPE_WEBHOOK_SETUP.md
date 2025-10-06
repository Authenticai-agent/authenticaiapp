# Stripe Webhook Setup Guide

## 🎯 Purpose
This webhook receives events from Stripe when donations are made, cancelled, or payments succeed/fail, and saves them to Supabase.

---

## 📋 Step-by-Step Setup

### **1. Run the SQL to Create Donations Table**

Go to your Supabase project:
1. Open **SQL Editor**
2. Run the SQL from `backend/sql/create_donations_table.sql`
3. Verify the table was created in **Table Editor**

---

### **2. Set Up Stripe Webhook (Development)**

#### **Option A: Using Stripe CLI (Recommended for Testing)**

1. **Install Stripe CLI:**
   ```bash
   # Mac
   brew install stripe/stripe-cli/stripe
   
   # Or download from: https://stripe.com/docs/stripe-cli
   ```

2. **Login to Stripe:**
   ```bash
   stripe login
   ```

3. **Forward webhooks to your local server:**
   ```bash
   stripe listen --forward-to localhost:8000/api/v1/stripe/webhook
   ```

4. **Copy the webhook signing secret** (starts with `whsec_`) and add to `backend/.env`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```

5. **Test the webhook:**
   ```bash
   stripe trigger checkout.session.completed
   ```

---

#### **Option B: Using ngrok (For Remote Testing)**

1. **Install ngrok:**
   ```bash
   # Mac
   brew install ngrok
   
   # Or download from: https://ngrok.com/download
   ```

2. **Start ngrok tunnel:**
   ```bash
   ngrok http 8000
   ```

3. **Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)

4. **Add webhook endpoint in Stripe Dashboard:**
   - Go to: https://dashboard.stripe.com/test/webhooks
   - Click **"Add endpoint"**
   - Endpoint URL: `https://abc123.ngrok.io/api/v1/stripe/webhook`
   - Events to send:
     - `checkout.session.completed`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Click **"Add endpoint"**

5. **Copy the Signing Secret** and add to `backend/.env`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```

---

### **3. Set Up Stripe Webhook (Production)**

1. **Deploy your backend** to production (e.g., Railway, Heroku, AWS)

2. **Add webhook endpoint in Stripe Dashboard:**
   - Go to: https://dashboard.stripe.com/webhooks
   - Click **"Add endpoint"**
   - Endpoint URL: `https://your-api.com/api/v1/stripe/webhook`
   - Events to send:
     - `checkout.session.completed`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Click **"Add endpoint"**

3. **Copy the Signing Secret** and add to production environment variables

4. **Update `FRONTEND_URL` in production `.env`:**
   ```bash
   FRONTEND_URL=https://your-frontend-domain.com
   ```

---

## 🧪 Testing the Integration

### **Test Cards (Stripe Test Mode)**

Use these test cards in Stripe Checkout:

| Card Number | Description |
|-------------|-------------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 0002` | Card declined |
| `4000 0025 0000 3155` | Requires authentication (3D Secure) |

**For all cards:**
- Use any future expiration date (e.g., `12/25`)
- Use any 3-digit CVC (e.g., `123`)
- Use any ZIP code (e.g., `12345`)

---

### **Test the Full Flow**

1. **Start backend:**
   ```bash
   cd backend
   uvicorn main:app --reload --port 8000
   ```

2. **Start frontend:**
   ```bash
   cd frontend
   npm start
   ```

3. **Start Stripe webhook listener:**
   ```bash
   stripe listen --forward-to localhost:8000/api/v1/stripe/webhook
   ```

4. **Test donation:**
   - Go to http://localhost:3000/dashboard
   - Scroll to donation card
   - Select a tier ($10, $20, or $35)
   - Click "Donate"
   - Use test card: `4242 4242 4242 4242`
   - Complete payment
   - Should redirect back with success message

5. **Verify in Supabase:**
   - Go to Supabase **Table Editor**
   - Check `donations` table
   - Should see new row with your donation

---

## 🔍 Debugging

### **Check Backend Logs**

Look for these log messages:
```
✅ Donation saved for user {user_id}
✅ Subscription cancelled: {subscription_id}
✅ Payment succeeded: {invoice_id}
⚠️ Payment failed: {invoice_id}
```

### **Check Stripe Dashboard**

- Go to: https://dashboard.stripe.com/test/events
- See all webhook events
- Click on an event to see details
- Check if webhook was delivered successfully

### **Common Issues**

1. **Webhook signature verification failed:**
   - Make sure `STRIPE_WEBHOOK_SECRET` is correct
   - Check that you're using the right secret (test vs live)

2. **Donation not saved to Supabase:**
   - Check Supabase credentials in `.env`
   - Verify `donations` table exists
   - Check backend logs for errors

3. **User redirected but no success message:**
   - Check that `FRONTEND_URL` in backend `.env` matches your frontend URL
   - Verify Dashboard.tsx has the success/cancel handling code

---

## 🚀 Going Live

Before switching to live mode:

1. ✅ Test thoroughly with test cards
2. ✅ Verify donations are saved to Supabase
3. ✅ Test cancellation flow
4. ✅ Replace test API keys with live keys
5. ✅ Set up production webhook endpoint
6. ✅ Update `FRONTEND_URL` to production domain
7. ✅ Test with real card (small amount)

---

## 📊 Monitoring

**Stripe Dashboard:**
- Monitor payments: https://dashboard.stripe.com/payments
- Check subscriptions: https://dashboard.stripe.com/subscriptions
- View webhooks: https://dashboard.stripe.com/webhooks

**Supabase:**
- Query donations: `SELECT * FROM donations ORDER BY created_at DESC`
- Check active subscriptions: `SELECT * FROM donations WHERE status = 'active'`

---

## 🔐 Security Notes

- ✅ Webhook signature verification is enabled
- ✅ RLS policies protect user data
- ✅ Service role is used for webhook writes
- ✅ API keys are in environment variables (not hardcoded)
- ✅ HTTPS required in production

---

## 📞 Support

If you encounter issues:
1. Check backend logs
2. Check Stripe Dashboard events
3. Verify environment variables
4. Test with Stripe CLI
5. Check Supabase logs

**Stripe Documentation:**
- Webhooks: https://stripe.com/docs/webhooks
- Testing: https://stripe.com/docs/testing
- Checkout: https://stripe.com/docs/payments/checkout
