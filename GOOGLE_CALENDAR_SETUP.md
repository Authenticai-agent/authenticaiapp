# 🗓️ Google Calendar Integration Setup Guide

## Current Status
- ✅ Backend API routes configured (`/backend/routers/calendar_integration.py`)
- ✅ Frontend component ready (`/frontend/src/components/GoogleCalendarConnect.tsx`)
- ❌ OAuth credentials not configured
- ❌ Environment variables missing

---

## Step-by-Step Setup

### 1. Create Google Cloud Project (5 minutes)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name: `Authenticai Health Platform`
4. Click "Create"

### 2. Enable Google Calendar API (2 minutes)

1. In your project, go to **APIs & Services** → **Library**
2. Search for "Google Calendar API"
3. Click on it and press **Enable**

### 3. Create OAuth 2.0 Credentials (10 minutes)

1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. If prompted, configure OAuth consent screen first:
   - **User Type:** External
   - **App name:** Authenticai Health Platform
   - **User support email:** Your email
   - **Developer contact:** Your email
   - **Scopes:** Add `https://www.googleapis.com/auth/calendar.readonly`
   - **Test users:** Add your email (for testing)
   - Click **Save and Continue**

4. Back to Create OAuth client ID:
   - **Application type:** Web application
   - **Name:** Authenticai Web Client
   
5. **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   https://authenticai.app
   https://your-netlify-domain.netlify.app
   ```

6. **Authorized redirect URIs:**
   ```
   http://localhost:3000/calendar/callback
   https://authenticai.app/calendar/callback
   https://your-netlify-domain.netlify.app/calendar/callback
   ```

7. Click **Create**
8. **IMPORTANT:** Copy the **Client ID** and **Client Secret** - you'll need these!

---

## 4. Configure Environment Variables

### Backend (.env file)

Add to `/backend/.env`:

```bash
# Google Calendar Integration
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:3000/calendar/callback

# For production, also add:
# GOOGLE_REDIRECT_URI=https://authenticai.app/calendar/callback
```

### Frontend (.env file)

Add to `/frontend/.env`:

```bash
# Google Calendar
REACT_APP_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
```

---

## 5. Update Backend Configuration

The backend code is already set up, but verify these files:

### `/backend/routers/calendar_integration.py`

Make sure it has:

```python
import os
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build

GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')
GOOGLE_REDIRECT_URI = os.getenv('GOOGLE_REDIRECT_URI')
```

### Install Required Python Packages

```bash
cd backend
pip install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client
pip freeze > requirements.txt
```

---

## 6. Update Frontend Configuration

The frontend component is already configured. Just verify:

### `/frontend/src/components/GoogleCalendarConnect.tsx`

Should have:

```tsx
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
```

---

## 7. Test the Integration

### Local Testing

1. Start backend:
   ```bash
   cd backend
   python main.py
   ```

2. Start frontend:
   ```bash
   cd frontend
   npm start
   ```

3. Navigate to Dashboard
4. Click "Connect Google Calendar"
5. You should see Google OAuth consent screen
6. Grant permissions
7. Should redirect back with success message

### Troubleshooting

**Error: "redirect_uri_mismatch"**
- Check that redirect URI in Google Console matches exactly
- Make sure no trailing slashes
- Verify protocol (http vs https)

**Error: "invalid_client"**
- Check Client ID and Secret are correct
- Verify they're in .env files
- Restart both backend and frontend

**Error: "access_denied"**
- User clicked "Cancel" on consent screen
- Try again and click "Allow"

---

## 8. Deploy to Production

### Netlify Environment Variables

1. Go to Netlify Dashboard → Site Settings → Environment Variables
2. Add:
   ```
   REACT_APP_GOOGLE_CLIENT_ID = your-client-id-here
   ```

### Railway Environment Variables

1. Go to Railway Dashboard → Your Project → Variables
2. Add:
   ```
   GOOGLE_CLIENT_ID = your-client-id-here
   GOOGLE_CLIENT_SECRET = your-client-secret-here
   GOOGLE_REDIRECT_URI = https://authenticai.app/calendar/callback
   ```

### Update Google Console

1. Go back to Google Cloud Console
2. Update Authorized redirect URIs to include production URL
3. Publish OAuth consent screen (move from Testing to Production)

---

## 9. Security Best Practices

### ✅ DO:
- Store credentials in environment variables
- Use HTTPS in production
- Limit OAuth scopes to only what's needed (`calendar.readonly`)
- Regularly rotate client secrets
- Monitor API usage in Google Console

### ❌ DON'T:
- Commit credentials to Git
- Share client secrets publicly
- Request more permissions than needed
- Store tokens in localStorage (backend handles this)

---

## 10. Features Enabled

Once configured, users can:

1. **Connect Calendar** - One-click OAuth flow
2. **View Upcoming Events** - See next 5 appointments
3. **Get Health Recommendations** - Based on air quality and schedule
4. **Receive Alerts** - "Bad air quality during your outdoor meeting"
5. **Disconnect Anytime** - Revoke access easily

---

## API Endpoints

### Backend Routes

```
GET  /api/v1/calendar/auth/url          - Get OAuth URL
POST /api/v1/calendar/auth/callback     - Handle OAuth callback
GET  /api/v1/calendar/events            - Get upcoming events
GET  /api/v1/calendar/status            - Check connection status
POST /api/v1/calendar/disconnect        - Revoke access
```

### Frontend Component

```tsx
<GoogleCalendarConnect />
```

Shows:
- Connect button (if not connected)
- Upcoming events list (if connected)
- Disconnect button (if connected)
- Health recommendations based on schedule

---

## Cost

**FREE** - Google Calendar API is free for:
- Up to 1,000,000 requests/day
- Unlimited users
- No credit card required

Your app will use ~10-50 requests per user per day, so you can support thousands of users for free.

---

## Quick Start (TL;DR)

1. Create Google Cloud project
2. Enable Calendar API
3. Create OAuth credentials
4. Copy Client ID and Secret
5. Add to `.env` files:
   ```bash
   # Backend
   GOOGLE_CLIENT_ID=xxx
   GOOGLE_CLIENT_SECRET=xxx
   GOOGLE_REDIRECT_URI=http://localhost:3000/calendar/callback
   
   # Frontend
   REACT_APP_GOOGLE_CLIENT_ID=xxx
   ```
6. Install Python packages: `pip install google-auth google-auth-oauthlib google-api-python-client`
7. Restart backend and frontend
8. Test connection

---

## Support

If you encounter issues:

1. Check Google Cloud Console → APIs & Services → Dashboard for errors
2. Verify environment variables are loaded (print them in code)
3. Check browser console for frontend errors
4. Check backend logs for API errors
5. Verify redirect URIs match exactly

---

## Next Steps After Setup

1. **Test with your Google account**
2. **Add test users** in OAuth consent screen
3. **Monitor API usage** in Google Console
4. **Deploy to production** with production URLs
5. **Publish OAuth app** (move from Testing to Production)

---

**Estimated Setup Time:** 15-20 minutes  
**Difficulty:** Easy (just follow steps)  
**Cost:** $0 (completely free)

Once configured, the "Connect Google Calendar" button will work perfectly! 🎉
