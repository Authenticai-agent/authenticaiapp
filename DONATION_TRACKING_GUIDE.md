# 💚 Donation Tracking Guide

## Database Schema

### Donations Table Structure

```sql
donations (
    id UUID PRIMARY KEY,
    user_id UUID,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT UNIQUE,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'usd',
    status TEXT DEFAULT 'active',
    interval TEXT DEFAULT 'year',
    cancel_at_period_end BOOLEAN DEFAULT FALSE,  ← NEW FIELD
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
)
```

## Donation Lifecycle States

### 1. **Active Recurring Donation**
```sql
status = 'active' AND cancel_at_period_end = FALSE
```
- User is being charged regularly
- Will continue indefinitely
- **Badge**: 🟢 Green "active"

### 2. **Ending Donation (Intermediate State)**
```sql
status = 'active' AND cancel_at_period_end = TRUE
```
- User clicked "Stop Recurring Donation"
- Still has access until period ends
- Won't be charged again
- **Badge**: 🟠 Orange "ending"
- **Display**: "Will stop soon"

### 3. **Stopped Donation**
```sql
status = 'cancelled'
```
- Period has ended
- No longer has access
- Set by Stripe webhook when subscription actually ends
- **Badge**: ⚪ Grey "cancelled"

### 4. **Payment Failed**
```sql
status = 'past_due'
```
- Payment method failed
- Stripe will retry
- **Badge**: 🟡 Yellow "past_due"

## SQL Queries

### Get All Active Donations (Will Continue)
```sql
SELECT * FROM donations 
WHERE status = 'active' 
AND cancel_at_period_end = FALSE
ORDER BY created_at DESC;
```

### Get Donations Set to Stop (Intermediate State)
```sql
SELECT * FROM donations 
WHERE status = 'active' 
AND cancel_at_period_end = TRUE
ORDER BY created_at DESC;
```

### Get All Recurring Donations for a User
```sql
SELECT * FROM donations 
WHERE user_id = 'user-uuid-here'
AND stripe_subscription_id IS NOT NULL
ORDER BY created_at DESC;
```

### Get User's Total Monthly Support
```sql
SELECT 
    user_id,
    SUM(amount) as total_monthly,
    COUNT(*) as donation_count
FROM donations 
WHERE status = 'active' 
AND cancel_at_period_end = FALSE
GROUP BY user_id;
```

### Get All Stopped Donations
```sql
SELECT * FROM donations 
WHERE status = 'cancelled'
ORDER BY updated_at DESC;
```

## How the System Works

### When User Makes a Donation:
1. Stripe Checkout creates subscription
2. Webhook `checkout.session.completed` fires
3. Backend saves to `donations` table:
   - `status = 'active'`
   - `cancel_at_period_end = FALSE`

### When User Clicks "Stop Recurring Donation":
1. Frontend calls `/api/v1/stripe/stop-donation`
2. Backend:
   - Calls Stripe API: `subscription.modify(cancel_at_period_end=True)`
   - Updates database: `cancel_at_period_end = TRUE`
   - Status remains `'active'`
3. Frontend shows orange "ending" badge

### When Period Actually Ends:
1. Stripe webhook `customer.subscription.deleted` fires
2. Backend updates database: `status = 'cancelled'`
3. User loses access
4. Frontend shows grey "cancelled" badge

## Frontend Display Logic

### Profile Page
```typescript
// Status badge color
donation.status === 'active' && !donation.cancel_at_period_end
  ? 'green'      // Active, will continue
  : donation.status === 'active' && donation.cancel_at_period_end
  ? 'orange'     // Ending soon
  : 'grey'       // Cancelled

// Status text
donation.status === 'active' && donation.cancel_at_period_end 
  ? 'ending' 
  : donation.status
```

### Manage Donation Page
```typescript
// Show warning if ending
{donation.cancel_at_period_end && (
  <div className="bg-orange-50">
    ⚠️ This recurring donation will end on {date}.
    You won't be charged again.
  </div>
)}

// Show stop button only if not already stopping
{!donation.cancel_at_period_end && (
  <button>Stop Recurring Donation</button>
)}
```

## Migration Instructions

### Apply the Migration to Your Supabase Database:

1. **Go to Supabase Dashboard** → SQL Editor
2. **Run this migration**:
   ```sql
   -- Copy contents from: backend/sql/add_cancel_at_period_end.sql
   ```
3. **Verify** the column was added:
   ```sql
   SELECT * FROM information_schema.columns 
   WHERE table_name = 'donations';
   ```

### Or Use psql:
```bash
psql -h your-supabase-host -U postgres -d postgres -f backend/sql/add_cancel_at_period_end.sql
```

## Analytics Queries

### Revenue Metrics
```sql
-- Active monthly recurring revenue
SELECT SUM(amount) as mrr
FROM donations 
WHERE status = 'active' 
AND cancel_at_period_end = FALSE;

-- Churn rate (donations set to stop)
SELECT 
    COUNT(CASE WHEN cancel_at_period_end = TRUE THEN 1 END) * 100.0 / COUNT(*) as churn_rate
FROM donations 
WHERE status = 'active';
```

### User Engagement
```sql
-- Users with multiple donations
SELECT user_id, COUNT(*) as donation_count, SUM(amount) as total_amount
FROM donations 
WHERE status = 'active'
GROUP BY user_id
HAVING COUNT(*) > 1
ORDER BY total_amount DESC;

-- Average donation amount
SELECT AVG(amount) as avg_donation
FROM donations 
WHERE status = 'active';
```

## Key Insights

✅ **Recurring vs One-Time**: Check if `stripe_subscription_id` exists
✅ **Active vs Stopped**: Check `status` field
✅ **Ending Soon**: Check `cancel_at_period_end = TRUE`
✅ **Total Support**: Sum all `amount` where `status = 'active'` and `cancel_at_period_end = FALSE`

This gives you complete visibility into your donation lifecycle! 💚
