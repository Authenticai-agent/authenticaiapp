# Railway Resend Email Setup

## Issue
Feedback emails to jura@authenticai.ai were not being sent because the Resend API was not properly configured.

## Solution

### 1. Get Your Resend API Key
1. Go to https://resend.com/api-keys
2. Create a new API key
3. Copy the key (starts with `re_`)

### 2. Configure Railway Environment Variables

Add these two environment variables to your Railway project:

```
RESEND_API_KEY=re_your_actual_api_key_here
RESEND_FROM_EMAIL=onboarding@resend.dev
```

**Steps in Railway:**
1. Go to your Railway project dashboard
2. Click on your backend service
3. Go to "Variables" tab
4. Click "New Variable"
5. Add `RESEND_API_KEY` with your actual API key
6. Add `RESEND_FROM_EMAIL` with `onboarding@resend.dev`
7. Click "Deploy" to restart with new variables

### 3. Verify Domain (Optional but Recommended)

To use a custom from email like `feedback@authenticai.ai`:

1. Go to https://resend.com/domains
2. Add your domain `authenticai.ai`
3. Add the DNS records they provide
4. Once verified, update `RESEND_FROM_EMAIL` to `feedback@authenticai.ai`

### 4. Test the Integration

Send a test feedback message from your app and check:
- Backend logs in Railway for email confirmation
- Your inbox at jura@authenticai.ai
- Resend dashboard for email delivery status

## Code Changes Made

1. **Fixed Resend API syntax** in `backend/routers/contact.py`
   - Updated to use correct parameter format for Resend SDK 0.8.0+
   - Added better error logging with `exc_info=True`

2. **Updated `.env.example`** to document Resend variables

## Troubleshooting

If emails still don't send:

1. Check Railway logs: `railway logs`
2. Look for these log messages:
   - ✅ "Resend email service initialized" (good)
   - ⚠️ "RESEND_API_KEY not set" (missing env var)
   - ❌ "Failed to send email" (check error details)

3. Verify API key is valid in Resend dashboard
4. Check Resend dashboard for delivery errors
5. Make sure the `resend` package is installed (it's in requirements.txt)

## Current Configuration

- **From Email**: `onboarding@resend.dev` (Resend's test domain)
- **To Email**: `jura@authenticai.ai`
- **Subject**: "New Feedback from {name}"
- **Fallback**: If email fails, feedback is still saved to database
