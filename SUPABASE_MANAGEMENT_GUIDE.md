# 🗄️ **SUPABASE DATABASE MANAGEMENT GUIDE**

## 📋 **How to Check and Modify Supabase Tables**

---

## 🔑 **1. ACCESS SUPABASE DASHBOARD**

### **Method A: Web Dashboard (Recommended)**
1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Log in to your account
3. Select your Authenticai project
4. Navigate to **"Table Editor"** in the left sidebar

### **Method B: Command Line Interface**
```bash
# Install Supabase CLI (if not already installed)
npm install -g @supabase/cli

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# View tables
supabase db tables
```

---

## 👥 **2. USER MANAGEMENT: Checking/Modifying Users Table**

### **A. View All Users**
**In Supabase Dashboard:**
1. Go to **Table Editor** → **users** table
2. You'll see columns like:
   - `id` (uuid)
   - `email`
   - `created_at`
   - `email_confirmed_at`
   - `password_hash`
   - `encrypted_user_metadata`
   - `raw_app_meta_data`
   - `is_super_admin`

### **B. Change User Password**
**Option 1: Using Supabase Dashboard**
1. Go to **Authentication** → **Users**
2. Find the user by email
3. Click the user's email
4. Click **"Reset Password"**
5. System will email a password reset link

**Option 2: Using SQL Editor**
```sql
-- Reset user password (they'll get email)
SELECT auth.reset_password('user@example.com');

-- Or generate reset link directly
SELECT auth.email_password_reset('user@example.com');
```

**Option 3: Programmatically (Backend API)**
```python
# Create password reset endpoint
from supabase import create_client

@app.post("/api/v1/admin/reset-user-password")
async def reset_user_password(email: str):
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        # Send password reset email
        result = supabase.auth.reset_password_email(email)
        
        return {
            "success": True,
            "message": f"Password reset email sent to {email}",
            "action": "check_email"
        }
    except Exception as e:
        return {"error": f"Password reset failed: {str(e)}"}
```

---

## 💰 **3. PAYMENT MANAGEMENT: Checking Payments Table**

### **A. View All Payments**
**In Supabase Table Editor:**
1. Go to **Table Editor** → **payments** table
2. Look for columns like:
   - `id`
   - `user_id` (foreign key to users)
   - `amount`
   - `status` (pending/completed/failed)
   - `payment_method`
   - `transaction_id`
   - `created_at`
   - `paid_at`

### **B. Payment Status Queries**
```sql
-- View all payments with user info
SELECT 
    p.id,
    u.email,
    p.amount,
    p.status,
    p.created_at,
    p.paid_at
FROM payments p
JOIN users u ON p.user_id = u.id
ORDER BY p.created_at DESC;

-- Find failed payments
SELECT * FROM payments 
WHERE status = 'failed' 
ORDER BY created_at DESC;

-- Monthly revenue overview
SELECT 
    DATE_TRUNC('month', paid_at) as month,
    COUNT(*) as payment_count,
    SUM(amount) as total_revenue
FROM payments 
WHERE status = 'completed'
GROUP BY month
ORDER BY month DESC;
```

### **C. Update Payment Status**
```sql
-- Mark payment as completed manually
UPDATE payments 
SET status = 'completed', paid_at = NOW()
WHERE id = 'payment_uuid_here';

-- Refund a payment (mark as refunded)
UPDATE payments 
SET status = 'refunded', refunded_at = NOW()
WHERE id = 'payment_uuid_here';
```

---

## 🗂️ **4. USEFUL USER ANALYTICS QUERIES**

### **A. User Activity Overview**
```sql
-- Most active users
SELECT 
    u.email,
    u.created_at,
    COUNT(p.id) as payment_count,
    SUM(p.amount) as total_spent
FROM users u
LEFT JOIN payments p ON u.id = p.user_id AND p.status = 'completed'
GROUP BY u.id, u.email, u.created_at
ORDER BY total_spent DESC;

-- Recent registrations
SELECT 
    email,
    created_at,
    email_confirmed_at,
    CASE WHEN email_confirmed_at IS NOT NULL THEN 'Verified' ELSE 'Pending' END as verification_status
FROM users 
ORDER BY created_at DESC 
LIMIT 20;

-- Subscription status overview
SELECT 
    CASE WHEN p.status = 'completed' THEN 'Active' ELSE 'Inactive' END as subscription_status,
    COUNT(*) as user_count
FROM users u
LEFT JOIN payments p ON u.id = p.user_id 
    AND p.created_at > NOW() - INTERVAL '31 days'
GROUP BY p.status;
```

### **B. Revenue Analytics**
```sql
-- Daily revenue trend (last 30 days)
SELECT 
    DATE(paid_at) as date,
    COUNT(*) as payments,
    SUM(amount) as daily_revenue
FROM payments 
WHERE status = 'completed' 
    AND paid_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(paid_at)
ORDER BY date;

-- Payment success rate
SELECT 
    status,
    COUNT(*) as count,
    ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER(), 2) as percentage
FROM payments
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY status;
```

---

## 🔧 **5. RECOMMENDED ADMIN ENDPOINTS**

### **A. User Management Endpoints**
```python
@app.get("/api/v1/admin/users")
async def list_all_users(limit: int = 100):
    """List all users with their subscription status"""
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        # Query users with their recent payment info
        users_query = supabase.table('users').select("*, payments(*)").limit(limit)
        users = users_query.execute()
        
        return {
            "users": users.data,
            "total_count": len(users.data),
            "context": "user_management"
        }
    except Exception as e:
        return {"error": f"Failed to fetch users: {str(e)}"}

@app.post("/api/v1/admin/users/{user_id}/deactivate")
async def deactivate_user(user_id: str):
    """Deactivate a user (soft delete)"""
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        # Soft delete user
        result = supabase.table('users').update({
            'active': False,
            'deactivated_at': datetime.utcnow().isoformat()
        }).eq('id', user_id).execute()
        
        return {"success": True, "message": "User deactivated"}
    except Exception as e:
        return {"error": f"User deactivation failed: {str(e)}"}

@app.post("/api/v1/admin/reset-password")
async def admin_reset_password(email: str):
    """Admin function to reset user password"""
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        # Send password reset
        result = supabase.auth.reset_password_email(email)
        
        return {
            "success": True,
            "message": f"Password reset email sent to {email}",
            "user_action_required": "check_email"
        }
    except Exception as e:
        return {"error": f"Password reset failed: {str(e)}"}

@app.get("/api/v1/admin/payments/summary")
async def payment_summary():
    """Get comprehensive payment analytics"""
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        # Get payment stats
        payments = supabase.table('payments').select("*").execute()
        
        total_revenue = sum(p['amount'] for p in payments.data if p['status'] == 'completed')
        active_subs = len([p for p in payments.data if p['status'] == 'completed' and 
                          datetime.fromisoformat(p['paid_at'].replace('Z', '')) > datetime.now() - timedelta(days=31)])
        
        return {
            "analytics": {
                "total_revenue": total_revenue,
                "active_subscriptions": active_subs,
                "total_payments": len(payments.data),
                "success_rate": len([p for p in payments.data if p['status'] == 'completed']) / len(payments.data) if payments.data else 0
            },
            "recent_payments": payments.data[-10:],  # Last 10 payments
            "context": "payment_analytics"
        }
    except Exception as e:
        return {"error": f"Payment summary failed: {str(e)}"}

@app.post("/api/v1/admin/payments/{payment_id}/manual-approval")
async def manual_payment_approval(payment_id: str):
    """Manually approve a payment (for failed payments)"""
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        # Update payment status
        result = supabase.table('payments').update({
            'status': 'completed',
            'paid_at': datetime.utcnow().isoformat(),
            'manually_approved': True
        }).eq('id', payment_id).execute()
        
        return {"success": True, "message": "Payment manually approved"}
    except Exception as e:
        return {"error": f"Payment approval failed: {str(e)}"}
```

---

## 📊 **6. REAL-TIME ANALYTICS DASHBOARD QUERIES**

### **A. Key Metrics for Dashboard**
```sql
-- Main KPIs
SELECT 
    (SELECT COUNT(*) FROM users WHERE active = true) as active_users,
    (SELECT COUNT(*) FROM payments WHERE status = 'completed' AND paid_at > NOW() - INTERVAL '31 days') as monthly_active_subs,
    (SELECT SUM(amount) FROM payments WHERE status = 'completed' AND paid_at > NOW() - INTERVAL '31 days') as monthly_revenue,
    (SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '7 days') as new_users_week;

-- User growth trend
SELECT 
    DATE_TRUNC('week', created_at) as week,
    COUNT(*) as new_users
FROM users 
WHERE created_at > NOW() - INTERVAL '12 weeks'
GROUP BY week 
ORDER BY week;

-- Revenue trend
SELECT 
    DATE_TRUNC('week', paid_at) as week,
    SUM(amount) as weekly_revenue
FROM payments 
WHERE status = 'completed' AND paid_at > NOW() - INTERVAL '12 weeks'
GROUP BY week 
ORDER BY week;
```

---

## 🔐 **7. SECURITY: USER AUTHENTICATION**

### **A. Force Email Verification**
```sql
-- Find unverified users
SELECT email, created_at 
FROM users 
WHERE email_confirmed_at IS NULL 
    AND created_at < NOW() - INTERVAL '24 hours';

-- Manually verify email (emergency cases)
UPDATE users 
SET email_confirmed_at = NOW() 
WHERE id = 'user_uuid_here';
```

### **B. Session Management**
```sql
-- View active sessions
SELECT 
    u.email,
    s.last_sign_in_at,
    s.confirmation_sent_at
FROM auth.users u
INNER JOIN auth.sessions s ON u.id = s.user_id;
```

---

## ✅ **QUICK COMMANDS REFERENCE**

### **Essential Supabase Operations:**

1. **View Tables**: Dashboard → Table Editor
2. **Reset Password**: Authentication → Users → Reset Password
3. **View Payments**: Table Editor → payments table
4. **SQL Queries**: Dashboard → SQL Editor
5. **User Analytics**: Use the SQL queries above
6. **Manual Payment Fix**: Update payments status in Table Editor

### **Database Connection String:**
```
Host: YOUR_PROJECT_REF.supabase.co
Database: postgres
Port: 5432
User: postgres
Password: YOUR_DB_PASSWORD
```

---

**🎯 With this guide, you can fully manage users, payments, and analytics in your Supabase database!** 💰📊
